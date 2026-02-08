
import React from 'react';
import { FacilityStatus } from '../types/facility';
import { Hammer, CheckCircle2, AlertTriangle } from 'lucide-react';

interface FacilityStatusToggleProps {
  status: FacilityStatus;
  onToggle: (newStatus: FacilityStatus) => void;
}

const FacilityStatusToggle: React.FC<FacilityStatusToggleProps> = ({ status, onToggle }) => {
  const isAvailable = status === FacilityStatus.AVAILABLE;

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between p-6 bg-white border rounded-[32px] transition-all duration-300 ${isAvailable ? 'border-slate-100 shadow-sm' : 'border-amber-100 bg-amber-50/20 shadow-lg shadow-amber-100/20'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            {isAvailable ? <CheckCircle2 size={24} /> : <Hammer size={24} />}
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">สถานะการให้บริการ</p>
            <p className={`text-xs font-bold ${isAvailable ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isAvailable ? 'พร้อมให้บริการสำหรับลูกบ้าน' : 'ปิดปรับปรุงพื้นที่ชั่วคราว'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => onToggle(isAvailable ? FacilityStatus.MAINTENANCE : FacilityStatus.AVAILABLE)}
          className={`relative w-16 h-8 rounded-full transition-all duration-500 focus:outline-none p-1 ${isAvailable ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-amber-500 shadow-lg shadow-amber-200'}`}
        >
          <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-500 flex items-center justify-center ${isAvailable ? 'translate-x-8' : 'translate-x-0'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></div>
          </div>
        </button>
      </div>

      {!isAvailable && (
        <div className="bg-amber-50 border border-amber-100 p-5 rounded-[28px] animate-in slide-in-from-top-2 duration-300">
          <div className="flex gap-4">
            <div className="mt-0.5 text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-800 mb-1">แจ้งเตือน: กำลังปิดปรับปรุงพื้นที่</h4>
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                ลูกบ้านจะเห็นสถานะ "ปิดปรับปรุงบริการ" ในหน้าหลัก และไม่สามารถทำรายการจองใหม่ได้จนกว่าจะเปิดให้บริการอีกครั้ง
                <span className="block mt-1 font-bold">รายการจองเดิมที่ได้รับอนุมัติแล้วจะยังคงอยู่ โปรดตรวจสอบและยกเลิกด้วยตนเองหากมีความจำเป็น</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityStatusToggle;
