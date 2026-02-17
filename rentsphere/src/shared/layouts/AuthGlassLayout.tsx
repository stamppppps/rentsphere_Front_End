import React from "react";
import bgCondo from "@/assets/bg/condo.jpg";
import logo from "@/assets/brand/rentsphere-logo.png";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AuthGlassLayout({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgCondo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* dark overlay (ทำให้รูปจาง + อ่านง่าย) */}
      <div className="absolute inset-0 bg-slate-950/70" />

      {/* subtle gradient glow */}
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-cyan-500/20 blur-3xl" />

      {/* content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src={logo}
              alt="RentSphere"
              className="w-20 md:w-24 drop-shadow-xl"
            />
            <h1 className="mt-4 text-2xl font-semibold tracking-[0.35em] text-sky-200">
              RENTSPHERE
            </h1>
            <p className="mt-2 text-xs tracking-[0.25em] text-sky-200/60">
              EXCLUSIVE RESIDENTIAL ACCESS
            </p>
          </div>

          {/* Glass Card */}
          <div className="rounded-[28px] border border-white/10 bg-white/10 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.45)] px-8 py-8">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-sm text-white/60">{subtitle}</p>
            )}

            <div className="mt-6">{children}</div>

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-white/40">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400/60" />
              การเชื่อมต่อที่เข้ารหัสปลอดภัย
            </div>
          </div>

          <p className="mt-8 text-center text-[11px] tracking-[0.35em] text-white/25">
            RESERVED FOR OWNERS AND VERIFIED RESIDENTS
          </p>
        </div>
      </div>
    </div>
  );
}
