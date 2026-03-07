import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";


import TenantWelcomePage from "@/features/tenant/pages/Auth/pages/WelcomePage";
import BillingHistoryDetailPage from "@/features/tenant/pages/billing/pages/ BillingHistoryDetailPage";
import BillingHistoryPage from "@/features/tenant/pages/billing/pages/ BillingHistoryPage";
import BillingBankTransferPage from "@/features/tenant/pages/billing/pages/BillingBankTransferPage";
import BillingPage from "@/features/tenant/pages/billing/pages/BillingPage";
import BillingPaymentDetailPage from "@/features/tenant/pages/billing/pages/BillingPaymentDetailPage";
import BillingPayMethodPage from "@/features/tenant/pages/billing/pages/BillingPayMethodPage";
import BillingPdfViewerPage from "@/features/tenant/pages/billing/pages/BillingPdfViewerPage";
import BillingSubmitSuccessPage from "@/features/tenant/pages/billing/pages/BillingSubmitSuccessPage";
import BillingSummaryPage from "@/features/tenant/pages/billing/pages/BillingSummaryPage";
import TenantUploadSlipPage from "@/features/tenant/pages/billing/pages/TenantUploadSlipPage";
import BookingConfirmPage from "@/features/tenant/pages/booking/pages/BookingConfirmPage";
import BookingSuccessPage from "@/features/tenant/pages/booking/pages/BookingSuccessPage";
import FacilityDetailPage from "@/features/tenant/pages/booking/pages/FacilityDetailPage";
import FacilityListPage from "@/features/tenant/pages/booking/pages/FacilityListPage";
import HistoryPageReal from "@/features/tenant/pages/history/pages/HistoryPage";
import TenantHomePage from "@/features/tenant/pages/home/pages/TenantHomePage";
import RepairDetailPage from "@/features/tenant/pages/maintenance/pages/RepairDetailPage";
import RepairHistoryPage from "@/features/tenant/pages/maintenance/pages/RepairHistoryPage";
import RepairRequestPage from "@/features/tenant/pages/maintenance/pages/RepairRequestPage";
import ParcelPage from "@/features/tenant/pages/parcel/pages/ParcelPage";
import TenantProfilePage from "@/features/tenant/pages/profile/pages/TenantProfilePage";
import TenantLayout from "@/shared/layouts/TenantLayout";

// ===== LINE-auth tenant pages (from source project) =====
import RoleSelect from "@/features/owner/pages/tenant/RoleSelect";
import TenantHomeLinePage from "@/features/owner/pages/tenant/TenantHome";
import TenantGate from "@/features/owner/pages/tenant/TenantGate";
import TenantFacilityBooking from "@/features/owner/pages/tenant/TenantFacilityBooking";
import MyRepairs from "@/features/owner/pages/tenant/repairs/MyRepairs";
import RepairDetail from "@/features/owner/pages/tenant/repairs/RepairDetail";
import RepairCreate from "@/features/owner/pages/tenant/repairs/RepairCreate";

const NotificationsPage = () => <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-[#f0f5ff] to-white pb-32 p-4 pt-10 text-center text-gray-500 font-medium ">การแจ้งเตือน</div>;

const tenantRoutes: RouteObject[] = [
  // Role Selection (Line Login Entry)
  { path: "/role", element: <RoleSelect /> },
  { path: "/login", element: <Navigate to="/role" replace /> },
  { path: "/welcome", element: <Navigate to="/tenant/welcome" replace /> },
  { path: "/tenant/login", element: <Navigate to="/owner/line-login" replace /> },
  { path: "/tenant/welcome", element: <TenantWelcomePage /> },

  // Base Redirects
  { path: "/tenant/app", element: <Navigate to="/tenant/home" replace /> },
  { path: "/home", element: <Navigate to="/tenant/home" replace /> },
  { path: "/history", element: <Navigate to="/tenant/history" replace /> },
  { path: "/notifications", element: <Navigate to="/tenant/notifications" replace /> },
  { path: "/profile", element: <Navigate to="/tenant/profile" replace /> },
  { path: "/maintenance", element: <Navigate to="/tenant/maintenance" replace /> },
  { path: "/parcel", element: <Navigate to="/tenant/parcel" replace /> },
  { path: "/billing", element: <Navigate to="/tenant/billing" replace /> },
  { path: "/booking", element: <Navigate to="/tenant/booking" replace /> },

  // Old LINE flows we are keeping but remapping
  { path: "/tenant/gate", element: <TenantGate /> },
  { path: "/tenant/facility", element: <TenantFacilityBooking /> },

  {
    path: "/tenant",
    element: <TenantLayout />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: <TenantHomePage /> },
      { path: "history", element: <HistoryPageReal /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "profile", element: <TenantProfilePage /> },

      // Maintenance / Repairs (Using the newly wired UI)
      { path: "maintenance", element: <RepairRequestPage /> },
      { path: "maintenance/history", element: <RepairHistoryPage /> },
      { path: "maintenance/:id", element: <RepairDetailPage /> },

      // Parcels
      { path: "parcel", element: <ParcelPage /> },

      // Billing
      { path: "billing", element: <BillingPage /> },
      { path: "billing/:billId/pay", element: <BillingPayMethodPage /> },
      { path: "billing/:billId/pay/bank-transfer", element: <BillingBankTransferPage /> },
      { path: "billing/:billId/pay/success", element: <BillingSubmitSuccessPage /> },
      { path: "billing/:billId/upload-slip", element: <TenantUploadSlipPage /> },
      { path: "billing/:billId/payment-detail", element: <BillingPaymentDetailPage /> },
      { path: "billing/:billId/pdf", element: <BillingPdfViewerPage /> },
      { path: "billing/summary", element: <BillingSummaryPage /> },
      { path: "billing/history", element: <BillingHistoryPage /> },
      { path: "billing/history/:historyId", element: <BillingHistoryDetailPage /> },

      // Booking
      { path: "booking", element: <FacilityListPage /> },
      { path: "booking/:id", element: <FacilityDetailPage /> },
      { path: "booking/confirm", element: <BookingConfirmPage /> },
      { path: "booking/success", element: <BookingSuccessPage /> },

      { path: "*", element: <Navigate to="home" replace /> },
    ],
  },
];

export default tenantRoutes;
