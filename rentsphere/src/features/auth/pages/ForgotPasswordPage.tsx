import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";
import { useAuthRole } from "@/features/auth/hooks/useAuthRole";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { authBasePath } = useAuthRole();

  const [forgotMethod, setForgotMethod] = useState<"email" | "phone">("email");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>("");

  const handleSubmit = () => {
    const v = value.trim();

    if (!v) {
      setError(forgotMethod === "email" ? "กรุณากรอกอีเมล" : "กรุณากรอกเบอร์โทรศัพท์");
      return;
    }

    if (forgotMethod === "email") {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!ok) {
        setError("รูปแบบอีเมลไม่ถูกต้อง");
        return;
      }
    } else {
      
      const digits = v.replace(/\D/g, "");
      if (digits.length < 9 || digits.length > 10) {
        setError("รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง");
        return;
      }
    }

    setError("");

  
    navigate(`${authBasePath}/otp`, {
      state: { forgotMethod, value: v, from: "forgot" },
    });
  };

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
              type="button"
              onClick={() => {
                setForgotMethod("email");
                setValue("");
                setError("");
              }}
              className={`flex-1 py-3 rounded-xl border transition-all font-medium ${
                forgotMethod === "email"
                  ? "border-blue-400 text-blue-600"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              อีเมล
            </button>
            <button
              type="button"
              onClick={() => {
                setForgotMethod("phone");
                setValue("");
                setError("");
              }}
              className={`flex-1 py-3 rounded-xl border transition-all font-medium ${
                forgotMethod === "phone"
                  ? "border-blue-400 text-blue-600"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              เบอร์โทรศัพท์
            </button>
          </div>

          <div className="w-full mb-6">
            <label className="block text-[10px] font-bold text-gray-400 mb-1 ml-1 uppercase">
              {forgotMethod === "email" ? "อีเมล" : "เบอร์โทรศัพท์"}
            </label>
            <input
              type={forgotMethod === "email" ? "email" : "tel"}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className={`w-full px-5 py-3 rounded-lg bg-slate-50 border outline-none focus:ring-2 ${
                error ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
              }`}
              placeholder={forgotMethod === "email" ? "example@mail.com" : "08X-XXX-XXXX"}
            />

            {error && (
              <p className="mt-2 text-sm text-red-500">
                {error}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg"
          >
            {forgotMethod === "email" ? "ส่งอีเมลรีเซ็ตรหัสผ่าน" : "ขอ OTP"}
          </button>

          <button
            type="button"
            onClick={() => navigate(`${authBasePath}/login`)}
            className="mt-6 text-sm text-slate-500 underline underline-offset-4"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
