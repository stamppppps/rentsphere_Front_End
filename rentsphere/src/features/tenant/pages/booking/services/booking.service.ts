import type { Facility, TimeSlot } from '../types/facility.types';
import type { BookingRecord, BookingStatus } from '../types/booking.types';

let bookingStore: BookingRecord[] = [];

export const getFacilities = async (): Promise<Facility[]> => {
  return [
    {
      id: '1',
      name: 'Swimming Pool',
      category: 'Water Activity',
      building: 'Facilities Center',
      openTime: '06:00',
      closeTime: '22:00',
      imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=500&auto=format&fit=crop',
      status: 'available',
      isQuotaExempt: true,
      capacity: 12
    },
    {
      id: '2',
      name: 'Badminton Court',
      category: 'Sport Area',
      building: 'Sport Complex',
      openTime: '06:00',
      closeTime: '22:00',
      imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=500&auto=format&fit=crop',
      status: 'available',
      isQuotaExempt: false,
      capacity: 4
    },
    {
      id: '3',
      name: 'Fitness Center',
      category: 'Health Club',
      building: 'Facilities Center',
      openTime: '05:00',
      closeTime: '23:00',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=500&auto=format&fit=crop',
      status: 'available',
      isQuotaExempt: true,
      capacity: 12
    },
    {
      id: '4',
      name: 'Meeting Room',
      category: 'Working Space',
      building: 'Business Center',
      openTime: '08:00',
      closeTime: '20:00',
      imageUrl: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=500&auto=format&fit=crop',
      status: 'available',
      isQuotaExempt: false,
      capacity: 8
    }
  ];
};

export const getAvailability = async (facilityId: string, _date: string): Promise<TimeSlot[]> => {
  const facilities = await getFacilities();
  const facility = facilities.find(f => f.id === facilityId);
  const slots: TimeSlot[] = [];
  
  for (let i = 6; i < 22; i++) {
    const start = i.toString().padStart(2, '0') + ':00';
    const end = (i + 1).toString().padStart(2, '0') + ':00';
    
    const currentOccupancy = Math.floor(Math.random() * (facility?.capacity || 10));
    const isFull = currentOccupancy >= (facility?.capacity || 10);

    slots.push({
      time: `${start} - ${end}`,
      status: isFull ? 'full' : 'available',
      currentOccupancy
    });
  }
  return slots;
};

export const getMyBookings = (): BookingRecord[] => {
  return bookingStore;
};

export const saveBooking = (record: BookingRecord) => {
  const existing = getMyBookings();
  bookingStore = [record, ...existing];
};

export const updateBookingStatus = (id: string, status: BookingStatus) => {
  const bookings = getMyBookings();
  const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
  bookingStore = updated;
};

export const checkBookingQuota = (dateStr: string, facilityId: string): { 
  allowed: boolean; 
  reason?: string; 
  remainingMonth?: number;
  dailyCount?: number;
  occupiedTimes?: string[];
} => {
  const exemptIds = ['1', '3']; // Fitness & Pool ไม่นับโควตา
  const allBookings = getMyBookings().filter(b => b.status !== 'CANCELLED');
  const targetDate = new Date(dateStr).toDateString();
  const now = new Date();

  // 1. หาช่วงเวลาที่จองไว้แล้วในทุกพื้นที่ของวันนี้
  const occupiedTimes = allBookings
    .filter(b => new Date(b.date).toDateString() === targetDate)
    .flatMap(b => b.slots);

  // 2. คำนวณโควตารายเดือน: นับตาม "จำนวนรายการจอง (Sessions)" ในเดือนปัจจุบันของระบบ
  const monthlySessionsCount = allBookings.reduce((acc, b) => {
    const bDate = new Date(b.date);
    if (!exemptIds.includes(b.facilityId) && 
        bDate.getMonth() === now.getMonth() && 
        bDate.getFullYear() === now.getFullYear()) {
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
      occupiedTimes
    };
  }

  if (exemptIds.includes(facilityId)) {
    return { allowed: true, dailyCount: 0, remainingMonth, occupiedTimes };
  }

  // 3. โควตารายวันเฉพาะพื้นที่ (จำกัด 2 ชม./พื้นที่)
  const dailyCount = allBookings.reduce((acc, b) => {
    if (new Date(b.date).toDateString() === targetDate && b.facilityId === facilityId) {
      return acc + b.slots.length;
    }
    return acc;
  }, 0);

  if (dailyCount >= 2) {
    return { 
      allowed: false, 
      reason: 'คุณจองพื้นที่นี้ครบ 2 ชม. สำหรับวันนี้แล้ว', 
      dailyCount,
      remainingMonth,
      occupiedTimes 
    };
  }

  return { allowed: true, remainingMonth, dailyCount, occupiedTimes };
};
