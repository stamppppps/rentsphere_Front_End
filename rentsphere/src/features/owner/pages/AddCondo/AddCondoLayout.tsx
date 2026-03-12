import RentSphereLogo from "@/assets/brand/rentsphere-logo.png";
import { useState } from "react";
import { Outlet, matchPath, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";

const MENU = [
    { label: "ค่าบริการ", path: "step-1" },
    { label: "การคิดค่าน้ำ / ค่าไฟ", path: "step-2" },
    { label: "บัญชีธนาคาร", path: "step-3" },
    { label: "จัดการชั้น", path: "step-4" },
    { label: "ผังห้อง", path: "step-5" },
    { label: "ค่าห้อง", path: "step-6" },
    { label: "สถานะห้อง", path: "step-7" },
    { label: "ค่าบริการรายห้อง", path: "step-8" },
];

function SidebarItem({
    label,
    isActive,
    onClick,
}: {
    label: string;
    isActive?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "w-full text-left rounded-2xl",
                "px-7 py-5",
                "text-[18px] font-extrabold text-black/80",
                "tracking-[0.2px]",
                "transition-all duration-200",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/40",
                isActive
                    ? "bg-white shadow-md translate-x-0.5"
                    : "text-gray-700 hover:bg-white/60 hover:text-gray-900 hover:translate-x-0.5",
            ].join(" ")}
        >
            {label}
        </button>
    );
}

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    const a = parts[0]?.[0] ?? "U";
    const b = parts.length >= 2 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return (a + b).toUpperCase();
}

export default function AddCondoLayout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const [showMenu, setShowMenu] = useState(false);

    const isActive = (stepPath: string) =>
        !!matchPath({ path: `/owner/add-condo/${stepPath}` }, pathname);

    const isStep0 = !!matchPath({ path: "/owner/add-condo/step-0" }, pathname);
    const isStep9 = !!matchPath({ path: "/owner/add-condo/step-9" }, pathname);

    if (isStep0) {
        return (
            <div className="owner-ui min-h-screen w-full bg-[#EEF4FF] font-sans text-black/85">
                <Outlet />
            </div>
        );
    }

    if (isStep9) {
        return (
            <div className="owner-ui min-h-screen w-full bg-[#EEF4FF] font-sans text-black/85 flex items-center justify-center p-6">
                <div className="w-full">
                    <Outlet />
                </div>
            </div>
        );
    }

    const ownerName = user?.name?.trim() || user?.email || "Owner";
    const initials = getInitials(ownerName);

    const handleLogout = () => {
        logout();
        localStorage.removeItem("rentsphere_auth");
        navigate("/login", { replace: true });
    };

    return (
        <div className="owner-ui flex h-screen w-full overflow-hidden bg-[#EEF4FF] font-sans text-black/85">
            <aside className="w-[22rem] shrink-0 bg-[#D6E6FF] border-r border-blue-100/80 shadow-[2px_0_14px_rgba(0,0,0,0.05)] flex flex-col h-screen overflow-hidden">
                <div className="shrink-0 px-8 pt-7 pb-5">
                    <button
                        type="button"
                        onClick={() => navigate("/owner/condo")}
                        className="flex items-start gap-4 cursor-pointer hover:opacity-80 transition"
                    >
                        <div className="h-24 w-24 shrink-0 overflow-hidden -mt-2">
                            <img
                                src={RentSphereLogo}
                                alt="RentSphere"
                                draggable={false}
                                className="h-full w-full object-contain drop-shadow-[0_14px_24px_rgba(15,23,42,0.22)] scale-[1.18] -translate-y-[12px]"
                            />
                        </div>

                        <span className="text-3xl font-extrabold tracking-tight text-gray-900 leading-none pt-[6px]">
                            RentSphere
                        </span>
                    </button>

                    <div className="text-3xl font-extrabold tracking-tight text-gray-900 text-center">
                        คอนโดมิเนียม
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pt-4 pb-8">
                    <div className="rounded-3xl border-2 border-dashed border-blue-300/70 bg-white/35 backdrop-blur-sm p-5">
                        <div className="flex flex-col gap-4">
                            {MENU.map((m) => (
                                <SidebarItem
                                    key={m.path}
                                    label={m.label}
                                    isActive={isActive(m.path)}
                                    onClick={() => navigate(`/owner/add-condo/${m.path}`)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="h-10" />
                </div>
            </aside>

            <main className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
                <header className="h-20 shrink-0 bg-[#D6E6FF] border-b border-blue-100/80 flex items-center justify-end px-10 shadow-sm">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowMenu((v) => !v)}
                            className="flex items-center gap-4 px-3 py-2 rounded-2xl hover:bg-white/50 transition cursor-pointer"
                        >
                            <div className="w-11 h-11 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-lg shadow-sm">
                                {initials}
                            </div>
                            <div className="text-gray-900 font-extrabold text-[16px] tracking-[0.2px]">
                                {ownerName}
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-white rounded-2xl border border-blue-100/80 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-5 py-4 border-b border-gray-100">
                                        <div className="text-[13px] font-black text-slate-900 truncate">{ownerName}</div>
                                        {user?.email && <div className="text-[11px] font-bold text-slate-500 truncate mt-0.5">{user.email}</div>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full text-left px-5 py-3.5 text-[14px] font-black text-rose-600 hover:bg-rose-50 transition flex items-center gap-3"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        ออกจากระบบ
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 pb-28">
                    <div className="mx-auto w-full max-w-6xl">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}

