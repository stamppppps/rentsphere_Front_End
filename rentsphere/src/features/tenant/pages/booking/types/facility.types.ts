export interface Facility {
  id: string;
  name: string;
  category: string;
  building: string;
  openTime: string;
  closeTime: string;
  imageUrl: string;
  availableSlotsCount?: number;
  status: 'available' | 'full';
  isQuotaExempt?: boolean;
  capacity?: number; // Maximum people per slot
}

export interface TimeSlot {
  time: string;
  status: 'available' | 'full';
  currentOccupancy?: number;
}

export interface DaySelection {
  dayName: string;
  date: number;
  fullDate: string;
}
