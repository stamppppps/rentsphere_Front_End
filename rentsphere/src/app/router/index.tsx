import { createBrowserRouter } from "react-router-dom";
import ownerRoutes from "./owner.routes";
import tenantRoutes, { tenantAuthRoutes } from "./tenant.routes";


const router = createBrowserRouter([
  ...tenantAuthRoutes,
  ...tenantRoutes,
  ...ownerRoutes,
]);

export default router;
