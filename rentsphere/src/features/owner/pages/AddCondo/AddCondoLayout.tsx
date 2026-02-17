import RentSphereLogo from "@/assets/brand/rentsphere-logo.png";
import { Outlet, matchPath, useLocation, useNavigate } from "react-router-dom";

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

export default function AddCondoLayout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

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

    return (
        <div className="owner-ui flex h-screen w-full overflow-hidden bg-[#EEF4FF] font-sans text-black/85">
            <aside className="w-[22rem] shrink-0 bg-[#D6E6FF] border-r border-blue-100/80 shadow-[2px_0_14px_rgba(0,0,0,0.05)] flex flex-col h-screen overflow-hidden">
                <div className="shrink-0 px-8 pt-7 pb-5">
                    <div className="flex items-start gap-4">
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
                    </div>

                    <div className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">
                        คอนโดมิเนียม
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 pr-2">
                    <div className="rounded-3xl border-2 border-dashed border-blue-300/70 bg-white/35 backdrop-blur-sm p-5">
                        <div className="flex flex-col gap-4">
                            {MENU.map((m) => (
                                <SidebarItem
                                    key={m.path}
                                    label={m.label}
                                    isActive={isActive(m.path)}
                                    onClick={() => navigate(m.path, { relative: "path" })}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="h-10" />
                </div>
            </aside>

            <main className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
                <header className="h-20 shrink-0 bg-[#D6E6FF] border-b border-blue-100/80 flex items-center justify-end px-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-lg shadow-sm">
                            K
                        </div>
                        <div className="text-gray-900 font-extrabold text-[16px] tracking-[0.2px]">
                            Mr. Kittidet Suksarn
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 pb-28">
                    <div className="mx-auto w-full max-w-6xl">
                        <Outlet />
                    </div>
                </div>

                <div className="sticky bottom-0 w-full bg-[#EEF4FF]/90 backdrop-blur border-t border-blue-100/70">
                    <div className="mx-auto w-full max-w-6xl px-8 py-5 flex items-center justify-end gap-4">
                        <div id="bottom-bar-slot" />
                    </div>
                </div>
            </main>
        </div>
    );
}