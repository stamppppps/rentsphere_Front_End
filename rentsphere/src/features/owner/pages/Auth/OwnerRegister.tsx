import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthStep } from '@/types';
import rentsphereLogo from '@/assets/brand/rentsphere-logo.png';


const OwnerRegister: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>(AuthStep.REGISTER_PHONE);
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 

  const handleNextStep = (next: AuthStep) => setStep(next);

 
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


  // OTP input 
  useEffect(() => {
    const activeIndex = otp.findIndex((v) => v === '');
    const targetIndex = activeIndex === -1 ? otp.length - 1 : activeIndex;
    const el = document.getElementById(`otp-${targetIndex}`) as HTMLInputElement | null;
    el?.focus();
  }, [otp]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
  };

  const renderStep = () => {
    switch (step) {
      case AuthStep.REGISTER_PHONE:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-800">สมัครสมาชิก Owner</h2>
            <p className="text-gray-500 text-sm">กรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP</p>

            <input
              type="text"
              className="w-full px-5 py-4 input-auth focus:ring-2 focus:ring-indigo-300 outline-none transition-all"
              placeholder="เบอร์โทรศัพท์"
            />

            <button
              onClick={() => handleNextStep(AuthStep.OTP_VERIFY)}
              className="w-full py-4 btn-auth text-white rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98]"
            >
              ขอรหัส OTP
            </button>

            <div className="text-[11px] pt-4 border-t border-gray-200 flex justify-between">
              <span className="text-gray-500">
                มีบัญชีแล้ว?{' '}
                <Link to="/owner/login" className="text-blue-500 font-bold">
                  เข้าสู่ระบบ
                </Link>
              </span>
              <Link to="/auth/tenant" className="text-gray-400 hover:text-gray-600">
                ผู้เช่า (Tenant)
              </Link>
            </div>
          </div>
        );

      case AuthStep.OTP_VERIFY:
        return (
          <div className="space-y-5">
            <h2 className="text-3xl font-bold text-gray-800">ยืนยัน OTP</h2>
            <p className="text-gray-500 text-sm">กรอกรหัส OTP 6 หลักที่ส่งไปยังเบอร์โทรศัพท์</p>

            <div className="flex items-center justify-between gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  maxLength={1}
                  className="w-12 h-12 text-center rounded-xl border border-gray-200 bg-white/70 outline-none focus:ring-2 focus:ring-indigo-300"
                />
              ))}
            </div>

            <button
              onClick={() => handleNextStep(AuthStep.REGISTER_DETAIL)}
              className="w-full py-4 btn-auth text-white rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98]"
            >
              ยืนยัน
            </button>

            <div className="flex justify-between text-[11px] pt-4 border-t border-gray-200">
              <button
                onClick={() => handleNextStep(AuthStep.REGISTER_PHONE)}
                className="text-gray-400 hover:text-gray-600"
              >
                ย้อนกลับ
              </button>
              <button className="text-blue-500 font-bold">ส่งรหัสใหม่</button>
            </div>
          </div>
        );

      case AuthStep.REGISTER_DETAIL:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-800">ข้อมูลเจ้าของหอ</h2>
            <p className="text-gray-500 text-sm">กรอกข้อมูลสำหรับการสร้างบัญชี Owner</p>

            <input
              type="text"
              className="w-full px-5 py-4 input-auth focus:ring-2 focus:ring-indigo-300 outline-none transition-all"
              placeholder="ชื่อ - นามสกุล"
            />
            <input
              type="email"
              className="w-full px-5 py-4 input-auth focus:ring-2 focus:ring-indigo-300 outline-none transition-all"
              placeholder="อีเมล"
            />

            <button
              onClick={() => handleNextStep(AuthStep.SET_PASSWORD)}
              className="w-full py-4 btn-auth text-white rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98]"
            >
              ถัดไป
            </button>

            <div className="flex justify-between text-[11px] pt-4 border-t border-gray-200">
              <button
                onClick={() => handleNextStep(AuthStep.OTP_VERIFY)}
                className="text-gray-400 hover:text-gray-600"
              >
                ย้อนกลับ
              </button>
            </div>
          </div>
        );

      case AuthStep.SET_PASSWORD:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-800">ตั้งรหัสผ่าน</h2>
            <p className="text-gray-500 text-sm">สร้างรหัสผ่านสำหรับบัญชี Owner</p>

            <input
              type="password"
              className="w-full px-5 py-4 input-auth focus:ring-2 focus:ring-indigo-300 outline-none transition-all"
              placeholder="รหัสผ่าน"
            />
            <input
              type="password"
              className="w-full px-5 py-4 input-auth focus:ring-2 focus:ring-indigo-300 outline-none transition-all"
              placeholder="ยืนยันรหัสผ่าน"
            />

            <button
              onClick={() => handleNextStep(AuthStep.SUCCESS)}
              className="w-full py-4 btn-auth text-white rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98]"
            >
              สมัครสมาชิก
            </button>

            <div className="flex justify-between text-[11px] pt-4 border-t border-gray-200">
              <button
                onClick={() => handleNextStep(AuthStep.REGISTER_DETAIL)}
                className="text-gray-400 hover:text-gray-600"
              >
                ย้อนกลับ
              </button>
            </div>
          </div>
        );

      case AuthStep.SUCCESS:
        return (
          <div className="space-y-5 text-center">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">สมัครสำเร็จ</h2>
            <p className="text-gray-500 text-sm">คุณสามารถเข้าสู่ระบบ Owner ได้ทันที</p>

            <button
              onClick={() => navigate('/owner/login')}
              className="w-full py-4 btn-auth text-white rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98]"
            >
              ไปหน้าเข้าสู่ระบบ
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left Cosmic Branding Section */}
      <div className="hidden md:flex w-7/12 cosmic-gradient flex-col items-center justify-center relative">
        <Meteors />
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
          <p className="text-white/60 text-sm">สมัครสมาชิกเจ้าของหอพัก (Owner)</p>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full md:w-5/12 flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="w-full max-w-md glass-card p-10">
          <div className="flex flex-col items-center mb-8">
            <img src={rentsphereLogo} alt="RentSphere" className="w-14 h-14 object-contain mb-3" />
          </div>

          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default OwnerRegister;
