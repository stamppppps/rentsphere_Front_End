import { useNavigate } from "react-router-dom";

type SidebarProps = {
    activeKey?: string;
};

const MENU = [
    { key: "dashboard", label: "แดชบอร์ด", to: "/owner/dashboard" },
    { key: "rooms", label: "ห้อง", to: "/owner/rooms" },
    { key: "maintenance", label: "แจ้งซ่อม", to: "/owner/maintenance" },
    { key: "parcel", label: "แจ้งพัสดุ", to: "/owner/parcel" },
    { key: "common-area-booking", label: "จองส่วนกลาง", to: "/owner/common-area-booking" },
    { key: "meter", label: "จดมิเตอร์", to: "/owner/meter" },
    { key: "billing", label: "ออกบิล", to: "/owner/billing" },
    { key: "payments", label: "แจ้งชำระเงิน", to: "/owner/payments" },
    { key: "reports", label: "รายงาน", to: "/owner/reports" },
    { key: "settings", label: "การตั้งค่า", to: "/owner/settings" },
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
                "px-6 py-4",
                "text-base font-extrabold",
                "transition-all duration-200",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/40",
                isActive
                    ? "bg-white text-gray-900 shadow-md translate-x-0.5"
                    : "text-gray-700 hover:bg-white/60 hover:text-gray-900 hover:translate-x-0.5",
            ].join(" ")}
        >
            {label}
        </button>
    );
}

export default function Sidebar({ activeKey }: SidebarProps) {
    const nav = useNavigate();

    return (
        <div className="h-full w-full">
            {/* Logo Area */}
            <div className="h-24 flex items-center px-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-600/20">
                        RS
                    </div>
                    <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                        RentSphere
                    </span>
                </div>
            </div>

            <div className="px-6 pb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-5 pl-1">
                    คอนโดมิเนียม
                </h1>

                <div className="rounded-3xl border-2 border-dashed border-blue-300/70 bg-white/35 backdrop-blur-sm p-5">
                    <div className="flex flex-col gap-3">
                        {MENU.map((m) => (
                            <SidebarItem
                                key={m.key}
                                label={m.label}
                                isActive={m.key === activeKey}
                                onClick={() => nav(m.to)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
