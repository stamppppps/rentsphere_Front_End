import React from "react";
import { useNavigate } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";
import { useAuthRole } from "@/features/auth/hooks/useAuthRole";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { basePath } = useAuthRole();

  return (
    <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
      <CondoBackground />
      <Meteors />

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        <img
          src={rentsphereLogo}
          alt="RentSphere"
          className="w-28 md:w-40 lg:w-44 -mt-2 mb-3 drop-shadow-xl"
        />
        <h1 className="text-2xl font-bold text-blue-900 tracking-widest -mt-1 mb-6">
          RENTSPHERE
        </h1>

        <div className="w-full bg-white p-12 rounded-[3rem] shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-8 text-center">
            โปรดตั้งรหัสผ่านใหม่
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2">
                รหัสผ่านใหม่ <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2">
                ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => navigate(`${basePath}/login`)}
                className="w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
