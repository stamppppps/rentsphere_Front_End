// src/features/tenant/pages/booking/types/booking.types.ts

export type BookingStatus = "BOOKED" | "ACTIVE" | "CANCELLED" | "FINISHED";


export interface BookingRecord {
  id: string;
  facilityId: string;
  facilityName?: string; // ✅ เพิ่มบรรทัดนี้
  imageUrl: string;
  date: string;
  displayDate: string;
  slots: string[];
  userName: string;
  status: BookingStatus;
  createdAt: string;
  note?: string;
}