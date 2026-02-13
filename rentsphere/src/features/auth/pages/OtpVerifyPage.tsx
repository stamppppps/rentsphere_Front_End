import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";
import { useAuthRole } from "@/features/auth/hooks/useAuthRole";

const OtpVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const { authBasePath } = useAuthRole();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const isComplete = otp.every((d) => d.length === 1);

  const onChangeDigit = (i: number,value: string) =>{
    //เอาเฉพาะตัวเลข 
    const ch = value.replace(/\D/g,"").slice(-1);

    const next = [...otp];
    next[i] = ch;
    setOtp(next);

    //กรอกแล้ว ขยับไปช่องถัดไป
    if (ch && i < 5) {
      const nextInput = document.getElementById(
        `otp-${i + 1}`
      ) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  const onKeyDownDigit = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      const prev = document.getElementById(`otp-${i - 1}`) as HTMLInputElement | null;
      prev?.focus();
    }
  };

  const handleSubmit = () => {
    if (!isComplete) return;

    //ไปหน้า Reset
    navigate(`${authBasePath}/reset`,{ replace: true });
  };

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

          <p className="text-center text-sm text-white/60 mb-10 leading-relaxed">
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
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                className="w-14 h-16 md:w-20 md:h-24 text-center text-4xl font-bold rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                value={digit}
                onChange={(e) => onChangeDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDownDigit(i, e)}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={!isComplete}
            onClick={handleSubmit}
            className={`w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg
              ${!isComplete ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            ยืนยัน
          </button>

          <div className="mt-8 text-center">
            <p className="text-xs text-white/60">
              ยังไม่ได้รับรหัสใช่ไหม?{" "}
              <button type="button" className="font-bold text-white underline">
                ส่งรหัสอีกครั้ง
              </button>
            </p>
            <p className="text-xs text-white/40 mt-1">
              ขอรหัสใหม่ได้ใน 00:30 วินาที
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerifyPage;
