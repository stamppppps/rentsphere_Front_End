// src/features/tenant/pages/booking/services/booking.service.ts
import type { Facility, TimeSlot } from "../types/facility.types";
import type { BookingRecord, BookingStatus } from "../types/booking.types";

/**
 * ✅ ใช้ backend เดิม (ตามที่เธอใช้ใน TenantFacilityBooking.tsx)
 */
const API = "https://backendlinefacality.onrender.com";

/**
 * ===== Helpers =====
 */
function normalizeHHmm(t: string) {
  if (!t) return "00:00";
  return String(t).slice(0, 5);
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * สร้าง slot list จากเวลาเปิด-ปิด และความยาว slot
 * (เช่น 06:00-22:00, slot 60 => 06:00-07:00 ... 21:00-22:00)
 */
function buildSlotsForDay(openHHmm: string, closeHHmm: string, slotMinutes = 60) {
  const [oh, om] = openHHmm.split(":").map((x) => parseInt(x, 10));
  const [ch, cm] = closeHHmm.split(":").map((x) => parseInt(x, 10));

  const start = new Date();
  start.setHours(oh || 0, om || 0, 0, 0);

  const end = new Date();
  end.setHours(ch || 0, cm || 0, 0, 0);

  const out: string[] = [];
  let t = start.getTime();
  const endMs = end.getTime();

  const step = Math.max(15, Number(slotMinutes) || 60) * 60 * 1000;

  while (t + step <= endMs) {
    const d = new Date(t);
    out.push(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`);
    t += step;
  }

  return out;
}

function ensureLineUserId() {
  const lineUserId = localStorage.getItem("lineUserId") || "";
  if (!lineUserId) throw new Error("ไม่พบ lineUserId (กรุณา login ผ่าน LINE ใหม่)");
  return lineUserId;
}

async function apiGet(path: string, lineUserId: string) {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API}${path}${sep}t=${Date.now()}`;

  const r = await fetch(url, {
    headers: { "x-line-user-id": lineUserId, "Cache-Control": "no-cache" },
    cache: "no-store",
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "โหลดข้อมูลไม่สำเร็จ");
  return data;
}

async function apiPost(path: string, body: any, lineUserId: string) {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-line-user-id": lineUserId },
    body: JSON.stringify(body ?? {}),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "ทำรายการไม่สำเร็จ");
  return data;
}

/**
 * ===== Backend DTO (รูปแบบข้อมูลจาก backend) =====
 */
type FacilityDTO = {
  id: string;
  name: string;
  description?: string | null;
  capacity: number;
  open_time: string;
  close_time: string;
  slot_minutes: number;
  image_url?: string | null;
  location?: string | null;
  type?: string | null;
  active?: boolean;
};

type AvailabilityResponse = {
  capacity: number;
  counts: Record<string, number>; // key = "HH:mm", value = จำนวนจองใน slot
};

/**
 * ===== Public API for UI pages =====
 * - getFacilities
 * - getAvailability
 * - getMyBookings (ไว้ใช้หน้าอื่น)
 * - saveBooking / updateBookingStatus (เผื่อหน้าอื่น)
 * - checkBookingQuota (ของเพื่อนใช้คำนวณสิทธิ์)
 */

/**
 * ✅ โหลด Facilities จาก backend จริง
 */
export const getFacilities = async (): Promise<Facility[]> => {
  const lineUserId = ensureLineUserId();

  // backend: GET /tenant/facilities  -> { items: FacilityDTO[] }
  const data = await apiGet(`/tenant/facilities`, lineUserId);
  const items = (data.items || []) as FacilityDTO[];

  // map DTO -> UI Facility (ของเพื่อน)
  const mapped: Facility[] = items.map((f) => ({
    id: f.id,
    name: f.name,
    category: f.type || "Common Area",
    building: f.location || "—",
    openTime: normalizeHHmm(f.open_time),
    closeTime: normalizeHHmm(f.close_time),
    imageUrl:
      f.image_url ||
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=500&auto=format&fit=crop",

    /**
     * ✅ IMPORTANT:
     * type ของเพื่อนรับแค่ "available" | "full"
     * ห้ามใส่ "unavailable"
     */
    status: f.active === false ? "full" : "available",

    // จะยกเว้นโควตาหรือไม่ (ถ้ายังไม่มี logic ก็ให้ false ไปก่อน)
    isQuotaExempt: false,

    capacity: Number(f.capacity || 1),
  }));

  return mapped;
};

/**
 * ✅ โหลด Availability จาก backend จริง แล้วแปลงเป็น TimeSlot[] (ของ UI เพื่อน)
 *
 * backend: GET /tenant/facility-bookings/availability?facility_id=...&date=YYYY-MM-DD
 * -> { capacity: number, counts: { "06:00": 1, ... } }
 *
 * NOTE:
 * - UI เพื่อนใช้ time เป็น string เช่น "06:00 - 07:00"
 * - status เป็น "available" | "full"
 */
export const getAvailability = async (facilityId: string, dateStr: string): Promise<TimeSlot[]> => {
  const lineUserId = ensureLineUserId();

  const facilities = await getFacilities();
  const facility = facilities.find((f) => f.id === facilityId);
  if (!facility) return [];

  const dateYmd = dateStr?.slice(0, 10) || toYmd(new Date());

  const data = (await apiGet(
    `/tenant/facility-bookings/availability?facility_id=${encodeURIComponent(facilityId)}&date=${encodeURIComponent(
      dateYmd
    )}`,
    lineUserId
  )) as AvailabilityResponse;

  const capacity = Number(data?.capacity || facility.capacity || 1);
  const counts = (data?.counts || {}) as Record<string, number>;

  const slotsHHmm = buildSlotsForDay(facility.openTime, facility.closeTime, 60);

  const out: TimeSlot[] = slotsHHmm.map((startHHmm) => {
    // end = start + 1 ชั่วโมง (เพราะ UI เพื่อนทำ 1 ชั่วโมง)
    const [hh, mm] = startHHmm.split(":").map((x) => parseInt(x, 10));
    const end = new Date();
    end.setHours(hh, mm, 0, 0);
    end.setMinutes(end.getMinutes() + 60);
    const endHHmm = `${pad2(end.getHours())}:${pad2(end.getMinutes())}`;

    const used = Number(counts[startHHmm] || 0);

    // ✅ แบบ capacity จริง (เต็มเมื่อ used >= capacity)
    const isFull = used >= capacity;

    return {
      time: `${startHHmm} - ${endHHmm}`,
      status: isFull ? "full" : "available",
      currentOccupancy: used,
    };
  });

  return out;
};

/**
 * ===== ตัวด้านล่างไว้รองรับหน้าอื่นใน UI เพื่อน (ถ้ายังไม่ใช้ก็ไม่เป็นไร) =====
 *
 * ถ้าเธอยังไม่เอาหน้าจองจริง (confirm/success) มาใช้ ก็ปล่อยไว้ได้
 * แต่ผมทำให้เป็น local store เหมือนเพื่อนก่อน เพื่อไม่ให้หน้าอื่นพัง
 */
let bookingStore: BookingRecord[] = [];

export const getMyBookings = (): BookingRecord[] => bookingStore;

export const saveBooking = async (record: BookingRecord) => {
  const dateYmd = record.date?.slice(0, 10);
  if (!dateYmd) throw new Error("date ไม่ถูกต้อง");

  // record.slots[0] มักเป็น "HH:mm - HH:mm"
  const first = record.slots?.[0];
  if (!first) throw new Error("กรุณาเลือกเวลา");

  const startHHmm = first.includes(" - ") ? first.split(" - ")[0].trim() : first.trim();

  // ✅ ยิงไป backend เพื่อ insert + ส่ง LINE
  await createBookingOnBackend({
    facilityId: record.facilityId,
    dateYmd,
    startHHmm,
    note: record.note,
  });
};

export const updateBookingStatus = (id: string, status: BookingStatus) => {
  bookingStore = bookingStore.map((b) => (b.id === id ? { ...b, status } : b));
};

/**
 * ✅ โควตา (เอาของเพื่อนมา 그대로)
 * - เธอจะค่อยแก้ไป query จาก backend จริงก็ได้ทีหลัง
 */
export const checkBookingQuota = (
  dateStr: string,
  facilityId: string
): {
  allowed: boolean;
  reason?: string;
  remainingMonth?: number;
  dailyCount?: number;
  occupiedTimes?: string[];
} => {
  const exemptIds = ["1", "3"]; // ตัวอย่างเดิมของเพื่อน
  const allBookings = getMyBookings().filter((b) => b.status !== "CANCELLED");
  const targetDate = new Date(dateStr).toDateString();
  const now = new Date();

  const occupiedTimes = allBookings
    .filter((b) => new Date(b.date).toDateString() === targetDate)
    .flatMap((b) => b.slots);

  const monthlySessionsCount = allBookings.reduce((acc, b) => {
    const bDate = new Date(b.date);
    if (
      !exemptIds.includes(b.facilityId) &&
      bDate.getMonth() === now.getMonth() &&
      bDate.getFullYear() === now.getFullYear()
    ) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const MAX_MONTHLY_SESSIONS = 10;
  const remainingMonth = Math.max(0, MAX_MONTHLY_SESSIONS - monthlySessionsCount);

  if (monthlySessionsCount >= MAX_MONTHLY_SESSIONS) {
    return {
      allowed: false,
      reason: `คุณใช้สิทธิ์จอง (${MAX_MONTHLY_SESSIONS} ครั้ง/เดือน) ครบแล้ว`,
      remainingMonth: 0,
      dailyCount: 0,
      occupiedTimes,
    };
  }

  if (exemptIds.includes(facilityId)) {
    return { allowed: true, dailyCount: 0, remainingMonth, occupiedTimes };
  }

  const dailyCount = allBookings.reduce((acc, b) => {
    if (new Date(b.date).toDateString() === targetDate && b.facilityId === facilityId) {
      return acc + b.slots.length;
    }
    return acc;
  }, 0);

  if (dailyCount >= 2) {
    return {
      allowed: false,
      reason: "คุณจองพื้นที่นี้ครบ 2 ชม. สำหรับวันนี้แล้ว",
      dailyCount,
      remainingMonth,
      occupiedTimes,
    };
  }

  return { allowed: true, remainingMonth, dailyCount, occupiedTimes };
};

/**
 * (Optional) ถ้าอยากให้หน้า confirm กดจองจริงผ่าน backend
 * เธอค่อยเอาฟังก์ชันนี้ไปใช้ใน BookingConfirmPage ทีหลังได้
 */
export const createBookingOnBackend = async (args: {
  facilityId: string;
  dateYmd: string; // YYYY-MM-DD
  startHHmm: string; // "06:00"
  note?: string;
}) => {
  const lineUserId = ensureLineUserId();

  // backend ต้องการ start_at เป็น ISO
  const start_at = new Date(`${args.dateYmd}T${args.startHHmm}:00+07:00`).toISOString();

  return apiPost(
    `/tenant/facility-bookings`,
    {
      facility_id: args.facilityId,
      start_at,
      note: args.note?.trim() ? args.note.trim() : null,
    },
    lineUserId
  );
};
