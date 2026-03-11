import RentSphereLogo from "@/assets/brand/rentsphere-logo.png";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type SubMenuItem = {
    key: string;
    label: string;
    path: string;
};

type MenuItem = {
    key: string;
    label: string;
    path?: string;
    children?: SubMenuItem[];
};

type SidebarProps = {
    title?: string;
    menu?: MenuItem[];
    activeKey?: string;
    condoId?: string;
};

const SETTINGS_CONDO_ID_KEY = "owner_settings_condo_id";
const SIDEBAR_SCROLL_KEY = "owner_sidebar_scroll_top";

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
        children: [
            { key: "setting-step-0", label: "ตั้งค่าคอนโด", path: "/owner/settings/step-0" },
            { key: "setting-step-1", label: "ค่าบริการ", path: "/owner/settings/step-1" },
            { key: "setting-step-2", label: "ค่าน้ำ/ค่าไฟ", path: "/owner/settings/step-2" },
            { key: "setting-step-3", label: "บัญชีธนาคาร", path: "/owner/settings/step-3" },
            { key: "setting-step-4", label: "จัดการชั้น", path: "/owner/settings/step-4" },
            { key: "setting-step-5", label: "ผังห้อง", path: "/owner/settings/step-5" },
            { key: "setting-step-6", label: "ค่าห้อง", path: "/owner/settings/step-6" },
            { key: "setting-step-7", label: "สถานะห้อง", path: "/owner/settings/step-7" },
            { key: "setting-step-8", label: "ค่าบริการรายห้อง", path: "/owner/settings/step-8" },
        ],
    },
];

function SidebarItem({
    label,
    active,
    onClick,
    rightIcon,
}: {
    label: string;
    active?: boolean;
    onClick: () => void;
    rightIcon?: React.ReactNode;
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
                "flex items-center justify-between gap-3",
                active
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-800/80 hover:bg-white/60 hover:text-gray-900",
            ].join(" ")}
        >
            <span>{label}</span>
            {rightIcon}
        </button>
    );
}

function SidebarSubItem({
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
                "w-full text-left rounded-xl",
                "px-5 py-3 ml-3",
                "text-[15px] font-bold",
                active
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-700/80 hover:bg-white/60 hover:text-gray-900",
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
    condoId,
}: SidebarProps) {
    const nav = useNavigate();
    const location = useLocation();
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const { pathname, search } = location;
    const items = menu ?? DEFAULT_MENU;

    const params = useMemo(() => new URLSearchParams(search), [search]);

    const condoIdFromQuery = params.get("condoId")?.trim() || "";
    const condoIdFromStorage =
        sessionStorage.getItem(SETTINGS_CONDO_ID_KEY)?.trim() || "";

    const effectiveCondoId =
        condoId?.trim() || condoIdFromQuery || condoIdFromStorage || "";

    useEffect(() => {
        if (effectiveCondoId) {
            sessionStorage.setItem(SETTINGS_CONDO_ID_KEY, effectiveCondoId);
        }
    }, [effectiveCondoId]);

    const buildMenuPath = (basePath: string) => {
        const nextParams = new URLSearchParams();

        if (effectiveCondoId) {
            nextParams.set("condoId", effectiveCondoId);
        }

        const qs = nextParams.toString();
        return qs ? `${basePath}?${qs}` : basePath;
    };

    const buildStepPath = (basePath: string) => {
        const nextParams = new URLSearchParams();

        if (effectiveCondoId) {
            nextParams.set("condoId", effectiveCondoId);
        }

        nextParams.set("mode", "edit");

        return `${basePath}?${nextParams.toString()}`;
    };

    const isActivePath = (path?: string) =>
        path ? pathname === path || pathname.startsWith(path + "/") : false;

    const isChildActive = (children?: SubMenuItem[]) => {
        if (!children?.length) return false;

        return children.some((child) => {
            if (activeKey) return child.key === activeKey;
            return isActivePath(child.path);
        });
    };

    const initialOpenKeys = useMemo(() => {
        const set = new Set<string>();

        items.forEach((item) => {
            if (!item.children?.length) return;

            const shouldOpenByActiveKey =
                !!activeKey && item.children.some((child) => child.key === activeKey);

            const shouldOpenByPath =
                item.children.some((child) => isActivePath(child.path));

            if (shouldOpenByActiveKey || shouldOpenByPath) {
                set.add(item.key);
            }
        });

        return set;
    }, [items, pathname, activeKey]);

    const [openKeys, setOpenKeys] = useState<Set<string>>(initialOpenKeys);

    useEffect(() => {
        setOpenKeys((prev) => {
            const next = new Set(prev);
            initialOpenKeys.forEach((key) => next.add(key));
            return next;
        });
    }, [initialOpenKeys]);

    useEffect(() => {
        const saved = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
        if (!saved || !scrollRef.current) return;

        scrollRef.current.scrollTop = Number(saved);
    }, [pathname, openKeys]);

    const toggleGroup = (key: string) => {
        setOpenKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="shrink-0 px-8 pt-7 pb-5">
                <button
                    type="button"
                    onClick={() => nav("/owner/condo")}
                    className="flex items-start gap-4"
                >
                    <div className="h-24 w-24 shrink-0 overflow-hidden -mt-2">
                        <img
                            src={RentSphereLogo}
                            alt="RentSphere"
                            draggable={false}
                            className="h-full w-full object-contain"
                        />
                    </div>

                    <span className="text-3xl font-extrabold text-gray-900 pt-[6px]">
                        RentSphere
                    </span>
                </button>

                <div className="mt-2 text-3xl font-extrabold text-gray-900 text-center">
                    {title}
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 pb-8"
                onScroll={(e) => {
                    sessionStorage.setItem(
                        SIDEBAR_SCROLL_KEY,
                        String(e.currentTarget.scrollTop)
                    );
                }}
            >
                <div className="rounded-3xl border-2 border-dashed border-blue-300/70 bg-white/35 p-5">
                    <div className="flex flex-col gap-4">
                        {items.map((m) => {
                            const hasChildren = !!m.children?.length;
                            const groupOpen = openKeys.has(m.key);

                            const parentActive = activeKey
                                ? m.key === activeKey ||
                                !!m.children?.some((child) => child.key === activeKey)
                                : hasChildren
                                    ? isChildActive(m.children)
                                    : isActivePath(m.path);

                            return (
                                <div key={m.key} className="flex flex-col gap-2">
                                    <SidebarItem
                                        label={m.label}
                                        active={parentActive}
                                        onClick={() => {
                                            if (hasChildren) {
                                                toggleGroup(m.key);
                                                return;
                                            }

                                            if (m.path) nav(buildMenuPath(m.path));
                                        }}
                                        rightIcon={
                                            hasChildren ? (
                                                groupOpen ? (
                                                    <ChevronDown size={18} />
                                                ) : (
                                                    <ChevronRight size={18} />
                                                )
                                            ) : null
                                        }
                                    />

                                    {hasChildren && groupOpen && (
                                        <div className="flex flex-col gap-2">
                                            {m.children!.map((child) => {
                                                const childActive = activeKey
                                                    ? child.key === activeKey
                                                    : isActivePath(child.path);

                                                return (
                                                    <SidebarSubItem
                                                        key={child.key}
                                                        label={child.label}
                                                        active={childActive}
                                                        onClick={() => nav(buildStepPath(child.path))}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="h-10" />
            </div>
        </div>
    );
}