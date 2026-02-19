import type { RouteObject } from "react-router-dom";
import React from "react";
import { Navigate } from "react-router-dom";

// ✅ ใช้ relative ตัดปัญหา alias @
import TenantLayout from "../../shared/layouts/TenantLayout";
import TenantHomePage from "../../features/tenant/pages/home/pages/TenantHomePage";

// ✅ Guard เดิม
function RequireLineLogin({ children }: { children: React.ReactNode }) {
  const lineUserId = localStorage.getItem("lineUserId");
  if (!lineUserId) return <Navigate to="/role" replace />;
  return <>{children}</>;
}

// ✅ placeholder กันพัง (ยังไม่ต้อง import หน้าอื่น)
const ComingSoon = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-[#f0f5ff] to-white pb-32 p-6 pt-10 text-center text-gray-500 font-medium">
    {title} (กำลังปรับปรุง)
  </div>
);

const tenantRoutes: RouteObject[] = [
  // รองรับ URL เก่า
  { path: "/tenant/app", element: <Navigate to="/tenant/home" replace /> },

  // shortcut
  { path: "/home", element: <Navigate to="/tenant/home" replace /> },

  {
    path: "/tenant",
    element: (
      <RequireLineLogin>
        <TenantLayout />
      </RequireLineLogin>
    ),
    children: [
      { index: true, element: <Navigate to="home" replace /> },

      // ✅ เปิดแค่ Home ก่อน
      { path: "home", element: <TenantHomePage /> },

      // ✅ ที่เหลือ placeholder กันหน้าอื่นพังโปรเจกต์
      { path: "history", element: <ComingSoon title="History" /> },
      { path: "notifications", element: <ComingSoon title="Notifications" /> },
      { path: "profile", element: <ComingSoon title="Profile" /> },
      { path: "maintenance", element: <ComingSoon title="Maintenance" /> },
      { path: "parcel", element: <ComingSoon title="Parcel" /> },
      { path: "billing", element: <ComingSoon title="Billing" /> },
      { path: "booking", element: <ComingSoon title="Booking" /> },

      { path: "*", element: <Navigate to="home" replace /> },
    ],
  },
];

export default tenantRoutes;
