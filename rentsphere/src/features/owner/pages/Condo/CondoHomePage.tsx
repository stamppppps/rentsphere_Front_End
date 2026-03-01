import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* ====== types ====== */
type CondoItem = {
    id: string;
    name: string;
    roomsTotal: number;
    roomsActive: number;
    unpaidBills: number;
};

type UserRole = "OWNER" | "ADMIN";

type ManagedUser = {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    role: UserRole;
    condos: string[];
};

type UserForm = {
    fullName: string;
    phone: string;
    email: string;
    role: UserRole;
};

/* ====== icons / helpers  ====== */
function CondoIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M6 21V5a2 2 0 0 1 2-2h3v18M13 21V9h5a2 2 0 0 1 2 2v10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h.01M9 11h.01M9 15h.01M16 13h.01M16 17h.01" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21v-2a4 4 0 0 0-3-3.87" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

const roleLabel: Record<UserRole, string> = {
    OWNER: "เจ้าของ",
    ADMIN: "แอดมิน",
};

const emptyForm: UserForm = {
    fullName: "",
    phone: "",
    email: "",
    role: "ADMIN",
};

function uid() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function inputPill() {
    return [
        "w-full h-[54px] px-6 rounded-full",
        "bg-[#EEF3FF] border border-blue-100/60",
        "text-gray-900 font-bold shadow-inner",
        "focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300",
    ].join(" ");
}

function selectPill() {
    return [
        "w-full h-[54px] px-6 rounded-full",
        "bg-[#EEF3FF] border border-blue-100/60",
        "text-gray-900 font-bold shadow-inner",
        "focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300",
    ].join(" ");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="text-sm font-extrabold text-gray-800 mb-3">{label}</div>
            {children}
        </div>
    );
}

