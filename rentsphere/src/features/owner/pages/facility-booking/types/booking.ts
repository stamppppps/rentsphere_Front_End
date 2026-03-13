export const BookingStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  LATE: "LATE",
} as const;

export type BookingStatus =
  (typeof BookingStatus)[keyof typeof BookingStatus];

export interface Booking {
  id: string;
  condoId?: string;
  facilityId: string;
  roomId?: string | null;
  tenantUserId?: string | null;
  peopleCount?: number;

  facilityName: string;
  userId: string;
  userName: string;
  unit: string;

  date: string;
  startTime: string;
  endTime: string;

  status: BookingStatus;
  participants: number;

  reason?: string;
  note?: string;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
  adminNotes?: string;

  approvedBy?: string | null;
  approvedAt?: string | null;

  createdAt: string;
  updatedAt?: string | null;

  isAutoApproved?: boolean;
}