import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Wrench,
  Receipt,
  Package,
  Calendar,
  ChevronRight,
  Headset,
  Home,
  Menu,
  CheckCircle2,
  MapPin,
} from "lucide-react";

type Props = {
  fullName?: string;
  condoName?: string;
  unit?: string;
};

export default function TenantHome({
  fullName = "Tenant",
  condoName = "Condo",
  unit = "Unit",
}: Props) {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem("lineUserId");
    nav("/role", { replace: true });
  };

  return (
    <div className="w-screen h-screen bg-[#D1E4FF] font-sans pb-24 relative overflow-x-hidden">
      {/* background decor */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center justify-between sticky top-0 z-50 bg-[#D1E4FF]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => nav("/app")}
            className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-95"
            aria-label="Home"
          >
            <span className="text-white font-black text-xl italic">S</span>
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">RentSphere</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => nav("/tenant/repairs")}
            className="relative p-2 text-indigo-600 hover:bg-white/40 rounded-full transition-colors"
            aria-label="Notifications"
            title="ดู Ticket ของฉัน"
          >
            <Bell size={24} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#D1E4FF]" />
          </button>

          <button
            onClick={logout}
            className="p-1 border-2 border-indigo-400 rounded-full hover:bg-white/30 transition-colors"
            aria-label="Profile"
            title="ออกจากระบบ"
          >
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
              <User size={20} className="text-slate-400" />
            </div>
          </button>
        </div>
      </header>

      <main className="px-6 space-y-6">
        {/* Greeting */}
        <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-[2rem] p-6 shadow-sm">
          <h2 className="text-slate-500 text-sm font-medium">Hi, {fullName}</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">{condoName}</p>
          <p className="text-slate-400 text-xs font-semibold">{unit}</p>

          <div className="mt-4 flex justify-end opacity-20">
            <div className="h-10 w-32 bg-slate-400 rounded-md" />
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <ServiceCard
            title="รายงานซ่อมบำรุง"
            icon={<Wrench className="text-indigo-400" size={32} />}
            onClick={() => nav("/tenant/repair-new")}
          />
          <ServiceCard
            title="บิล / การชำระเงิน"
            icon={<Receipt className="text-indigo-400" size={32} />}
            badge
            onClick={() => alert("ยังไม่เปิดใช้เมนูบิล (placeholder)")}
          />
          <ServiceCard
            title="พัสดุ"
            icon={<Package className="text-indigo-400" size={32} />}
            location
            onClick={() => alert("ยังไม่มีหน้า /my-parcels")}
            // ถ้าทำหน้าแล้ว: onClick={() => nav("/my-parcels")}
          />
          <ServiceCard
            title="จองส่วนกลาง"
            icon={<Calendar className="text-indigo-400" size={32} />}
            checked
            onClick={() => alert("ยังไม่เปิดใช้เมนูจองส่วนกลาง (placeholder)")}
          />
        </div>

        {/* Contact */}
        <button
          onClick={() => alert("ยังไม่ได้ผูกช่องทางติดต่อนิติ (placeholder)")}
          className="w-full text-left bg-white/40 backdrop-blur-md border border-white/50 rounded-[2rem] p-6 shadow-sm flex items-center justify-between relative overflow-hidden group active:scale-[0.98] transition-all"
        >
          <h3 className="text-xl font-bold text-slate-700 relative z-10">ติดต่อนิติ</h3>
          <div className="relative z-10 p-3 bg-indigo-50 rounded-2xl shadow-inner">
            <Headset className="text-indigo-600" size={32} />
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-100/50 rounded-full translate-x-1/2 translate-y-1/2 blur-xl" />
        </button>

        {/* Latest */}
        <section className="bg-white/30 backdrop-blur-md border border-white/40 rounded-[2.5rem] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className="text-slate-500 font-bold text-sm">Latest</h4>
            <button
              onClick={() => nav("/tenant/repairs")}
              className="text-slate-400 hover:text-slate-600"
              aria-label="See more"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="space-y-3">
            <ActivityItem
              title="รายงานซ่อมบำรุง"
              subtitle="ดู Ticket ของฉัน"
              date="กดเพื่อดูรายการทั้งหมด"
              onClick={() => nav("/tenant/repairs")}
            />
            <ActivityItem
              title="พัสดุ"
              subtitle="เช็คพัสดุ (placeholder)"
              date="จะทำเป็น /my-parcels ได้"
              onClick={() => alert("ยังไม่มีหน้า /my-parcels")}
            />
          </div>
        </section>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 bg-white/60 backdrop-blur-xl border border-white/40 rounded-full shadow-2xl flex items-center justify-between px-8 z-50">
        <button
          onClick={() => nav("/tenant/repairs")}
          className="text-indigo-600 transition-transform active:scale-90"
          title="Ticket ของฉัน"
        >
          <Menu size={24} />
        </button>
        <span className="text-indigo-400 font-bold tracking-tight">RentSphere</span>
        <button
          onClick={() => nav("/app")}
          className="text-indigo-600 transition-transform active:scale-90"
          title="หน้าแรก"
        >
          <Home size={24} />
        </button>
      </nav>
    </div>
  );
}

function ServiceCard({
  title,
  icon,
  badge,
  checked,
  location,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: boolean;
  checked?: boolean;
  location?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white/40 backdrop-blur-md border border-white/50 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 group active:scale-[0.96] transition-all shadow-sm"
    >
      <div className="text-xs font-bold text-slate-500 text-center">{title}</div>
      <div className="relative">
        {icon}
        {badge && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white font-bold">
            !
          </div>
        )}
        {checked && (
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
            <CheckCircle2 size={16} className="text-blue-500" />
          </div>
        )}
        {location && (
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
            <MapPin size={16} className="text-blue-500" />
          </div>
        )}
      </div>
    </button>
  );
}

function ActivityItem({
  title,
  subtitle,
  date,
  onClick,
}: {
  title: string;
  subtitle: string;
  date: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/60 p-5 rounded-3xl flex flex-col gap-1 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-white/40 group active:scale-[0.98] transition-all"
    >
      <div className="text-xs font-bold text-slate-700">{title}</div>
      <div className="text-[11px] font-medium text-slate-500">{subtitle}</div>
      <div className="text-[10px] text-slate-400">{date}</div>
    </button>
  );
}
