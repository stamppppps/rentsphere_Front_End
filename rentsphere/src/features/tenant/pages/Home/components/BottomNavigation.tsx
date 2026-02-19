import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, History, Bell, User } from "lucide-react";

const TabButton = ({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 ${
      active ? "text-blue-600" : "text-gray-400"
    }`}
  >
    <div
      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
        active ? "bg-blue-50" : "bg-transparent"
      }`}
    >
      {icon}
    </div>
    <span className="text-[11px] font-bold">{label}</span>
  </button>
);

export default function BottomNavigation() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const is = (p: string) => pathname === p;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4 pb-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-xl px-3 py-2 flex items-center">
          <TabButton
            active={is("/tenant/home")}
            label="Home"
            icon={<Home size={22} />}
            onClick={() => nav("/tenant/home")}
          />
          <TabButton
            active={is("/tenant/history")}
            label="History"
            icon={<History size={22} />}
            onClick={() => nav("/tenant/history")}
          />
          <TabButton
            active={is("/tenant/notifications")}
            label="Alerts"
            icon={<Bell size={22} />}
            onClick={() => nav("/tenant/notifications")}
          />
          <TabButton
            active={is("/tenant/profile")}
            label="Profile"
            icon={<User size={22} />}
            onClick={() => nav("/tenant/profile")}
          />
        </div>
      </div>
    </div>
  );
}