/* ====== UserManagementPanel  ====== */
function UserManagementPanel({ condoName }: { condoName: string }) {
    // ============ local state (no mock) ============
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<UserForm>(emptyForm);

    // ============ TODO: Backend later ============
    useEffect(() => {
        // ตัวอย่างโครง(ยังไม่เรียกจริง)
        // setLoading(true);
        // fetch("/api/owner/users?condoName=" + encodeURIComponent(condoName))
        //   .then((r) => r.json())
        //   .then((data) => setUsers(data.users ?? []))
        //   .catch(() => setError("โหลดรายชื่อผู้ใช้งานไม่สำเร็จ"))
        //   .finally(() => setLoading(false));
    }, [condoName]);

    const rows = useMemo(() => users.map((u, idx) => ({ ...u, no: idx + 1 })), [users]);

    const openCreate = () => {
        setMode("create");
        setEditingId(null);
        setForm({ ...emptyForm });
        setOpen(true);
    };

    const openEdit = (u: ManagedUser) => {
        setMode("edit");
        setEditingId(u.id);
        setForm({ fullName: u.fullName, phone: u.phone, email: u.email, role: u.role });
        setOpen(true);
    };

    const close = () => setOpen(false);

    const onSave = () => {
        if (!form.fullName.trim()) return;
        if (!form.phone.trim()) return;
        if (!form.email.trim()) return;

        // ===== TODO: backend later =====
        // create: POST /api/owner/users
        // edit:   PATCH /api/owner/users/:id

        if (mode === "create") {
            const newUser: ManagedUser = {
                id: uid(),
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                role: form.role,
                condos: [condoName],
            };
            setUsers((prev) => [newUser, ...prev]);
            setOpen(false);
            return;
        }

        setUsers((prev) =>
            prev.map((u) =>
                u.id === editingId
                    ? { ...u, fullName: form.fullName.trim(), phone: form.phone.trim(), email: form.email.trim(), role: form.role }
                    : u
            )
        );
        setOpen(false);
    };

    return (
        <div className="rounded-2xl bg-white border border-blue-100/60 shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-8 py-6 bg-[#f3f7ff] border-b border-blue-100/60">
                <div>
                    <div className="text-xl font-extrabold tracking-tight text-gray-900">จัดการผู้ใช้งาน</div>
                    <div className="mt-1 text-sm font-bold text-gray-600">เพิ่ม/แก้ไขเจ้าหน้าที่ และกำหนดตำแหน่ง</div>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className={[
                        "h-[44px] px-7 rounded-xl border-0 text-white font-extrabold text-sm",
                        "shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
                        "!bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer",
                        "focus:outline-none focus:ring-2 focus:ring-blue-200",
                    ].join(" ")}
                >
                    เพิ่ม
                </button>
            </div>

            <div className="px-8 py-8">
                <div className="rounded-2xl bg-white border border-blue-100/60 shadow-sm overflow-hidden">
                    <div className="px-6 pt-6">
                        <div className="grid grid-cols-12 gap-4 items-center px-6 py-4 rounded-2xl bg-[#EEF3FF] text-gray-700 font-extrabold">
                            <div className="col-span-1 text-center">#</div>
                            <div className="col-span-4">ชื่อ/ตำแหน่ง</div>
                            <div className="col-span-3">เบอร์/อีเมล</div>
                            <div className="col-span-3">อสังหาริมทรัพย์</div>
                            <div className="col-span-1 text-right"></div>
                        </div>
                    </div>

                    <div className="px-6 pb-6">
                        {loading ? (
                            <div className="text-center text-gray-500 font-bold py-10">กำลังโหลด...</div>
                        ) : error ? (
                            <div className="text-center text-rose-600 font-extrabold py-10">{error}</div>
                        ) : rows.length === 0 ? (
                            <div className="text-center text-gray-500 font-bold py-10">ยังไม่มีผู้ใช้งาน</div>
                        ) : (
                            <div className="divide-y divide-gray-200/80">
                                {rows.map((u) => (
                                    <div key={u.id} className="grid grid-cols-12 gap-4 items-start px-6 py-6">
                                        <div className="col-span-1 text-center font-extrabold text-gray-600">{u.no}</div>

                                        <div className="col-span-4">
                                            <div className="font-extrabold text-gray-900">{u.fullName}</div>
                                            <div className="mt-1 text-sm font-bold text-gray-500">{roleLabel[u.role]}</div>
                                        </div>

                                        <div className="col-span-3">
                                            <div className="font-extrabold text-gray-900">{u.phone}</div>
                                            <div className="mt-1 text-sm font-bold text-gray-500">{u.email}</div>
                                        </div>

                                        <div className="col-span-3">
                                            {(u.condos ?? []).length === 0 ? (
                                                <div className="text-sm font-bold text-gray-400">ยังไม่ได้ผูกคอนโด</div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {(u.condos ?? []).slice(0, 2).map((c) => (
                                                        <div key={c} className="text-sm font-extrabold text-gray-700">
                                                            {c}
                                                        </div>
                                                    ))}
                                                    {(u.condos ?? []).length > 2 && (
                                                        <div className="text-xs font-extrabold text-gray-400">+{(u.condos ?? []).length - 2} เพิ่มเติม</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-span-1 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(u)}
                                                className="h-[36px] px-4 rounded-xl bg-white border border-gray-200 text-gray-700 font-extrabold text-sm
                                 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                                 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                            >
                                                edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/30" onClick={close} />
                    <div
                        className="relative w-full max-w-[820px] rounded-2xl bg-white shadow-[0_18px_55px_rgba(0,0,0,0.35)]
                       border border-blue-100/60 overflow-hidden"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="px-10 py-7 border-b border-gray-200/80">
                            <div className="text-3xl font-extrabold text-gray-900">
                                {mode === "create" ? "เพิ่มเจ้าหน้าที่" : "แก้ไขเจ้าหน้าที่"}
                            </div>
                        </div>

                        <div className="px-10 py-8">
                            <div className="grid grid-cols-1 gap-6">
                                <Field label="ชื่อและนามสกุล">
                                    <input
                                        value={form.fullName}
                                        onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                                        className={inputPill()}
                                    />
                                </Field>

                                <Field label="เบอร์โทรศัพท์มือถือ">
                                    <input
                                        value={form.phone}
                                        onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                                        className={inputPill()}
                                    />
                                </Field>

                                <Field label="อีเมล">
                                    <input
                                        value={form.email}
                                        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                                        className={inputPill()}
                                    />
                                </Field>

                                <Field label="ตำแหน่ง">
                                    <select
                                        value={form.role}
                                        onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as UserRole }))}
                                        className={selectPill()}
                                    >
                                        <option value="OWNER">เจ้าของ</option>
                                        <option value="ADMIN">แอดมิน</option>
                                    </select>
                                </Field>
                            </div>

                            <div className="mt-10 flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={close}
                                    className="h-[44px] px-10 rounded-xl bg-white border border-gray-200 text-gray-700 font-extrabold shadow-sm hover:bg-gray-50 active:scale-[0.98] transition"
                                >
                                    ปิด
                                </button>

                                <button
                                    type="button"
                                    onClick={onSave}
                                    className="h-[44px] px-10 rounded-xl border-0 text-white font-extrabold shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition !bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98]"
                                >
                                    บันทึก
                                </button>
                            </div>

                            <div className="mt-3 text-xs font-bold text-gray-400">* โครงสำหรับ BE: list/create/update</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* =========================
    CondoHomePage backend
   ========================= */
type LocationState = { justCreated?: boolean; condoId?: string } | null;

// แก้ URLให้ตรงbackend
async function fetchCondosFromApi(): Promise<CondoItem[]> {
    const res = await fetch("/api/owner/condos", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        throw new Error("โหลดรายการคอนโดไม่สำเร็จ");
    }

    const data = await res.json();

    // รองรับ 2 แบบ API ส่งเป็น array ตรง ๆ หรือห่อ {items:[]}
    if (Array.isArray(data)) return data as CondoItem[];
    if (Array.isArray(data?.items)) return data.items as CondoItem[];
    return [];
}

export default function CondoHomePage() {
    const nav = useNavigate();
    const location = useLocation();

    const state = (location.state ?? null) as LocationState;
    const justCreated = Boolean(state?.justCreated);
    const createdCondoId = state?.condoId;

    const [tab, setTab] = useState<"condo" | "users">("condo");

    const [condos, setCondos] = useState<CondoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCondos = async () => {
        try {
            setError(null);
            setLoading(true);
            const list = await fetchCondosFromApi();
            setCondos(list);
        } catch (e: any) {
            setCondos([]);
            setError(e?.message ?? "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCondos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (justCreated) loadCondos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [justCreated]);

    const sortedCondos = useMemo(() => {
        if (!createdCondoId) return condos;
        const top = condos.find((c) => c.id === createdCondoId);
        const rest = condos.filter((c) => c.id !== createdCondoId);
        return top ? [top, ...rest] : condos;
    }, [condos, createdCondoId]);

    // ไปหน้า dashboard แบบผูก condoId
    const goDashboard = (condoId: string) => nav("/owner/dashboard", { state: { condoId } });

    const condoNameForUsers = sortedCondos[0]?.name ?? "—";

    return (
        <div className="owner-ui min-h-[calc(100vh-64px)] bg-[#EEF4FF] font-sans text-black/85">
            <div className="px-8 py-8">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] border border-blue-100/60 overflow-hidden">
                        <div className="px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/60">
                            <div className="text-2xl font-extrabold tracking-tight text-gray-900">คอนโดมิเนียม</div>
                        </div>

                        <div className="px-6 py-6">
                            {/* tabs  */}
                            <div className="flex items-center justify-center">
                                <div className="w-full max-w-3xl">
                                    <div className="flex items-end justify-center gap-14">
                                        <button type="button" onClick={() => setTab("condo")} className="group flex flex-col items-center gap-2">
                                            <div
                                                className={[
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center",
                                                    "shadow-[0_10px_20px_rgba(0,0,0,0.12)] border transition",
                                                    tab === "condo" ? "bg-white border-blue-200 text-blue-700" : "bg-white/70 border-gray-200 text-gray-500 group-hover:text-gray-700",
                                                ].join(" ")}
                                                aria-hidden
                                            >
                                                <CondoIcon />
                                            </div>

                                            <div className={["text-lg font-extrabold tracking-[0.2px] transition", tab === "condo" ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"].join(" ")}>
                                                จัดการคอนโดมิเนียม
                                            </div>

                                            <div className={["h-[2px] rounded-full transition", tab === "condo" ? "w-44 bg-[#5b86ff]" : "w-44 bg-transparent"].join(" ")} />
                                        </button>

                                        <button type="button" onClick={() => setTab("users")} className="group flex flex-col items-center gap-2">
                                            <div
                                                className={[
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center",
                                                    "shadow-[0_10px_20px_rgba(0,0,0,0.12)] border transition",
                                                    tab === "users" ? "bg-white border-blue-200 text-blue-700" : "bg-white/70 border-gray-200 text-gray-500 group-hover:text-gray-700",
                                                ].join(" ")}
                                                aria-hidden
                                            >
                                                <UsersIcon />
                                            </div>

                                            <div className={["text-lg font-extrabold tracking-[0.2px] transition", tab === "users" ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"].join(" ")}>
                                                จัดการผู้ใช้งาน
                                            </div>

                                            <div className={["h-[2px] rounded-full transition", tab === "users" ? "w-36 bg-[#5b86ff]" : "w-36 bg-transparent"].join(" ")} />
                                        </button>
                                    </div>

                                    <div className="mt-4 h-px w-full bg-blue-100/80" />

                                    <div className="mt-5 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => nav("/owner/add-condo/step-0")}
                                            className={[
                                                "h-[46px] px-10 rounded-xl border-0 text-white font-extrabold text-base tracking-[0.2px]",
                                                "shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
                                                "!bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer",
                                                "focus:outline-none focus:ring-2 focus:ring-blue-200",
                                            ].join(" ")}
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                                                    <span className="text-[16px] font-black leading-none">+</span>
                                                </span>
                                                เพิ่มคอนโดมิเนียม
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button type="button" className="text-gray-500 font-bold underline underline-offset-4 hover:text-gray-700" onClick={() => { }}>
                                    จัดเรียงลำดับ
                                </button>
                            </div>

                            <div className="mt-8">
                                {tab === "condo" ? (
                                    <>
                                        {/* loading / error */}
                                        {loading && (
                                            <div className="text-center text-gray-500 font-bold py-10">
                                                กำลังโหลดรายการคอนโด...
                                            </div>
                                        )}

                                        {!loading && error && (
                                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 shadow-sm">
                                                <div className="font-extrabold text-rose-700">โหลดข้อมูลไม่สำเร็จ</div>
                                                <div className="mt-1 text-sm font-bold text-rose-600">{error}</div>

                                                <button
                                                    type="button"
                                                    onClick={loadCondos}
                                                    className="mt-4 h-[44px] px-6 rounded-xl bg-white border border-rose-200 text-rose-700 font-extrabold text-sm shadow-sm hover:bg-rose-100/40 active:scale-[0.98]"
                                                >
                                                    ลองใหม่
                                                </button>
                                            </div>
                                        )}

                                        {/* empty state */}
                                        {!loading && !error && sortedCondos.length === 0 && (
                                            <div className="rounded-2xl border border-blue-100/60 bg-white px-8 py-10 text-center shadow-sm">
                                                <div className="text-lg font-extrabold text-gray-900">ยังไม่มีคอนโดในระบบ</div>
                                                <div className="mt-2 text-sm font-bold text-gray-600">
                                                    กด “เพิ่มคอนโดมิเนียม” เพื่อเริ่มตั้งค่า Step 0–Step 9
                                                </div>
                                            </div>
                                        )}

                                        {/* list condos */}
                                        {!loading && !error && sortedCondos.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {sortedCondos.map((c) => {
                                                    const hasDebt = c.unpaidBills > 0;

                                                    const debtBoxClass = hasDebt
                                                        ? "bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]"
                                                        : "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]";

                                                    const highlight =
                                                        createdCondoId && c.id === createdCondoId ? "ring-4 ring-blue-200/70" : "";

                                                    return (
                                                        <div
                                                            key={c.id}
                                                            className={[
                                                                "rounded-2xl bg-white border border-blue-100/60 shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden",
                                                                highlight,
                                                            ].join(" ")}
                                                        >
                                                            <div className="px-5 py-3 bg-[#f3f7ff] border-b border-blue-100/60">
                                                                <div className="text-sm font-extrabold tracking-[0.2px] text-gray-800">{c.name}</div>
                                                            </div>

                                                            <div className="px-5 py-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-16 w-16 rounded-2xl bg-white border border-blue-100/70 shadow-[0_10px_20px_rgba(0,0,0,0.12)] flex items-center justify-center text-blue-700">
                                                                        <CondoIcon />
                                                                    </div>

                                                                    <div className="flex-1 grid grid-cols-3 gap-3">
                                                                        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
                                                                            <div className="text-lg font-extrabold text-gray-900">
                                                                                {c.roomsActive} / {c.roomsTotal}
                                                                            </div>
                                                                            <div className="text-[11px] font-bold text-gray-500">ห้องใช้งาน / ทั้งหมด</div>
                                                                        </div>

                                                                        <div className={["rounded-xl border px-4 py-3 text-center", debtBoxClass].join(" ")}>
                                                                            <div className="text-lg font-extrabold">{c.unpaidBills}</div>
                                                                            <div className="text-[11px] font-bold opacity-80">บิลค้างชำระ</div>
                                                                        </div>

                                                                        <div className="flex items-center justify-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => goDashboard(c.id)}
                                                                                className={[
                                                                                    "h-[40px] px-6 rounded-xl border-0 text-white font-extrabold text-sm tracking-[0.2px]",
                                                                                    "shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
                                                                                    "!bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer",
                                                                                    "focus:outline-none focus:ring-2 focus:ring-blue-200",
                                                                                ].join(" ")}
                                                                            >
                                                                                จัดการ
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <UserManagementPanel condoName={condoNameForUsers} />
                                )}
                            </div>

                            <div className="h-6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}