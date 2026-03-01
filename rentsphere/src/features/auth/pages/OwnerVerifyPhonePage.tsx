import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";
import { api } from "@/shared/api/http";
import { useOwnerRegisterStore } from "@/features/auth/ownerRegister.store";

type VerifyOtpRes = { ok: true };

const OwnerVerifyPhonePage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const storeRequestId = useOwnerRegisterStore((s) => s.requestId);
  const phone = useOwnerRegisterStore((s) => s.phone);
  const setRequestId = useOwnerRegisterStore((s) => s.setRequestId);

  const requestIdFromUrl = params.get("requestId");
  const requestId = storeRequestId || requestIdFromUrl || "";

  React.useEffect(() => {
    
    if (!storeRequestId && requestIdFromUrl) setRequestId(requestIdFromUrl);
  }, [storeRequestId, requestIdFromUrl, setRequestId]);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isComplete = useMemo(() => otp.every((d) => d.length === 1), [otp]);

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
    setError(null);

    if (!requestId) {
      setError("ไม่พบ requestId กรุณาเริ่มสมัครใหม่");
      return;
    }
    if (!isComplete) return;

    try {
      setLoading(true);
      await api<VerifyOtpRes>("/auth/verify/phone", {
        method: "POST",
        body: JSON.stringify({
          requestId,
          otp: otp.join(""),
        }),
      });

     
      navigate("/auth/owner/register-success",{replace:true });
    } catch (e: any) {
      setError(e?.message || "OTP ไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    if (!requestId) return setError("ไม่พบ requestId กรุณาเริ่มสมัครใหม่");
    try {
      setLoading(true);
      await api<{ ok: true }>("/auth/verify/resend", {
        method: "POST",
        body: JSON.stringify({ requestId }),
      });
    } catch (e: any) {
      setError(e?.message || "ส่ง OTP ใหม่ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
      <CondoBackground />
      <Meteors />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        <img src={rentsphereLogo} alt="RentSphere" className="w-28 md:w-32 lg:w-36 -mt-2 mb-3 drop-shadow-xl" />
        <h1 className="text-2xl font-bold text-blue-900 tracking-widest mb-12">RENTSPHERE</h1>

        <div className="w-full flex flex-col items-center">
          <h3 className="text-2xl font-bold text-white mb-6">กรอกรหัส OTP</h3>

          <p className="text-center text-sm text-white/60 mb-10 leading-relaxed">
            กรุณากรอกรหัสยืนยัน 6 หลักที่ส่งไปยัง
            <br />
            <span className="font-semibold text-white/80">{phone || "—"}</span>
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

          {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

          <button
            type="button"
            disabled={!isComplete || loading}
            onClick={handleSubmit}
            className={`w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg ${
              !isComplete || loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleResend}
            className={`mt-3 text-sm text-white/70 underline underline-offset-4 ${loading ? "opacity-50" : ""}`}
          >
            ส่ง OTP ใหม่
          </button>

          <div className="mt-8 text-center">
            <p className="text-xs text-white/60">
              กลับไปหน้าเลือกวิธี?{" "}
              <button
                type="button"
                className="font-bold text-white underline"
                onClick={() => navigate(`/auth/owner/verify-method?requestId=${encodeURIComponent(requestId || "")}`)}
              >
                กลับไปเลือก
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerVerifyPhonePage;
