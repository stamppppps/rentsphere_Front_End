import React from 'react';
import { CalendarDays, PlayCircle, Clock, UserX } from 'lucide-react';

interface FacilitySummaryProps {
  today: number;
  active: number;
  late: number;
  noShow: number;
}

const FacilitySummary: React.FC<FacilitySummaryProps> = ({ today, active, late, noShow }) => {
  const stats = [
    {
      label: 'การจองวันนี้',
      value: today,
      icon: CalendarDays,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      borderColor: 'group-hover:border-indigo-200'
    },
    {
      label: 'กำลังใช้งานอยู่',
      value: active,
      icon: PlayCircle,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'group-hover:border-emerald-200'
    },
    {
      label: 'มาสาย',
      value: late,
      icon: Clock,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-500',
      borderColor: 'group-hover:border-amber-200'
    },
    {
      label: 'ไม่มา (No Show)',
      value: noShow,
      icon: UserX,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-500',
      borderColor: 'group-hover:border-rose-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className={`bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 group transition-all duration-300 ${stat.borderColor}`}
        >
          <div className={`w-16 h-16 ${stat.bgColor} ${stat.textColor} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
            <stat.icon size={32} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FacilitySummary;
