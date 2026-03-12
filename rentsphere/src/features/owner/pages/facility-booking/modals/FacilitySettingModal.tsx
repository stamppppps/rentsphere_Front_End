import {
  AlertCircle,
  ChevronDown,
  Clock,
  Image as ImageIcon,
  Loader2,
  Save,
  Timer,
  Trash2,
  Type,
  Upload,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import type { Facility } from "../types/facility";

interface FacilitySettingModalProps {
  facility: Facility;
  onClose: () => void;
  onSave?: (payload: {
    facilityName: string;
    imageFile?: File | null;
    openTime: string;
    closeTime: string;
    slotMinutes: number;
    maxPeople: number | null;
    maxBookingsPerDay: number | null;
    requiresApproval: boolean;
    feePerSlot: number;
    deposit: number;
    cancellationHours: number;
  }) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

function convertMinutesToDurationLabel(slotMinutes: number): string {
  switch (slotMinutes) {
    case 60:
      return "1 ชั่วโมง";
    case 90:
      return "1.5 ชั่วโมง";
    case 120:
      return "2 ชั่วโมง";
    default:
      return "1 ชั่วโมง";
  }
}

function convertDurationToMinutes(duration: string): number {
  switch (duration) {
    case "1 ชั่วโมง":
      return 60;
    case "1.5 ชั่วโมง":
      return 90;
    case "2 ชั่วโมง":
      return 120;
    default:
      return 60;
  }
}

const FacilitySettingModal: React.FC<FacilitySettingModalProps> = ({
  facility,
  onClose,
  onSave,
  onDelete,
}) => {
  const [facilityName, setFacilityName] = useState(facility.name ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    bookingSetting: {
      openTime: facility.bookingSetting?.openTime ?? "08:00",
      closeTime: facility.bookingSetting?.closeTime ?? "20:00",
      duration: convertMinutesToDurationLabel(
        facility.bookingSetting?.slotMinutes ?? 60
      ),
      maxPeople: facility.bookingSetting?.maxPeople ?? 1,
      maxBookingsPerDay: facility.bookingSetting?.maxBookingsPerDay ?? 2,
      requiresApproval: facility.bookingSetting?.requiresApproval ?? false,
      feePerSlot: facility.bookingSetting?.feePerSlot ?? 0,
      deposit: facility.bookingSetting?.deposit ?? 0,
      cancellationHours: facility.bookingSetting?.cancellationHours ?? 0,
    },
  });

  const previewUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return (
      facility.coverImageUrl ||
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
    );
  }, [imageFile, facility.coverImageUrl]);

  useEffect(() => {
    return () => {
      if (imageFile && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [imageFile, previewUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!facilityName.trim()) {
      alert("กรุณากรอกชื่อพื้นที่");
      return;
    }

    if (!formData.bookingSetting.openTime || !formData.bookingSetting.closeTime) {
      alert("กรุณากำหนดเวลาเปิดและเวลาปิด");
      return;
    }

    try {
      setIsSaving(true);

      await onSave?.({
        facilityName: facilityName.trim(),
        imageFile,
        openTime: formData.bookingSetting.openTime,
        closeTime: formData.bookingSetting.closeTime,
        slotMinutes: convertDurationToMinutes(formData.bookingSetting.duration),
        maxPeople: formData.bookingSetting.maxPeople,
        maxBookingsPerDay: formData.bookingSetting.maxBookingsPerDay,
        requiresApproval: formData.bookingSetting.requiresApproval,
        feePerSlot: formData.bookingSetting.feePerSlot,
        deposit: formData.bookingSetting.deposit,
        cancellationHours: formData.bookingSetting.cancellationHours,
      });

      onClose();
    } catch (error) {
      console.error("SAVE FACILITY SETTINGS ERROR:", error);
      alert("บันทึกการตั้งค่าไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `ต้องการลบพื้นที่ "${facility.name}" ใช่หรือไม่?`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await onDelete?.();
      onClose();
    } catch (error) {
      console.error("DELETE FACILITY ERROR:", error);
      alert("ลบพื้นที่ไม่สำเร็จ");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        <div className="relative p-10 pb-6 border-b border-slate-50">
          <button
            onClick={onClose}
            type="button"
            disabled={isSaving || isDeleting}
            className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all active:scale-90 group disabled:opacity-50"
          >
            <X size={20} className="text-slate-400 group-hover:text-slate-600" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
            Facility Configuration
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            ตั้งค่าพื้นที่ส่วนกลาง
          </h2>

          <p className="text-slate-400 font-medium mt-1">
            แก้ไขข้อมูลของ{" "}
            <span className="text-indigo-600 font-bold">{facility.name}</span>
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="p-10 space-y-8 max-h-[75vh] overflow-y-auto no-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <ImageIcon size={12} className="text-indigo-500" />
                รูปพื้นที่
              </label>

              <div className="rounded-[28px] overflow-hidden border border-slate-200 bg-slate-100 aspect-square">
                <img
                  src={previewUrl}
                  alt={facilityName || facility.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-bold cursor-pointer hover:bg-slate-100 transition">
                <Upload size={16} />
                เลือกรูปใหม่
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setImageFile(file);
                  }}
                />
              </label>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Type size={12} className="text-indigo-500" />
                  ชื่อพื้นที่
                </label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-black text-slate-700"
                  placeholder="เช่น ห้องฟิตเนส"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Users size={12} className="text-indigo-500" />
                    ความจุสูงสุด (ท่าน)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bookingSetting.maxPeople ?? 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bookingSetting: {
                          ...formData.bookingSetting,
                          maxPeople: parseInt(e.target.value, 10) || 1,
                        },
                      })
                    }
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-black text-slate-700"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Timer size={12} className="text-indigo-500" />
                    เวลาต่อรอบ
                  </label>

                  <div className="relative">
                    <select
                      value={formData.bookingSetting.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookingSetting: {
                            ...formData.bookingSetting,
                            duration: e.target.value,
                          },
                        })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-black text-slate-700 appearance-none"
                    >
                      <option>1 ชั่วโมง</option>
                      <option>1.5 ชั่วโมง</option>
                      <option>2 ชั่วโมง</option>
                    </select>

                    <ChevronDown
                      size={18}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Clock size={12} className="text-indigo-500" />
                  เวลาเปิด-ปิดให้บริการ
                </label>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase ml-1">
                      เวลาเปิด
                    </p>
                    <input
                      type="time"
                      value={formData.bookingSetting.openTime ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookingSetting: {
                            ...formData.bookingSetting,
                            openTime: e.target.value,
                          },
                        })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none font-bold text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase ml-1">
                      เวลาปิด
                    </p>
                    <input
                      type="time"
                      value={formData.bookingSetting.closeTime ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookingSetting: {
                            ...formData.bookingSetting,
                            closeTime: e.target.value,
                          },
                        })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-[28px] border border-slate-100/50">
            <div className="p-2 bg-white rounded-xl text-slate-400 shadow-sm shrink-0">
              <AlertCircle size={18} />
            </div>
            <div className="text-xs text-slate-500 leading-relaxed font-medium space-y-1">
              <p>
                การเปลี่ยนแปลงจะมีผลต่อการจองรอบใหม่เท่านั้น
                รายการจองเดิมจะยังคงยึดตามกฎเดิม
              </p>
              <p>
                ระบบจะตรวจสอบเพิ่มเติมตอนจองจริง เช่น เวลาซ้อน,
                สิทธิ์ครบต่อวัน, ช่วงเวลาที่เลยไปแล้ว และช่วงเวลาที่เหลือน้อยกว่า 30 นาที
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-6">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
              className="px-6 py-4 rounded-2xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
              ลบพื้นที่นี้
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isDeleting}
                className="py-4 px-8 rounded-2xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                disabled={isSaving || isDeleting}
                className="py-4 px-8 rounded-2xl bg-[#0F172A] text-white font-black hover:bg-indigo-950 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 group disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Save
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                )}
                {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacilitySettingModal;