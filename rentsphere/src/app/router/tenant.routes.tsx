import React from "react";

const TenantLayout = React.lazy(() => import("@/app/layouts/TenantLayout"));

const tenantRoutes = [
  {
    path: "/tenant",
    element: (
      <React.Suspense fallback={<div className="p-6">Loading...</div>}>
        <TenantLayout />
      </React.Suspense>
    ),
  },
];

export default tenantRoutes;
