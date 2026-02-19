import React from "react";
import { Outlet } from "react-router-dom";
import BottomNavigation from "../../features/tenant/pages/home/components/BottomNavigation";

const TenantLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-gray-100">
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default TenantLayout;
