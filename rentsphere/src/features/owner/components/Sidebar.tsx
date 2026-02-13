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
        "text-xl font-extrabold tracking-wide",
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
    <aside className="w-[22rem] shrink-0 bg-[#D6E6FF] border-r border-blue-100/80 shadow-[2px_0_14px_rgba(0,0,0,0.05)]">
      {/* Logo */}
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
          {title}
        </h1>

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
      </div>
    </aside>
  );
}
