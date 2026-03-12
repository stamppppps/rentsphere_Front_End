import { type Booking, BookingStatus } from '../types/booking';
import { type Facility, FacilityStatus } from '../types/facility';

type FacilityWithRules = Facility & {
  capacity?: number;
  openTime?: string;
  closeTime?: string;
};

export const bookingRules = {
  /**
   * Basic permission checks
   */
  canApprove: (booking: Booking, facility: Facility) => {
    return (
      booking.status === BookingStatus.PENDING &&
      facility.status === FacilityStatus.AVAILABLE
    );
  },

  canCheckIn: (booking: Booking) => {
    return ([BookingStatus.APPROVED] as BookingStatus[]).includes(booking.status);
  },

  /**
   * Business Logic Validations
   */
  isCapacityExceeded: (booking: Booking, facility: Facility) => {
    const f = facility as FacilityWithRules;
    return typeof f.capacity === 'number'
      ? booking.participants > f.capacity
      : false;
  },

  isOutsideOperatingHours: (booking: Booking, facility: Facility) => {
    const f = facility as FacilityWithRules;
    if (!f.openTime || !f.closeTime) return false;

    const bStart = booking.startTime;
    const bEnd = booking.endTime;

    return bStart < f.openTime || bEnd > f.closeTime;
  },

  isTimeOverlap: (target: Booking, allBookings: Booking[]) => {
    const conflicts = allBookings.filter(
      (b) =>
        b.id !== target.id &&
        b.date === target.date &&
        ([BookingStatus.APPROVED, BookingStatus.COMPLETED] as BookingStatus[]).includes(
          b.status
        )
    );

    return conflicts.some((b) => {
      return target.startTime < b.endTime && target.endTime > b.startTime;
    });
  },

  getValidationErrors: (booking: Booking, facility: Facility, allBookings: Booking[]) => {
    const errors: string[] = [];
    const f = facility as FacilityWithRules;

    if (bookingRules.isCapacityExceeded(booking, facility) && typeof f.capacity === 'number') {
      errors.push(
        `จำนวนผู้ใช้งาน (${booking.participants}) เกินความจุของพื้นที่ (${f.capacity})`
      );
    }

    if (bookingRules.isOutsideOperatingHours(booking, facility) && f.openTime && f.closeTime) {
      errors.push(
        `เวลาที่จอง (${booking.startTime}-${booking.endTime}) อยู่นอกเวลาทำการ (${f.openTime}-${f.closeTime})`
      );
    }

    if (bookingRules.isTimeOverlap(booking, allBookings)) {
      errors.push('มีรายการจองอื่นที่อนุมัติแล้วในช่วงเวลานี้ (Time Overlap)');
    }

    return errors;
  }
};