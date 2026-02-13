import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";
import { useAuthRole } from "@/features/auth/hooks/useAuthRole";

import { api } from "@/shared/api/http";
import { useAuthStore } from "@/features/auth/auth.store";
import { useRegisterFlowStore } from "@/features/auth/registerFlow.store";

type LoginResponse = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: "TENANT" | "OWNER" | "ADMIN";
  };
  token: string;
};

type VerifyOtpResponse = { ok?: boolean };

const OtpVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const { base } = useAuthRole(); // ใช้ base เดียวกับ Login/Register เพื่อกลับหน้าได้ถูก
  const setAuth = useAuthStore((s) => s.setAuth);

  const { role, name, email, phone, password, inviteCode, otpRef } =
    useRegisterFlowStore((s) => s);
  const clear = useRegisterFlowStore((s) => s.clear);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [secondsLeft, setSecondsLeft] = useState(30);

  const isComplete = otp.every((d) => d.length === 1);

  // ถ้าเข้าหน้านี้มาแล้วไม่มี otpRef แปลว่าหลุด flow → กลับไป register
  useEffect(() => {
    if (!otpRef) {
      navigate(`${base}/register`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpRef]);

  // countdown UI เฉยๆ (ไม่ได้ผูกกับ backend)
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const onChangeDigit = (i: number, value: string) => {
    const ch = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = ch;
    setOtp(next);

    if (ch && i < 5) {
      const nextInput = document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  const onKeyDownDigit = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      const prev = document.getElementById(`otp-${i - 1}`) as HTMLInputElement | null;
      prev?.focus();
    }
  };

  async function handleSubmit() {
    if (!isComplete || !otpRef) return;

    try {
      setLoading(true);
      setError(null);

      const otpCode = otp.join("");

      // 1) verify otp
      await api<VerifyOtpResponse>("/auth/register/verify-otp", {
        method: "POST",
        body: JSON.stringify({ otpRef, otp: otpCode }),
      });

      // 2) complete register -> ได้ token เหมือน login
      const payload: any = {
        otpRef,
        email: email.trim(),
        password,
        name: name.trim(),
      };

      if (role === "TENANT") payload.inviteCode = (inviteCode || "").trim();

      const data = await api<LoginResponse>("/auth/register/complete", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // 3) set auth + clear flow
      setAuth(data.token, data.user);
      clear();

      // 4) redirect by backend role
      if (data.user.role === "OWNER") navigate("/owner", { replace: true });
      else if (data.user.role === "TENANT") navigate("/tenant", { replace: true });
      else navigate("/admin", { replace: true });
    } catch (e: any) {
      setError(e.message || "ยืนยัน OTP ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!phone?.trim()) {
      setError("ไม่พบเบอร์โทรศัพท์ (กลับไปสมัครใหม่)");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ขอ OTP ใหม่ (ได้ otpRef ใหม่)
      const data = await api<{ otpRef: string; expiresAt?: string }>("/auth/register/request-otp", {
        method: "POST",
        body: JSON.stringify({
          phone: phone.trim(),
          role, // "TENANT" | "OWNER"
        }),
      });

      useRegisterFlowStore.getState().setForm({ otpRef: data.otpRef });
      setOtp(["", "", "", "", "", ""]);
      setSecondsLeft(30);
    } catch (e: any) {
      setError(e.message || "ส่ง OTP ใหม่ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

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
          <h3 className="text-2xl font-bold text-white mb-6">กรอกรหัสยืนยันตัวตน</h3>

          <p className="text-center text-sm text-white/60 mb-10 leading-relaxed">
            กรุณากรอกรหัสยืนยัน 6 หลักที่ส่งไปยัง
            <br />
            หมายเลขโทรศัพท์ {phone || "-"} เพื่อยืนยันตัวตน
          </p>

          <div className="flex justify-center gap-4 mb-6">
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
            disabled={!isComplete || loading}
            onClick={handleSubmit}
            className={`w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg ${
              !isComplete || loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "กำลังยืนยัน..." : "ยืนยัน"}
          </button>

          {error && <p className="text-red-200 text-sm mt-4">{error}</p>}

          <div className="mt-8 text-center">
            <p className="text-xs text-white/60">
              ยังไม่ได้รับรหัสใช่ไหม?{" "}
              <button
                type="button"
                className={`font-bold text-white underline ${
                  secondsLeft > 0 || loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={secondsLeft > 0 || loading}
                onClick={handleResend}
              >
                ส่งรหัสอีกครั้ง
              </button>
            </p>
            <p className="text-xs text-white/40 mt-1">
              {secondsLeft > 0
                ? `ขอรหัสใหม่ได้ใน 00:${String(secondsLeft).padStart(2, "0")} วินาที`
                : "สามารถขอ OTP ใหม่ได้แล้ว"}
            </p>

            <button
              type="button"
              className="mt-6 text-xs text-white/70 underline"
              onClick={() => navigate(`${base}/register`)}
            >
              กลับไปแก้ไขข้อมูลสมัคร
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerifyPage;
