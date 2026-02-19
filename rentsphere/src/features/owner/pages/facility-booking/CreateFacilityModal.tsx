import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Users,
  Plus,
  Timer,
  CheckCircle2,
  Image as ImageIcon,
  ChevronDown,
  Layout,
  Info,
  ShieldCheck,
  AlignLeft,
  CalendarDays,
  DoorOpen,
  DoorClosed,
} from "lucide-react";
import { FacilityType } from "./types/facility";

export type CreateFacilityPayload = {
  name: string;
  type: FacilityType;
  capacity: number;
  openTime: string; // "HH:mm"
  closeTime: string; // "HH:mm"
  slotMinutes: number; // 60
  isAutoApprove: boolean;
  description?: string | null;
  active?: boolean;
};

type CreateFacilityFormData = {
  name: string;
  category: string;
  capacity: number;
  openTime: string;
  closeTime: string;
  slotMinutes: number; // นาที/รอบ
  isAutoApprove: boolean;
  description: string;
};

interface CreateFacilityModalProps {
  onClose: () => void;
  onSave?: (payload: CreateFacilityPayload) => void | Promise<void>;
}

const CATEGORY_TO_TYPE: Record<string, FacilityType> = {
  "กีฬาและสุขภาพ": FacilityType.SPORT,
  "พักผ่อนหย่อนใจ": FacilityType.RELAX,
  "พื้นที่ทำงาน": FacilityType.WORKING,
  "สระว่ายน้ำ": FacilityType.OUTDOOR,
};

