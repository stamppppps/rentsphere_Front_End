import OwnerLayout from "@/app/layouts/OwnerLayout";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

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
import CondoHomePage from "@/features/owner/pages/Condo/CondoHomePage";
import DashboardPage from "@/features/owner/pages/Dashboard/DashboardPage";
import { default as AdminRepairs, default as MaintenancePage } from "@/features/owner/pages/Maintenance/AdminRepairs";
import MeterPage from "@/features/owner/pages/Meter/MeterPage";
import MeterPage2 from "@/features/owner/pages/Meter/MeterPage_2";
import AdminParcel from "@/features/owner/pages/Parcel/AdminParcel";
import ParcelPage from "@/features/owner/pages/Parcel/ParcelPage";
import PaymentsPage from "@/features/owner/pages/Payments/PaymentsPage";
import ReportsPage from "@/features/owner/pages/Reports/ReportsPage";
import AdvancePaymentPage from "@/features/owner/pages/Rooms/AdvancePaymentPage";
import MonthlyContractPage from "@/features/owner/pages/Rooms/MonthlyContractPage";
import EditContractPage from "@/features/owner/pages/Rooms/EditContractPage";
import RoomDetailPage from "@/features/owner/pages/Rooms/RoomDetailPage";
import RoomMeterPage from "@/features/owner/pages/Rooms/RoomMeterPage";
import RoomsPage from "@/features/owner/pages/Rooms/RoomsPage";
import TenantAccessCodePage from "@/features/owner/pages/Rooms/TenantAccessCodePage";
import SettingsPage from "@/features/owner/pages/Settings/SettingsPage";
import SettingStep0Page from "@/features/owner/pages/Settings/SettingStep0Page";
import SettingStep1Page from "@/features/owner/pages/Settings/SettingStep1Page";
import SettingStep2Page from "@/features/owner/pages/Settings/SettingStep2Page";
import SettingStep3Page from "@/features/owner/pages/Settings/SettingStep3Page";
import SettingStep4Page from "@/features/owner/pages/Settings/SettingStep4Page";
import SettingStep5Page from "@/features/owner/pages/Settings/SettingStep5Page";
import SettingStep6Page from "@/features/owner/pages/Settings/SettingStep6Page";
import SettingStep7Page from "@/features/owner/pages/Settings/SettingStep7Page";
import SettingStep8Page from "@/features/owner/pages/Settings/SettingStep8Page";
// ===== Facility Booking pages =====
import BookingDetailPage from "@/features/owner/pages/facility-booking/pages/BookingDetailPage";
import BookingHistoryPage from "@/features/owner/pages/facility-booking/pages/BookingHistoryPage";
import FacilityDetailPage from "@/features/owner/pages/facility-booking/pages/FacilityDetailPage";
import FacilityListPage from "@/features/owner/pages/facility-booking/pages/FacilityListPage";

// ===== Tenant / LINE Login pages =====
import DormLink from "@/features/owner/pages/tenant/Linesetup/DormLink";
import DormRegister from "@/features/owner/pages/tenant/Linesetup/DormRegister";
import LineLogin from "@/features/owner/pages/tenant/Linesetup/LineLogin";
import LineLoginSuccess from "@/features/owner/pages/tenant/Linesetup/LineLoginSuccess";
import RepairCreate from "@/features/owner/pages/tenant/repairs/RepairCreate";


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
      { path: "rooms/:roomId", element: <RoomDetailPage /> },
      { path: "rooms/:roomId/monthly", element: <MonthlyContractPage /> },
      { path: "rooms/:roomId/edit-contract", element: <EditContractPage /> },
      { path: "rooms/:roomId/advance-payment", element: <AdvancePaymentPage /> },
      { path: "rooms/:roomId/meter", element: <RoomMeterPage /> },
      { path: "rooms/:roomId/access-code", element: <TenantAccessCodePage /> },
      { path: "maintenance", element: <MaintenancePage /> },
      { path: "parcel", element: <ParcelPage /> },
      { path: "meter", element: <MeterPage /> },
      { path: "meter/record", element: <MeterPage2 /> },
      { path: "billing", element: <BillingPage /> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "settings", element: <SettingsPage /> },
      //setting (edit)
      { path: "settings/step-0", element: <SettingStep0Page /> },
      { path: "settings/step-1", element: <SettingStep1Page /> },
      { path: "settings/step-2", element: <SettingStep2Page /> },
      { path: "settings/step-3", element: <SettingStep3Page /> },
      { path: "settings/step-4", element: <SettingStep4Page /> },
      { path: "settings/step-5", element: <SettingStep5Page /> },
      { path: "settings/step-6", element: <SettingStep6Page /> },
      { path: "settings/step-7", element: <SettingStep7Page /> },
      { path: "settings/step-8", element: <SettingStep8Page /> },

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

      // ===== Common Area / Facility Booking =====
      {
        path: "common-area-booking",
        children: [
          { index: true, element: <FacilityListPage /> },
          { path: ":facilityId", element: <FacilityDetailPage /> },
          { path: ":facilityId/bookings/:bookingId", element: <BookingDetailPage /> },
          { path: "history", element: <BookingHistoryPage /> },
        ],
      },


      { path: "*", element: <Navigate to="dashboard" replace /> },
    ],
  },

  {
    path: "/owner/admin-repairs",
    element: <AdminRepairs />,
  },

  {
    path: "/owner/admin/parcel",
    element: <AdminParcel />,
  },

  {
    path: "/owner/repair-create",
    element: <RepairCreate />,
  },

  {
    path: "/owner/line-login",
    element: <LineLogin />,
  },
  {
    path: "/owner/line-login-success",
    element: <LineLoginSuccess />,
  },

  {
    path: "/tenant/dorm-register",
    element: <DormRegister />,
  },
  {
    path: "/owner/dorm-link",
    element: <DormLink />,
  },

];

export default ownerRoutes;
