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
        "px-7 py-5",                 // ✅ สูง/กว้างขึ้น -> ไม่โล่ง
        "text-xl font-bold",         // ✅ ตัวอักษรใหญ่ + ชัด
        "tracking-wide",             // ✅ อ่านชัดขึ้น
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

export default function AddCondoLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (stepPath: string) =>
    !!matchPath({ path: `/owner/add-condo/${stepPath}` }, pathname);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#EEF4FF] font-sans">
      {/* Sidebar */}
      <aside
        className={[
          "w-[22rem]", // ✅ กว้างขึ้นนิดจาก w-80 (20rem) -> 22rem
          "shrink-0 bg-[#D6E6FF]",
          "border-r border-blue-100/80",
          "shadow-[2px_0_14px_rgba(0,0,0,0.05)]",
        ].join(" ")}
      >
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

          {/* Dashed Border Container */}
          <div className="rounded-3xl border-2 border-dashed border-blue-300/70 bg-white/35 backdrop-blur-sm p-5">
            <div className="flex flex-col gap-4">
              {MENU.map((m) => {
                const active = isActive(m.path);
                return (
                  <SidebarItem
                    key={m.path}
                    label={m.label}
                    isActive={active}
                    onClick={() => navigate(m.path, { relative: "path" })}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </aside>

{/* Main */}
<main className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
  {/* Top Header Bar */}
  <header className="h-20 shrink-0 bg-[#D6E6FF] border-b border-blue-100/80 flex items-center justify-end px-10 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-lg shadow-sm">
        K
      </div>
      <div className="text-gray-900 font-semibold text-lg">
        Mr. Kittidet Suksarn
      </div>
    </div>
  </header>

  {/* Page Content */}
  <div className="flex-1 overflow-y-auto p-8 pb-28">
    {/* ✅ pb-28 เผื่อพื้นที่ให้ bottom bar ไม่ทับ */}
    <div className="mx-auto w-full max-w-6xl">
      <Outlet />
    </div>
  </div>

  {/* ✅ Bottom Bar (เรียบเสมอ) */}
  <div className="sticky bottom-0 w-full bg-[#EEF4FF]/90 backdrop-blur border-t border-blue-100/70">
    <div className="mx-auto w-full max-w-6xl px-8 py-5 flex items-center justify-end gap-4">
      {/* ตรงนี้ Step6 จะ render ปุ่มของมันเองทีหลัง (ดูข้อ 2) */}
      <div id="bottom-bar-slot" />
    </div>
  </div>
</main>

    </div>
  );
}
