import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import TenantLayout from "@/shared/layouts/TenantLayout";
import TenantHomePage from "@/features/tenant/pages/home/pages/TenantHomePage";
import MaintenancePage from "@/features/tenant/pages/maintenance/pages/MaintenancePage";
import ParcelPage from "@/features/tenant/pages/parcel/pages/ParcelPage";
import BillingPage from "@/features/tenant/pages/billing/pages/BillingPage";
import BookingPage from "@/features/tenant/pages/booking/pages/BookingPage";

const HistoryPage = () => <div className="p-4 pt-10 text-center text-gray-500 font-medium">ประวัติการใช้งาน</div>;
const NotificationsPage = () => <div className="p-4 pt-10 text-center text-gray-500 font-medium">ไม่มีการแจ้งเตือนใหม่</div>;
const ProfilePage = () => <div className="p-4 pt-10 text-center text-gray-500 font-medium">โปรไฟล์ของคุณ</div>;

const tenantRoutes: RouteObject[] = [
  { path: "/home", element: <Navigate to="/tenant/home" replace /> },
  { path: "/history", element: <Navigate to="/tenant/history" replace /> },
  { path: "/notifications", element: <Navigate to="/tenant/notifications" replace /> },
  { path: "/profile", element: <Navigate to="/tenant/profile" replace /> },
  { path: "/maintenance", element: <Navigate to="/tenant/maintenance" replace /> },
  { path: "/parcel", element: <Navigate to="/tenant/parcel" replace /> },
  { path: "/billing", element: <Navigate to="/tenant/billing" replace /> },
  { path: "/booking", element: <Navigate to="/tenant/booking" replace /> },
  {
    path: "/tenant",
    element: <TenantLayout />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: <TenantHomePage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "maintenance", element: <MaintenancePage /> },
      { path: "parcel", element: <ParcelPage /> },
      { path: "billing", element: <BillingPage /> },
      { path: "booking", element: <BookingPage /> },
      { path: "*", element: <Navigate to="home" replace /> },
    ],
  },
];

export default tenantRoutes;
