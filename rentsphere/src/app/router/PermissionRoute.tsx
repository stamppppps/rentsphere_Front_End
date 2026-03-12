import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";

type Props = {
  allow: string[];
};

export default function PermissionRoute({ allow }: Props) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const activeMembership = useAuthStore((s) => s.activeMembership);

  if (!user) {
    return <Navigate to="/auth/owner/login" replace state={{ from: location }} />;
  }

  if (user.role === "OWNER" || user.role === "ADMIN") {
    return <Outlet />;
  }

  if (user.role !== "STAFF") {
    return <Navigate to="/auth/owner/login" replace state={{ from: location }} />;
  }

  const allowedModules = activeMembership?.allowedModules ?? [];
  const ok = allow.some((module) => allowedModules.includes(module));

  if (!ok) {
    return <Navigate to="/staff/403" replace />;
  }

  return <Outlet />;
}