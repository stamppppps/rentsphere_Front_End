import React from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  LogOut,
  MapPin,
  Sparkles,
} from "lucide-react";

interface SuccessPortalProps {
  onConfirm: () => void;
}

const SuccessPortal: React.FC<SuccessPortalProps> = ({ onConfirm }) => {
  return (
    <div className="rentsphere-scope relative w-full h-full bg-[#f8fafc] text-[#1a1a1a] flex flex-col justify-between overflow-hidden">
      {/* Decorative Top */}
      <div className="absolute top-0 left-0 w-full h-48 bg-[#0f172a] -z-0">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"
            className="w-full h-full object-cover grayscale"
            alt="Estate"
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#f8fafc] to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 px-8 flex flex-col items-center">
        <div className="relative mb-8 animate-reveal">
          <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center border-[6px] border-[#f8fafc]">
            <CheckCircle2 size={54} className="text-blue-600" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="text-cyan-400 animate-pulse" size={24} />
          </div>
        </div>

        <h1 className="serif-title text-4xl font-semibold tracking-tight text-[#1a1a1a] mb-2 animate-reveal" style={{ animationDelay: '0.1s' }}>
          ยินดีต้อนรับสู่ RentSphere
        </h1>

         <p className="text-sm text-slate-500 tracking-wider font-light animate-reveal" style={{ animationDelay: '0.2s' }}>
          ยืนยันตัวตนสำเร็จ
        </p>
        {/* Member Details */}
        <div
          className="w-full mt-12 p-8 rounded-[2rem] bg-white border border-blue-50 shadow-xl animate-reveal"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#f0f9ff] flex items-center justify-center flex-shrink-0">
                <Building2 size={20} className="text-blue-500/60" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                  โครงการที่พักอาศัย
                </p>
                <p className="text-sm font-medium">เดอะ ริทซ์-คาร์ลตัน เรสซิเดนเซส</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#ecfeff] flex items-center justify-center flex-shrink-0">
                <MapPin size={20} className="text-cyan-500/60" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                  ตำแหน่ง
                </p>
                <p className="text-sm font-medium">ชั้น 72,ตึกเอ</p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                สมาชิห
              </p>
              <span className="inline-block px-3 py-1 bg-[#0f172a] text-cyan-400 rounded-full text-[9px] font-black tracking-widest uppercase">
                Platinum Member
              </span>
            </div>
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 p-0.5">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                className="w-full h-full rounded-full bg-blue-50"
                alt="Avatar"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-8 animate-reveal" style={{ animationDelay: "0.4s" }}>
        <button
          onClick={onConfirm}
          className="group w-full h-16 bg-[#0f172a] text-white rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-slate-900 active:scale-[0.98] shadow-2xl"
        >
          <span className="text-sm font-bold tracking-[0.2em] uppercase">
           เข้าสู่หน้าหลัก
          </span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onConfirm}
          className="w-full mt-4 flex items-center justify-center gap-2 text-slate-400 hover:text-blue-500 transition-colors py-2"
        >
          <LogOut size={14} />
          <span className="text-[10px] font-bold tracking-widest uppercase">ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
};

export default SuccessPortal;
