export const AuditAction = {
  // Facility Actions
  FACILITY_CREATE: 'FACILITY_CREATE',
  FACILITY_UPDATE: 'FACILITY_UPDATE',
  FACILITY_STATUS_TOGGLE: 'FACILITY_STATUS_TOGGLE',
  
  // Booking Lifecycle Actions
  BOOKING_CREATE: 'BOOKING_CREATE',
  BOOKING_APPROVE: 'BOOKING_APPROVE',
  BOOKING_REJECT: 'BOOKING_REJECT',
  BOOKING_CANCEL: 'BOOKING_CANCEL',
  BOOKING_CHECK_IN: 'BOOKING_CHECK_IN',
  BOOKING_CHECK_OUT: 'BOOKING_CHECK_OUT',
  BOOKING_LATE: 'BOOKING_LATE',
  BOOKING_NO_SHOW: 'BOOKING_NO_SHOW',
  BOOKING_EDIT: 'BOOKING_EDIT',
  
  // System/Config Actions
  CONFIG_CHANGE: 'CONFIG_CHANGE',
  SYSTEM_AUTO_CLEANUP: 'SYSTEM_AUTO_CLEANUP',
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export type PerformerRole = 'owner' | 'staff' | 'system';

export interface AuditLog {
  id: string;
  action: AuditAction | string; // Enum preferred, string allowed for legacy/future-proofing
  performedBy: string;         // Name of the admin or "System"
  performedByRole: PerformerRole;
  
  targetType: 'facility' | 'booking' | 'user' | 'config';
  targetId: string;            // Primary key of the target entity
  
  details: string;             // Human-readable summary for display in Timeline
  timestamp: string;           // ISO 8601 string
  
  // Advanced context for "Provenance" 
  metadata?: {
    reason?: string;           // Specific reason provided by the admin at the time
    previousStatus?: string;
    currentStatus?: string;
    notes?: string;            // Internal notes not seen by the user
    location?: string;         // IP address or access point if relevant
  };
}
