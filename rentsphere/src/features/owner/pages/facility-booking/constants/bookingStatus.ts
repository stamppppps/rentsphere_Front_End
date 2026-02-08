
import { BookingStatus } from '../types/booking';

/**
 * Single Source of Truth for Booking Statuses
 * Controls labels, colors, and action text for the whole system.
 */
export const BOOKING_STATUS_CONFIG = {
  [BookingStatus.PENDING]: { 
    label: 'รออนุมัติ', 
    actionLabel: 'อนุมัติการจอง',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    iconColor: 'text-amber-500',
    description: 'คำขอใหม่จากลูกบ้านที่รอการตรวจสอบ'
  },
  [BookingStatus.APPROVED]: { 
    label: 'อนุมัติแล้ว', 
    actionLabel: 'ยืนยันอนุมัติ',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconColor: 'text-emerald-500',
    description: 'รายการที่ได้รับการยืนยันและพร้อมเข้าใช้งาน'
  },
  [BookingStatus.REJECTED]: { 
    label: 'ถูกปฏิเสธ', 
    actionLabel: 'ปฏิเสธคำขอ',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    iconColor: 'text-rose-500',
    description: 'รายการที่ไม่ผ่านการอนุมัติโดยแอดมิน'
  },
  [BookingStatus.CANCELLED]: { 
    label: 'ยกเลิก', 
    actionLabel: 'ยกเลิกการจอง',
    color: 'bg-slate-100 text-slate-500 border-slate-200',
    iconColor: 'text-slate-400',
    description: 'รายการที่ถูกยกเลิกโดยลูกบ้านหรือแอดมิน'
  },
  [BookingStatus.COMPLETED]: { 
    label: 'เสร็จสิ้น', 
    actionLabel: 'เช็คอิน / สำเร็จ',
    color: 'bg-green-100 text-green-700 border-green-200',
    iconColor: 'text-green-600',
    description: 'ลูกบ้านเข้าใช้งานและออกจากพื้นที่เรียบร้อยแล้ว'
  },
  [BookingStatus.LATE]: { 
    label: 'เช็คอินสาย', 
    actionLabel: 'แจ้งมาสาย',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    iconColor: 'text-orange-500',
    description: 'ลูกบ้านมาสายเกินระยะเวลาผ่อนปรน (Grace Period)'
  },
  [BookingStatus.NO_SHOW]: { 
    label: 'ไม่ปรากฏตัว', 
    actionLabel: 'แจ้ง No-Show',
    color: 'bg-red-50 text-red-700 border-red-200',
    iconColor: 'text-red-600',
    description: 'ลูกบ้านไม่มาเข้าใช้งานตามเวลาที่จองไว้'
  },
};
