import React from "react";
import RentSphereLogo from "@/assets/brand/rentsphere-logo.png";
import { useNavigate } from "react-router-dom";

export default function OwnerMenu({
  ownerName,
  condoName,
}: {
  ownerName?: string | null;
  condoName?: string | null;
}) {
  const nav = useNavigate();

  return (
    <div className="w-full flex items-center justify-between">
      <button
        type="button"
        onClick={() => nav("/owner/condo")}
        className="flex items-center gap-2 rounded-xl px-1 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70"
      >
        <img
          src={RentSphereLogo}
          alt="RentSphere"
          draggable={false}
          className="h-9 w-9 object-contain"
        />
        <div className="text-lg font-extrabold text-slate-900">RentSphere</div>
      </button>

      <div className="text-sm font-extrabold text-slate-700">
        {condoName ? condoName : "คอนโดมิเนียม"}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-white/70 border border-blue-200 flex items-center justify-center font-extrabold text-slate-700">
          {(ownerName?.trim()?.[0] ?? "O").toUpperCase()}
        </div>
        <div className="text-sm font-extrabold text-slate-800">{ownerName ? ownerName : "-"}</div>
      </div>
    </div>
  );
}
