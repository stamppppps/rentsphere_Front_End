import { useLocation, useNavigate } from "react-router-dom";

type MenuItem = {
  key: string;
  label: string;
  path: string;
};

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
        active
          ? "bg-white text-gray-900 shadow-md"
          : "text-gray-800/80 hover:bg-white/60 hover:text-gray-900",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

/* ✅ ตรงนี้คือจุดสำคัญ */
export default function Sidebar({
  title,
  menu,
}: {
  title: string;
  menu: MenuItem[];
}) {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const isActive = (itemPath: string) =>
    pathname === itemPath || pathname.startsWith(itemPath + "/");

  return (
    <aside className="w-[22rem] shrink-0 bg-[#D6E6FF] border-r">
      {/* Logo */}
      <div className="h-24 flex items-center px-8">
        <span className="text-3xl font-extrabold">RentSphere</span>
      </div>

      <div className="px-6 pb-6">
        {/* 🔥 ข้อความเปลี่ยนได้ */}
        <h1 className="text-3xl font-extrabold mb-5">
          {title}
        </h1>

        <div className="flex flex-col gap-4">
          {menu.map((m) => (
            <SidebarItem
              key={m.key}
              label={m.label}
              active={isActive(m.path)}
              onClick={() => nav(m.path)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}