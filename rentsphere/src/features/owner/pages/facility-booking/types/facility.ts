export const FacilityStatus = {
  AVAILABLE: "AVAILABLE",
  MAINTENANCE: "MAINTENANCE",
} as const;

export type FacilityStatus =
  (typeof FacilityStatus)[keyof typeof FacilityStatus];

export const FacilityType = {
  ALL: "ALL",
  SPORT: "SPORT",
  RELAX: "RELAX",
  WORKING: "WORKING",
  OUTDOOR: "OUTDOOR",
} as const;

export type FacilityType =
  (typeof FacilityType)[keyof typeof FacilityType];

export type FacilityBookingSetting = {
  id: string;
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

export interface Facility {
  id: string;
  condoId: string;

  name: string;
  facilityName: string;
  description: string;
  coverImageUrl: string | null;

  isActive: boolean;
  status: FacilityStatus;

  createdAt?: string;
  updatedAt?: string;

  bookingSetting: FacilityBookingSetting | null;
}