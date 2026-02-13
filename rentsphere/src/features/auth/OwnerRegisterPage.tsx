import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";
import { api } from "@/shared/api/http";
import { useOwnerRegisterStore } from "@/features/auth/ownerRegister.store";

type StartRes = {
  requestId: string;
  otpExpiresAt?: string;
  emailTokenExpiresAt?: string;
  message?: string;
};

const OwnerRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setStart = useOwnerRegisterStore((s) => s.setStart);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // ยังไม่ส่ง password ไป start (เพื่อ “ยืนยันก่อนค่อยสร้าง user”)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("กรุณากรอกชื่อ-นามสกุล");
    if (!email.trim()) return setError("กรุณากรอกอีเมล");
    if (!phone.trim()) return setError("กรุณากรอกเบอร์โทรศัพท์");

    try {
      setLoading(true);

      const data = await api<StartRes>("/auth/register/start", {
        method: "POST",
        body: JSON.stringify({
          role: "OWNER",
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      setStart({ requestId: data.requestId, email: email.trim(), phone: phone.trim() });

      navigate("/auth/owner/otp", { replace: true });
    } catch (e: any) {
      setError(e?.message || "เริ่มสมัครสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
      <CondoBackground />
      <Meteors />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl px-10 py-10">
          <div className="flex flex-col items-center text-center">
            <img src={rentsphereLogo} alt="RentSphere" className="w-28 md:w-32 lg:w-36 -mt-2 mb-3 drop-shadow-xl" />
            <h1 className="text-2xl md:text-3xl font-semibold tracking-[0.22em] text-white/90 -mt-7">
              RENTSPHERE
            </h1>
            <p className="mt-2 text-sm text-white/60">
              สมัครสมาชิก OWNER (ยืนยัน OTP + ยืนยันอีเมลก่อน)
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <input
              type="text"
              placeholder="ชื่อ - นามสกุล"
              className="input-auth w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="อีเมล"
              className="input-auth w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              type="tel"
              placeholder="หมายเลขโทรศัพท์"
              className="input-auth w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />

            {error && <p className="text-red-300 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`btn-auth w-full mt-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "กำลังส่ง OTP..." : "ถัดไป (ยืนยัน OTP)"}
            </button>

            <p className="text-center text-sm text-white/60 mt-4">
              มีบัญชีแล้ว?{" "}
              <button
                type="button"
                onClick={() => navigate("/auth/owner/login")}
                className="text-sky-300 hover:text-sky-200 underline underline-offset-4"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OwnerRegisterPage;
