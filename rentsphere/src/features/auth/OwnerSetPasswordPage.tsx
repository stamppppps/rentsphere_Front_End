import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";
import { api } from "@/shared/api/http";
import { useAuthStore } from "@/features/auth/auth.store";
import { useOwnerRegisterStore } from "@/features/auth/ownerRegister.store";

type CompleteRes = {
  user: { id: string; email: string; name?: string | null; role: "OWNER" | "TENANT" | "ADMIN" };
  token: string;
};

const OwnerSetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const requestId = useOwnerRegisterStore((s) => s.requestId);
  const clearFlow = useOwnerRegisterStore((s) => s.clear);

  const setAuth = useAuthStore((s) => s.setAuth);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!requestId) return setError("ไม่พบ requestId กรุณาเริ่มสมัครใหม่");
    if (!password) return setError("กรุณากรอกรหัสผ่าน");
    if (password.length < 8) return setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัว");
    if (password !== confirm) return setError("รหัสผ่านไม่ตรงกัน");

    try {
      setLoading(true);

      const data = await api<CompleteRes>("/auth/register/complete", {
        method: "POST",
        body: JSON.stringify({ requestId, password }),
      });

      setAuth(data.token, data.user);
      clearFlow();

      // ไป owner dashboard
      navigate("/owner", { replace: true });
    } catch (e: any) {
      setError(e?.message || "สร้างบัญชีไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
      <CondoBackground />
      <Meteors />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl px-10 py-10 text-center">
          <img src={rentsphereLogo} alt="RentSphere" className="w-24 mx-auto mb-4 drop-shadow-xl" />
          <h1 className="text-xl md:text-2xl font-semibold text-white/90">ตั้งรหัสผ่าน</h1>
          <p className="mt-3 text-sm text-white/70">
            ขั้นตอนสุดท้าย: ตั้งรหัสผ่านเพื่อสร้างบัญชี OWNER และเข้าสู่ระบบ
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4 text-left">
            <input
              type="password"
              placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)"
              className="input-auth w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="ยืนยันรหัสผ่านใหม่"
              className="input-auth w-full"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />

            {error && <p className="text-red-300 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`btn-auth w-full mt-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชีและเข้าสู่ระบบ"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/auth/owner/register")}
              className="w-full py-3 rounded-2xl border border-white/20 text-white/80 hover:bg-white/10 transition"
            >
              ย้อนกลับไปสมัครใหม่
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OwnerSetPasswordPage;
