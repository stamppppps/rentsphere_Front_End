import { BookingStatus } from "../types/booking";

interface BookingStatusConfig {
  label: string;
  actionLabel: string;
  color: string;
  iconColor: string;
  description: string;
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, BookingStatusConfig> = {
  PENDING: {
    label: "รออนุมัติ",
    actionLabel: "อนุมัติ",
    color: "yellow",
    iconColor: "text-yellow-600",
    description: "กำลังรอการอนุมัติ",
  },

  APPROVED: {
    label: "อนุมัติแล้ว",
    actionLabel: "เช็คอิน",
    color: "blue",
    iconColor: "text-blue-600",
    description: "การจองได้รับการอนุมัติ",
  },

  REJECTED: {
    label: "ถูกปฏิเสธ",
    actionLabel: "ปฏิเสธ",
    color: "red",
    iconColor: "text-red-600",
    description: "การจองถูกปฏิเสธ",
  },

  CANCELLED: {
    label: "ยกเลิก",
    actionLabel: "ยกเลิก",
    color: "gray",
    iconColor: "text-gray-500",
    description: "การจองถูกยกเลิก",
  },

  COMPLETED: {
    label: "เสร็จสิ้น",
    actionLabel: "เสร็จสิ้น",
    color: "green",
    iconColor: "text-green-600",
    description: "การใช้งานเสร็จสิ้น",
  },

  LATE: {
    label: "มาสาย",
    actionLabel: "มาสาย",
    color: "orange",
    iconColor: "text-orange-500",
    description: "ผู้ใช้งานมาช้ากว่าเวลาที่จอง",
  },
};