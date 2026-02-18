export type BookingStatus = 'BOOKED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';

export interface BookingRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  imageUrl: string;
  date: string; // ISO string
  displayDate: string; // Thai format
  slots: string[];
  userName: string;
  status: BookingStatus;
  createdAt: string;
}

export interface BookingRequest {
  facilityId: string;
  date: string;
  slots: string[];
}
