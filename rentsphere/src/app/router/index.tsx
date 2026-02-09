import { createBrowserRouter } from "react-router-dom";
import ownerRoutes from "./owner.routes";
import authRoutes from "./auth.routes";

const router = createBrowserRouter([
  ...authRoutes,
  ...ownerRoutes,
]);

export default router;
