import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutList,
  Home,
  LogOut,
  Search,
  Clock,
  CheckCircle2,
  RefreshCcw,
  XCircle,
  MapPin,
  MessageSquare,
  Maximize2,
  Send,
  Plus,
  Copy,
  X,
  Users,
  Package,
} from "lucide-react";

const API = "http://localhost:3001";

type Repair = {
  id: string;
  created_at: string;
  problem_type: string;
  description: string | null;
  status: string;
  location: string | null;
  room: string | null;
  image_url: string | null;
  line_user_id: string | null;
};

function StatusBadge({ status }: { status: string }) {
  const base =
    "text-[11px] font-black px-2.5 py-1 rounded-full border inline-flex items-center gap-1";
  if (status === "new")
    return (
      <span className={`${base} bg-indigo-50 text-indigo-700 border-indigo-100`}>
        ใหม่
      </span>
    );
  if (status === "กำลังดำเนินงาน")
    return (
      <span className={`${base} bg-amber-50 text-amber-700 border-amber-100`}>
        กำลังทำ
      </span>
    );
  if (status === "เสร็จแล้ว")
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-100`}>
        เสร็จ
      </span>
    );
  if (status === "ปฏิเสธ")
    return (
      <span className={`${base} bg-rose-50 text-rose-700 border-rose-100`}>
        ปฏิเสธ
      </span>
    );
  return (
    <span className={`${base} bg-slate-50 text-slate-700 border-slate-100`}>
      {status}
    </span>
  );
}

const FilterButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
      active
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
        : "text-slate-600 hover:bg-slate-50"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ActionButton = ({
  disabled,
  onClick,
  icon,
  label,
  sub,
  variant,
}: {
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
  variant?: "primary" | "emerald" | "rose";
}) => {
  const styles =
    variant === "primary"
      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
      : variant === "emerald"
      ? "bg-white border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 shadow-emerald-50"
      : variant === "rose"
      ? "bg-white border-2 border-rose-100 hover:border-rose-500 hover:bg-rose-50 text-rose-700 shadow-rose-50"
      : "bg-white border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700 shadow-slate-50";

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex-1 min-w-[140px] flex flex-col items-center justify-center p-4 rounded-3xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale ${styles}`}
    >
      <div className="mb-2 bg-black/0 p-2 rounded-2xl">{icon}</div>
      <span className="text-base">{label}</span>
      <span className="text-[10px] uppercase tracking-widest opacity-60 font-black">
        {sub}
      </span>
    </button>
  );
};

