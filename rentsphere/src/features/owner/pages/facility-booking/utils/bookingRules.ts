import { type Booking, BookingStatus } from '../types/booking';
import { type Facility, FacilityStatus } from '../types/facility';

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
    return ([BookingStatus.APPROVED, BookingStatus.LATE] as BookingStatus[]).includes(
      booking.status
    );
  },

  /**
   * Business Logic Validations
   */
  isCapacityExceeded: (booking: Booking, facility: Facility) => {
    const maxPeople = facility.bookingSetting?.maxPeople;
    if (typeof maxPeople !== 'number') return false;
    return booking.participants > maxPeople;
  },

  isOutsideOperatingHours: (booking: Booking, facility: Facility) => {
    const openTime = facility.bookingSetting?.openTime;
    const closeTime = facility.bookingSetting?.closeTime;

    if (!openTime || !closeTime) return false;

    const bStart = booking.startTime;
    const bEnd = booking.endTime;

    return bStart < openTime || bEnd > closeTime;
  },

  isTimeOverlap: (target: Booking, allBookings: Booking[]) => {
    const conflicts = allBookings.filter(
      (b) =>
        b.id !== target.id &&
        b.date === target.date &&
        ([BookingStatus.APPROVED, BookingStatus.COMPLETED, BookingStatus.LATE] as BookingStatus[]).includes(
          b.status
        )
    );

    return conflicts.some((b) => {
      return target.startTime < b.endTime && target.endTime > b.startTime;
    });
  },

  getValidationErrors: (booking: Booking, facility: Facility, allBookings: Booking[]) => {
    const errors: string[] = [];

    const maxPeople = facility.bookingSetting?.maxPeople;
    const openTime = facility.bookingSetting?.openTime;
    const closeTime = facility.bookingSetting?.closeTime;

    if (bookingRules.isCapacityExceeded(booking, facility) && typeof maxPeople === 'number') {
      errors.push(`จำนวนผู้ใช้งาน (${booking.participants}) เกินความจุของพื้นที่ (${maxPeople})`);
    }

    if (bookingRules.isOutsideOperatingHours(booking, facility) && openTime && closeTime) {
      errors.push(
        `เวลาที่จอง (${booking.startTime}-${booking.endTime}) อยู่นอกเวลาทำการ (${openTime}-${closeTime})`
      );
    }

    if (bookingRules.isTimeOverlap(booking, allBookings)) {
      errors.push('มีรายการจองอื่นที่อนุมัติแล้วในช่วงเวลานี้ (Time Overlap)');
    }

    return errors;
  },
};