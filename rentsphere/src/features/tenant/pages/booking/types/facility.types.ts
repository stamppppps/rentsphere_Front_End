// src/features/tenant/pages/booking/types/facility.types.ts

export type FacilityStatus = "available" | "full";

export interface Facility {
  id: string;
  name: string;
  category: string;
  building: string;
  openTime: string;  // "06:00"
  closeTime: string; // "22:00"
  imageUrl: string;
  status: FacilityStatus;
  isQuotaExempt: boolean;
  capacity: number;
}

export type TimeSlotStatus = "available" | "full";

export interface TimeSlot {
  time: string; // "06:00 - 07:00"
  status: TimeSlotStatus;
  currentOccupancy: number;
}
