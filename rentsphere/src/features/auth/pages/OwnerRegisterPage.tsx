import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";
import { api } from "@/shared/api/http";
import { useAuthStore } from "@/features/auth/auth.store";

type RegisterResponse = {
  user: { id: string; email: string; name?: string | null; role: "OWNER" };
  token: string;
};

const OwnerRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("กรุณากรอกชื่อ-นามสกุล");
    if (!email.trim()) return setError("กรุณากรอกอีเมล");
    if (!password) return setError("กรุณากรอกรหัสผ่าน");
    if (password !== confirm) return setError("รหัสผ่านไม่ตรงกัน");

    try {
      setLoading(true);

      // ✅ เจ้าของสมัคร = ไม่ต้องมี invite code
            api("/auth/register/start", {
        method: "POST",
        body: JSON.stringify({
            name,
            email,
            phone,
            role: "OWNER",
        }),
        });

      
      setAuth(data.token, data.user);
      navigate("/owner", { replace: true });
    } catch (e: any) {
      setError(e.message || "สมัครสมาชิกไม่สำเร็จ");
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
            <img
              src={rentsphereLogo}
              alt="RentSphere"
              className="w-28 md:w-32 lg:w-36 -mt-2 mb-3 drop-shadow-xl"
            />
            <h1 className="text-2xl md:text-3xl font-semibold tracking-[0.22em] text-white/90 -mt-7">
              RENTSPHERE
            </h1>
            <p className="mt-2 text-sm text-white/60">
              สมัครสมาชิกเพื่อเข้าใช้งานระบบ (OWNER)
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

            {/* ✅ ไม่มี invite code ใน owner */}
            <input
              type="password"
              placeholder="รหัสผ่าน"
              className="input-auth w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="ยืนยันรหัสผ่าน"
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
              {loading ? "กำลังสมัคร..." : "ลงทะเบียน (OWNER)"}
            </button>

            <p className="text-center text-sm text-white/60 mt-4">
              เป็นสมาชิกอยู่แล้วใช่ไหม?{" "}
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
