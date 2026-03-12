import { api } from "@/shared/api/http";
import { type Booking, BookingStatus } from "../types/booking";
import { auditService } from "./audit.service";

type BookingDto = {
  id: string;
  condoId?: string;
  facilityId: string;
  roomId?: string | null;
  tenantUserId?: string | null;
  userName?: string;
  unit?: string;
  facilityName?: string;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  peopleCount?: number | null;
  note?: string | null;
  status: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

function normalizeBookingStatus(value: string): BookingStatus {
  const upper = String(value ?? "").toUpperCase();

  if (upper === BookingStatus.APPROVED) return BookingStatus.APPROVED;
  if (upper === BookingStatus.REJECTED) return BookingStatus.REJECTED;
  if (upper === BookingStatus.CANCELLED) return BookingStatus.CANCELLED;
  if (upper === BookingStatus.COMPLETED) return BookingStatus.COMPLETED;
  return BookingStatus.PENDING;
}

function formatDateOnly(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function formatTimeOnly(value?: string | null): string {
  if (!value) return "";

  const raw = String(value);
  const match = raw.match(/^(\d{2}):(\d{2})/);

  if (match) return `${match[1]}:${match[2]}`;

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  return `${hh}:${mm}`;
}

function normalizeBooking(dto: BookingDto): Booking {
  return {
    id: String(dto.id),
    condoId: dto.condoId,
    facilityId: String(dto.facilityId),
    facilityName: String(dto.facilityName ?? "-"),

    roomId: dto.roomId ?? null,
    tenantUserId: dto.tenantUserId ?? null,
    userId: String(dto.tenantUserId ?? dto.roomId ?? dto.id),
    userName: String(dto.userName ?? "-"),
    unit: String(dto.unit ?? "-"),

    date: formatDateOnly(dto.date),
    startTime: formatTimeOnly(dto.startTime),
    endTime: formatTimeOnly(dto.endTime),

    status: normalizeBookingStatus(dto.status),
    participants: Number(dto.peopleCount ?? 1),

    reason: dto.note ?? "",
    rejectionReason: dto.rejectionReason ?? null,
    cancellationReason: null,
    adminNotes: dto.note ?? "",

    approvedBy: dto.approvedBy ?? null,
    approvedAt: dto.approvedAt ?? null,

    createdAt: String(dto.createdAt),
    updatedAt: dto.updatedAt ?? null,

    isAutoApproved: false,
  };
}

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    const rows = await api<BookingDto[]>("/owner/bookings");
    return (rows ?? []).map(normalizeBooking);
  },

  async getBookingsByFacility(facilityId: string): Promise<Booking[]> {
    const rows = await api<BookingDto[]>(
      `/owner/facilities/${encodeURIComponent(facilityId)}/bookings`
    );
    return (rows ?? []).map(normalizeBooking);
  },

  async getBookingsByCondo(condoId: string): Promise<Booking[]> {
    const rows = await api<BookingDto[]>(
      `/owner/condos/${encodeURIComponent(condoId)}/bookings`
    );
    return (rows ?? []).map(normalizeBooking);
  },

  async getBookingById(id: string): Promise<Booking | null> {
    try {
      const row = await api<BookingDto>(
        `/owner/bookings/${encodeURIComponent(id)}`
      );
      return row ? normalizeBooking(row) : null;
    } catch {
      return null;
    }
  },

  async updateStatus(
    id: string,
    status: BookingStatus,
    metadata?: { reason?: string; notes?: string }
  ): Promise<Booking> {
    const row = await api<BookingDto>(
      `/owner/bookings/${encodeURIComponent(id)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
          reason: metadata?.reason,
          notes: metadata?.notes,
        }),
      }
    );

    await auditService.createLog({
      action: `BOOKING_${status}`,
      performedBy: "Owner",
      performedByRole: "owner",
      targetType: "booking",
      targetId: id,
      details: `Changed booking status to ${status}`,
      metadata: {
        reason: metadata?.reason,
        notes: metadata?.notes,
        currentStatus: status,
      },
    });

    return normalizeBooking(row);
  },
};