import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BottomNav from "@/features/tenant/components/BottomNav";

export default function TenantLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // map route -> active tab (ปรับตาม route จริงของเธอ)
  const active =
    location.pathname.includes("/tenant/home") ? "dashboard" :
    location.pathname.includes("/tenant/services") ? "services" :
    "profile";

  const onNavigate = (screen: string) => {
    if (screen === "dashboard") navigate("/tenant/home");
    if (screen === "services") navigate("/tenant/services");
    if (screen === "profile") navigate("/tenant/profile");
  };

  return (
    <div className="min-h-screen w-full bg-[#071526] flex items-center justify-center p-6">
      {/* Phone frame */}
      <div className="w-[390px] h-[844px] bg-white rounded-[3rem] overflow-hidden relative shadow-2xl">
        {/* Content */}
        <div className="absolute inset-0">
          <Outlet />
        </div>

        {/* Bottom Nav */}
        <BottomNav active={active as any} onNavigate={onNavigate} />
      </div>
    </div>
  );
}