export default function AdminRepairs() {
  const adminSecret = localStorage.getItem("adminSecret") || "";

  const [items, setItems] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [filter, setFilter] = useState<string>("new");
  const [selected, setSelected] = useState<Repair | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ ข้อความที่ admin พิมพ์เอง
  const [customMessage, setCustomMessage] = useState("");

  // ✅ modal สร้างโค้ดผู้เช่า
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");
  const [createdCode, setCreatedCode] = useState<string>("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-admin-secret": adminSecret,
    }),
    [adminSecret]
  );

  const load = async () => {
    setErr("");
    setOk("");
    setLoading(true);
    try {
      if (!adminSecret) {
        window.location.href = "/admin-login";
        return;
      }
      const q = filter ? `?status=${encodeURIComponent(filter)}` : "";
      const r = await fetch(`${API}/admin/repairs${q}`, { headers });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "โหลดรายการไม่สำเร็จ");
      setItems(data.items || []);
    } catch (e: any) {
      setErr(e.message || "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (status: string) => {
    if (!selected) return;
    setActionLoading(true);
    setErr("");
    setOk("");
    try {
      const message =
        customMessage.trim().length > 0
          ? customMessage.trim()
          : `อัปเดตงานแจ้งซ่อม #${selected.id}\nสถานะ: ${status}`;

      const r = await fetch(`${API}/admin/repair/${selected.id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, message }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "อัปเดตสถานะไม่สำเร็จ");

      setOk("อัปเดตแล้ว และส่งข้อความ LINE ให้ผู้เช่าเรียบร้อย ✅");
      setCustomMessage("");
      setSelected(null);
      await load();
    } catch (e: any) {
      setErr(e.message || "error");
    } finally {
      setActionLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminSecret");
    window.location.href = "/admin-login";
  };

  const openCreateModal = () => {
    setOpenCreate(true);
    setCreateErr("");
    setCreatedCode("");
    setFullName("");
    setPhone("");
    setEmail("");
  };

  const createTenantCode = async () => {
    setCreateErr("");
    setCreatedCode("");

    if (!fullName.trim()) {
      setCreateErr("กรุณากรอกชื่อผู้เช่า");
      return;
    }

    setCreating(true);
    try {
      const r = await fetch(`${API}/dorm/register`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
        }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "สร้างโค้ดไม่สำเร็จ");

      setCreatedCode(data.code);
    } catch (e: any) {
      setCreateErr(e?.message || "error");
    } finally {
      setCreating(false);
    }
  };

  const copyCode = async () => {
    if (!createdCode) return;
    await navigator.clipboard.writeText(createdCode);
    alert("คัดลอกโค้ดแล้ว ✅");
  };

  return (
    <div className="w-screen min-h-screen bg-[#F3F4FF] flex flex-col font-sans">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-indigo-100 shadow-sm px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <LayoutList size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Admin Repairs
              </h1>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">
                Management Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ✅ สร้างโค้ดผู้เช่า */}
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-black text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">สร้างโค้ดผู้เช่า</span>
              <span className="sm:hidden">สร้างโค้ด</span>
            </button>

            {/* ✅ ไปหน้าแจ้งพัสดุ */}
            <button
              onClick={() => (window.location.href = "/owner/admin/parcel")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-bold rounded-xl transition-all"
            >
              <Package size={18} />
              <span className="hidden sm:inline">แจ้งพัสดุ</span>
            </button>

            <button
              onClick={() => (window.location.href = "/owner/role")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <Home size={18} />
              <span className="hidden sm:inline">หน้าหลัก</span>
            </button>

            <div className="w-[1px] h-6 bg-slate-200 hidden sm:block mx-1" />

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-black text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-indigo-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-1">
            <FilterButton
              active={filter === "new"}
              onClick={() => setFilter("new")}
              icon={<Search size={16} />}
              label="ใหม่"
            />
            <FilterButton
              active={filter === "in_progress"}
              onClick={() => setFilter("in_progress")}
              icon={<Clock size={16} />}
              label="กำลังทำ"
            />
            <FilterButton
              active={filter === "done"}
              onClick={() => setFilter("done")}
              icon={<CheckCircle2 size={16} />}
              label="เสร็จ"
            />
            <FilterButton
              active={filter === ""}
              onClick={() => setFilter("")}
              icon={<LayoutList size={16} />}
              label="ทั้งหมด"
            />
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            รีเฟรชข้อมูล
          </button>
        </div>

        {err && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3">
            <XCircle size={20} />
            <span className="text-sm font-bold">{err}</span>
          </div>
        )}

        {ok && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle2 size={20} />
            <span className="text-sm font-bold">{ok}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* List */}
          <section className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/20 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800">รายการแจ้งซ่อม</h2>
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full font-bold">
                {items.length} งาน
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[calc(100vh-320px)]">
              {loading && items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
                  <RefreshCcw className="animate-spin" size={32} />
                  <p className="text-sm font-medium">กำลังดึงข้อมูลล่าสุด...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3 opacity-60">
                  <div className="bg-slate-100 p-4 rounded-full">
                    <Search size={32} />
                  </div>
                  <p className="text-sm font-medium italic">ไม่พบรายการแจ้งซ่อมในหมวดนี้</p>
                </div>
              ) : (
                items.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => {
                      setSelected(it);
                      setCustomMessage("");
                      setErr("");
                      setOk("");
                    }}
                    className={`group w-full text-left rounded-2xl p-4 transition-all border-2 ${
                      selected?.id === it.id
                        ? "border-indigo-600 bg-indigo-50/50 shadow-md"
                        : "border-transparent bg-slate-50 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 min-w-0">
                        <div className="font-bold text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors truncate">
                          {it.problem_type}
                        </div>
                        <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
                          <MapPin size={12} />
                          <span className="truncate">
                            ห้อง {it.room || "N/A"} • {it.location || "ไม่ระบุ"}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={it.status} />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-400 border-t border-slate-200/50 pt-2">
                      <div className="flex items-center gap-1 uppercase tracking-wider">
                        <Clock size={12} />
                        {new Date(it.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-indigo-400 group-hover:translate-x-1 transition-transform">
                        รายละเอียด →
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Detail */}
          <section className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/20 flex flex-col">
            <div className="p-5 border-b border-slate-50">
              <h2 className="font-extrabold text-slate-800">รายละเอียดงานแจ้งซ่อม</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
              {!selected ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto gap-4 py-20">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400 animate-pulse">
                    <LayoutList size={40} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-800">โปรดเลือกรายการ</h3>
                    <p className="text-slate-500 font-medium">
                      เลือกข้อมูลแจ้งซ่อมจากแถบด้านซ้าย เพื่อตรวจสอบและดำเนินการ
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-3xl font-black text-slate-900">
                          {selected.problem_type}
                        </h3>
                        <StatusBadge status={selected.status} />
                      </div>
                      <div className="flex items-center gap-4 text-slate-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                            <Home size={14} />
                          </div>
                          <span>ห้อง {selected.room || "-"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                            <MapPin size={14} />
                          </div>
                          <span>{selected.location || "-"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        เลขที่รายการ
                      </span>
                      <span className="text-lg font-mono font-bold text-slate-700">
                        #{selected.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Left */}
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <MessageSquare size={16} />
                          <h4 className="text-sm font-bold uppercase tracking-wider">
                            รายละเอียดปัญหา
                          </h4>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {selected.description || "ไม่ได้ระบุรายละเอียดเพิ่มเติม"}
                        </p>
                      </div>

                      <div className="bg-indigo-50/30 p-5 rounded-2xl flex items-center gap-4">
                        <div className="bg-white p-2.5 rounded-xl border border-indigo-100 text-indigo-600 shadow-sm">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                              selected.line_user_id || "User"
                            }&backgroundColor=6366f1`}
                            className="w-8 h-8 rounded-lg"
                            alt="User"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                            LINE User ID
                          </p>
                          <p className="text-sm font-mono font-bold text-indigo-900 truncate">
                            {selected.line_user_id || "Anonymous"}
                          </p>
                        </div>
                      </div>

                      {/* ✅ Admin message box */}
                      <div className="bg-white border border-indigo-100 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-800 font-black mb-3">
                          <Send size={16} className="text-indigo-600" />
                          ส่งข้อความถึงผู้เช่า (พิมพ์เอง)
                        </div>

                        <textarea
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          placeholder="ตัวอย่าง: รับเรื่องแล้ว ช่างจะเข้าดูพรุ่งนี้ 10:00 / รบกวนอยู่ห้องเพื่อเปิดให้ช่างตรวจ"
                          className="w-full border rounded-2xl p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />

                        <div className="text-[12px] text-slate-500 mt-2">
                          * ถ้าไม่พิมพ์ ระบบจะส่งข้อความมาตรฐานให้อัตโนมัติ
                        </div>
                      </div>
                    </div>

                    {/* Right */}
                    {selected.image_url && (
                      <div className="group relative">
                        <div className="absolute top-4 left-4 z-10">
                          <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                            <Maximize2 size={12} /> รูปประกอบจากผู้แจ้ง
                          </span>
                        </div>
                        <div className="rounded-3xl border-4 border-slate-50 overflow-hidden bg-slate-100 shadow-lg group-hover:shadow-xl transition-all duration-500 aspect-video">
                          <img
                            src={selected.image_url}
                            alt="repair-visual"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
                      <CheckCircle2 size={18} className="text-indigo-600" />
                      <h4>ดำเนินการจัดการสถานะ + ส่ง LINE</h4>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <ActionButton
                        variant="primary"
                        disabled={actionLoading}
                        onClick={() => updateStatus("in_progress")}
                        icon={<Clock size={20} />}
                        label="รับเรื่อง"
                        sub="In Progress"
                      />
                      <ActionButton
                        variant="emerald"
                        disabled={actionLoading}
                        onClick={() => updateStatus("done")}
                        icon={<CheckCircle2 size={20} />}
                        label="เสร็จแล้ว"
                        sub="Done"
                      />
                      <ActionButton
                        variant="rose"
                        disabled={actionLoading}
                        onClick={() => updateStatus("rejected")}
                        icon={<XCircle size={20} />}
                        label="ปฏิเสธ"
                        sub="Rejected"
                      />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 border border-slate-100 italic">
                      <div className="bg-indigo-600 w-1.5 h-1.5 rounded-full mt-2 animate-pulse shrink-0" />
                      <p className="text-[12px] text-slate-500 font-medium">
                        เมื่อกดปุ่ม ระบบจะอัปเดตฐานข้อมูลและส่งข้อความไปหา{" "}
                        <strong className="text-slate-700">LINE ของผู้เช่า</strong> ทันที
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="p-8 text-center text-slate-400 text-sm font-medium">
        &copy; 2024 SmartRepair Management Systems.
      </footer>

      {/* =========================
          ✅ Modal: สร้างโค้ดผู้เช่า
         ========================= */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenCreate(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-indigo-100 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
                  <Users size={20} />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900">สร้างโค้ดผู้เช่า</div>
                  <div className="text-sm text-slate-500 font-semibold mt-1">
                    กรอกข้อมูลผู้เช่า แล้วระบบจะสร้าง “รหัส (code)” ให้เอาไปกรอกหน้า Tenant
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpenCreate(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200"
                aria-label="close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <div className="text-sm font-bold mb-1">ชื่อผู้เช่า *</div>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="เช่น นายสมชาย ใจดี"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-sm font-bold mb-1">เบอร์ (ไม่บังคับ)</div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="081xxxxxxx"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold mb-1">อีเมล (ไม่บังคับ)</div>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              {createErr && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-2xl font-bold text-sm flex items-center gap-2">
                  <XCircle size={18} />
                  {createErr}
                </div>
              )}

              {createdCode ? (
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-3xl">
                  <div className="text-sm font-bold text-indigo-700">โค้ดผู้เช่า</div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 font-mono text-2xl font-black tracking-wider text-slate-900 bg-white rounded-2xl px-4 py-3 border">
                      {createdCode}
                    </div>
                    <button
                      onClick={copyCode}
                      className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Copy size={18} />
                      Copy
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 font-semibold mt-2">
                    เอาโค้ดนี้ไปให้ผู้เช่า → เข้าหน้า Tenant → ใส่โค้ดเพื่อ link LINE
                  </div>

                  <button
                    onClick={() => setOpenCreate(false)}
                    className="w-full mt-4 bg-white border rounded-2xl font-black py-3 hover:bg-slate-50"
                  >
                    เสร็จสิ้น
                  </button>
                </div>
              ) : (
                <button
                  onClick={createTenantCode}
                  disabled={creating}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl disabled:opacity-50"
                >
                  {creating ? "กำลังสร้าง..." : "สร้างโค้ด"}
                </button>
              )}

              {!createdCode && (
                <div className="text-[12px] text-slate-500 font-semibold">
                  หมายเหตุ: ระบบจะสร้าง code ใหม่ แล้วรอผู้เช่าเอาไปกรอกเพื่อเชื่อม LINE
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
