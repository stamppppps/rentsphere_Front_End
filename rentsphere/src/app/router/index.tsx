import { createBrowserRouter } from "react-router-dom";
import ownerRoutes from "./owner.routes";
import authRoutes from "./auth.routes";
import tenantRoutes from "./tenant.routes";
import staffRoutes from "./staff.routes";

const router = createBrowserRouter([
  ...authRoutes,
  ...tenantRoutes,
  ...ownerRoutes,
  ...staffRoutes
]);

export default router;
