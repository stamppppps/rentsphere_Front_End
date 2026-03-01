import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, LogOut, Building2, MapPin } from 'lucide-react';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden flex flex-col items-center justify-center p-6 font-sans max-w-md mx-auto shadow-2xl border-x border-gray-800">
      {/* Immersive Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 grayscale scale-110"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0f172a]/60 via-[#0f172a]/90 to-[#0f172a]" />

      <div className="w-full flex flex-col items-center px-4 relative z-20">
        {/* Success Animation */}
        <div className="relative mb-12">
          <div className="w-28 h-28 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center relative z-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_40px_rgba(34,211,238,0.3)]">
              <Check size={40} strokeWidth={3} />
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 z-0" />
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-12">
          <p className="text-cyan-400 text-xl font-bold uppercase tracking-[0.2em] mb-3">
            ยืนยันตัวตนสำเร็จ
          </p>
          <h1 className="text-4xl font-serif text-white mb-2 font-extralight tracking-wide">
            ยินดีต้อนรับเข้าสู่
          </h1>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            RentSphere 
          </h2>
        </div>

        {/* Resident Card */}
        <div className="w-full bg-white/5 backdrop-blur-3xl rounded-[40px] p-8 border border-white/10 shadow-2xl mb-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6">
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10 shadow-inner">
                <Building2 size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-l font-bold text-gray-500 uppercase tracking-widest">ที่พักอาศัย</p>
                <p className="text-base font-medium text-white">Waiting for backend data</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/10 shadow-inner">
                <MapPin size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-l font-bold text-gray-500 uppercase tracking-widest">ตำแหน่งห้องพัก</p>
                <p className="text-base font-medium text-white">Waiting for backend data</p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500/30 shadow-lg">
                  <div className="w-full h-full bg-cyan-500/10 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
                    USER
                  </div>
                </div>
                <div>
                  <p className="text-l font-bold text-gray-500 uppercase tracking-widest mb-1">ชื่อผู้เข้าสู่ระบบ</p>
                  <p className="text-sm font-bold text-white tracking-widest">Waiting for backend data</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="w-full bg-white text-[#0f172a] font-bold py-5 !rounded-4xl shadow-xl shadow-white/5 flex items-center justify-center gap-3 transition-all active:scale-[0.97] mb-8 group"
        >
          <span className="text-lg">เข้าสู่หน้าหลัก</span>
          <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Logout */}
        <button 
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-l font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-[0.3em]"
        >
          <LogOut size={14} />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
