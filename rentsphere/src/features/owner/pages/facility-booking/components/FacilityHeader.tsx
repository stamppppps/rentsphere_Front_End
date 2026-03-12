import {
  CalendarDays,
  ChevronLeft,
  Hammer,
  Play,
  Settings,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { type Facility, FacilityStatus } from "../types/facility";

interface FacilityHeaderProps {
  facility: Facility;
  onSettings?: () => void;
  onToggleStatus?: () => void;
}

const FacilityHeader: React.FC<FacilityHeaderProps> = ({
  facility,
  onSettings,
  onToggleStatus,
}) => {
  const navigate = useNavigate();
  const isAvailable = facility.status === FacilityStatus.AVAILABLE;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
      <div className="flex items-center gap-5">
        <button
          onClick={() => navigate("/owner/common-area-booking")}
          className="p-4 bg-white border border-slate-200 rounded-[22px] text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-90"
          title="กลับไปหน้าหลัก"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {facility.name}
            </h1>

            <div
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border shadow-sm ${
                isAvailable
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-amber-50 text-amber-600 border-amber-100"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isAvailable ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {isAvailable ? "พร้อมให้บริการ" : "ปิดปรับปรุงบริการ"}
            </div>
          </div>

          <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
            <CalendarDays size={16} className="text-indigo-400" />
            แผงควบคุมและรายการจองรายวัน
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSettings}
          className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <Settings size={20} className="text-indigo-600" />
          ตั้งค่าพื้นที่
        </button>

        <button
          onClick={onToggleStatus}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-[20px] font-bold transition-all shadow-lg active:scale-95 ${
            isAvailable
              ? "bg-amber-600 text-white shadow-amber-100 hover:bg-amber-700"
              : "bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700"
          }`}
        >
          {isAvailable ? <Hammer size={20} /> : <Play size={20} />}
          {isAvailable ? "ปิดปรับปรุงพื้นที่" : "เปิดให้บริการปกติ"}
        </button>
      </div>
    </div>
  );
};

export default FacilityHeader;