const CreateFacilityModal: React.FC<CreateFacilityModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<CreateFacilityFormData>({
    name: "",
    category: "กีฬาและสุขภาพ",
    capacity: 10,
    openTime: "08:00",
    closeTime: "20:00",
    slotMinutes: 60,
    isAutoApprove: true,
    description: "",
  });

  const type = useMemo(
    () => CATEGORY_TO_TYPE[formData.category] || FacilityType.RELAX,
    [formData.category]
  );

  // ✅ PORTAL ROOT
  const portalEl = useMemo(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("div");
    el.setAttribute("data-modal-root", "create-facility");
    return el;
  }, []);

  // ✅ mount + lock scroll + esc close
  useEffect(() => {
    if (!portalEl) return;

    document.body.appendChild(portalEl);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      portalEl.remove();
    };
  }, [portalEl, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateFacilityPayload = {
      name: formData.name.trim(),
      type,
      capacity: Number(formData.capacity) || 1,
      openTime: formData.openTime,
      closeTime: formData.closeTime,
      slotMinutes: Number(formData.slotMinutes) || 60,
      isAutoApprove: !!formData.isAutoApprove,
      description: (formData.description ?? "").trim() ? formData.description.trim() : null,
      active: true,
    };

    await onSave?.(payload);
  };

  if (!portalEl) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
      onMouseDown={(e) => {
        // ✅ click outside close
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-6xl rounded-[56px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden flex relative max-h-[95vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all active:scale-90 group z-20"
        >
          <X size={20} className="text-slate-400 group-hover:text-slate-600" />
        </button>

        {/* Left: Preview */}
        <div className="hidden lg:flex flex-col items-center justify-center w-[380px] bg-[#F8F9FD] p-12 border-r border-slate-100 shrink-0">
          <div className="relative w-full aspect-square mb-10 group">
            <div className="w-full h-full rounded-[48px] overflow-hidden shadow-2xl border-4 border-white transition-transform duration-500 group-hover:scale-[1.02] bg-slate-200">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800"
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
                  <ImageIcon size={14} /> เปลี่ยนรูปภาพ
                </div>
              </div>
            </div>
          </div>

          <div className="text-center w-full space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">
              <Layout size={12} className="text-indigo-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Live Preview
              </span>
            </div>

            <h3 className="text-3xl font-black text-slate-800 leading-tight truncate px-4">
              {formData.name || "ชื่อพื้นที่ของคุณ"}
            </h3>

            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase">
                {formData.category}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase">
                {formData.openTime} - {formData.closeTime}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Form + Sticky Footer */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="p-12 lg:p-16 pb-6">
            <h2 className="text-[40px] font-black text-slate-900 tracking-tight mb-1">
              เพิ่มพื้นที่ส่วนกลาง
            </h2>
            <p className="text-[14px] font-black text-[#A162F7] uppercase tracking-[0.3em] flex items-center gap-2">
              <Plus size={16} strokeWidth={3} /> CREATE NEW FACILITY
            </p>
          </div>

          {/* ✅ ใส่ id ให้ form แล้วให้ปุ่มข้างล่าง submit ได้ */}
          <form
            id="create-facility-form"
            onSubmit={handleSubmit}
            className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-12 lg:px-16 pb-36 space-y-12"
          >
            {/* Section 1 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl">
                  <Info size={18} />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  ข้อมูลพื้นฐาน (Basic Info)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    ชื่อพื้นที่ส่วนกลาง
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ห้องสมุดชุมชน, Sky Lounge, Co-Working Space"
                    className="w-full px-8 py-5 bg-[#F8F9FD] border border-transparent rounded-[24px] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-slate-200 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    ประเภท
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-8 py-5 bg-[#F8F9FD] border border-transparent rounded-[24px] focus:outline-none focus:bg-white focus:border-slate-200 transition-all font-black text-slate-700 appearance-none cursor-pointer shadow-sm"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option>กีฬาและสุขภาพ</option>
                      <option>สระว่ายน้ำ</option>
                      <option>พักผ่อนหย่อนใจ</option>
                      <option>พื้นที่ทำงาน</option>
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    ความจุ/รอบ (คน)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      className="w-full px-8 py-5 bg-[#F8F9FD] border border-transparent rounded-[24px] focus:outline-none focus:bg-white focus:border-slate-200 transition-all font-black text-slate-700 shadow-sm"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
                      }
                    />
                    <Users size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                  <CalendarDays size={18} />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  เวลาและรอบการจอง (Session Settings)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <DoorOpen size={12} className="text-emerald-500" /> เวลาเปิด
                  </label>
                  <input
                    type="time"
                    value={formData.openTime}
                    onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                    className="w-full px-6 py-5 bg-[#F8F9FD] border border-transparent rounded-[24px] focus:outline-none focus:bg-white focus:border-slate-200 font-black text-slate-700 shadow-sm transition-all text-center"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <DoorClosed size={12} className="text-rose-500" /> เวลาปิด
                  </label>
                  <input
                    type="time"
                    value={formData.closeTime}
                    onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                    className="w-full px-6 py-5 bg-[#F8F9FD] border border-transparent rounded-[24px] focus:outline-none focus:bg-white focus:border-slate-200 font-black text-slate-700 shadow-sm transition-all text-center"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    นาที/รอบ
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={15}
                      step={5}
                      className="w-full px-8 py-5 bg-[#F8F9FD] border border-transparent rounded-[24px] focus:outline-none focus:bg-white focus:border-slate-200 transition-all font-black text-slate-700 shadow-sm"
                      value={formData.slotMinutes}
                      onChange={(e) =>
                        setFormData({ ...formData, slotMinutes: parseInt(e.target.value) || 60 })
                      }
                    />
                    <Timer size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 ml-2">แนะนำ 60 นาที</div>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  นโยบายการจอง (Booking Policy)
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-10 py-5 bg-white border border-slate-100 rounded-[32px] shadow-sm">
                  <div className="flex items-center gap-4">
                    <CheckCircle2
                      size={20}
                      className={formData.isAutoApprove ? "text-emerald-500" : "text-slate-300"}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700 leading-tight">Auto approve</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                        {formData.isAutoApprove
                          ? 'จองแล้ว "อนุมัติทันที" ไม่ต้องให้แอดมินกด'
                          : "ปิดไว้ = ต้องให้แอดมินกดอนุมัติ"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isAutoApprove: !formData.isAutoApprove })}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none p-1 ${
                      formData.isAutoApprove ? "bg-[#A162F7]" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                        formData.isAutoApprove ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                  <AlignLeft size={18} />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">รายละเอียดเพิ่มเติม (Details)</h3>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  กฎ/คำแนะนำ (ไม่บังคับ)
                </label>
                <textarea
                  placeholder="เช่น ต้องจองล่วงหน้า 1 ชม., ห้ามนำอาหารเข้า, ปิดไฟเมื่อเลิกใช้งาน..."
                  className="w-full px-8 py-7 bg-[#F8F9FD] border border-transparent rounded-[32px] h-40 resize-none focus:outline-none focus:bg-white focus:border-slate-200 transition-all font-medium leading-relaxed shadow-sm text-slate-600"
                  value={formData.description ?? ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </form>

          {/* ✅ Sticky Footer */}
          <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-100 px-12 lg:px-16 py-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-14 py-5 rounded-[24px] border border-slate-100 text-slate-500 font-black hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95"
              >
                ยกเลิกการสร้าง
              </button>

              {/* ✅ ปุ่ม submit ต้องชี้ไปที่ form */}
              <button
                type="submit"
                form="create-facility-form"
                className="px-14 py-5 rounded-[24px] bg-[#0F172A] text-white font-black hover:bg-slate-900 transition-all flex items-center gap-3 shadow-[0_20px_40px_rgba(15,23,42,0.15)] active:scale-95 group"
              >
                <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                ยืนยันการเพิ่มพื้นที่
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    portalEl
  );
};

export default CreateFacilityModal;
