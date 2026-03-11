import type { RouteObject } from "react-router-dom";
import PlatformAdminPage from "@/features/admin/pages/PlatformAdminPage";

const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: <PlatformAdminPage />,
  },
];

export default adminRoutes;
