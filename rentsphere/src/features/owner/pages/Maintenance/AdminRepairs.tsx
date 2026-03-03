import React from "react";
import OwnerShell from "@/features/owner/components/OwnerShell";
import {
  LayoutList,
  Search,
  Clock,
  CheckCircle2,
  RefreshCcw,
  XCircle,
  MapPin,
  MessageSquare,
  Maximize2,
  Send,
  Package,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const base =
    "text-[11px] font-black px-2.5 py-1 rounded-full border inline-flex items-center gap-1";

  if (status === "new")
    return (
      <span className={`${base} bg-indigo-50 text-indigo-700 border-indigo-100`}>
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
}: {
  active: boolean;
  onClick?: () => void;
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
  onClick?: () => void;
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
      <div className="mb-2 p-2 rounded-2xl">{icon}</div>
      <span className="text-base">{label}</span>
      <span className="text-[10px] uppercase tracking-widest opacity-60 font-black">
        {sub}
      </span>
    </button>
  );
};

export default function OwnerAdminRepairsPage() {
  return (
    <OwnerShell title="งานแจ้งซ่อม" activeKey="repairs" showSidebar={true}>
      {/* Header strip */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
            <LayoutList size={22} />
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900">
              Admin Repairs
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Management Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-3xl border border-blue-100/60 bg-gradient-to-b from-[#EAF2FF] to-white/60 p-6">
        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-indigo-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-1">
            <FilterButton
              active={true}
              icon={<Search size={16} />}
              label="ใหม่"
            />
            <FilterButton
              active={false}
              icon={<Clock size={16} />}
              label="กำลังทำ"
            />
            <FilterButton
              active={false}
              icon={<CheckCircle2 size={16} />}
              label="เสร็จ"
            />
            <FilterButton
              active={false}
              icon={<LayoutList size={16} />}
              label="ทั้งหมด"
            />
          </div>

          <button
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-indigo-600 hover:bg-indigo-50 font-black rounded-xl transition-all"
            title="UI only"
          >
            <RefreshCcw size={18} />
            รีเฟรชข้อมูล
          </button>
        </div>

        {/* (ตัวอย่างตำแหน่งแสดง error/success ไว้เฉยๆ) */}
        {/* <div className="mt-4 bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3">
          <XCircle size={20} />
          <span className="text-sm font-black">Error message</span>
        </div> */}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* List */}
          <section className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/20 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800">รายการแจ้งซ่อม</h2>
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full font-black">
                0 งาน
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[calc(100vh-320px)]">
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3 opacity-60">
                <div className="bg-slate-100 p-4 rounded-full">
                  <Search size={32} />
                </div>
                <p className="text-sm font-bold italic">
                  ยังไม่มีข้อมูล (UI Only)
                </p>
              </div>
            </div>
          </section>

          {/* Detail */}
          <section className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/20 flex flex-col">
            <div className="p-5 border-b border-slate-50">
              <h2 className="font-extrabold text-slate-800">
                รายละเอียดงานแจ้งซ่อม
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto gap-4 py-20">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400 animate-pulse">
                  <LayoutList size={40} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800">
                    โปรดเลือกรายการ
                  </h3>
                  <p className="text-slate-500 font-bold">
                    (UI Only) ยังไม่ได้เชื่อมข้อมูลจาก backend
                  </p>
                </div>
              </div>

              {/* ✅ โครงรายละเอียด (เผื่อเอาไว้ต่อ API ทีหลัง) */}
              {/* 
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-black text-slate-900">
                        หัวข้องาน
                      </h3>
                      <StatusBadge status="new" />
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 font-bold">
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <Package size={14} />
                        </div>
                        <span>ห้อง -</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <MapPin size={14} />
                        </div>
                        <span>-</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      เลขที่รายการ
                    </span>
                    <span className="text-lg font-mono font-black text-slate-700">
                      #--------
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MessageSquare size={16} />
                        <h4 className="text-sm font-black uppercase tracking-wider">
                          รายละเอียดปัญหา
                        </h4>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-bold">
                        -
                      </p>
                    </div>

                    <div className="bg-white border border-indigo-100 rounded-3xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-slate-800 font-black mb-3">
                        <Send size={16} className="text-indigo-600" />
                        ส่งข้อความถึงผู้เช่า (พิมพ์เอง)
                      </div>

                      <textarea
                        placeholder="ตัวอย่าง: รับเรื่องแล้ว ช่างจะเข้าดูพรุ่งนี้ 10:00"
                        className="w-full border rounded-2xl p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />

                      <div className="text-[12px] text-slate-500 mt-2 font-bold">
                        * ถ้าไม่พิมพ์ ระบบจะส่งข้อความมาตรฐานให้อัตโนมัติ
                      </div>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5">
                        <Maximize2 size={12} /> รูปประกอบจากผู้แจ้ง
                      </span>
                    </div>
                    <div className="rounded-3xl border-4 border-slate-50 overflow-hidden bg-slate-100 shadow-lg aspect-video flex items-center justify-center text-slate-400">
                      (ภาพจะแสดงเมื่อมี image_url)
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-black mb-2">
                    <CheckCircle2 size={18} className="text-indigo-600" />
                    <h4>ดำเนินการจัดการสถานะ + ส่ง LINE</h4>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <ActionButton
                      variant="primary"
                      icon={<Clock size={20} />}
                      label="รับเรื่อง"
                      sub="In Progress"
                    />
                    <ActionButton
                      variant="emerald"
                      icon={<CheckCircle2 size={20} />}
                      label="เสร็จแล้ว"
                      sub="Done"
                    />
                    <ActionButton
                      variant="rose"
                      icon={<XCircle size={20} />}
                      label="ปฏิเสธ"
                      sub="Rejected"
                    />
                  </div>
                </div>
              </div>
              */}
            </div>
          </section>
        </div>
      </div>
    </OwnerShell>
  );
}