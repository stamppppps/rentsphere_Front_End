import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "@/app/router/ ProtectedRoute";
import PermissionRoute from "./PermissionRoute";

import OwnerLayout from "@/app/layouts/OwnerLayout";
import StaffInviteAcceptPage from "@/features/staff/pages/StaffInviteAcceptPage";

import DashboardPage from "@/features/owner/pages/Dashboard/DashboardPage";
import RoomsPage from "@/features/owner/pages/Rooms/RoomsPage";
import RoomDetailPage from "@/features/owner/pages/Rooms/RoomDetailPage";
import EditContractPage from "@/features/owner/pages/Rooms/EditContractPage";
import AccessCodesPage from "@/features/owner/pages/Rooms/TenantAccessCodePage";
import AdminRepairs from "@/features/owner/pages/Maintenance/AdminRepairs";
import AdminParcel from "@/features/owner/pages/Parcel/AdminParcel";
import FacilityListPage from "@/features/owner/pages/facility-booking/pages/FacilityListPage";
import MeterPage from "@/features/owner/pages/Meter/MeterPage";
import MeterPage2 from "@/features/owner/pages/Meter/MeterPage_2";
import BillingPage from "@/features/owner/pages/Billing/BillingPage";
import PaymentsPage from "@/features/owner/pages/Payments/PaymentsPage";
import ReportsPage from "@/features/owner/pages/Reports/ReportsPage";

const staffRoutes: RouteObject[] = [
  {
    path: "/staff/invite/:token",
    element: <StaffInviteAcceptPage />,
  },
  {
    element: <ProtectedRoute allowRoles={["STAFF"]} />,
    children: [
      {
        path: "/staff",
        element: <OwnerLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },

          {
            element: <PermissionRoute allow={["DASHBOARD"]} />,
            children: [{ path: "dashboard", element: <DashboardPage /> }],
          },

          {
            element: <PermissionRoute allow={["ROOMS"]} />,
            children: [
              { path: "rooms", element: <RoomsPage /> },
              { path: "rooms/:roomId", element: <RoomDetailPage /> },
              { path: "rooms/:roomId/edit-contract", element: <EditContractPage /> },
              { path: "rooms/:roomId/access-codes", element: <AccessCodesPage /> },
            ],
          },

          {
            element: <PermissionRoute allow={["REPAIR"]} />,
            children: [{ path: "maintenance", element: <AdminRepairs /> }],
          },

          {
            element: <PermissionRoute allow={["PARCEL"]} />,
            children: [{ path: "admin/parcel", element: <AdminParcel /> }],
          },

          {
            element: <PermissionRoute allow={["FACILITY"]} />,
            children: [
              { path: "common-area-booking", element: <FacilityListPage /> },
            ],
          },

          {
            element: <PermissionRoute allow={["METER"]} />,
            children: [
              { path: "meter", element: <MeterPage /> },
              { path: "meter/record", element: <MeterPage2 /> },
            ],
          },

          {
            element: <PermissionRoute allow={["BILLING"]} />,
            children: [{ path: "billing", element: <BillingPage /> }],
          },

          {
            element: <PermissionRoute allow={["PAYMENT"]} />,
            children: [{ path: "payments", element: <PaymentsPage /> }],
          },

          {
            element: <PermissionRoute allow={["REPORTS"]} />,
            children: [{ path: "reports", element: <ReportsPage /> }],
          },

          {
            path: "403",
            element: (
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="rounded-2xl border bg-white px-8 py-10 shadow">
                  <h1 className="text-2xl font-bold text-red-600 mb-2">
                    403 Forbidden
                  </h1>
                  <p className="text-slate-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                </div>
              </div>
            ),
          },

          { path: "*", element: <Navigate to="/staff/dashboard" replace /> },
        ],
      },
    ],
  },
];

export default staffRoutes;