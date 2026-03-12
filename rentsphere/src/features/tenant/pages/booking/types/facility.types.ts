export type FacilityStatus = "AVAILABLE" | "MAINTENANCE";

export interface FacilityBookingSetting {
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
}

export interface Facility {
  id: string;
  condoId?: string;
  name: string;
  facilityName?: string;
  description?: string;
  category?: string;
  building?: string;

  coverImageUrl?: string | null;
  imageUrl?: string | null;

  status: FacilityStatus;
  availableSlotsCount?: number;
  isQuotaExempt?: boolean;

  bookingSetting?: FacilityBookingSetting | null;
}

export interface TimeSlot {
  time: string;
  status: "available" | "full";
  currentOccupancy?: number;
  reason?: "past" | "booked" | "cutoff";
  message?: string;
}

export interface DaySelection {
  dayName: string;
  date: number;
  fullDate: string;
}