import type { LucideIcon } from 'lucide-react';
import {
  Ban,
  Check,
  CheckCircle,
  Clock,
  Edit3,
  Eye,
  LogIn,
  UserX,
  X,
} from 'lucide-react';
import { BOOKING_STATUS_CONFIG } from '../constants/bookingStatus';
import type { Booking } from '../types/booking';
import { BookingStatus } from '../types/booking';
import { FacilityStatus } from '../types/facility';
import { checkIfBeyondGracePeriod, checkIfExpired, checkIfLate } from './time';

export interface BookingActionItem {
  label: string;
  icon: LucideIcon;
  action: string;
  primary?: boolean;
  danger?: boolean;
  divider?: boolean;
  hidden?: boolean;
}

/**
 * Maps Facility Status to readable Thai labels
 */
export const getFacilityStatusLabel = (status: FacilityStatus) => {
  switch (status) {
    case FacilityStatus.AVAILABLE:
      return 'เปิดให้บริการ';
    case FacilityStatus.MAINTENANCE:
      return 'ปิดปรับปรุง';
    default:
      return 'ไม่ทราบสถานะ';
  }
};

/**
 * Helper to get status colors/config from constants
 */
export const getStatusConfig = (status: BookingStatus) => {
  return BOOKING_STATUS_CONFIG[status] || BOOKING_STATUS_CONFIG[BookingStatus.PENDING];
};

/**
 * Returns allowed admin actions based on the current booking status and real-time conditions.
 */
export const getAllowedActions = (booking: Booking): BookingActionItem[] => {
  const status = booking.status;
  const isLate = status === BookingStatus.APPROVED && checkIfLate(booking.date, booking.startTime);
  const isBeyondGrace = isLate && checkIfBeyondGracePeriod(booking.date, booking.startTime);
  const isExpired = status === BookingStatus.APPROVED && checkIfExpired(booking.date, booking.endTime);

  switch (status) {
    case BookingStatus.PENDING:
      return [
        {
          label: getStatusConfig(BookingStatus.APPROVED).actionLabel,
          icon: Check,
          action: 'approve',
          primary: true,
        },
        {
          label: getStatusConfig(BookingStatus.REJECTED).actionLabel,
          icon: X,
          action: 'reject',
          danger: true,
        },
        { label: 'แก้ไขข้อมูล', icon: Edit3, action: 'edit' },
      ];

    case BookingStatus.APPROVED:
    case BookingStatus.LATE:
      if (isExpired) {
        return [
          {
            label: 'ยืนยันไม่ปรากฏตัว (มีบทลงโทษ)',
            icon: UserX,
            action: 'no_show',
            danger: true,
          },
          {
            label: 'ปิดรายการปกติ (Soft Complete)',
            icon: CheckCircle,
            action: 'complete',
            primary: true,
          },
          { label: 'ดูรายละเอียด', icon: Eye, action: 'view', divider: true },
        ];
      }

      if (isBeyondGrace) {
        return [
          {
            label: 'ยืนยันไม่มาตามนัด (No-Show)',
            icon: UserX,
            action: 'no_show',
            danger: true,
          },
          {
            label: 'ใช้งานจริง (Check-in)',
            icon: LogIn,
            action: 'complete',
            primary: true,
          },
          { label: 'ดูรายละเอียด', icon: Eye, action: 'view', divider: true },
        ];
      }

      if (isLate) {
        return [
          {
            label: 'ยืนยันเข้าใช้งาน (สาย)',
            icon: LogIn,
            action: 'complete',
            primary: true,
          },
          {
            label: 'บันทึกไม่มาปรากฏตัว',
            icon: UserX,
            action: 'no_show',
            danger: true,
          },
          { label: 'ดูรายละเอียด', icon: Eye, action: 'view', divider: true },
        ];
      }

      return [
        {
          label: getStatusConfig(BookingStatus.COMPLETED).actionLabel,
          icon: CheckCircle,
          action: 'complete',
          primary: true,
        },
        {
          label: getStatusConfig(BookingStatus.LATE).actionLabel,
          icon: Clock,
          action: 'late',
          hidden: status === BookingStatus.LATE,
        },
        {
          label: 'ไม่ปรากฏตัวตามนัด',
          icon: UserX,
          action: 'no_show',
          danger: true,
        },
        {
          label: getStatusConfig(BookingStatus.CANCELLED).actionLabel,
          icon: Ban,
          action: 'cancel',
          divider: true,
        },
      ].filter((a) => !('hidden' in a) || !a.hidden);

    default:
      return [{ label: 'ดูรายละเอียด', icon: Eye, action: 'view' }];
  }
};