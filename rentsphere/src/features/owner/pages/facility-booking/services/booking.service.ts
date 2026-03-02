import { type Booking, BookingStatus } from '../types/booking';
import { auditService } from './audit.service';

const localBookings: Booking[] = [];

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
