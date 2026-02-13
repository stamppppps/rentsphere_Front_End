import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import OwnerLayout from "@/app/layouts/OwnerLayout";

// Owner Auth Pages
import OwnerLogin from "@/features/owner/pages/Auth/OwnerLogin";
import OwnerRegister from "@/features/owner/pages/Auth/OwnerRegister";

// AddCondo flow
import AddCondoLayout from "@/features/owner/pages/AddCondo/AddCondoLayout";
import Step6RoomPrice from "@/features/owner/pages/AddCondo/steps/Step6_RoomPrice";
import Step7Review from "@/features/owner/pages/AddCondo/steps/Step7_Review";
import Step8RoomService from "@/features/owner/pages/AddCondo/steps/Step8_RoomService";
import Step9Success from "@/features/owner/pages/AddCondo/steps/Step9_Success";
import Step_0 from "@/features/owner/pages/AddCondo/steps/Step_0";
import Step_1 from "@/features/owner/pages/AddCondo/steps/Step_1";
import Step_2 from "@/features/owner/pages/AddCondo/steps/Step_2";
import Step_3 from "@/features/owner/pages/AddCondo/steps/Step_3";
import Step_4 from "@/features/owner/pages/AddCondo/steps/Step_4";
import Step_5 from "@/features/owner/pages/AddCondo/steps/Step_5";

// Owner pages
import BillingPage from "@/features/owner/pages/Billing/BillingPage";

import CommonAreaBookingPage from "@/features/owner/pages/CommonAreaBooking/CommonAreaBookingPage";

import CondoHomePage from "@/features/owner/pages/Condo/CondoHomePage";

import DashboardPage from "@/features/owner/pages/Dashboard/DashboardPage";

import MaintenancePage from "@/features/owner/pages/Maintenance/MaintenancePage";

import MeterPage from "@/features/owner/pages/Meter/MeterPage";

import ParcelPage from "@/features/owner/pages/Parcel/ParcelPage";

import PaymentsPage from "@/features/owner/pages/Payments/PaymentsPage";

import ReportsPage from "@/features/owner/pages/Reports/ReportsPage";

import AdvancePaymentPage from "@/features/owner/pages/Rooms/AdvancePaymentPage";
import MonthlyContractPage from "@/features/owner/pages/Rooms/MonthlyContractPage";
import RoomDetailPage from "@/features/owner/pages/Rooms/RoomDetailPage";
import RoomMeterPage from "@/features/owner/pages/Rooms/RoomMeterPage";
import RoomsPage from "@/features/owner/pages/Rooms/RoomsPage";
import TenantAccessCodePage from "@/features/owner/pages/Rooms/TenantAccessCodePage";

import SettingsPage from "@/features/owner/pages/Settings/SettingsPage";

const ownerRoutes: RouteObject[] = [
  { path: "/owner/login", element: <OwnerLogin /> },
  { path: "/owner/register", element: <OwnerRegister /> },


  {
    path: "/owner",
    element: <OwnerLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },

      // Owner feature pages
      { path: "dashboard", element: <DashboardPage /> },
      { path: "condo", element: <CondoHomePage /> },
      { path: "rooms", element: <RoomsPage /> },
      { path: "rooms/:roomId", element: <RoomDetailPage /> },
      { path: "rooms/:roomId/monthly", element: <MonthlyContractPage /> },
      { path: "rooms/:roomId/advance-payment", element: <AdvancePaymentPage /> },
      { path: "rooms/:roomId/meter", element: <RoomMeterPage /> },
      { path: "rooms/:roomId/access-code", element: <TenantAccessCodePage /> },
      { path: "maintenance", element: <MaintenancePage /> },
      { path: "parcel", element: <ParcelPage /> },
      { path: "common-area-booking", element: <CommonAreaBookingPage /> },
      { path: "meter", element: <MeterPage /> },
      { path: "billing", element: <BillingPage /> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "settings", element: <SettingsPage /> },

      // Step 0 - standalone page (ไม่อยู่ใน AddCondoLayout)
      { path: "add-condo/step-0", element: <Step_0 /> },

      // AddCondo flow (step-1 onwards with sidebar layout)
      {
        path: "add-condo",
        element: <AddCondoLayout />,
        children: [
          { index: true, element: <Navigate to="step-0" replace /> },

          { path: "step-1", element: <Step_1 /> },
          { path: "step-2", element: <Step_2 /> },
          { path: "step-3", element: <Step_3 /> },
          { path: "step-4", element: <Step_4 /> },
          { path: "step-5", element: <Step_5 /> },
          { path: "step-6", element: <Step6RoomPrice /> },
          { path: "step-7", element: <Step7Review /> },
          { path: "step-8", element: <Step8RoomService /> },
          { path: "step-9", element: <Step9Success /> },
        ],
      },

      { path: "*", element: <Navigate to="dashboard" replace /> },
    ],
  },
];

export default ownerRoutes;
