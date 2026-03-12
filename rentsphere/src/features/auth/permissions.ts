import { useAuthStore } from "@/features/auth/auth.store";

export function getAllowedModules(): string[] {
  const state = useAuthStore.getState();
  const user = state.user;

  if (!user) return [];

  if (user.role === "OWNER" || user.role === "ADMIN") {
    return [
      "DASHBOARD",
      "ROOMS",
      "REPAIR",
      "PARCEL",
      "FACILITY",
      "METER",
      "BILLING",
      "PAYMENT",
      "REPORTS",
      "SETTINGS",
      "STAFF",
      "TENANT",
    ];
  }

  if (user.role !== "STAFF") return [];

  return state.activeMembership?.allowedModules ?? [];
}

export function hasModuleAccess(moduleName: string): boolean {
  const state = useAuthStore.getState();
  const user = state.user;

  if (!user) return false;

  if (user.role === "OWNER" || user.role === "ADMIN") {
    return true;
  }

  if (user.role !== "STAFF") {
    return false;
  }

  const allowedModules = state.activeMembership?.allowedModules ?? [];
  return allowedModules.includes(moduleName);
}