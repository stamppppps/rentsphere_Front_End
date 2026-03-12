import { api } from "@/shared/api/http";
import type {
  BookingRecord,
  BookingRequest,
  BookingStatus,
} from "../types/booking.types";
import type { Facility, TimeSlot } from "../types/facility.types";

type FacilityBookingSettingDto = {
  id?: string;
  openTime: string | null;
  closeTime: string | null;
  slotMinutes: number;
  maxPeople: number | null;
  maxBookingsPerDay: number | null;
  requiresApproval: boolean;
  feePerSlot: number;
  deposit: number;
  cancellationHours: number;
};

type FacilityDto = {
  id: string;
  condoId?: string;
  name?: string;
  facilityName?: string;
  description?: string | null;
  coverImageUrl?: string | null;
  imageUrl?: string | null;
  status?: string | null;
  isActive?: boolean;
  bookingSetting?: FacilityBookingSettingDto | null;
  availableSlotsCount?: number;
};

type TenantBookingDto = {
  id: string;
  facilityId: string;
  facilityName?: string;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  note?: string | null;
  userName?: string | null;
  createdAt?: string | null;
};

type PublicSlotDto = {
  startTime: string;
  endTime: string;
  available: boolean;
};

type PublicSlotsResponse = {
  facilityId: string;
  date: string;
  slots: PublicSlotDto[];
};

type CreateBookingPayload = {
  lineUserId: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
};

type FacilityBookingSummaryDto = {
  facilityId: string;
  date: string;
  bookedCount: number;
  bookedPeople: number;
  items: Array<{
    id: string;
    startTime: string;
    endTime: string;
    peopleCount: number;
  }>;
};

const DEFAULT_FACILITY_IMAGE =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";

let bookingStore: BookingRecord[] = [];

