import type { RouteObject } from "react-router-dom";
import React from "react";
import { Navigate } from "react-router-dom";

// ✅ ใช้ relative ตัดปัญหา alias @
import TenantLayout from "../../shared/layouts/TenantLayout";
import TenantHomePage from "../../features/tenant/pages/home/pages/TenantHomePage";

import FacilityDetailPage from "@/features/tenant/pages/booking/pages/FacilityDetailPage";
import BookingConfirmPage from "@/features/tenant/pages/booking/pages/BookingConfirmPage";
import BookingSuccessPage from "@/features/tenant/pages/booking/pages/BookingSuccessPage";
// ✅ import หน้า Booking ที่ทำไว้แล้ว
import FacilityListPage from "../../features/tenant/pages/booking/pages/FacilityListPage";
// (ถ้ายังไม่อยากเปิด detail ตอนนี้ ให้คอมเมนต์ไว้ก่อน)
// import FacilityDetailPage from "../../features/tenant/pages/booking/pages/FacilityDetailPage";

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

      // ✅ Home
      { path: "home", element: <TenantHomePage /> },

      // ✅ Booking: เปิดใช้จริง
      { path: "booking", element: <FacilityListPage /> },

      // ✅ ถ้าจะเปิด detail ทีหลัง ค่อยปลดคอมเมนต์
      // { path: "booking/:id", element: <FacilityDetailPage /> },
        { path: "booking", element: <FacilityListPage /> },
{ path: "booking/:id", element: <FacilityDetailPage /> },
{ path: "booking/confirm", element: <BookingConfirmPage /> },
{ path: "booking/success", element: <BookingSuccessPage /> },

      // ที่เหลือ placeholder กันหน้าอื่นพัง
      { path: "history", element: <ComingSoon title="History" /> },
      { path: "notifications", element: <ComingSoon title="Notifications" /> },
      { path: "profile", element: <ComingSoon title="Profile" /> },
      { path: "maintenance", element: <ComingSoon title="Maintenance" /> },
      { path: "parcel", element: <ComingSoon title="Parcel" /> },
      { path: "billing", element: <ComingSoon title="Billing" /> },

      { path: "*", element: <Navigate to="home" replace /> },
    ],
  },
];

export default tenantRoutes;
