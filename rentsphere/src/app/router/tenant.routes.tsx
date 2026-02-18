import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import TenantLayout from "@/shared/layouts/TenantLayout";
import TenantHomePage from "@/features/tenant/pages/home/pages/TenantHomePage";
import MaintenancePage from "@/features/tenant/pages/maintenance/pages/MaintenancePage";
import ParcelPage from "@/features/tenant/pages/parcel/pages/ParcelPage";
import BillingPage from "@/features/tenant/pages/billing/pages/BillingPage";
import FacilityListPage from "@/features/tenant/pages/booking/pages/FacilityListPage";
import FacilityDetailPage from "@/features/tenant/pages/booking/pages/FacilityDetailPage";
import BookingConfirmPage from "@/features/tenant/pages/booking/pages/BookingConfirmPage";
import BookingSuccessPage from "@/features/tenant/pages/booking/pages/BookingSuccessPage";
import HistoryPageReal from "@/features/tenant/pages/history/pages/HistoryPage";
import TenantProfilePage from "@/features/tenant/pages/profile/pages/TenantProfilePage";

const NotificationsPage = () => <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-[#f0f5ff] to-white pb-32 p-4 pt-10 text-center text-gray-500 font-medium ">การแจ้งเตือน</div>;

const tenantRoutes: RouteObject[] = [
  { path: "/home", element: <Navigate to="/tenant/home" replace /> },
  { path: "/history", element: <Navigate to="/tenant/history" replace /> },
  { path: "/notifications", element: <Navigate to="/tenant/notifications" replace /> },
  { path: "/profile", element: <Navigate to="/tenant/profile" replace /> },
  { path: "/maintenance", element: <Navigate to="/tenant/maintenance" replace /> },
  { path: "/parcel", element: <Navigate to="/tenant/parcel" replace /> },
  { path: "/billing", element: <Navigate to="/tenant/billing" replace /> },
  { path: "/booking", element: <Navigate to="/tenant/booking" replace /> },
  { path: "/booking/:id", element: <Navigate to="/tenant/booking/:id" replace /> },
  { path: "/booking/confirm", element: <Navigate to="/tenant/booking/confirm" replace /> },
  { path: "/booking/success", element: <Navigate to="/tenant/booking/success" replace /> },
  {
    path: "/tenant",
    element: <TenantLayout />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: <TenantHomePage /> },
      { path: "history", element: <HistoryPageReal /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "profile", element: <TenantProfilePage /> },
      { path: "maintenance", element: <MaintenancePage /> },
      { path: "parcel", element: <ParcelPage /> },
      { path: "billing", element: <BillingPage /> },
      { path: "booking", element: <FacilityListPage /> },
      { path: "booking/:id", element: <FacilityDetailPage /> },
      { path: "booking/confirm", element: <BookingConfirmPage /> },
      { path: "booking/success", element: <BookingSuccessPage /> },
      { path: "*", element: <Navigate to="home" replace /> },
    ],
  },
];

export default tenantRoutes;
