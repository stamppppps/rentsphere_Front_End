import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors, SaaSBackground } from "@/features/auth/components/AuthBackground";
import { api } from "@/shared/api/http";
import { useAuthStore } from "@/features/auth/auth.store";

type LoginResponse = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: "TENANT" | "OWNER" | "ADMIN";
  };
  token: string;
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
 

  const setAuth = useAuthStore((s) => s.setAuth);

  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputSaaS =
    "w-full px-5 py-4 rounded-2xl bg-white/90 border border-indigo-100 shadow-sm " +
    "text-slate-800 placeholder:text-slate-400 " +
    "focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 " +
    "outline-none transition-all";

  const cardSaaS =
    "w-full max-w-xl rounded-3xl bg-white/65 backdrop-blur-xl border border-white/60 " +
    "shadow-[0_24px_60px_rgba(15,23,42,0.18)] p-10";

  async function handleLogin(){
    try {
      setLoading(true);
      setError(null);

      
      const payload = {
        email: identifier.trim(),
        password,
      };

      const data = await api<LoginResponse>("/auth/login",{
        method: "POST",
        body: JSON.stringify(payload),
      });

      setAuth(data.token, data.user);

      
      if (data.user.role === "OWNER") navigate("/owner/condo");
      else if (data.user.role === "TENANT") navigate("/tenant");
      else navigate("/admin");
    } catch (e: any) {
      setError(e.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent){
    e.preventDefault();
    if (!identifier.trim()){
      setError("กรุณากรอกอีเมล");
      return;
    }
    if (!password) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }
    handleLogin();
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
     
      <div className="hidden md:flex w-7/12 cosmic-gradient flex-col items-center justify-center relative overflow-hidden">
        <CondoBackground />
        <Meteors />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <img
            src={rentsphereLogo}
            alt="RentSphere"
            className="w-56 md:w-64 lg:w-72 mb-7 drop-shadow-xl"
          />
          <h1 className="text-6xl font-bold text-white tracking-[0.3em] mt-[-84px]">
            RENTSPHERE
          </h1>
          <p className="mt-5 text-white/70 tracking-wide text-sm">
            Modern Rentsphere Management Platform
          </p>
        </div>
      </div>

     
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
        <SaaSBackground />

        <div className={`relative z-10 ${cardSaaS}`}>
          <h2 className="text-5xl font-bold text-slate-900 mb-2">ลงชื่อเข้าใช้</h2>

          <p className="text-xs text-slate-600 mb-8 leading-relaxed">
            ยินดีต้อนรับสู่ <span className="text-indigo-600 font-bold">RentSphere</span>
            <br />
            เมื่อคุณลงชื่อเข้าใช้ แสดงว่าคุณยอมรับ
            <a href="#" className="text-blue-600 underline ml-1 underline-offset-2">
              เงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว
            </a>
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="text"
              className={inputSaaS}
              placeholder="อีเมล"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="email"
            />

            <input
              type="password"
              className={inputSaaS}
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <div className="flex items-center gap-2 px-1">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                id="remember"
              />
              <label htmlFor="remember" className="text-xs text-slate-600">
                จดจำรหัสผ่าน
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex items-center justify-between text-[11px] pt-4 border-t border-slate-200">
              <div className="text-slate-600">
                สมาชิกใหม่?{" "}
               <button
                      type="button"
                      onClick={() => navigate("/auth/owner/register")}
                      className="text-blue-700 font-bold"
                    >
                      สมัครสมาชิกเพื่อเข้าใช้งานระบบ
                    </button>

              </div>

              <button
                type="button"
                onClick={() => navigate("/auth/owner/forgot")}

                className="text-blue-700"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
