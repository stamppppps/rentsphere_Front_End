import React from "react";

export default function OwnerMenu({
  ownerName,
  condoName,
}: {
  ownerName?: string | null;
  condoName?: string | null;
}) {
  return (
    <div className="w-full flex items-center justify-between">
      {/* ซ้าย: โลโก้/ชื่อระบบ (ของเดิมคุณ) */}
      <div className="flex items-center gap-3">
        <div className="text-lg font-extrabold text-slate-900">RentSphere</div>
      </div>

      {/* กลาง: ชื่อคอนโดจริง */}
      <div className="text-sm font-extrabold text-slate-700">
        {condoName ? condoName : "คอนโดมิเนียม"}
      </div>

      {/* ขวา: ชื่อเจ้าของจริง */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-white/70 border border-blue-200 flex items-center justify-center font-extrabold text-slate-700">
          {(ownerName?.trim()?.[0] ?? "O").toUpperCase()}
        </div>
        <div className="text-sm font-extrabold text-slate-800">
          {ownerName ? ownerName : "—"}
        </div>
      </div>
    </div>
  );
}