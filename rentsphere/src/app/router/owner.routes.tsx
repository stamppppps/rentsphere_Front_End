import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import OwnerLayout from "@/app/layouts/OwnerLayout";

// AddCondo flow
import AddCondoLayout from "@/features/owner/pages/AddCondo/AddCondoLayout";
import Step6RoomPrice from "@/features/owner/pages/AddCondo/steps/Step6_RoomPrice";
import Step7Review from "@/features/owner/pages/AddCondo/steps/Step7_Review";
import Step8RoomService from "@/features/owner/pages/AddCondo/steps/Step8_RoomService";
import Step9Success from "@/features/owner/pages/AddCondo/steps/Step9_Success";
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
import RoomsPage from "@/features/owner/pages/Rooms/RoomsPage";
import SettingsPage from "@/features/owner/pages/Settings/SettingsPage";

const ownerRoutes: RouteObject[] = [
  {
    path: "/owner",
    element: <OwnerLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },

      // Owner feature pages
      { path: "dashboard", element: <DashboardPage /> },
      { path: "condo", element: <CondoHomePage /> },
      { path: "rooms", element: <RoomsPage /> },
      { path: "maintenance", element: <MaintenancePage /> },
      { path: "parcel", element: <ParcelPage /> },
      { path: "common-area-booking", element: <CommonAreaBookingPage /> },
      { path: "meter", element: <MeterPage /> },
      { path: "billing", element: <BillingPage /> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "reports", element: <ReportsPage /> },

      { path: "settings", element: <SettingsPage /> },

      // AddCondo flow
      {
        path: "add-condo",
        element: <AddCondoLayout />,
        children: [
          { index: true, element: <Navigate to="step-3" replace /> },
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
