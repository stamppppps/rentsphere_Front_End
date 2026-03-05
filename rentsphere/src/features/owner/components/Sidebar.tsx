import RentSphereLogo from "@/assets/brand/rentsphere-logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type MenuItem = {
    key: string;
    label: string;
    path: string;
    subItems?: Omit<MenuItem, "subItems">[];
};

type SidebarProps = {
    title?: string;
    menu?: MenuItem[];
    activeKey?: string;
};

const DEFAULT_MENU: MenuItem[] = [
    { key: "dashboard", label: "ข้อมูลภาพรวม", path: "/owner/dashboard" },
    { key: "rooms", label: "ห้อง", path: "/owner/rooms" },
    { key: "maintenance", label: "แจ้งซ่อม", path: "/owner/maintenance" },
    { key: "parcel", label: "แจ้งพัสดุ", path: "/owner/admin/parcel" },
    { key: "common-area-booking", label: "จองส่วนกลาง", path: "/owner/common-area-booking" },
    { key: "meter", label: "จดมิเตอร์", path: "/owner/meter" },
    { key: "billing", label: "ออกบิล", path: "/owner/billing" },
    { key: "payments", label: "แจ้งชำระเงิน", path: "/owner/payments" },
    { key: "reports", label: "รายงาน", path: "/owner/reports" },
    {
        key: "settings",
        label: "การตั้งค่า",
        path: "#",
        subItems: [
            { key: "step0", label: "ตั้งค่าคอนโด", path: "/owner/add-condo/step-0" },
            { key: "step1", label: "ค่าบริการ", path: "/owner/add-condo/step-1" },
            { key: "step2", label: "การคิดค่าน้ำ/ค่าไฟ", path: "/owner/add-condo/step-2" },
            { key: "step3", label: "บัญชีธนาคาร", path: "/owner/add-condo/step-3" },
            { key: "step4", label: "จัดการชั้น", path: "/owner/add-condo/step-4" },
            { key: "step5", label: "ผังห้อง", path: "/owner/add-condo/step-5" },
            { key: "step6", label: "ค่าห้อง", path: "/owner/add-condo/step-6" },
            { key: "step7", label: "สถานะห้อง", path: "/owner/add-condo/step-7" },
            { key: "step8", label: "ค่าบริการรายห้อง", path: "/owner/add-condo/step-8" },
            { key: "add-condo", label: "เพิ่มคอนโด", path: "/owner/add-condo" },
        ],
    },
];

function SidebarItem({
    item,
    active,
    isActivePath,
    onNavigate,
}: {
    item: MenuItem;
    active?: boolean;
    isActivePath: (path: string) => boolean;
    onNavigate: (path: string) => void;
}) {
    const hasSubItems = !!item.subItems?.length;
    const isSubActive = hasSubItems && item.subItems!.some((sub) => isActivePath(sub.path));
    const [isOpen, setIsOpen] = useState(isSubActive);

    const handleClick = () => {
        if (hasSubItems) {
            setIsOpen(!isOpen);
        } else {
            onNavigate(item.path);
        }
    };

    return (
        <div className="flex flex-col w-full">
            <button
                type="button"
                onClick={handleClick}
                className={[
                    "w-full text-left rounded-2xl",
                    "px-7 py-5",
                    "flex items-center justify-between",
                    "text-[18px] font-extrabold tracking-[0.2px]",
                    "transition-all duration-200",
                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/40",
                    active || isSubActive
                        ? "bg-white text-gray-900 shadow-md translate-x-0.5"
                        : "text-gray-800/80 hover:bg-white/60 hover:text-gray-900 hover:translate-x-0.5",
                ].join(" ")}
            >
                <span>{item.label}</span>
                {hasSubItems && (
                    isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )
                )}
            </button>

            {hasSubItems && isOpen && (
                <div className="flex flex-col gap-1 pl-4 mt-2 ml-4 border-l-2 border-gray-300/50">
                    {item.subItems!.map((sub) => {
                        const subActive = isActivePath(sub.path);
                        return (
                            <button
                                key={sub.key}
                                type="button"
                                onClick={() => onNavigate(sub.path)}
                                className={[
                                    "w-full text-left rounded-xl",
                                    "px-4 py-3",
                                    "text-[16px] font-bold tracking-[0.1px]",
                                    "transition-all duration-200",
                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/40",
                                    subActive
                                        ? "bg-blue-50/80 text-blue-700 shadow-sm translate-x-1 border border-blue-200"
                                        : "text-gray-600 hover:bg-white/80 hover:text-gray-800 hover:translate-x-1",
                                ].join(" ")}
                            >
                                {sub.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
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

    const isActivePath = (itemPath: string) => {
        if (itemPath === "#") return false;
        return pathname === itemPath || pathname.startsWith(itemPath + "/");
    };

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

                <div className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 text-center">
                    {title}
                </div>
            </div>

            {/* ===== Menu (scroll) ===== */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 scrollbar-hide">
                <div className="rounded-3xl border-2 border-dashed border-blue-300/70 bg-white/35 backdrop-blur-sm p-5">
                    <div className="flex flex-col gap-4">
                        {items.map((m) => (
                            <SidebarItem
                                key={m.key}
                                item={m}
                                active={activeKey ? m.key === activeKey : isActivePath(m.path)}
                                isActivePath={isActivePath}
                                onNavigate={(path) => nav(path)}
                            />
                        ))}
                    </div>
                </div>

                <div className="h-10" />
            </div>
        </div>
    );
}