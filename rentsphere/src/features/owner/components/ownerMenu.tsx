import React from "react";

export default function OwnerMenu({
  ownerName,
  condoName,
}: {
  ownerName?: string | null;
  condoName?: string | null;
}) {
  return (
    <div className="w-full flex items-center gap-4">
      <div className="w-[220px] shrink-0" />

      <div className="min-w-0 flex-1 text-sm font-extrabold text-slate-700 text-center truncate px-2">
        {condoName ?? ""}
      </div>

      <div className="w-[220px] shrink-0 flex items-center justify-end gap-3">
        <div className="h-9 w-9 rounded-full bg-white/70 border border-blue-200 flex items-center justify-center font-extrabold text-slate-700">
          {(ownerName?.trim()?.[0] ?? "O").toUpperCase()}
        </div>
        <div className="text-sm font-extrabold text-slate-800">{ownerName ? ownerName : "-"}</div>
      </div>
    </div>
  );
}
