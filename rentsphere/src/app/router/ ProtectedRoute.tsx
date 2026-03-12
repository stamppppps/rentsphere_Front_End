import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";

type UserRole = "OWNER" | "TENANT" | "ADMIN" | "STAFF";

type Props = {
  allowRoles?: UserRole[];
};

export default function ProtectedRoute({ allowRoles }: Props) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  // ยังไม่ login
  if (!token || !user) {
    return (
      <Navigate
        to="/auth/owner/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // ถ้ามีการกำหนด role ที่อนุญาต
  if (allowRoles && !allowRoles.includes(user.role as UserRole)) {
    // redirect ตาม role จริงของ user
    if (user.role === "OWNER") {
      return <Navigate to="/owner/condo" replace />;
    }

    if (user.role === "TENANT") {
      return <Navigate to="/tenant" replace />;
    }

    if (user.role === "STAFF") {
      return <Navigate to="/staff/dashboard" replace />;
    }

    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}