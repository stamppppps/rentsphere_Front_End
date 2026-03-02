import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, ArrowRight, ShieldCheck, Home } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AuthLayout variant="dark">
      <div className="w-full flex flex-col items-center px-4">
        {/* Logo Icon */}
        <div className="w-20 h-20 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-500/5 shadow-[0_0_30px_rgba(34,211,238,0.15)] mb-10">
          <Home className="text-cyan-400" size={36} />
        </div>

        {/* Brand Name */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif tracking-[0.25em] text-white mb-3 font-extralight">
            RENTSPHERE
          </h1>
        </div>

        {/* Login Card */}
        <div className="w-full bg-[#1e293b]/30 backdrop-blur-2xl border border-white/5 rounded-[48px] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow Effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full" />

          <div className="text-center mb-10 relative z-10">
            <h2 className="text-3xl font-bold text-white mb-3">ยินดีต้อนรับ</h2>
            <p className="text-xl text-gray-400 leading-relaxed px-2">
              กรุณากรอกรหัสส่วนตัวที่ได้รับจาก <br/>
              <span className="text-cyan-400 font-semibold">นิติบุคคล</span> เพื่อเข้าสู่ระบบ
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6 relative z-10">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-500/40 group-focus-within:text-cyan-400 transition-colors">
                <Key size={22} />
              </div>
              <input 
                type="text"
                placeholder="รหัสเข้าใช้งาน"
                className="w-full bg-black/20 border border-white/10 !rounded-3xl py-5 pl-14 pr-6 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all text-lg"
              />
            </div>

            <button 
              type="button"
              onClick={() => navigate('/tenant/welcome')}
              className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white font-bold py-5 !rounded-3xl !shadow-xl shadow-cyan-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.97] group"
            >
              <span className="text-lg">เข้าสู่ระบบ</span>
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 flex items-center justify-center gap-2 text-[9px] font-bold text-cyan-500/30 uppercase tracking-widest relative z-10">
            <ShieldCheck size={14} />
            การเชื่อมต่อได้รับการเข้ารหัสอย่างปลอดภัย
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 flex flex-col items-center gap-4 opacity-40">
          <div className="h-12 w-[1px] bg-gradient-to-b from-cyan-500/50 to-transparent" />
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] text-center max-w-[200px] leading-loose">
            สำหรับผู้พักอาศัยและเจ้าของห้องที่ได้รับการยืนยันแล้วเท่านั้น
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
