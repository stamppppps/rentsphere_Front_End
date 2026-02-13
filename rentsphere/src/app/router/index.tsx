import { createBrowserRouter } from "react-router-dom";
import ownerRoutes from "./owner.routes";
import authRoutes from "./auth.routes";
import adminRoutes  from "./admin.routes";
import tenantRoutes from "./tenant.routes";

const router = createBrowserRouter([
  ...authRoutes,
  ...ownerRoutes,
  ...adminRoutes,
  ...tenantRoutes,
]);

export default router;
