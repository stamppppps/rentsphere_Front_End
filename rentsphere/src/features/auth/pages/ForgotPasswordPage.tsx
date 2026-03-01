import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";
import { api } from "@/shared/api/http";

type ForgotRes = { ok: true; requestId?: string; channel?: "EMAIL" | "PHONE" };

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  
  const base = "/auth/owner";

  const [forgotMethod, setForgotMethod] = useState<"email" | "phone">("email");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>("");
  const [info, setInfo] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const v = value.trim();
    setError("");
    setInfo("");

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

    try {
      setLoading(true);

      const channel: "EMAIL" | "PHONE" = forgotMethod === "email" ? "EMAIL" : "PHONE";

      const data = await api<ForgotRes>("/auth/password/forgot", {
        method: "POST",
        body: JSON.stringify({ identifier: v, channel }),
      });

      if (data?.requestId) {
        navigate(
          `${base}/reset?requestId=${encodeURIComponent(data.requestId)}&channel=${encodeURIComponent(
            data.channel || channel
          )}`,
          { replace: true }
        );
        return;
      }

      setInfo("ถ้าข้อมูลถูกต้อง ระบบจะส่งรหัสยืนยันให้คุณภายในไม่กี่นาที");
    } catch (e: any) {
      setError(e?.message || "ส่งคำขอไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
      <CondoBackground />
      <Meteors />

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        <img src={rentsphereLogo} alt="RentSphere" className="w-28 md:w-32 lg:w-36 -mt-2 mb-3 drop-shadow-xl" />
        <h1 className="text-2xl font-bold text-blue-900 tracking-widest mb-12">RENTSPHERE</h1>

        <div className="w-full bg-white p-10 rounded-[3rem] shadow-xl flex flex-col items-center">
          <h3 className="text-xl font-medium text-gray-800 mb-8">โปรดระบุช่องทางสำหรับตั้งรหัสผ่านใหม่</h3>

          <div className="flex w-full gap-4 mb-6">
            <button
              type="button"
              onClick={() => {
                setForgotMethod("email");
                setValue("");
                setError("");
                setInfo("");
              }}
              className={`flex-1 py-3 rounded-xl border transition-all font-medium ${
                forgotMethod === "email" ? "border-blue-400 text-blue-600" : "border-gray-200 text-gray-400"
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
                setInfo("");
              }}
              className={`flex-1 py-3 rounded-xl border transition-all font-medium ${
                forgotMethod === "phone" ? "border-blue-400 text-blue-600" : "border-gray-200 text-gray-400"
              }`}
            >
              เบอร์โทรศัพท์
            </button>
          </div>

          <form onSubmit={onSubmit} className="w-full">
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
                  if (info) setInfo("");
                }}
                className={`w-full px-5 py-3 rounded-lg bg-slate-50 border outline-none focus:ring-2 ${
                  error ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                }`}
                placeholder={forgotMethod === "email" ? "example@mail.com" : "08X-XXX-XXXX"}
              />

              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
              {info && <p className="mt-2 text-sm text-slate-600">{info}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "กำลังส่ง..." : forgotMethod === "email" ? "ส่งรหัสทางอีเมล" : "ส่ง OTP ทาง SMS"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate(`${base}/login`)}
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
