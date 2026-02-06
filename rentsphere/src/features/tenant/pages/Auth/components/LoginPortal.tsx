import React, { useState } from "react";
import { ArrowRight, Home, Key, ShieldCheck } from "lucide-react";

interface LoginPortalProps {
  onLogin: (token: string) => void;
}

const LoginPortal: React.FC<LoginPortalProps> = ({ onLogin }) => {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);
    setTimeout(() => {
      onLogin(token);
    }, 800);
  };

  return (
    <div className="rentsphere-scope relative w-full h-full flex flex-col items-center justify-between p-8 overflow-hidden bg-[#0a0e17]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200"
          className="w-full h-full object-cover scale-110 opacity-40 transition-transform duration-[2000ms] ease-out"
          style={{ objectPosition: "center 20%" }}
          alt="Luxury Architecture"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17]/90 via-[#0a0e17]/40 to-[#0a0e17]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 w-full mt-12 text-center animate-reveal">
        <div className="flex justify-center mb-6">
          <div className="p-3.5 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,114,255,0.2)]">
            <Home size={28} className="text-blue-400" strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="serif-title text-5xl font-light tracking-[0.15em] mb-2 blue-gradient">
          RENTSPHERE
        </h1>
        <p className="text-[10px] tracking-[0.5em] text-cyan-400/50 font-bold uppercase">
          Exclusive Residential Access
        </p>
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full glass-premium rounded-[2.5rem] p-8 animate-reveal"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="mb-8 text-center">
          <h2 className="text-lg font-medium text-white/90 tracking-wide">
            ยินดีต้อนรับสู่ RentSphere
          </h2>
          <p className="text-[11px] text-white/30 mt-1 italic font-light">
           กรุณากรอกรหัสที่ส่งไปยัง LINE Official เพื่อยืนยันตัวตน
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-400/30 group-focus-within:text-cyan-400 transition-all duration-300">
              <Key size={18} />
            </div>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Private Token"
              className="w-full h-16 bg-white/[0.02] border border-white/10 rounded-2xl pl-14 pr-6 outline-none transition-all focus:border-blue-500/40 focus:bg-white/[0.06] text-center tracking-[0.4em] font-light text-white placeholder:tracking-normal placeholder:text-white/20"
            />
          </div>

          <button
            type="submit"
            disabled={!token || isLoading}
            className="group relative w-full h-16 rounded-2xl overflow-hidden font-bold transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-blue-900/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 opacity-95 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 shimmer opacity-20"></div>
            <span className="relative flex items-center justify-center gap-3 text-white uppercase tracking-[0.2em] text-sm font-bold">
               {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
                strokeWidth={2.5}
              />
            </span>
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-white/20">
          <ShieldCheck size={14} className="text-cyan-400/40" />
          <span className="text-[9px] uppercase tracking-[0.2em] font-black">
            การเชื่อมต่อที่เข้ารหัสปลอดภัย
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mb-8 opacity-40 hover:opacity-100 transition-all duration-500">
        <p className="text-[9px] text-center tracking-[0.35em] font-light uppercase text-blue-200/50">
          Reserved for Owners and Verified Residents
        </p>
      </div>
    </div>
  );
};

export default LoginPortal;
