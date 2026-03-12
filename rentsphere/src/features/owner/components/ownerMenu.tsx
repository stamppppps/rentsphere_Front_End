import { useAuthStore } from "@/features/auth/auth.store";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OwnerMenu({
  condoName,
}: {
  ownerName?: string | null;
  condoName?: string | null;
}) {
  const nav = useNavigate();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name || user?.email || "Owner";
  const initial = (displayName.trim()[0] ?? "O").toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    nav("/auth/owner/login");
  };

  return (
    <div className="w-full flex items-center gap-4">
      <div className="w-[220px] shrink-0" />

      <div className="min-w-0 flex-1 text-sm font-extrabold text-slate-700 text-center truncate px-2">
        {condoName ?? ""}
      </div>

      {/* User profile + dropdown */}
      <div className="w-[220px] shrink-0 flex items-center justify-end" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/50 transition-colors"
        >
          <div className="h-9 w-9 rounded-full bg-white/70 border border-blue-200 flex items-center justify-center font-extrabold text-slate-700">
            {initial}
          </div>
          <div className="text-sm font-extrabold text-slate-800 truncate max-w-[130px]">
            {displayName}
          </div>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-[4.2rem] right-6 z-50 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-bold text-gray-900 truncate">
                {displayName}
              </div>
              <div className="text-xs text-gray-400 font-semibold truncate">
                {user?.email ?? "-"}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
