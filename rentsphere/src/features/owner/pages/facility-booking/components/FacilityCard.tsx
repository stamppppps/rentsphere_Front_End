
import React from 'react';
import { Link } from 'react-router-dom';
import { type Facility, FacilityStatus } from '../types/facility';
import { FACILITY_TYPE_CONFIG } from '../constants/facilityType';
import { Users, Clock, ArrowRight, Tag, Hammer, CheckCircle2 } from 'lucide-react';

interface FacilityCardProps {
  facility: Facility;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ facility }) => {
  const typeConfig = FACILITY_TYPE_CONFIG[facility.type] || FACILITY_TYPE_CONFIG['all'];
  const isAvailable = facility.status === FacilityStatus.AVAILABLE;
  const isMaintenance = facility.status === FacilityStatus.MAINTENANCE;

  return (
    <div className={`bg-white rounded-[32px] overflow-hidden border transition-all duration-300 group flex flex-col h-full ${
      isAvailable 
        ? 'border-slate-100 shadow-sm hover:shadow-xl' 
        : isMaintenance 
          ? 'border-amber-100 bg-amber-50/5 shadow-sm' 
          : 'border-slate-200 opacity-80 grayscale-[0.5]'
    }`}>
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={facility.imageUrl} 
          alt={facility.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!isAvailable ? 'brightness-75' : ''}`}
        />
        <div className="absolute top-4 left-4 flex gap-2">
           <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border ${
             isAvailable 
              ? 'bg-emerald-500/90 text-white border-emerald-400' 
              : isMaintenance 
                ? 'bg-amber-500/90 text-white border-amber-400' 
                : 'bg-slate-500/90 text-white border-slate-400'
           }`}>
            {isAvailable ? (
              <><CheckCircle2 size={10} /> พร้อมใช้งาน</>
            ) : isMaintenance ? (
              <><Hammer size={10} /> ปิดปรับปรุงบริการ</>
            ) : (
              'ปิดให้บริการ'
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex gap-2 mb-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-tight ${typeConfig.color}`}>
            <Tag size={10} />
            {typeConfig.label}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors leading-tight">{facility.name}</h3>
          <p className="text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed h-10">{facility.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-slate-50/80 rounded-2xl p-3 flex items-center gap-3 border border-slate-100/50">
            <Users size={16} className="text-indigo-500" />
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">ความจุ</p>
              <p className="text-xs font-black text-slate-700">{facility.capacity} ท่าน</p>
            </div>
          </div>
          <div className="bg-slate-50/80 rounded-2xl p-3 flex items-center gap-3 border border-slate-100/50">
            <Clock size={16} className="text-indigo-500" />
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">เวลาเปิด</p>
              <p className="text-xs font-black text-slate-700">{facility.openTime}-{facility.closeTime}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <Link 
            to={`/owner/common-area-booking/${facility.id}`}
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black transition-all duration-300 shadow-xl active:scale-95 ${
              isAvailable 
                ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200 hover:shadow-indigo-100' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
            }`}
          >
            ดูรายละเอียด <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FacilityCard;
