import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import TenantLayout from "@/app/layouts/TenantLayout";
import ProtectedRoute  from "./ ProtectedRoute";

import TenantLogin from "@/features/tenant/pages/Auth/TenantLogin";
import TenantHome from "@/features/tenant/pages/Home/TenantHome";

export const tenantAuthRoutes: RouteObject[] = [
  {
    path: "/tenant/login",
    element: <TenantLogin />,
  },
];

const tenantRoutes: RouteObject[] = [
  {
    path: "/tenant",
    element: (
      <ProtectedRoute role="tenant">
        <TenantLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: <TenantHome /> },
      { path: "*", element: <Navigate to="home" replace /> },
    ],
  },
];

export default tenantRoutes;
