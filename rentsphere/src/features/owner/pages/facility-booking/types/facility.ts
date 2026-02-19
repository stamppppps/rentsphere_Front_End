export const FacilityType = {
  SPORT: "sport",
  RELAX: "relax",
  WORKING: "working",
  OUTDOOR: "outdoor",
} as const;

export type FacilityType = (typeof FacilityType)[keyof typeof FacilityType];

export type Facility = {
  id: string;
  dormId: string;

  name: string;
  description: string | null;

  capacity: number;
  active: boolean;
  slotMinutes: number;

  openTime: string;  // HH:mm
  closeTime: string; // HH:mm

  type: FacilityType;
  isAutoApprove: boolean;
};