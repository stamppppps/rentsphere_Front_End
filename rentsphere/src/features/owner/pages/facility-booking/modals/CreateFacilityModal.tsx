import {
  AlignLeft,
  CalendarDays,
  ChevronDown,
  DoorClosed,
  DoorOpen,
  Image as ImageIcon,
  Info,
  Layout,
  Loader2,
  Plus,
  Timer,
  Upload,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { facilityService } from "../services/facility.service";

type CreateFacilityFormData = {
  name: string;
  category: string;
  capacity: number;
  openTime: string;
  closeTime: string;
  duration: string;
  description: string;
};

interface CreateFacilityModalProps {
  condoId: string;
  onClose: () => void;
  onCreated?: () => void;
}

function convertDurationToMinutes(duration: string): number {
  switch (duration) {
    case "1 ชั่วโมง":
      return 60;
    case "1.5 ชั่วโมง":
      return 90;
    case "2 ชั่วโมง":
      return 120;
    case "ไม่จำกัด":
      return 60;
    default:
      return 60;
  }
}

const CreateFacilityModal: React.FC<CreateFacilityModalProps> = ({
  condoId,
  onClose,
  onCreated,
}) => {
  const [formData, setFormData] = useState<CreateFacilityFormData>({
    name: "",
    category: "กีฬาและสุขภาพ",
    capacity: 10,
    openTime: "08:00",
    closeTime: "20:00",
    duration: "1 ชั่วโมง",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewImageUrl = useMemo(() => {
    if (!selectedImageFile) return null;
    return URL.createObjectURL(selectedImageFile);
  }, [selectedImageFile]);

  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  const handleChooseImage = () => {
    if (isSubmitting) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    setSelectedImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!condoId) {
      alert("ไม่พบ condoId");
      return;
    }

    if (!formData.name.trim()) {
      alert("กรุณากรอกชื่อพื้นที่ส่วนกลาง");
      return;
    }

    if (formData.capacity < 1) {
      alert("ความจุสูงสุดต้องมากกว่า 0");
      return;
    }

    let createdFacility: { id: string } | null = null;

    try {
      setIsSubmitting(true);

      createdFacility = await facilityService.createFacility({
        condoId,
        facilityName: formData.name.trim(),
        description: formData.description.trim() || null,
        coverImageUrl: null,
      });

      if (selectedImageFile) {
        await facilityService.uploadFacilityImage(
          createdFacility.id,
          selectedImageFile
        );
      }

      await facilityService.saveFacilitySettings(createdFacility.id, {
        openTime: formData.openTime,
        closeTime: formData.closeTime,
        slotMinutes: convertDurationToMinutes(formData.duration),
        maxPeople: formData.capacity,
        maxBookingsPerDay: null,
        requiresApproval: false,
        feePerSlot: 0,
        deposit: 0,
        cancellationHours: 0,
      });

      onCreated?.();
      onClose();
    } catch (error) {
      console.error("CREATE FACILITY ERROR:", error);

      if (createdFacility?.id) {
        alert("สร้างพื้นที่สำเร็จแล้ว แต่บันทึกรูปหรือการตั้งค่าบางส่วนไม่สำเร็จ");
      } else {
        alert("สร้างพื้นที่ส่วนกลางไม่สำเร็จ");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl rounded-[56px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden flex animate-in zoom-in-95 duration-500 relative max-h-[95vh]">
        <button
          onClick={onClose}
          type="button"
          disabled={isSubmitting}
          className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all active:scale-90 group z-10 disabled:opacity-50"
        >
          <X size={20} className="text-slate-400 group-hover:text-slate-600" />
        </button>

        <div className="hidden lg:flex flex-col items-center justify-center w-[380px] bg-[#F8F9FD] p-12 border-r border-slate-100 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          <div className="relative w-full aspect-square mb-10 group">
            <div className="w-full h-full rounded-[48px] overflow-hidden shadow-2xl border-4 border-white transition-transform duration-500 group-hover:scale-[1.02] bg-white">
              {previewImageUrl ? (
                <>
                  <img
                    src={previewImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={handleChooseImage}
                    disabled={isSubmitting}
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                  >
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
                      <ImageIcon size={14} />
                      เปลี่ยนรูปภาพ
                    </div>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleChooseImage}
                  disabled={isSubmitting}
                  className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-indigo-50 hover:to-sky-50 transition-all disabled:cursor-not-allowed"
                >
                  <div className="w-24 h-24 rounded-[28px] bg-white shadow-sm border border-slate-100 flex items-center justify-center text-indigo-500">
                    <Upload size={34} />
                  </div>

                  <div className="text-center px-6">
                    <p className="text-base font-black text-slate-700">
                      เพิ่มรูปพื้นที่ส่วนกลาง
                    </p>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                      กดเพื่อเลือกรูปภาพสำหรับแสดงหน้าปก
                    </p>
                  </div>
                </button>
              )}
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

            {selectedImageFile && (
              <p className="text-[11px] text-slate-400 font-bold truncate max-w-full px-6">
                {selectedImageFile.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 p-12 lg:p-16 overflow-y-auto no-scrollbar">
          <div className="mb-12">
            <h2 className="text-[40px] font-black text-slate-900 tracking-tight mb-1">
              เพิ่มพื้นที่ส่วนกลาง
            </h2>
            <p className="text-[14px] font-black text-[#A162F7] uppercase tracking-[0.3em] flex items-center gap-2">
              <Plus size={16} strokeWidth={3} /> CREATE NEW FACILITY
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl">
                  <Info size={18} />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  ข้อมูลพื้นฐาน (Basic Info)
                </h3>
              </div>

              <div className="lg:hidden space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  รูปภาพพื้นที่ส่วนกลาง
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                <button
                  type="button"
                  onClick={handleChooseImage}
                  disabled={isSubmitting}
                  className="w-full min-h-[180px] rounded-[28px] border border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50"
                >
                  {previewImageUrl ? (
                    <img
                      src={previewImageUrl}
                      alt="Preview"
                      className="w-full h-[180px] object-cover rounded-[28px]"
                    />
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-500">
                        <ImageIcon size={24} />
                      </div>
                      <p className="text-sm font-black text-slate-700">
                        เพิ่มรูปภาพ
                      </p>
                    </>
                  )}
                </button>
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
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    หมวดหมู่
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-8 py-5 bg-[#F8F9FD] border border-transparent rounded-[24px] focus:outline-none focus:bg-white focus:border-slate-200 transition-all font-black text-slate-700 appearance-none cursor-pointer shadow-sm"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
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
                    ความจุสูงสุด (ท่าน)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      className="w-full px-8 py-5 bg-[#F8F9FD] border border-transparent rounded-[24px] focus:outline-none focus:bg-white focus:border-slate-200 transition-all font-black text-slate-700 shadow-sm"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value, 10) || 0,
                        })
                      }
                    />
                    <Users
                      size={18}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>

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
                    onChange={(e) =>
                      setFormData({ ...formData, openTime: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, closeTime: e.target.value })
                    }
                    className="w-full px-6 py-5 bg-[#F8F9FD] border border-transparent rounded-[24px] focus:outline-none focus:bg-white focus:border-slate-200 font-black text-slate-700 shadow-sm transition-all text-center"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    ระยะเวลาต่อรอบ
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-8 py-5 bg-[#F8F9FD] border border-transparent rounded-[24px] focus:outline-none focus:bg-white focus:border-slate-200 transition-all font-black text-slate-700 appearance-none cursor-pointer shadow-sm"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                    >
                      <option>1 ชั่วโมง</option>
                      <option>1.5 ชั่วโมง</option>
                      <option>2 ชั่วโมง</option>
                      <option>ไม่จำกัด</option>
                    </select>
                    <Timer
                      size={18}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                  <AlignLeft size={18} />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  รายละเอียดเพิ่มเติม (Details)
                </h3>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  กฎระเบียบและคำแนะนำการใช้งาน
                </label>
                <textarea
                  placeholder="เช่น กรุณาสวมรองเท้าผ้าใบ, ห้ามนำอาหารเข้ามาในพื้นที่, ปิดเครื่องใช้ไฟฟ้าเมื่อเลิกใช้งาน..."
                  className="w-full px-8 py-7 bg-[#F8F9FD] border border-transparent rounded-[32px] h-40 resize-none focus:outline-none focus:bg-white focus:border-slate-200 transition-all font-medium leading-relaxed shadow-sm text-slate-600"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-10 border-t border-slate-100 mt-12">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-14 py-5 rounded-[24px] border border-slate-100 text-slate-500 font-black hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95 disabled:opacity-50"
              >
                ยกเลิกการสร้าง
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-14 py-5 rounded-[24px] bg-[#0F172A] text-white font-black hover:bg-slate-900 transition-all flex items-center gap-3 shadow-[0_20px_40px_rgba(15,23,42,0.15)] active:scale-95 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <Plus
                    size={24}
                    className="group-hover:rotate-90 transition-transform duration-300"
                  />
                )}
                {isSubmitting ? "กำลังบันทึก..." : "ยืนยันการเพิ่มพื้นที่"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFacilityModal;