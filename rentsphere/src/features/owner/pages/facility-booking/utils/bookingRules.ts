import { type Booking, BookingStatus } from '../types/booking';
import { type Facility, FacilityStatus } from '../types/facility';

export const bookingRules = {
  /**
   * Basic permission checks
   */
  canApprove: (booking: Booking, facility: Facility) => {
    return booking.status === BookingStatus.PENDING && facility.status === FacilityStatus.AVAILABLE;
  },
  
  canCheckIn: (booking: Booking) => {
    return ([BookingStatus.APPROVED, BookingStatus.LATE] as BookingStatus[]).includes(booking.status);
  },

  /**
   * Business Logic Validations
   */
  isCapacityExceeded: (booking: Booking, facility: Facility) => {
    return booking.participants > facility.capacity;
  },

  isOutsideOperatingHours: (booking: Booking, facility: Facility) => {
    const bStart = booking.startTime;
    const bEnd = booking.endTime;
    return bStart < facility.openTime || bEnd > facility.closeTime;
  },

  isTimeOverlap: (target: Booking, allBookings: Booking[]) => {
    // Only compare with approved bookings that are on the same day
    const conflicts = allBookings.filter(b => 
      b.id !== target.id && 
      b.date === target.date &&
      ([BookingStatus.APPROVED, BookingStatus.COMPLETED, BookingStatus.LATE] as BookingStatus[]).includes(b.status)
    );

    return conflicts.some(b => {
      // Overlap logic: (StartA < EndB) and (EndA > StartB)
      return target.startTime < b.endTime && target.endTime > b.startTime;
    });
  },

  getValidationErrors: (booking: Booking, facility: Facility, allBookings: Booking[]) => {
    const errors: string[] = [];
    if (bookingRules.isCapacityExceeded(booking, facility)) {
      errors.push(`จำนวนผู้ใช้งาน (${booking.participants}) เกินความจุของพื้นที่ (${facility.capacity})`);
    }
    if (bookingRules.isOutsideOperatingHours(booking, facility)) {
      errors.push(`เวลาที่จอง (${booking.startTime}-${booking.endTime}) อยู่นอกเวลาทำการ (${facility.openTime}-${facility.closeTime})`);
    }
    if (bookingRules.isTimeOverlap(booking, allBookings)) {
      errors.push(`มีรายการจองอื่นที่อนุมัติแล้วในช่วงเวลานี้ (Time Overlap)`);
    }
    return errors;
  }
};
