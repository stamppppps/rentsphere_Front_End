import { useParams } from "react-router-dom";
import { UserRole } from '@/types';

export function useAuthRole() {
  const { role } = useParams<{ role: string }>();

  const userRole = role?.toUpperCase() === "OWNER" ? UserRole.OWNER : UserRole.TENANT;
  const rolePath = userRole === UserRole.OWNER ? "owner" : "tenant";
  const base = `/auth/${rolePath}`;

  return {
    role,
    userRole: role,
    rolePath,
    base,
    basePath: base,
    authBasePath: base,
  };
}