function toSlotStartDate(date: string, startTime: string): Date {
  const [hour = 0, minute = 0] = String(startTime).split(":").map(Number);
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function isPastSlot(date: string, startTime: string): boolean {
  return toSlotStartDate(date, startTime).getTime() <= Date.now();
}

function getSlotStartTime(slot: string): string {
  return slot.split(" - ")[0] ?? "";
}

function getSlotEndTime(slot: string): string {
  return slot.split(" - ")[1] ?? "";
}

function getNow(): Date {
  return new Date();
}

function isWithin30Minutes(date: string, startTime: string): boolean {
  const slotStart = toSlotStartDate(date, startTime).getTime();
  const now = getNow().getTime();
  const diffMs = slotStart - now;

  return diffMs > 0 && diffMs < 30 * 60 * 1000;
}

function getSlotBlockReason(
  date: string,
  startTime: string,
  availableFromBackend: boolean
): { reason?: "past" | "booked" | "cutoff"; message?: string } {
  if (isPastSlot(date, startTime)) {
    return {
      reason: "past",
      message: "ไม่สามารถจองได้",
    };
  }

  if (isWithin30Minutes(date, startTime)) {
    return {
      reason: "cutoff",
      message: "ไม่สามารถจองในเวลานี้ได้ กรุณาเลือกรอบถัดไป",
    };
  }

  if (!availableFromBackend) {
    return {
      reason: "booked",
      message: "ถูกจองแล้ว",
    };
  }

  return {};
}

function getLineUserId(): string {
  const lineUserId =
    localStorage.getItem("lineUserId") ||
    localStorage.getItem("rentsphere_line_user_id") ||
    "";

  if (!lineUserId) {
    throw new Error("ไม่พบ lineUserId");
  }

  return lineUserId;
}

function normalizeFacilityStatus(
  value?: string | null
): "AVAILABLE" | "MAINTENANCE" {
  return String(value ?? "").toUpperCase() === "MAINTENANCE"
    ? "MAINTENANCE"
    : "AVAILABLE";
}

function normalizeFacility(dto: FacilityDto): Facility {
  return {
    id: String(dto.id),
    condoId: dto.condoId ? String(dto.condoId) : undefined,
    name: String(dto.name ?? dto.facilityName ?? ""),
    facilityName: String(dto.facilityName ?? dto.name ?? ""),
    description: String(dto.description ?? ""),
    category: "พื้นที่ส่วนกลาง",
    building: "",
    coverImageUrl: dto.coverImageUrl ?? null,
    imageUrl: dto.imageUrl ?? dto.coverImageUrl ?? DEFAULT_FACILITY_IMAGE,
    status: normalizeFacilityStatus(dto.status),
    availableSlotsCount: Number(dto.availableSlotsCount ?? 8),
    isQuotaExempt: false,
    bookingSetting: dto.bookingSetting
      ? {
          id: dto.bookingSetting.id,
          openTime: dto.bookingSetting.openTime ?? "08:00",
          closeTime: dto.bookingSetting.closeTime ?? "20:00",
          slotMinutes: Number(dto.bookingSetting.slotMinutes ?? 60),
          maxPeople:
            dto.bookingSetting.maxPeople == null
              ? null
              : Number(dto.bookingSetting.maxPeople),
          maxBookingsPerDay:
            dto.bookingSetting.maxBookingsPerDay == null
              ? null
              : Number(dto.bookingSetting.maxBookingsPerDay),
          requiresApproval: Boolean(dto.bookingSetting.requiresApproval),
          feePerSlot: Number(dto.bookingSetting.feePerSlot ?? 0),
          deposit: Number(dto.bookingSetting.deposit ?? 0),
          cancellationHours: Number(dto.bookingSetting.cancellationHours ?? 0),
        }
      : null,
  };
}

function normalizeBookingStatus(status: string): BookingStatus {
  const upper = String(status ?? "").toUpperCase();

  if (upper === "CHECKED_IN") return "CHECKED_IN";
  if (upper === "COMPLETED") return "COMPLETED";
  if (upper === "CANCELLED") return "CANCELLED";

  return "BOOKED";
}

function buildSlotsFromTimes(startTime: string, endTime: string): string[] {
  const slots: string[] = [];

  const [startHour = 0, startMin = 0] = String(startTime).split(":").map(Number);
  const [endHour = 0, endMin = 0] = String(endTime).split(":").map(Number);

  let current = new Date(2000, 0, 1, startHour, startMin, 0, 0);
  const end = new Date(2000, 0, 1, endHour, endMin, 0, 0);

  while (current < end) {
    const next = new Date(current.getTime() + 60 * 60 * 1000);

    const sh = String(current.getHours()).padStart(2, "0");
    const sm = String(current.getMinutes()).padStart(2, "0");
    const eh = String(next.getHours()).padStart(2, "0");
    const em = String(next.getMinutes()).padStart(2, "0");

    slots.push(`${sh}:${sm} - ${eh}:${em}`);
    current = next;
  }

  return slots;
}

function formatThaiDate(date: string): string {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return date;
  }

  return d.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function normalizeBooking(dto: TenantBookingDto): BookingRecord {
  return {
    id: String(dto.id),
    facilityId: String(dto.facilityId),
    facilityName: String(dto.facilityName ?? ""),
    imageUrl: dto.imageUrl ?? dto.coverImageUrl ?? DEFAULT_FACILITY_IMAGE,
    date: String(dto.date),
    displayDate: formatThaiDate(String(dto.date)),
    slots: buildSlotsFromTimes(dto.startTime, dto.endTime),
    userName: String(dto.userName ?? "ฉัน"),
    status: normalizeBookingStatus(dto.status),
    createdAt: dto.createdAt ?? new Date().toISOString(),
  };
}

export const getFacilities = async (): Promise<Facility[]> => {
  const lineUserId = getLineUserId();

  const rows = await api<FacilityDto[]>(
    `/tenant-public/facilities?lineUserId=${encodeURIComponent(lineUserId)}`
  );

  return Array.isArray(rows) ? rows.map(normalizeFacility) : [];
};

export const getFacilityById = async (
  facilityId: string
): Promise<Facility | null> => {
  const lineUserId = getLineUserId();

  const row = await api<FacilityDto>(
    `/tenant-public/facilities/${encodeURIComponent(
      facilityId
    )}?lineUserId=${encodeURIComponent(lineUserId)}`
  );

  return row ? normalizeFacility(row) : null;
};

export const getAvailability = async (
  facilityId: string,
  date: string
): Promise<TimeSlot[]> => {
  const lineUserId = getLineUserId();

  const res = await api<PublicSlotsResponse>(
    `/tenant-public/facilities/${encodeURIComponent(
      facilityId
    )}/slots?lineUserId=${encodeURIComponent(lineUserId)}&date=${encodeURIComponent(
      date
    )}`
  );

  const slots = Array.isArray(res?.slots) ? res.slots : [];

  return slots.map((slot) => {
    const block = getSlotBlockReason(date, slot.startTime, slot.available);
    const disabled = Boolean(block.reason);

    return {
      time: `${slot.startTime} - ${slot.endTime}`,
      status: disabled ? "full" : "available",
      currentOccupancy: slot.available ? 0 : 1,
      reason: block.reason,
      message: block.message,
    };
  });
};

export const getMyBookings = async (): Promise<BookingRecord[]> => {
  const lineUserId = getLineUserId();

  const rows = await api<TenantBookingDto[]>(
    `/tenant-public/bookings/me?lineUserId=${encodeURIComponent(lineUserId)}`
  );

  bookingStore = Array.isArray(rows) ? rows.map(normalizeBooking) : [];
  return bookingStore;
};

export const saveBooking = async (record: BookingRecord): Promise<void> => {
  bookingStore = [record, ...bookingStore];
};

export const createBooking = async (
  payload: BookingRequest
): Promise<BookingRecord> => {
  const lineUserId = getLineUserId();

  if (!payload.slots || payload.slots.length === 0) {
    throw new Error("กรุณาเลือกช่วงเวลา");
  }

  const sortedSlots = [...payload.slots].sort((a, b) => {
    return (
      toSlotStartDate(payload.date, getSlotStartTime(a)).getTime() -
      toSlotStartDate(payload.date, getSlotStartTime(b)).getTime()
    );
  });

  const hasPastSlot = sortedSlots.some((slot) =>
    isPastSlot(payload.date, getSlotStartTime(slot))
  );

  if (hasPastSlot) {
    throw new Error("ไม่สามารถจองได้");
  }

  const hasCutoffSlot = sortedSlots.some((slot) =>
    isWithin30Minutes(payload.date, getSlotStartTime(slot))
  );

  if (hasCutoffSlot) {
    throw new Error("ไม่สามารถจองในเวลานี้ได้ กรุณาเลือกรอบถัดไป");
  }

  const firstSlot = sortedSlots[0];
  const lastSlot = sortedSlots[sortedSlots.length - 1];

  const startTime = getSlotStartTime(firstSlot);
  const endTime = getSlotEndTime(lastSlot);

  const row = await api<TenantBookingDto>(
    `/tenant-public/facilities/${encodeURIComponent(payload.facilityId)}/bookings`,
    {
      method: "POST",
      body: JSON.stringify({
        lineUserId,
        date: payload.date,
        startTime,
        endTime,
        note: "",
      } satisfies CreateBookingPayload),
    }
  );

  const normalized = normalizeBooking(row);
  bookingStore = [normalized, ...bookingStore];
  return normalized;
};

export const updateBookingStatus = async (
  id: string,
  status: BookingStatus
): Promise<void> => {
  bookingStore = bookingStore.map((b) =>
    b.id === id ? { ...b, status } : b
  );
};

export const cancelBooking = async (id: string): Promise<void> => {
  const lineUserId = getLineUserId();

  await api(`/tenant-public/bookings/${encodeURIComponent(id)}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ lineUserId }),
  });

  bookingStore = bookingStore.map((b) =>
    b.id === id ? { ...b, status: "CANCELLED" } : b
  );
};

export const checkBookingQuota = async (
  dateStr: string,
  facilityId?: string,
  dailyLimit: number = 2
): Promise<{
  allowed: boolean;
  reason?: string;
  remainingDay?: number;
  dailyCount?: number;
  occupiedTimes?: string[];
}> => {
  const allBookings = (await getMyBookings()).filter(
    (b) => b.status !== "CANCELLED"
  );

  const targetDate = String(dateStr).split("T")[0];
  const isAllFacilities = !facilityId || facilityId === "any";

  const bookingsOfDay = allBookings.filter((b) => {
    const bookingDate = String(b.date).split("T")[0];
    return bookingDate === targetDate;
  });

  const occupiedTimes = bookingsOfDay
    .filter((b) => isAllFacilities || b.facilityId === facilityId)
    .flatMap((b) => b.slots);

  const dailyCount = bookingsOfDay.reduce((acc, b) => {
    if (isAllFacilities || b.facilityId === facilityId) {
      return acc + b.slots.length;
    }
    return acc;
  }, 0);

  const remainingDay = Math.max(0, dailyLimit - dailyCount);

  if (dailyCount >= dailyLimit) {
    return {
      allowed: false,
      reason: `คุณใช้สิทธิ์จองครบ ${dailyLimit} ครั้งสำหรับวันนี้แล้ว`,
      remainingDay: 0,
      dailyCount,
      occupiedTimes,
    };
  }

  return {
    allowed: true,
    remainingDay,
    dailyCount,
    occupiedTimes,
  };
};

export const getFacilityBookingSummary = async (
  facilityId: string,
  date: string
): Promise<FacilityBookingSummaryDto | null> => {
  const lineUserId = getLineUserId();

  const row = await api<FacilityBookingSummaryDto>(
    `/tenant-public/facilities/${encodeURIComponent(
      facilityId
    )}/booking-summary?lineUserId=${encodeURIComponent(
      lineUserId
    )}&date=${encodeURIComponent(date)}`
  );

  return row ?? null;
};