import React, { useState, useEffect } from "react";
import OwnerShell from "@/features/owner/components/OwnerShell";
import { getSelectedCondoId, useCondoStore } from "@/features/owner/stores/condoStore";
import {
  LayoutList,
  Search,
  Clock,
  CheckCircle2,
  RefreshCcw,
  XCircle,
  MessageSquare,
  Package,
  User,
  Image as ImageIcon,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const base =
    "text-[11px] font-black px-2.5 py-1 rounded-full border inline-flex items-center gap-1";

  if (status === "new")
    return (
      <span className={`${base} bg-blue-50 text-blue-700 border-blue-100`}>
        ใหม่
      </span>
    );
  if (status === "in_progress")
    return (
      <span className={`${base} bg-amber-50 text-amber-700 border-amber-100`}>
        กำลังทำ
      </span>
    );
  if (status === "done")
    return (
      <span
        className={`${base} bg-emerald-50 text-emerald-700 border-emerald-100`}
      >
        เสร็จ
      </span>
    );
  if (status === "rejected")
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
  colorScheme = "blue",
}: {
  active: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  colorScheme?: "blue" | "amber" | "emerald";
}) => {
  let shadowColor = "shadow-blue-200";
  if (colorScheme === "amber") {
    shadowColor = "shadow-amber-200";
  } else if (colorScheme === "emerald") {
    shadowColor = "shadow-emerald-200";
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${active
          ? `text-white shadow-lg ${shadowColor} ${colorScheme === "amber"
            ? "bg-gradient-to-r from-amber-500 to-yellow-400"
            : colorScheme === "emerald"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
              : "bg-gradient-to-r from-blue-600 to-sky-500"
          }`
          : "text-slate-600 hover:bg-slate-50"
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const ActionButton = ({
  disabled,
  onClick,
  icon,
  label,
  sub,
  variant,
}: {
  disabled?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
  variant?: "primary" | "emerald" | "rose";
}) => {
  const styles =
    variant === "primary"
      ? "text-white shadow-blue-200"
      : variant === "emerald"
        ? "bg-white border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 shadow-emerald-50"
        : variant === "rose"
          ? "bg-white border-2 border-rose-100 hover:border-rose-500 hover:bg-rose-50 text-rose-700 shadow-rose-50"
          : "bg-white border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700 shadow-slate-50";

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex-1 min-w-[140px] flex flex-col items-center justify-center p-4 rounded-3xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale ${styles} ${variant === "primary" ? "bg-gradient-to-r from-blue-600 to-sky-500" : ""}`}
    >
      <div className="mb-2 p-2 rounded-2xl">{icon}</div>
      <span className="text-base">{label}</span>
      <span className="text-[10px] uppercase tracking-widest opacity-60 font-black">
        {sub}
      </span>
    </button>
  );
};

export default function OwnerAdminRepairsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const loadRepairs = async () => {
    setLoading(true);
    setErr("");
    try {
      const condoId = getSelectedCondoId();
      if (!condoId) throw new Error("Please select a condo first.");

      const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API}/repair/condo/${condoId}`);
      if (!res.ok) throw new Error("Failed to load repairs");

      const data = await res.json();
      setRepairs(data.items || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e.message || "Error loading repairs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepairs();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API}/repair/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");

      loadRepairs(); // Refresh the list
      if (selectedRepair && selectedRepair.id === id) {
        setSelectedRepair({ ...selectedRepair, status });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e.message || "Failed to update status");
    }
  };

  const filteredRepairs = repairs.filter(r => {
    if (filter === "all") return true;
    if (filter === "new") return r.status === "OPEN";
    if (filter === "in_progress") return r.status === "IN_PROGRESS" || r.status === "WAITING_PARTS";
    if (filter === "done") return r.status === "DONE";
    if (filter === "rejected") return r.status === "CANCELLED";
    return true;
  });

  const condoName = useCondoStore(s => s.condoName);

  return (
    <OwnerShell title="งานแจ้งซ่อม" activeKey="maintenance" showSidebar={true} condoName={condoName || "คอนโดมิเนียม"}>
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl text-white shadow-lg shadow-blue-200 bg-gradient-to-r from-blue-600 to-sky-500">
            <LayoutList size={22} />
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900">Admin Repairs</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Management Dashboard</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-blue-100/60 bg-white p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-blue-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-1">
            <FilterButton active={filter === "new"} onClick={() => setFilter("new")} icon={<Search size={16} />} label="ใหม่" />
            <FilterButton active={filter === "in_progress"} onClick={() => setFilter("in_progress")} icon={<Clock size={16} />} label="กำลังทำ" colorScheme="amber" />
            <FilterButton active={filter === "done"} onClick={() => setFilter("done")} icon={<CheckCircle2 size={16} />} label="เสร็จ" colorScheme="emerald" />
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")} icon={<LayoutList size={16} />} label="ทั้งหมด" />
          </div>

          <button onClick={loadRepairs} className="flex items-center justify-center gap-2 px-5 py-2.5 text-blue-600 hover:bg-blue-50 font-black rounded-xl transition-all">
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            รีเฟรชข้อมูล
          </button>
        </div>

        {err && (
          <div className="mt-4 bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3">
            <XCircle size={20} />
            <span className="text-sm font-black">{err}</span>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          <section className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-100/20 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800">รายการแจ้งซ่อม</h2>
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full font-black">
                {filteredRepairs.length} งาน
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[calc(100vh-320px)]">
              {loading && repairs.length === 0 ? (
                <div className="p-4 text-center text-slate-500 font-bold">กำลังโหลด...</div>
              ) : filteredRepairs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3 opacity-60">
                  <div className="bg-slate-100 p-4 rounded-full"><Search size={32} /></div>
                  <p className="text-sm font-bold italic">ยังไม่มีงานแจ้งซ่อม</p>
                </div>
              ) : (
                filteredRepairs.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRepair(r)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedRepair?.id === r.id
                      ? "border-blue-400 bg-blue-50 shadow-md"
                      : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 truncate pr-2">{r.problem_type}</h3>
                      <StatusBadge status={r.status === "OPEN" ? "new" : r.status === "IN_PROGRESS" || r.status === "WAITING_PARTS" ? "in_progress" : r.status === "DONE" ? "done" : "rejected"} />
                    </div>
                    <div className="text-xs text-slate-500 flex justify-between">
                      <span>{r.room ? `ห้อง ${r.room}` : "ห้อง -"}</span>
                      <span>{new Date(r.created_at).toLocaleDateString("th-TH")}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600 line-clamp-2">{r.description}</div>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-100/20 flex flex-col">
            <div className="p-5 border-b border-slate-50">
              <h2 className="font-extrabold text-slate-800">รายละเอียดงานแจ้งซ่อม</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
              {!selectedRepair ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto gap-4 py-20">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-400">
                    <LayoutList size={40} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-800">โปรดเลือกรายการ</h3>
                    <p className="text-slate-500 font-bold">เลือกรายการจากรายชื่อด้านซ้ายเพื่อดูรายละเอียด</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-3xl font-black text-slate-900">{selectedRepair.problem_type}</h3>
                        <StatusBadge status={selectedRepair.status === "OPEN" ? "new" : selectedRepair.status === "IN_PROGRESS" || selectedRepair.status === "WAITING_PARTS" ? "in_progress" : selectedRepair.status === "DONE" ? "done" : "rejected"} />
                      </div>
                      <div className="flex items-center gap-4 text-slate-500 font-bold">
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                            <Package size={14} />
                          </div>
                          <span>ห้อง {selectedRepair.room || "-"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                            <User size={14} />
                          </div>
                          <span>{selectedRepair.tenantName || "ผู้เช่า"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">วันที่แจ้ง</span>
                      <span className="text-lg font-mono font-black text-slate-700">
                        {new Date(selectedRepair.created_at).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <MessageSquare size={16} />
                          <h4 className="text-sm font-black uppercase tracking-wider">รายละเอียดปัญหา</h4>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-bold whitespace-pre-wrap">
                          {selectedRepair.description || "ไม่มีรายละเอียด"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedRepair.images && selectedRepair.images.length > 0 && (
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <ImageIcon size={16} />
                        <h4 className="text-sm font-black uppercase tracking-wider">
                          รูปประกอบ ({selectedRepair.images.length} รูป)
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedRepair.images.map((url: string, idx: number) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={url}
                              alt={`repair-${idx}`}
                              className="w-full h-48 object-cover rounded-2xl border border-slate-200 hover:opacity-80 hover:shadow-lg transition-all cursor-pointer"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-black mb-2">
                      <CheckCircle2 size={18} className="text-blue-600" />
                      <h4>ดำเนินการจัดการสถานะ</h4>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <ActionButton
                        variant="primary"
                        icon={<Clock size={20} />}
                        label="รับเรื่อง"
                        sub="In Progress"
                        onClick={() => updateStatus(selectedRepair.id, "IN_PROGRESS")}
                        disabled={selectedRepair.status === "IN_PROGRESS"}
                      />
                      <ActionButton
                        variant="emerald"
                        icon={<CheckCircle2 size={20} />}
                        label="เสร็จแล้ว"
                        sub="Done"
                        onClick={() => updateStatus(selectedRepair.id, "DONE")}
                        disabled={selectedRepair.status === "DONE"}
                      />
                      <ActionButton
                        variant="rose"
                        icon={<XCircle size={20} />}
                        label="ยกเลิก/ปฏิเสธ"
                        sub="Cancelled"
                        onClick={() => updateStatus(selectedRepair.id, "CANCELLED")}
                        disabled={selectedRepair.status === "CANCELLED"}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </OwnerShell>
  );
}
