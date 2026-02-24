import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";

function getAuthBaseFromPath(pathname: string) {
  const m = pathname.match(/^\/auth\/(owner|tenant)(?:\/|$)/);
  return m ? `/auth/${m[1]}` : "/auth/owner";
}

const RegisterSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const base = getAuthBaseFromPath(location.pathname);
  const params = new URLSearchParams(location.search);

  const email = params.get("email") || "";
  const phone = params.get("phone") || "";

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
        <h1 className="text-2xl font-bold text-blue-900 tracking-widest mb-8">
          RENTSPHERE
        </h1>

        <div className="w-full bg-white p-10 rounded-[3rem] shadow-xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <span className="text-3xl">✅</span>
            </div>

            <h2 className="text-2xl font-semibold text-slate-800">
              ลงทะเบียนสำเร็จ
            </h2>
            <p className="mt-2 text-slate-600">
              บัญชีของคุณพร้อมใช้งานแล้ว
            </p>

            {(email || phone) && (
              <div className="mt-6 w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 text-left">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                  ข้อมูลบัญชี
                </p>
                {email && (
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">อีเมล:</span> {email}
                  </p>
                )}
                {phone && (
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">เบอร์โทร:</span> {phone}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate(`${base}/login`, { replace: true })}
              className="mt-8 w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg"
            >
              ไปหน้าเข้าสู่ระบบ
            </button>

            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="mt-4 text-sm text-slate-500 underline underline-offset-4"
            >
              กลับหน้าแรก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccessPage;
