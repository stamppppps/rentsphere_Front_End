
import { type Booking, BookingStatus } from '../types/booking';
import { auditService } from './audit.service';

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    facilityId: 'f1',
    facilityName: 'ฟิตเนส (Fitness)',
    userId: 'u1',
    userName: 'สมชาย รักเรียน',
    unit: 'A-101',
    date: '2024-03-25',
    startTime: '08:00',
    endTime: '09:30',
    status: BookingStatus.PENDING,
    participants: 1,
    isAutoApproved: false,
    createdAt: '2024-03-20T10:00:00Z',
    reason: 'ออกกำลังกายช่วงเช้าก่อนไปทำงาน'
  },
  {
    id: 'b2',
    facilityId: 'f1',
    facilityName: 'ฟิตเนส (Fitness)',
    userId: 'u2',
    userName: 'สมศรี ดีงาม',
    unit: 'B-205',
    date: '2024-03-25',
    startTime: '10:00',
    endTime: '11:30',
    status: BookingStatus.APPROVED,
    participants: 2,
    isAutoApproved: true,
    createdAt: '2024-03-21T14:30:00Z',
    reason: 'เล่นเวทเทรนนิ่งกับเพื่อน'
  },
  {
    id: 'b3',
    facilityId: 'f2',
    facilityName: 'สระว่ายน้ำ (Pool)',
    userId: 'u3',
    userName: 'วิชัย ใจเด็ด',
    unit: 'C-309',
    date: '2024-03-24',
    startTime: '16:00',
    endTime: '18:00',
    status: BookingStatus.COMPLETED,
    participants: 3,
    isAutoApproved: true,
    checkInTime: '2024-03-24T16:05:00Z',
    checkOutTime: '2024-03-24T18:00:00Z',
    createdAt: '2024-03-22T09:15:00Z'
  }
];

const localBookings = [...MOCK_BOOKINGS];

export const bookingService = {
  getBookings: async (facilityId?: string): Promise<Booking[]> => {
    const filtered = facilityId ? localBookings.filter(b => b.facilityId === facilityId) : localBookings;
    return new Promise((resolve) => setTimeout(() => resolve([...filtered]), 500));
  },
  
  getBookingById: async (id: string): Promise<Booking | null> => {
    const b = localBookings.find(b => b.id === id);
    return new Promise((resolve) => setTimeout(() => resolve(b ? { ...b } : null), 300));
  },

  updateStatus: async (id: string, status: BookingStatus, metadata?: { reason?: string, notes?: string }): Promise<Booking> => {
    const index = localBookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found');

    const oldStatus = localBookings[index].status;
    const now = new Date().toISOString();
    
    // Update booking with metadata
    localBookings[index] = { 
      ...localBookings[index], 
      status,
      updatedAt: now,
      ...(status === BookingStatus.REJECTED && { rejectionReason: metadata?.reason }),
      ...(status === BookingStatus.CANCELLED && { cancellationReason: metadata?.reason }),
      ...(status === BookingStatus.COMPLETED && { checkInTime: localBookings[index].checkInTime || now, checkOutTime: now }),
      ...(status === BookingStatus.LATE && { checkInTime: now }),
      adminNotes: metadata?.notes || localBookings[index].adminNotes
    };

    // Record this action in the audit trail
    await auditService.createLog({
      action: `UPDATE_STATUS_${status.toUpperCase()}`,
      performedBy: 'Admin Manager',
      performedByRole: 'owner',
      targetType: 'booking',
      targetId: id,
      details: `เปลี่ยนสถานะจาก [${oldStatus}] เป็น [${status}] ${metadata?.reason ? `เนื่องจาก: ${metadata.reason}` : ''}`
    });

    return new Promise((resolve) => setTimeout(() => resolve({ ...localBookings[index] }), 500));
  }
};
