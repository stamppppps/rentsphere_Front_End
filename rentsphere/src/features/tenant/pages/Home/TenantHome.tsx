import React from "react";
import {
  Bell,
  Wrench,
  Receipt,
  Package,
  Calendar,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

const TenantHome: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col bg-transparent overflow-hidden">
      {/* Top Header */}
      <div className="relative z-10 pt-12 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white text-[10px] font-black italic">RS</span>
          </div>
          <h1 className="serif-title text-xl font-bold tracking-tight text-slate-800">
            RentSphere
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 bg-white/50 rounded-full shadow-sm text-slate-400">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-400 border-2 border-white rounded-full" />
          </button>

          <div className="w-9 h-9 bg-purple-100 rounded-full p-0.5 border-2 border-white shadow-sm overflow-hidden">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              className="w-full h-full rounded-full"
              alt="Profile"
            />
          </div>
        </div>
      </div>

      {/* Scroll area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pt-6 pb-[calc(160px+env(safe-area-inset-bottom))] space-y-6 rs-no-scrollbar">

        {/* User Card */}
        <div className="rs-glass-card rounded-[2.5rem] p-6">
          <p className="text-slate-400 text-[12px] font-medium">สวัสดีคุณกิตติเดช!</p>
          <h2 className="text-lg font-bold text-slate-800 mt-0.5">
            Hi, Mr. Kittidet Suksarn
          </h2>

          <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100/50">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">
                คอนโด
              </p>
              <p className="text-sm font-bold text-slate-600">Condo ABC</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">
                ห้อง
              </p>
              <p className="text-sm font-bold text-slate-600">Unit A 301</p>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <ServiceCard icon={<Wrench className="text-blue-500" />} label="รายงานซ่อมบำรุง" color="bg-blue-50" />
          <ServiceCard icon={<Receipt className="text-indigo-500" />} label="บิล / การชำระเงิน" color="bg-indigo-50" />
          <ServiceCard icon={<Package className="text-orange-500" />} label="พัสดุ" color="bg-orange-50" />
          <ServiceCard icon={<Calendar className="text-cyan-500" />} label="จองส่วนกลาง" color="bg-cyan-50" />
        </div>

        {/* Contact */}
        <button className="w-full rs-glass-card rounded-[2rem] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Staff"
                className="w-12 h-12 bg-white rounded-2xl shadow-sm"
                alt="Staff"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <MessageCircle size={10} className="text-white fill-white" />
              </div>
            </div>

            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-800">ติดต่อเจ้าหน้าที่</h3>
              <p className="text-[10px] text-slate-400">คุยกับนิติบุคคล / แจ้งปัญหา</p>
            </div>
          </div>

          <ArrowRight size={20} className="text-slate-300" />
        </button>

        {/* Recent */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-slate-800">รายการล่าสุด</h3>
            <button className="text-[11px] font-bold text-purple-500 uppercase">ดูทั้งหมด</button>
          </div>

          <RecentItem
            icon={<Receipt size={16} />}
            title="บิล / การชำระเงิน"
            detail="Amount Due: $4,200"
            date="Due Date: May 31, 2024"
            color="bg-indigo-50 text-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

const ServiceCard: React.FC<{ icon: any; label: string; color: string }> = ({
  icon,
  label,
  color,
}) => (
  <div className="rs-glass-card rounded-[2rem] p-5 flex flex-col gap-3 transition-transform active:scale-95 cursor-pointer">
    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shadow-sm`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <p className="text-[12px] font-bold text-slate-700 leading-tight">{label}</p>
  </div>
);

const RecentItem: React.FC<{
  icon: any;
  title: string;
  detail: string;
  date: string;
  color: string;
}> = ({ icon, title, detail, date, color }) => (
  <div className="bg-white/40 border border-white/60 rounded-[1.5rem] p-4 flex items-center gap-4">
    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="text-xs font-bold text-slate-800">{title}</h4>
      <p className="text-[11px] text-slate-600 font-medium">{detail}</p>
      <p className="text-[9px] text-slate-400 mt-0.5">{date}</p>
    </div>
    <ChevronRight size={16} className="text-slate-200" />
  </div>
);

const ChevronRight = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default TenantHome;
<s></s>