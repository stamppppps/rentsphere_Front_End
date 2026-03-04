import type { RouteObject } from "react-router-dom";
import StaffInviteAcceptPage from "@/features/staff/pages/StaffInviteAcceptPage";

const staffRoutes: RouteObject[] = [
  { path: "/staff/invite/:token", element: <StaffInviteAcceptPage /> },
];

export default staffRoutes;