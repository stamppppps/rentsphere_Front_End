// src/features/auth/pages/OwnerVerifyEmailPage.tsx
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/shared/api/http";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

type VerifyResponse = { ok: boolean; userId?: string };

export default function OwnerVerifyEmailPage() {
  const q = useQuery();
  const navigate = useNavigate();

  const email = q.get("email") || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onVerify() {
    setError(null);
    if (!email) return setError("ไม่พบอีเมลในลิงก์");
    if (otp.length !== 6) return setError("กรอกรหัส OTP 6 หลัก");

    try {
      setLoading(true);

      const password = sessionStorage.getItem("pending_password") || undefined;

      await api<VerifyResponse>("auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email, otp, password }),
      });

      sessionStorage.removeItem("pending_password");

      // ✅ ไปหน้า login
      navigate("/auth/owner/login", { replace: true });
    } catch (e: any) {
      setError(e?.message || "OTP ไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setError(null);
    try {
      setLoading(true);
      await api("auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    } catch (e: any) {
      setError(e?.message || "ส่ง OTP ใหม่ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="text-lg font-semibold">กรอกรหัส OTP</div>
          <div className="text-sm opacity-70">{email}</div>
        </div>

        <input
          className="input input-bordered w-full text-center tracking-[0.5em]"
          placeholder="______"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <button className="btn btn-primary w-full" onClick={onVerify} disabled={loading}>
          {loading ? "กำลังยืนยัน..." : "ยืนยัน OTP"}
        </button>

        <button className="btn btn-ghost w-full" onClick={onResend} disabled={loading || !email}>
          ส่ง OTP ใหม่
        </button>
      </div>
    </div>
  );
}
