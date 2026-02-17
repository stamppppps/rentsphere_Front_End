import React from "react";
import { useNavigate } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";
import { useAuthRole } from "@/features/auth/hooks/useAuthRole";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { base } = useAuthRole();

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
            <p className="mt-2 text-sm text-white/60">สมัครสมาชิกเพื่อเข้าใช้งานระบบ</p>
          </div>

          <div className="mt-8 space-y-4">
            <input type="text" placeholder="ชื่อ - นามสกุล" className="input-auth w-full" />
            <input type="email" placeholder="อีเมล" className="input-auth w-full" />
            <input type="tel" placeholder="หมายเลขโทรศัพท์" className="input-auth w-full" />
            <input type="password" placeholder="รหัสผ่าน" className="input-auth w-full" />
            <input type="password" placeholder="ยืนยันรหัสผ่าน" className="input-auth w-full" />

            <button onClick={() => navigate(`${base}/otp`)} className="btn-auth w-full mt-2">
              ลงทะเบียน
            </button>

            <p className="text-center text-sm text-white/60 mt-4">
              เป็นสมาชิกอยู่แล้วใช่ไหม?{" "}
              <button
                onClick={() => navigate(`${base}/login`)}
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
};

export default RegisterPage;
