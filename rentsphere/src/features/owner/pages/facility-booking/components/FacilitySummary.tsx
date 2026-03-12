import { CalendarDays, CheckCircle2, PlayCircle } from "lucide-react";
import React from "react";

interface FacilitySummaryProps {
  total: number;
  active: number;
  completed: number;
}

const FacilitySummary: React.FC<FacilitySummaryProps> = ({
  total,
  active,
  completed,
}) => {
  const stats = [
    {
      label: "การจองทั้งหมด",
      value: total,
      icon: CalendarDays,
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      borderColor: "group-hover:border-indigo-200",
    },
    {
      label: "กำลังใช้งาน",
      value: active,
      icon: PlayCircle,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "group-hover:border-emerald-200",
    },
    {
      label: "เสร็จสิ้น",
      value: completed,
      icon: CheckCircle2,
      bgColor: "bg-sky-50",
      textColor: "text-sky-600",
      borderColor: "group-hover:border-sky-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 group transition-all duration-300 ${stat.borderColor}`}
        >
          <div
            className={`w-16 h-16 ${stat.bgColor} ${stat.textColor} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}
          >
            <stat.icon size={32} />
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <p className="text-3xl font-black text-slate-900">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FacilitySummary;