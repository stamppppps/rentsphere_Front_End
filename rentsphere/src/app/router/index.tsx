import { createBrowserRouter } from "react-router-dom";
import ownerRoutes from "./owner.routes";

const router = createBrowserRouter([
  ...ownerRoutes,
]);

export default router;
