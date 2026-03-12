import React, { useEffect, useState } from 'react';
import type { RepairRequest } from '../types/maintenance.types';
import { ISSUE_TYPES } from '../types/maintenance.types';
import ImageUploader from './ImageUploader';

interface RepairFormProps {
  onSubmit: (data: Partial<RepairRequest>) => void;
  initialData?: Partial<RepairRequest>;
}

function cx(...cls: Array<string | false | undefined | null>) {
  return cls.filter(Boolean).join(" ");
}

const RepairForm: React.FC<RepairFormProps> = ({ onSubmit, initialData }) => {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [roomNo, setRoomNo] = useState<string>(initialData?.roomNumber || "");
  const [condoName, setCondoName] = useState<string>("");
  const [loadingRoom, setLoadingRoom] = useState(true);

  // Auto-fetch room number from residency
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const lineUserId = localStorage.getItem("lineUserId");
        const token = localStorage.getItem("token");
        if (!lineUserId && !token) {
          setLoadingRoom(false);
          return;
        }

        const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const query = lineUserId ? `?lineUserId=${encodeURIComponent(lineUserId)}` : "";
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API}/dorm/status${query}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setRoomNo(data.roomNo || "");
          setCondoName(data.condoName || "");
        }
      } catch (e) {
        console.error("Failed to fetch room info:", e);
      } finally {
        setLoadingRoom(false);
      }
    };
    fetchRoom();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    onSubmit({
      issueType: String(formData.get('issueType') || ''),
      roomNumber: roomNo,
      location: String(formData.get('location') || ''),
      details: String(formData.get('details') || ''),
      images,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Room Info Card */}
      <div className="rounded-[22px] border border-blue-100/70 bg-gradient-to-b from-[#EAF0FF] to-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
        <div className="text-[11px] font-black text-blue-600/70 uppercase tracking-widest mb-2">ข้อมูลห้องพัก</div>
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            {loadingRoom ? (
              <div className="text-sm font-bold text-slate-400">กำลังโหลด...</div>
            ) : roomNo ? (
              <>
                <div className="text-[18px] font-black text-slate-900">ห้อง {roomNo}</div>
                {condoName && <div className="text-[12px] font-bold text-slate-500 mt-0.5">{condoName}</div>}
              </>
            ) : (
              <div className="text-sm font-bold text-rose-600">ไม่พบข้อมูลห้องพัก กรุณาลงทะเบียนก่อน</div>
            )}
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-[22px] border border-blue-100/70 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)] space-y-5">
        <div>
          <div className="text-[11px] font-black text-blue-600/70 uppercase tracking-widest mb-1">รายละเอียดการแจ้งซ่อม</div>
          <div className="text-[18px] font-black text-slate-900">กรอกข้อมูลเพื่อแจ้งซ่อม</div>
        </div>

        {/* Issue Type */}
        <div className="space-y-2">
          <label className="block text-[13px] font-black text-slate-700">ประเภทปัญหา</label>
          <div className="relative">
            <select
              name="issueType"
              defaultValue={initialData?.issueType || ''}
              required
              className={cx(
                "w-full appearance-none",
                "bg-[#F8FAFF] border border-blue-100/70 rounded-2xl",
                "px-4 py-3.5 pr-10",
                "text-[14px] font-bold text-slate-900",
                "focus:outline-none focus:ring-2 focus:ring-blue-200/60 transition"
              )}
            >
              <option value="" disabled>-- เลือกประเภทปัญหา --</option>
              {ISSUE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="block text-[13px] font-black text-slate-700">จุดที่เกิดปัญหา</label>
          <input
            name="location"
            type="text"
            defaultValue={initialData?.location || ''}
            required
            placeholder="เช่น ระเบียง / ห้องน้ำ / ห้องนอน"
            className={cx(
              "w-full bg-[#F8FAFF] border border-blue-100/70 rounded-2xl",
              "px-4 py-3.5",
              "text-[14px] font-bold text-slate-900 placeholder:text-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-200/60 transition"
            )}
          />
        </div>

        {/* Details */}
        <div className="space-y-2">
          <label className="block text-[13px] font-black text-slate-700">รายละเอียดอาการ</label>
          <textarea
            name="details"
            defaultValue={initialData?.details || ''}
            required
            rows={4}
            placeholder="อธิบายอาการโดยสรุป เช่น น้ำรั่วจากเพดานห้องน้ำ"
            className={cx(
              "w-full bg-[#F8FAFF] border border-blue-100/70 rounded-2xl",
              "px-4 py-3.5",
              "text-[14px] font-bold text-slate-900 placeholder:text-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-200/60 transition resize-none"
            )}
          />
        </div>

        {/* Image Upload */}
        <ImageUploader images={images} onChange={setImages} />
      </div>

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={!roomNo || loadingRoom}
          className={cx(
            "relative w-full h-[56px] rounded-2xl font-black text-[16px] text-white overflow-hidden transition",
            "bg-[#2F6BFF] shadow-[0_16px_28px_rgba(47,107,255,0.26)] active:scale-[0.98]",
            (!roomNo || loadingRoom) && "opacity-50 cursor-not-allowed active:scale-100"
          )}
        >
          <span className="absolute inset-0 opacity-30 pointer-events-none">
            <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.6s_infinite]" />
          </span>
          ส่งคำขอแจ้งซ่อม
        </button>
      </div>
    </form>
  );
};

export default RepairForm;
