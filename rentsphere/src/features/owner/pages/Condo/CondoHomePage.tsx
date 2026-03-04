import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/shared/api/http";

type CondoApiItem = any;


function normalizeCondo(x: any) {
  const id = String(x.id ?? x.condoId ?? "");
  const name = String(
    x.name ?? x.nameTh ?? x.nameTH ?? x.condoName ?? x.title ?? "—"
  );

  // ----- roomsTotal -----
  const roomsTotal =
    Number(
      x.roomsTotal ??
        x.totalRooms ??
        x.rooms_total ??
        x.roomsCount ??
        x.stats?.roomsTotal ??
        x.stats?.totalRooms ??
        x._count?.rooms ??
        x.countRooms ??
        0
    ) ||
    (Array.isArray(x.rooms) ? x.rooms.length : 0) ||
    (Array.isArray(x.room) ? x.room.length : 0) ||
    0;


  const roomsActiveDirect = Number(
    x.roomsActive ??
      x.activeRooms ??
      x.rooms_active ??
      x.activeCount ??
      x.stats?.roomsActive ??
      x.stats?.activeRooms ??
      x._count?.activeRooms ??
      0
  );

  const roomsActiveFromRooms =
    Array.isArray(x.rooms)
      ? x.rooms.filter((r: any) => {
          if (typeof r?.isActive === "boolean") return r.isActive;
          if (typeof r?.active === "boolean") return r.active;
          const s = String(r?.status ?? r?.state ?? "").toUpperCase();
          return s === "ACTIVE" || s === "OCCUPIED" || s === "IN_USE";
        }).length
      : 0;

  const roomsActive = roomsActiveDirect || roomsActiveFromRooms || 0;

  // ----- unpaidBills -----
  const unpaidBills =
    Number(
      x.unpaidBills ??
        x.unpaid ??
        x.unpaid_bills ??
        x.unpaidCount ??
        x.stats?.unpaidBills ??
        x.stats?.unpaid ??
        x.stats?.unpaidCount ??
        x.billStats?.unpaidBills ??
        x.billStats?.unpaidCount ??
        0
    ) || 0;

  return { id, name, roomsTotal, roomsActive, unpaidBills };
}

async function fetchCondosFromApi(): Promise<CondoItem[]> {
  const data = await api<any>(`/owner/condos`, { method: "GET" });

  const list =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
      ? data.data
      : [];

  return list.map(normalizeCondo);
}

/* ====== types ====== */
type CondoItem = {
  id: string;
  name: string;
  roomsTotal: number;
  roomsActive: number;
  unpaidBills: number;
};

/* ====== Staff permissions (modules) ====== */
type PermissionModule =
  | "DASHBOARD"
  | "ROOMS"
  | "BILLING"
  | "PAYMENT"
  | "PARCEL"
  | "REPAIR"
  | "FACILITY"
  | "ANNOUNCE"
  | "CHAT"
  | "STAFF";

const MODULES: { code: PermissionModule; label: string }[] = [
  { code: "DASHBOARD", label: "Dashboard" },
  { code: "ROOMS", label: "Rooms" },
  { code: "BILLING", label: "Billing" },
  { code: "PAYMENT", label: "Payment" },
  { code: "PARCEL", label: "Parcel" },
  { code: "REPAIR", label: "Repair" },
  { code: "FACILITY", label: "Facility" },
  { code: "ANNOUNCE", label: "Announce" },
  { code: "CHAT", label: "Chat" },
  { code: "STAFF", label: "Staff" },
];

type StaffItem = {
  id: string; // membershipId
  staffUserId: string;
  fullName: string;
  phone?: string;
  email?: string;
  staffPosition?: string; 
  isActive: boolean;
  allowedModules: PermissionModule[];
};

type StaffForm = {
  fullName: string;
  phone: string;
  email: string;
  staffPosition: string;
  allowedModules: PermissionModule[];
  isActive: boolean;
};

const emptyStaffForm: StaffForm = {
  fullName: "",
  phone: "",
  email: "",
  staffPosition: "นิติ",
  allowedModules: MODULES.map((m) => m.code), 
  isActive: true,
};

/* ====== icons / helpers  ====== */
function CondoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21h18M6 21V5a2 2 0 0 1 2-2h3v18M13 21V9h5a2 2 0 0 1 2 2v10"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 7h.01M9 11h.01M9 15h.01M16 13h.01M16 17h.01"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21v-2a4 4 0 0 0-3-3.87"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 3.13a4 4 0 0 1 0 7.75"
      />
    </svg>
  );
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


function getTokenFromStorage(): string | null {
  try {
    const raw = localStorage.getItem("rentsphere_auth");
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch {
    return null;
  }
}

function isUnauthorizedError(e: any) {
  if (
    e &&
    typeof e === "object" &&
    e.name === "ApiError" &&
    typeof e.status === "number"
  ) {
    return e.status === 401;
  }
  const msg = String(e?.message ?? "");
  return /missing token|unauthorized|jwt|token/i.test(msg);
}

function isHtmlError(e: any) {
  const raw = String((e as any)?.raw ?? "");
  return raw.startsWith("<!doctype") || raw.startsWith("<html");
}


function UserManagementPanel({
  condoId,
  condoName,
}: {
  condoId: string | null;
  condoName: string;
}) {
  const [users, setUsers] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null); // membershipId
  const [form, setForm] = useState<StaffForm>(emptyStaffForm);

  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const rows = useMemo(
    () => users.map((u, idx) => ({ ...u, no: idx + 1 })),
    [users]
  );

  const loadUsers = async () => {
    if (!condoId) {
      setUsers([]);
      return;
    }
    try {
      setError(null);
      setLoading(true);

      const data = await api<any>(`/owner/condos/${condoId}/staff`, {
        method: "GET",
      });

      const list: any[] =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
          ? data.data
          : [];

      setUsers(
        list.map((x: any) => ({
          id: String(x.id),
          staffUserId: String(x.staffUserId ?? ""),
          fullName: String(x.fullName ?? ""),
          phone: x.phone ? String(x.phone) : "",
          email: x.email ? String(x.email) : "",
          staffPosition: x.staffPosition ? String(x.staffPosition) : "",
          isActive: Boolean(x.isActive ?? true),
          allowedModules: Array.isArray(x.allowedModules) ? x.allowedModules : [],
        }))
      );
    } catch (e: any) {
      setUsers([]);
      setError(e?.message ?? "โหลดรายชื่อไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();

  }, [condoId]);

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm({ ...emptyStaffForm });
    setTempPassword(null);
    setOpen(true);
  };

  const openEdit = (u: StaffItem) => {
    setMode("edit");
    setEditingId(u.id);
    setForm({
      fullName: u.fullName ?? "",
      phone: u.phone ?? "",
      email: u.email ?? "",
      staffPosition: u.staffPosition ?? "นิติ",
      allowedModules: u.allowedModules ?? [],
      isActive: u.isActive ?? true,
    });
    setTempPassword(null);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const toggleModule = (m: PermissionModule) => {
    setForm((s) => {
      const has = s.allowedModules.includes(m);
      return {
        ...s,
        allowedModules: has
          ? s.allowedModules.filter((x) => x !== m)
          : [...s.allowedModules, m],
      };
    });
  };

  const onSave = async () => {
    if (!condoId) return;
    if (!form.fullName.trim()) return;
    if (!form.email.trim() && !form.phone.trim()) return;

    try {
      setError(null);
      setLoading(true);

      if (mode === "create") {
        const payload = {
          fullName: form.fullName.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          staffPosition: form.staffPosition.trim(),
          allowedModules: form.allowedModules,
        };

        const res = await api<any>(`/owner/condos/${condoId}/staff`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const pw = res?.tempPassword ? String(res.tempPassword) : null;
        setTempPassword(pw);

        await loadUsers();
        if (!pw) setOpen(false);
        return;
      }

      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        staffPosition: form.staffPosition.trim(),
        allowedModules: form.allowedModules,
        isActive: form.isActive,
      };

      await api<any>(`/owner/condos/${condoId}/staff/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      await loadUsers();
      setOpen(false);
    } catch (e: any) {
      setError(e?.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-blue-100/60 shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-8 py-6 bg-[#f3f7ff] border-b border-blue-100/60">
        <div>
          <div className="text-xl font-extrabold tracking-tight text-gray-900">
            จัดการผู้ใช้งาน (เจ้าหน้าที่)
          </div>
          <div className="mt-1 text-sm font-bold text-gray-600">
            คอนโด: {condoName}
          </div>
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
          disabled={!condoId}
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
              <div className="col-span-3">สิทธิ์ (Modules)</div>
              <div className="col-span-1 text-right"></div>
            </div>
          </div>

          <div className="px-6 pb-6">
            {loading ? (
              <div className="text-center text-gray-500 font-bold py-10">
                กำลังโหลด...
              </div>
            ) : error ? (
              <div className="text-center text-rose-600 font-extrabold py-10">
                {error}
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center text-gray-500 font-bold py-10">
                ยังไม่มีผู้ใช้งาน
              </div>
            ) : (
              <div className="divide-y divide-gray-200/80">
                {rows.map((u) => (
                  <div
                    key={u.id}
                    className="grid grid-cols-12 gap-4 items-start px-6 py-6"
                  >
                    <div className="col-span-1 text-center font-extrabold text-gray-600">
                      {u.no}
                    </div>

                    <div className="col-span-4">
                      <div className="font-extrabold text-gray-900">
                        {u.fullName}
                      </div>
                      <div className="mt-1 text-sm font-bold text-gray-500">
                        {u.staffPosition || "—"}{" "}
                        {!u.isActive ? "(ปิดใช้งาน)" : ""}
                      </div>
                    </div>

                    <div className="col-span-3">
                      <div className="font-extrabold text-gray-900">
                        {u.phone || "—"}
                      </div>
                      <div className="mt-1 text-sm font-bold text-gray-500">
                        {u.email || "—"}
                      </div>
                    </div>

                    <div className="col-span-3">
                      <div className="text-sm font-bold text-gray-700">
                        {(u.allowedModules || []).slice(0, 4).join(", ")}
                        {(u.allowedModules || []).length > 4
                          ? ` +${u.allowedModules.length - 4}`
                          : ""}
                      </div>
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
            className="relative w-full max-w-[900px] rounded-2xl bg-white shadow-[0_18px_55px_rgba(0,0,0,0.35)]
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
              {tempPassword && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                  <div className="font-extrabold text-amber-800">
                    รหัสผ่านชั่วคราว (ให้เจ้าหน้าที่ใช้ล็อกอินครั้งแรก)
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="font-mono font-black text-amber-900 text-lg">
                      {tempPassword}
                    </div>
                    <button
                      className="h-[38px] px-4 rounded-xl bg-white border border-amber-200 font-extrabold"
                      onClick={() =>
                        navigator.clipboard.writeText(tempPassword)
                      }
                      type="button"
                    >
                      คัดลอก
                    </button>
                  </div>
                  <div className="mt-3 text-xs font-bold text-amber-700">
                    คัดลอกแล้วกด “ปิด” ได้เลย
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                <Field label="ชื่อและนามสกุล">
                  <input
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, fullName: e.target.value }))
                    }
                    className={inputPill()}
                  />
                </Field>

                <Field label="เบอร์โทรศัพท์มือถือ">
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, phone: e.target.value }))
                    }
                    className={inputPill()}
                  />
                </Field>

                <Field label="อีเมล">
                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, email: e.target.value }))
                    }
                    className={inputPill()}
                  />
                </Field>

                <Field label="ตำแหน่ง (เช่น นิติ/แอดมิน)">
                  <input
                    value={form.staffPosition}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        staffPosition: e.target.value,
                      }))
                    }
                    className={inputPill()}
                  />
                </Field>

                <Field label="สิทธิ์เข้าถึง (Modules)">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {MODULES.map((m) => {
                      const checked = form.allowedModules.includes(m.code);
                      return (
                        <label
                          key={m.code}
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleModule(m.code)}
                          />
                          <span className="font-extrabold text-gray-800">
                            {m.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </Field>

                {mode === "edit" && (
                  <Field label="สถานะการใช้งาน">
                    <select
                      value={form.isActive ? "ACTIVE" : "INACTIVE"}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          isActive: e.target.value === "ACTIVE",
                        }))
                      }
                      className={selectPill()}
                    >
                      <option value="ACTIVE">ใช้งาน</option>
                      <option value="INACTIVE">ปิดใช้งาน</option>
                    </select>
                  </Field>
                )}
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

              <div className="mt-3 text-xs font-bold text-gray-400">
                * BE: /owner/condos/:condoId/staff (GET/POST/PATCH)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
    CondoHomePage (production-safe)
   ========================= */
type LocationState = { justCreated?: boolean; condoId?: string } | null;

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

  const token = useMemo(() => getTokenFromStorage(), []);

  // ✅ Redirect login อัตโนมัติ ถ้าไม่มี token
  useEffect(() => {
    if (!token) {
      nav("/login", {
        replace: true,
        state: { from: location.pathname + location.search },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadCondos = async () => {
    if (!getTokenFromStorage()) {
      setLoading(false);
      setCondos([]);
      setError(null);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const data = await api<any>("/owner/condos", { method: "GET" });

      const listRaw =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
          ? data.data
          : [];

      setCondos(listRaw.map(normalizeCondo));
    } catch (e: any) {
      if (isUnauthorizedError(e)) {
        nav("/login", {
          replace: true,
          state: { from: location.pathname + location.search },
        });
        return;
      }

      if (isHtmlError(e)) {
        setCondos([]);
        setError(
          "ระบบตอบกลับผิดรูปแบบ (HTML) กรุณาตรวจสอบ API URL/Proxy/Server"
        );
        return;
      }

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

  const goDashboard = (condoId: string) =>
    nav("/owner/dashboard", { state: { condoId } });

  // ✅ ผูกหน้า “จัดการผู้ใช้งาน” กับคอนโดตัวแรกก่อน (MVP)
  const condoNameForUsers = sortedCondos[0]?.name ?? "—";
  const condoIdForUsers = sortedCondos[0]?.id ?? null;

  return (
    <div className="owner-ui min-h-[calc(100vh-64px)] bg-[#EEF4FF] font-sans text-black/85">
      <div className="px-8 py-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] border border-blue-100/60 overflow-hidden">
            <div className="px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/60">
              <div className="text-2xl font-extrabold tracking-tight text-gray-900">
                คอนโดมิเนียม
              </div>
            </div>

            <div className="px-6 py-6">
              {/* tabs */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-3xl">
                  <div className="flex items-end justify-center gap-14">
                    <button
                      type="button"
                      onClick={() => setTab("condo")}
                      className="group flex flex-col items-center gap-2"
                    >
                      <div
                        className={[
                          "h-12 w-12 rounded-2xl flex items-center justify-center",
                          "shadow-[0_10px_20px_rgba(0,0,0,0.12)] border transition",
                          tab === "condo"
                            ? "bg-white border-blue-200 text-blue-700"
                            : "bg-white/70 border-gray-200 text-gray-500 group-hover:text-gray-700",
                        ].join(" ")}
                        aria-hidden
                      >
                        <CondoIcon />
                      </div>

                      <div
                        className={[
                          "text-lg font-extrabold tracking-[0.2px] transition",
                          tab === "condo"
                            ? "text-gray-900"
                            : "text-gray-500 group-hover:text-gray-700",
                        ].join(" ")}
                      >
                        จัดการคอนโดมิเนียม
                      </div>

                      <div
                        className={[
                          "h-[2px] rounded-full transition",
                          tab === "condo"
                            ? "w-44 bg-[#5b86ff]"
                            : "w-44 bg-transparent",
                        ].join(" ")}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setTab("users")}
                      className="group flex flex-col items-center gap-2"
                    >
                      <div
                        className={[
                          "h-12 w-12 rounded-2xl flex items-center justify-center",
                          "shadow-[0_10px_20px_rgba(0,0,0,0.12)] border transition",
                          tab === "users"
                            ? "bg-white border-blue-200 text-blue-700"
                            : "bg-white/70 border-gray-200 text-gray-500 group-hover:text-gray-700",
                        ].join(" ")}
                        aria-hidden
                      >
                        <UsersIcon />
                      </div>

                      <div
                        className={[
                          "text-lg font-extrabold tracking-[0.2px] transition",
                          tab === "users"
                            ? "text-gray-900"
                            : "text-gray-500 group-hover:text-gray-700",
                        ].join(" ")}
                      >
                        จัดการผู้ใช้งาน
                      </div>

                      <div
                        className={[
                          "h-[2px] rounded-full transition",
                          tab === "users"
                            ? "w-36 bg-[#5b86ff]"
                            : "w-36 bg-transparent",
                        ].join(" ")}
                      />
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
                          <span className="text-[16px] font-black leading-none">
                            +
                          </span>
                        </span>
                        เพิ่มคอนโดมิเนียม
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="text-gray-500 font-bold underline underline-offset-4 hover:text-gray-700"
                  onClick={() => {}}
                >
                  จัดเรียงลำดับ
                </button>
              </div>

              <div className="mt-8">
                {tab === "condo" ? (
                  <>
                    {loading && (
                      <div className="text-center text-gray-500 font-bold py-10">
                        กำลังโหลดรายการคอนโด...
                      </div>
                    )}

                    {!loading && error && (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 shadow-sm">
                        <div className="font-extrabold text-rose-700">
                          โหลดข้อมูลไม่สำเร็จ
                        </div>
                        <div className="mt-1 text-sm font-bold text-rose-600">
                          {error}
                        </div>

                        <button
                          type="button"
                          onClick={loadCondos}
                          className="mt-4 h-[44px] px-6 rounded-xl bg-white border border-rose-200 text-rose-700 font-extrabold text-sm shadow-sm hover:bg-rose-100/40 active:scale-[0.98]"
                        >
                          ลองใหม่
                        </button>
                      </div>
                    )}

                    {!loading && !error && sortedCondos.length === 0 && (
                      <div className="rounded-2xl border border-blue-100/60 bg-white px-8 py-10 text-center shadow-sm">
                        <div className="text-lg font-extrabold text-gray-900">
                          ยังไม่มีคอนโดในระบบ
                        </div>
                        <div className="mt-2 text-sm font-bold text-gray-600">
                          กด “เพิ่มคอนโดมิเนียม” เพื่อเริ่มตั้งค่า
                        </div>
                      </div>
                    )}

                    {!loading && !error && sortedCondos.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sortedCondos.map((c) => {
                          const hasDebt = c.unpaidBills > 0;
                          const debtBoxClass = hasDebt
                            ? "bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]"
                            : "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]";
                          const highlight =
                            createdCondoId && c.id === createdCondoId
                              ? "ring-4 ring-blue-200/70"
                              : "";

                          return (
                            <div
                              key={c.id}
                              className={[
                                "rounded-2xl bg-white border border-blue-100/60 shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden",
                                highlight,
                              ].join(" ")}
                            >
                              <div className="px-5 py-3 bg-[#f3f7ff] border-b border-blue-100/60">
                                <div className="text-sm font-extrabold tracking-[0.2px] text-gray-800">
                                  {c.name}
                                </div>
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
                                      <div className="text-[11px] font-bold text-gray-500">
                                        ห้องใช้งาน / ทั้งหมด
                                      </div>
                                    </div>

                                    <div
                                      className={[
                                        "rounded-xl border px-4 py-3 text-center",
                                        debtBoxClass,
                                      ].join(" ")}
                                    >
                                      <div className="text-lg font-extrabold">
                                        {c.unpaidBills}
                                      </div>
                                      <div className="text-[11px] font-bold opacity-80">
                                        บิลค้างชำระ
                                      </div>
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
                  <UserManagementPanel
                    condoId={condoIdForUsers}
                    condoName={condoNameForUsers}
                  />
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