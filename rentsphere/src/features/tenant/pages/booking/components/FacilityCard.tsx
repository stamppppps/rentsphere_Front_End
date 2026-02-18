import React from 'react';
import type { Facility } from '../types/facility.types';
import { checkBookingQuota } from '../services/booking.service';

interface FacilityCardProps {
  facility: Facility;
  onClick: () => void;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onClick }) => {
  const isFull = facility.status === 'full';
  
  // ตรวจสอบโควตาโดยใช้วันที่ปัจจุบันเพื่อให้เลขสิทธิ์บนการ์ดอัปเดตตามสถานะปัจจุบันของผู้ใช้
  const quota = checkBookingQuota(new Date().toISOString(), facility.id);
  const remaining = quota.remainingMonth ?? 0;

  return (
    <button 
      onClick={onClick}
      className="relative w-full aspect-[16/9] rounded-[2.5rem] overflow-hidden mb-4 shadow-lg active:scale-[0.98] transition-all group text-left border-4 border-white"
    >
      <img src={facility.imageUrl} alt={facility.name} className="absolute inset-0 w-full h-full object-cover brightness-[0.65] group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 p-6 text-white w-full">
        <h3 className="text-xl font-bold mb-1 tracking-tight">{facility.name}</h3>
        
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase tracking-wider">
            <span>เปิด {facility.openTime} - {facility.closeTime}</span>
            <span className="w-1 h-1 bg-white/30 rounded-full"></span>
            <span>ความจุ {facility.capacity} คน/รอบ</span>
          </div>
          
          {!facility.isQuotaExempt && (
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
               <span className="text-blue-300 text-[11px] font-black uppercase tracking-[0.05em]">
                 สิทธิ์คงเหลือ <span className="text-white text-xs">{remaining} ครั้ง</span>/เดือน
               </span>
            </div>
          )}
        </div>
        
        <div className={`inline-flex px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase backdrop-blur-md border ${
          isFull 
            ? 'bg-orange-500/20 text-orange-200 border-orange-200/20' 
            : 'bg-white/10 text-white border-white/20'
        }`}>
          {isFull ? 'เต็มแล้ว' : `ว่าง ${facility.availableSlotsCount || 8} รอบ`}
        </div>
      </div>
    </button>
  );
};

export default FacilityCard;
