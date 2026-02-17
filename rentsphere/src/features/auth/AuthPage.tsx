import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthStep, UserRole } from '@/types';
import rentsphereLogo from '@/assets/brand/rentsphere-logo.png';
import condoBg from '@/assets/brand/condo.png';

const AuthPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>(AuthStep.LOGIN);
  const [forgotMethod, setForgotMethod] = useState<'email' | 'phone'>('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP

  const userRole =
    role?.toUpperCase() === 'OWNER' ? UserRole.OWNER : UserRole.TENANT;

  const handleNextStep = (next: AuthStep) => setStep(next);

 
  const inputSaaS =
    'w-full px-5 py-4 rounded-2xl bg-white/90 border border-indigo-100 shadow-sm ' +
    'text-slate-800 placeholder:text-slate-400 ' +
    'focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 ' +
    'outline-none transition-all';

  const cardSaaS =
    'w-full max-w-xl rounded-3xl bg-white/65 backdrop-blur-xl border border-white/60 ' +
    'shadow-[0_24px_60px_rgba(15,23,42,0.18)] p-10';

  // Generate meteor elements
  const Meteors = () => (
    <div className="stars-container">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="meteor"
          style={{
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 150 + 60}px`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 5}s`,
            
          }}
        />
      ))}
    </div>
  );

  // Background condo image (faint) + dark overlay
  const CondoBackground = () => (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${condoBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
        }}
      />
      <div className="absolute inset-0 bg-[#0b1020]/70" />
    </>
  );


  const SaaSBackground = () => (
    <>
      <div className="absolute inset-0 bg-[#eaf3ff]" />
      <div className="absolute -top-24 -right-28 w-[560px] h-[560px] bg-blue-300/35 blur-[110px] rounded-full" />
      <div className="absolute -bottom-28 -left-28 w-[560px] h-[560px] bg-indigo-300/30 blur-[110px] rounded-full" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-transparent to-indigo-50/70" />
      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(99,102,241,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.25) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </>
  );

  const renderStep = () => {
    switch (step) {
      case AuthStep.LOGIN:
        return (
          <div className="flex flex-col md:flex-row min-h-screen w-full">
            {/* Left Branding */}
            <div className="hidden md:flex w-7/12 cosmic-gradient flex-col items-center justify-center relative overflow-hidden">
              <CondoBackground />
              <Meteors />

              {/* Planetary Blurs */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full" />

              <div className="relative z-10 flex flex-col items-center">
                <img
                  src={rentsphereLogo}
                  alt="RentSphere"
                  className="w-56 md:w-64 lg:w-72 mb-7 drop-shadow-xl"
                />
                <h1 className="text-6xl font-bold text-white tracking-[0.3em] mt-[-84px]">
                  RENTSPHERE
                </h1>
                <p className="mt-5 text-white/70 tracking-wide text-sm">
                  Modern Condo Management Platform
                </p>
              </div>
            </div>

            {/* Right Login Form */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
              <SaaSBackground />

              
              <div className={`relative ${cardSaaS}`}>
                <h2 className="text-5xl font-bold text-slate-900 mb-2">
                  ลงชื่อเข้าใช้
                </h2>

                <p className="text-xs text-slate-600 mb-8 leading-relaxed">
                  ยินดีต้อนรับสู่{' '}
                  <span className="text-indigo-600 font-bold">RentSphere</span>
                  <br />
                  เมื่อคุณลงชื่อเข้าใช้ แสดงว่าคุณยอมรับ
                  <a
                    href="#"
                    className="text-blue-600 underline ml-1 underline-offset-2"
                  >
                    เงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว
                  </a>
                </p>

                <div className="space-y-4">
                  <input
                    type="text"
                    className={inputSaaS}
                    placeholder="อีเมล / เบอร์โทรศัพท์"
                  />

                  <input
                    type="password"
                    className={inputSaaS}
                    placeholder="รหัสผ่าน"
                  />

                  <div className="flex items-center gap-2 px-1">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      id="remember"
                    />
                    <label
                      htmlFor="remember"
                      className="text-xs text-slate-600"
                    >
                      จดจำรหัสผ่าน
                    </label>
                  </div>

                  <button
                    onClick={() =>
                      navigate(userRole === UserRole.OWNER ? '/owner' : '/tenant')
                    }
                    className="w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg"
                  >
                    เข้าสู่ระบบ
                  </button>

                  <div className="flex items-center justify-between text-[11px] pt-4 border-t border-slate-200">
                    <div className="text-slate-600">
                      สมาชิกใหม่?{' '}
                      <button
                        onClick={() => handleNextStep(AuthStep.REGISTER_PHONE)}
                        className="text-blue-700 font-bold"
                      >
                        สมัครลงทะเบียนทันที
                      </button>
                    </div>
                    <button
                      onClick={() => handleNextStep(AuthStep.REGISTER_DETAIL)}
                      className="text-blue-700"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      
      case AuthStep.REGISTER_PHONE:
        return (
          <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
            <CondoBackground />
            <Meteors />

            <div className="relative z-10 w-full max-w-md">
              <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl px-10 py-10">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={rentsphereLogo}
                    alt="RentSphere"
                    className="w-28 md:w-32 lg:w-36 -mt-2 mb-3 drop-shadow-xl"
                  />
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-[0.22em] text-white/90 -mt-7">
                    RENTSPHERE
                  </h1>
                  <p className="mt-2 text-sm text-white/60">
                    สมัครสมาชิกเพื่อเข้าใช้งานระบบ
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <input
                    type="text"
                    placeholder="ชื่อ - นามสกุล"
                    className="input-auth w-full"
                  />
                  <input
                    type="email"
                    placeholder="อีเมล"
                    className="input-auth w-full"
                  />
                  <input
                    type="tel"
                    placeholder="หมายเลขโทรศัพท์"
                    className="input-auth w-full"
                  />
                  <input
                    type="password"
                    placeholder="รหัสผ่าน"
                    className="input-auth w-full"
                  />
                  <input
                    type="password"
                    placeholder="ยืนยันรหัสผ่าน"
                    className="input-auth w-full"
                  />

                  <button
                    onClick={() => handleNextStep(AuthStep.OTP_VERIFY)}
                    className="btn-auth w-full mt-2"
                  >
                    ลงทะเบียน
                  </button>

                  <p className="text-center text-sm text-white/60 mt-4">
                    เป็นสมาชิกอยู่แล้วใช่ไหม?{' '}
                    <button
                      onClick={() => handleNextStep(AuthStep.LOGIN)}
                      className="text-sky-300 hover:text-sky-200 underline underline-offset-4"
                    >
                      เข้าสู่ระบบ
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case AuthStep.OTP_VERIFY:
        return (
          <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
            <CondoBackground />
            <Meteors />

            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
              <img
                src={rentsphereLogo}
                alt="RentSphere"
                className="w-28 md:w-32 lg:w-36 -mt-2 mb-3 drop-shadow-xl"
              />
              <h1 className="text-2xl font-bold text-blue-900 tracking-widest mb-12">
                RENTSPHERE
              </h1>

              <div className="w-full flex flex-col items-center">
                <h3 className="text-2xl font-bold text-white mb-6">
                  กรอกรหัสยืนยันตัวตน
                </h3>
                <p className="text-center text-sm text-gray-500 mb-10 leading-relaxed">
                  กรุณากรอกรหัสยืนยัน 6 หลักที่ส่งไปยัง
                  <br />
                  หมายเลขโทรศัพท์ 092-222-2222 เพื่อยืนยันตัวตน
                </p>

                <div className="flex justify-center gap-4 mb-12">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      className="w-14 h-16 md:w-20 md:h-24 text-center text-4xl font-bold rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                      value={digit}
                      onChange={(e) => {
                        const newOtp = [...otp];
                        newOtp[i] = e.target.value;
                        setOtp(newOtp);
                        if (e.target.value && i < 5) {
                          const nextInput = document.getElementById(`otp-${i + 1}`);
                          nextInput?.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => handleNextStep(AuthStep.SET_PASSWORD)}
                  className="w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg"
                >
                  ยืนยัน
                </button>

                <div className="mt-8 text-center">
                  <p className="text-xs text-gray-400">
                    ยังไม่ได้รับรหัสใช่ไหม?{' '}
                    <button className="font-bold text-white underline">
                      ส่งรหัสอีกครั้ง
                    </button>
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    ขอรหัสใหม่ได้ใน 00:30 วินาที
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case AuthStep.REGISTER_DETAIL:
        return (
          <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
            <CondoBackground />
            <Meteors />

            <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
              <img
                src={rentsphereLogo}
                alt="RentSphere"
                className="w-28 md:w-32 lg:w-36 -mt-2 mb-3 drop-shadow-xl"
              />
              <h1 className="text-2xl font-bold text-blue-900 tracking-widest mb-12">
                RENTSPHERE
              </h1>

              <div className="w-full bg-white p-10 rounded-[3rem] shadow-xl flex flex-col items-center">
                <h3 className="text-xl font-medium text-gray-800 mb-8">
                  โปรดระบุช่องทางสำหรับตั้งรหัสผ่านใหม่
                </h3>

                <div className="flex w-full gap-4 mb-6">
                  <button
                    onClick={() => setForgotMethod('email')}
                    className={`flex-1 py-3 rounded-xl border transition-all font-medium ${
                      forgotMethod === 'email'
                        ? 'border-blue-400 text-blue-600'
                        : 'border-gray-200 text-gray-400'
                    }`}
                  >
                    อีเมล
                  </button>
                  <button
                    onClick={() => setForgotMethod('phone')}
                    className={`flex-1 py-3 rounded-xl border transition-all font-medium ${
                      forgotMethod === 'phone'
                        ? 'border-blue-400 text-blue-600'
                        : 'border-gray-200 text-gray-400'
                    }`}
                  >
                    เบอร์โทรศัพท์
                  </button>
                </div>

                <div className="w-full mb-8">
                  <label className="block text-[10px] font-bold text-gray-400 mb-1 ml-1 uppercase">
                    {forgotMethod === 'email' ? 'อีเมล' : 'เบอร์โทรศัพท์'}
                  </label>
                  <input
                    type={forgotMethod === 'email' ? 'email' : 'tel'}
                    className="w-full px-5 py-3 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder={forgotMethod === 'email' ? 'example@mail.com' : '08X-XXX-XXXX'}
                  />
                </div>

                <button
                  onClick={() => handleNextStep(AuthStep.OTP_VERIFY)}
                  className="w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg"
                >
                  {forgotMethod === 'email' ? 'ส่งอีเมลรีเซ็ตรหัสผ่าน' : 'ขอ OTP'}
                </button>
              </div>
            </div>
          </div>
        );

      case AuthStep.SET_PASSWORD:
        return (
          <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
            <CondoBackground />
            <Meteors />

            <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
              <img
                src={rentsphereLogo}
                alt="RentSphere"
               className="w-28 md:w-40 lg:w-44 -mt-2 mb-3 drop-shadow-xl"
              />
              <h1 className="text-2xl font-bold text-blue-900 tracking-widest -mt-1 mb-6">

                RENTSPHERE
              </h1>

              <div className="w-full bg-white p-12 rounded-[3rem] shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-8 text-center">
                  โปรดตั้งรหัสผ่านใหม่
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">
                      รหัสผ่านใหม่ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">
                      ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => handleNextStep(AuthStep.LOGIN)}
                      className="w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg"

                    >
                      ยืนยัน
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="min-h-screen w-full">{renderStep()}</div>;
};

export default AuthPage;
