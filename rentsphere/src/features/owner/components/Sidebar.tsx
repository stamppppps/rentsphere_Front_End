import RentSphereLogo from "@/assets/brand/rentsphere-logo.png";
import { useLocation, useNavigate } from "react-router-dom";

type MenuItem = {
    key: string;
    label: string;
    path: string;
};

type SidebarProps = {
    title?: string;
    menu?: MenuItem[];
    activeKey?: string;
};

const DEFAULT_MENU: MenuItem[] = [
  { key: "dashboard", label: "แดชบอร์ด", path: "/owner/dashboard" },
  { key: "rooms", label: "ห้อง", path: "/owner/rooms" },
  { key: "maintenance", label: "แจ้งซ่อม", path: "/owner/admin-repairs" },
  { key: "parcel", label: "แจ้งพัสดุ", path: "/owner/admin/parcel" },
  { key: "common-area-booking", label: "จองส่วนกลาง", path: "/owner/common-area-booking" },
  { key: "meter", label: "จดมิเตอร์", path: "/owner/meter" },
  { key: "billing", label: "ออกบิล", path: "/owner/billing" },
  { key: "payments", label: "แจ้งชำระเงิน", path: "/owner/payments" },
  { key: "reports", label: "รายงาน", path: "/owner/reports" },
  { key: "settings", label: "การตั้งค่า", path: "/owner/settings" },
];

function SidebarItem({
    label,
    active,
    onClick,
}: {
    label: string;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "w-full text-left rounded-2xl",
                "px-7 py-5",
                "text-[18px] font-extrabold tracking-[0.2px]",
                "transition-all duration-200",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/40",
                active
                    ? "bg-white text-gray-900 shadow-md translate-x-0.5"
                    : "text-gray-800/80 hover:bg-white/60 hover:text-gray-900 hover:translate-x-0.5",
            ].join(" ")}
        >
            {label}
        </button>
    );
}

export default function Sidebar({
    title = "คอนโดมิเนียม",
    menu,
    activeKey,
}: SidebarProps) {
    const nav = useNavigate();
    const { pathname } = useLocation();
    const items = menu ?? DEFAULT_MENU;

    const isActivePath = (itemPath: string) =>
        pathname === itemPath || pathname.startsWith(itemPath + "/");

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* ===== Logo + Brand (fixed) ===== */}
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
                    {title}
                </div>
            </div>

            {/* ===== Menu (scroll) ===== */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 pr-2">
                <div className="rounded-3xl border-2 border-dashed border-blue-300/70 bg-white/35 backdrop-blur-sm p-5">
                    <div className="flex flex-col gap-4">
                        {items.map((m) => (
                            <SidebarItem
                                key={m.key}
                                label={m.label}
                                active={activeKey ? m.key === activeKey : isActivePath(m.path)}
                                onClick={() => nav(m.path)}
                            />
                        ))}
                    </div>
                </div>

                <div className="h-10" />
            </div>
        </div>
    );
}