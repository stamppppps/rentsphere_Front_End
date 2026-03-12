export const AuditAction = {
  // Facility Actions
  FACILITY_CREATE: "FACILITY_CREATE",
  FACILITY_UPDATE: "FACILITY_UPDATE",
  FACILITY_STATUS_TOGGLE: "FACILITY_STATUS_TOGGLE",

  // Booking Lifecycle
  BOOKING_CREATE: "BOOKING_CREATE",
  BOOKING_STATUS_UPDATE: "BOOKING_STATUS_UPDATE",
  BOOKING_APPROVE: "BOOKING_APPROVE",
  BOOKING_REJECT: "BOOKING_REJECT",
  BOOKING_CANCEL: "BOOKING_CANCEL",
  BOOKING_EDIT: "BOOKING_EDIT",

  // System
  CONFIG_CHANGE: "CONFIG_CHANGE",
  SYSTEM_AUTO_CLEANUP: "SYSTEM_AUTO_CLEANUP",
} as const;

export type AuditAction =
  (typeof AuditAction)[keyof typeof AuditAction];

export type PerformerRole = "owner" | "staff" | "system";

export type AuditTargetType =
  | "facility"
  | "booking"
  | "user"
  | "config";

export interface AuditLog {
  id: string;

  action: AuditAction | string;

  performedBy: string;
  performedByRole: PerformerRole;

  targetType: AuditTargetType;
  targetId: string;

  details: string;
  timestamp: string;

  metadata?: {
    reason?: string;
    previousStatus?: string;
    currentStatus?: string;
    notes?: string;
    location?: string;
  };
}