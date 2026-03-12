import { useAuthStore } from "@/features/auth/auth.store";
import { getSelectedCondoId } from "@/features/owner/stores/condoStore";

export function getActiveCondoId(): string {
  const auth = useAuthStore.getState();

  // STAFF → ใช้ condo จาก membership
  if (auth.user?.role === "STAFF") {
    return auth.activeMembership?.condoId ?? "";
  }

  // OWNER / ADMIN → ใช้ condo ที่เลือกไว้ใน owner store
  return getSelectedCondoId() ?? "";
}