import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import rentsphereLogo from '@/assets/brand/rentsphere-logo.png';


const OwnerLogin: React.FC = () => {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);

  // Generate meteor elements (same feel as AuthPage)
  const Meteors = () => (
    <div className="stars-container">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="meteor"
          style={{
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 150 + 50}px`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );

  const handleLogin = () => {
    // TODO: connect real API + token storage
    // For now, just navigate into owner area.
    void remember;
    navigate('/owner/add-condo/step-0');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left Cosmic Branding Section */}
      <div className="hidden md:flex w-7/12 cosmic-gradient flex-col items-center justify-center relative">
        <Meteors />

        {/* Planetary Blurs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <img src={rentsphereLogo} alt="RentSphere" className="w-12 h-12 object-contain" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">RENTSHPERE</h1>
          <p className="text-xl text-white/80 mb-2">ระบบจัดการหอพักครบวงจร</p>
          <p className="text-white/60 text-sm">สำหรับเจ้าของหอพัก (Owner)</p>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full md:w-5/12 flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="w-full max-w-md glass-card p-10">
          <div className="flex flex-col items-center mb-8">
            <img src={rentsphereLogo} alt="RentSphere" className="w-14 h-14 object-contain mb-3" />
            <h2 className="text-3xl font-bold text-gray-800">เข้าสู่ระบบ (Owner)</h2>
            <p className="text-gray-500 text-sm mt-1">กรอกข้อมูลเพื่อเข้าสู่ระบบ</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              className="w-full px-5 py-4 input-auth focus:ring-2 focus:ring-indigo-300 outline-none transition-all"
              placeholder="อีเมล / เบอร์โทรศัพท์"
            />
            <input
              type="password"
              className="w-full px-5 py-4 input-auth focus:ring-2 focus:ring-indigo-300 outline-none transition-all"
              placeholder="รหัสผ่าน"
            />

            <div className="flex items-center gap-2 px-1">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember" className="text-xs text-gray-400">
                จดจำรหัสผ่าน
              </label>
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-4 btn-auth text-white rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98]"
            >
              เข้าสู่ระบบ
            </button>

            <div className="flex items-center justify-between text-[11px] pt-4 border-t border-gray-200">
              <div className="text-gray-500">
                สมาชิกใหม่?{' '}
                <Link to="/owner/register" className="text-blue-500 font-bold">
                  สมัครลงทะเบียนทันที
                </Link>
              </div>

              <Link to="/auth/owner" className="text-gray-400 hover:text-gray-600">
                ลืมรหัสผ่าน?
              </Link>
            </div>

            <div className="mt-8 text-center">
              <Link to="/auth/tenant" className="text-xs text-gray-400 hover:text-gray-600">
                เข้าสู่ระบบผู้เช่า (Tenant)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerLogin;
