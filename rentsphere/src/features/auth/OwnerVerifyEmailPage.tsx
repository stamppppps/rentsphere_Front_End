import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";

const OwnerVerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const status = (params.get("status") || "").toLowerCase();

  let title = "ตรวจสอบอีเมลของคุณ";
  let desc =
    "เราได้ส่งลิงก์ยืนยันไปที่อีเมลแล้ว กรุณาเปิดอีเมลและกดลิงก์เพื่อยืนยัน จากนั้นกลับมาหน้านี้";

  if (status === "ok") {
    title = "✅ ยืนยันอีเมลสำเร็จ";
    desc = "กดปุ่มด้านล่างเพื่อตั้งรหัสผ่าน และสร้างบัญชี OWNER ให้เสร็จ";
  } else if (status === "expired") {
    title = "ลิงก์หมดอายุ";
    desc = "กรุณาเริ่มสมัครใหม่เพื่อรับลิงก์ยืนยันอีกครั้ง";
  } else if (status === "already") {
    title = "ยืนยันอีเมลแล้ว";
    desc = "อีเมลนี้ยืนยันไปแล้ว คุณสามารถไปขั้นตอนตั้งรหัสผ่านต่อได้";
  } else if (status === "invalid") {
    title = "ลิงก์ไม่ถูกต้อง";
    desc = "กรุณาเริ่มสมัครใหม่เพื่อรับลิงก์ที่ถูกต้อง";
  }

  const canContinue = status === "ok" || status === "already";

  return (
    <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
      <CondoBackground />
      <Meteors />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl px-10 py-10 text-center">
          <img src={rentsphereLogo} alt="RentSphere" className="w-24 mx-auto mb-4 drop-shadow-xl" />
          <h1 className="text-xl md:text-2xl font-semibold text-white/90">{title}</h1>
          <p className="mt-4 text-sm text-white/70 leading-relaxed">{desc}</p>

          <div className="mt-8 space-y-3">
            {canContinue ? (
              <button
                type="button"
                className="btn-auth w-full"
                onClick={() => navigate("/auth/owner/set-password")}
              >
                ไปตั้งรหัสผ่าน
              </button>
            ) : (
              <button
                type="button"
                className="btn-auth w-full"
                onClick={() => navigate("/auth/owner/register")}
              >
                เริ่มสมัครใหม่
              </button>
            )}

            <button
              type="button"
              className="w-full py-3 rounded-2xl border border-white/20 text-white/80 hover:bg-white/10 transition"
              onClick={() => navigate("/auth/owner/login")}
            >
              กลับไปหน้าเข้าสู่ระบบ
            </button>
          </div>

          <p className="mt-6 text-[11px] text-white/40">
            (ถ้ากดลิงก์แล้วไม่ขึ้น status=ok ให้เช็คว่า backend redirect กลับ APP_URL ถูกไหม)
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerVerifyEmailPage;
