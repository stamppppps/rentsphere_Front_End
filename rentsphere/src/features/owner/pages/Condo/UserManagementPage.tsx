import React, { useMemo, useState } from "react";

type UserRole = "OWNER" | "ADMIN";

type ManagedUser = {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    role: UserRole;
    condos: string[];
};

const roleLabel: Record<UserRole, string> = {
    OWNER: "เจ้าของ",
    ADMIN: "แอดมิน",
};

function uid() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

type UserFormState = {
    fullName: string;
    phone: string;
    email: string;
    role: UserRole;
};

const emptyForm: UserFormState = {
    fullName: "",
    phone: "",
    email: "",
    role: "ADMIN",
};

export default function UserManagementPage() {
    // mock data
    const [users, setUsers] = useState<ManagedUser[]>([
        {
            id: "1",
            fullName: "Mr. Kittidet Suksarn",
            phone: "081234567",
            email: "kittidet@gmail.com",
            role: "OWNER",
            condos: ["สวัสดีคอนโด", "ABC คอนโด"],
        },
    ]);

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<UserFormState>(emptyForm);

    const title = mode === "create" ? "เพิ่มเจ้าหน้าที่" : "แก้ไขเจ้าหน้าที่";

    const rows = useMemo(() => {
        return users.map((u, idx) => ({ ...u, no: idx + 1 }));
    }, [users]);

    const openCreate = () => {
        setMode("create");
        setEditingId(null);
        setForm(emptyForm);
        setOpen(true);
    };

    const openEdit = (u: ManagedUser) => {
        setMode("edit");
        setEditingId(u.id);
        setForm({
            fullName: u.fullName,
            phone: u.phone,
            email: u.email,
            role: u.role,
        });
        setOpen(true);
    };

    const closeModal = () => setOpen(false);

    const onSave = () => {
        // validation เบา ๆ
        if (!form.fullName.trim()) return;
        if (!form.phone.trim()) return;
        if (!form.email.trim()) return;

        if (mode === "create") {
            const newUser: ManagedUser = {
                id: uid(),
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                role: form.role,
                condos: [],
            };
            setUsers((prev) => [newUser, ...prev]);
            setOpen(false);
            return;
        }

        // edit
        setUsers((prev) =>
            prev.map((u) =>
                u.id === editingId
                    ? {
                        ...u,
                        fullName: form.fullName.trim(),
                        phone: form.phone.trim(),
                        email: form.email.trim(),
                        role: form.role,
                    }
                    : u
            )
        );
        setOpen(false);
    };

    return (
        <div className="w-full">
            <div className="rounded-3xl bg-white/70 backdrop-blur border border-blue-100/60 shadow-[0_18px_50px_rgba(15,23,42,0.12)] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 px-8 py-6 bg-[#f3f7ff] border-b border-blue-100/60">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-1.5 rounded-full bg-[#7aa8ff]" />
                        <div>
                            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                                จัดการผู้ใช้งาน
                            </div>
                            <div className="mt-1 text-sm font-bold text-slate-600">
                                เพิ่ม/แก้ไขเจ้าหน้าที่ และกำหนดตำแหน่ง
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={openCreate}
                        className="h-[44px] px-6 rounded-2xl bg-[#93C5FD] text-white font-extrabold text-sm shadow-[0_10px_18px_rgba(0,0,0,0.16)]
                       hover:bg-[#7fb4fb] active:scale-[0.98] transition
                       focus:outline-none focus:ring-4 focus:ring-blue-200/70"
                    >
                        เพิ่ม
                    </button>
                </div>

                {/* Table */}
                <div className="px-8 py-8">
                    <div className="rounded-3xl bg-white border border-blue-100/60 shadow-sm overflow-hidden">
                        <div className="px-6 pt-6">
                            <div className="grid grid-cols-12 gap-4 items-center px-6 py-4 rounded-2xl bg-[#eef3ff] text-slate-700 font-extrabold">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-4">ชื่อ/ตำแหน่ง</div>
                                <div className="col-span-3">เบอร์/อีเมล</div>
                                <div className="col-span-3">อสังหาริมทรัพย์</div>
                                <div className="col-span-1 text-right"> </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6">
                            {rows.length === 0 ? (
                                <div className="text-center text-slate-500 font-bold py-10">
                                    ยังไม่มีผู้ใช้งาน
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200/80">
                                    {rows.map((u) => (
                                        <div
                                            key={u.id}
                                            className="grid grid-cols-12 gap-4 items-start px-6 py-6"
                                        >
                                            <div className="col-span-1 text-center font-extrabold text-slate-600">
                                                {u.no}
                                            </div>

                                            <div className="col-span-4">
                                                <div className="font-extrabold text-slate-900">
                                                    {u.fullName}
                                                </div>
                                                <div className="mt-1 text-sm font-bold text-slate-500">
                                                    {roleLabel[u.role]}
                                                </div>
                                            </div>

                                            <div className="col-span-3">
                                                <div className="font-extrabold text-slate-900">
                                                    {u.phone}
                                                </div>
                                                <div className="mt-1 text-sm font-bold text-slate-500">
                                                    {u.email}
                                                </div>
                                            </div>

                                            <div className="col-span-3">
                                                {u.condos.length === 0 ? (
                                                    <div className="text-sm font-bold text-slate-400">
                                                        ยังไม่ได้ผูกคอนโด
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        {u.condos.slice(0, 2).map((c) => (
                                                            <div
                                                                key={c}
                                                                className="text-sm font-extrabold text-slate-700"
                                                            >
                                                                {c}
                                                            </div>
                                                        ))}
                                                        {u.condos.length > 2 && (
                                                            <div className="text-xs font-extrabold text-slate-400">
                                                                +{u.condos.length - 2} เพิ่มเติม
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-span-1 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(u)}
                                                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-extrabold text-sm
                                     shadow-sm hover:bg-slate-50 active:scale-[0.98] transition
                                     focus:outline-none focus:ring-2 focus:ring-slate-200"
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
            </div>

            {/* ===== Modal ===== */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={closeModal}
                    />

                    <div
                        className="relative w-full max-w-[860px] rounded-3xl bg-white shadow-[0_18px_55px_rgba(0,0,0,0.35)]
                       border border-blue-100/60 overflow-hidden"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* modal header */}
                        <div className="px-10 py-7 border-b border-slate-200/80">
                            <div className="text-3xl font-extrabold text-slate-900">
                                {title}
                            </div>
                        </div>

                        <div className="px-10 py-8">
                            <div className="grid grid-cols-1 gap-6">
                                <Field label="ชื่อและนามสกุล">
                                    <input
                                        value={form.fullName}
                                        onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                                        className={inputLikeMock()}
                                        placeholder=""
                                    />
                                </Field>

                                <Field label="เบอร์โทรศัพท์มือถือ">
                                    <input
                                        value={form.phone}
                                        onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                                        className={inputLikeMock()}
                                        placeholder=""
                                    />
                                </Field>

                                <Field label="อีเมล">
                                    <input
                                        value={form.email}
                                        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                                        className={inputLikeMock()}
                                        placeholder=""
                                    />
                                </Field>

                                <Field label="ตำแหน่ง">
                                    <select
                                        value={form.role}
                                        onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as UserRole }))}
                                        className={selectLikeMock()}
                                    >
                                        <option value="OWNER">เจ้าของ</option>
                                        <option value="ADMIN">แอดมิน</option>
                                    </select>
                                </Field>
                            </div>

                            {/* actions */}
                            <div className="mt-10 flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="h-[44px] px-10 rounded-2xl bg-white border border-slate-200 text-slate-700 font-extrabold
                             shadow-sm hover:bg-slate-50 active:scale-[0.98] transition"
                                >
                                    ปิด
                                </button>

                                <button
                                    type="button"
                                    onClick={onSave}
                                    className="h-[44px] px-10 rounded-2xl bg-[#a78bfa] text-white font-extrabold
                             shadow-[0_12px_18px_rgba(0,0,0,0.18)]
                             hover:bg-[#8b5cf6] active:scale-[0.98] transition
                             focus:outline-none focus:ring-4 focus:ring-purple-200/70"
                                >
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="text-sm font-extrabold text-slate-800 mb-3">{label}</div>
            {children}
        </div>
    );
}

function inputLikeMock() {
    return (
        "w-full h-[58px] px-6 rounded-full bg-[#e9e9ff] border border-[#e9e9ff] " +
        "text-slate-900 font-bold shadow-inner " +
        "focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
    );
}

function selectLikeMock() {
    return (
        "w-full h-[58px] px-6 rounded-full bg-[#e9e9ff] border border-[#e9e9ff] " +
        "text-slate-900 font-bold shadow-inner " +
        "focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
    );
}