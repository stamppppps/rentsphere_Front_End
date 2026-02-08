export const BookingStatus = {
  PENDING: 'pending', // รอการตรวจสอบ/อนุมัติจากแอดมิน
  APPROVED: 'approved', // อนุมัติแล้ว รอเข้าใช้งาน
  REJECTED: 'rejected', // ถูกปฏิเสธ (พร้อมเหตุผล)
  CANCELLED: 'cancelled', // ยกเลิกโดยลูกบ้านหรือแอดมิน
  COMPLETED: 'completed', // เข้าใช้งานและเสร็จสิ้นตามเวลา
  LATE: 'late', // เข้าใช้งานแต่มาสายกว่า Grace Period
  NO_SHOW: 'no_show', // ไม่มาเข้าใช้งานตามเวลาที่กำหนด
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export interface Booking {
  // Identification
  id: string;
  facilityId: string;
  facilityName: string;

  // User Context
  userId: string;
  userName: string;
  unit: string; // เลขที่ห้อง/ยูนิต (e.g., 'A-101')
  userAvatar?: string;
  userPhone?: string; // เบอร์ติดต่อกรณีฉุกเฉิน

  // Schedule
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'

  // Current State
  status: BookingStatus;
  participants: number; // จำนวนผู้ใช้งานจริง

  // Contextual Data (Explains the "Why")
  reason?: string; // วัตถุประสงค์การจองจากลูกบ้าน
  rejectionReason?: string; // เหตุผลกรณีแอดมินปฏิเสธ
  cancellationReason?: string; // เหตุผลกรณียกเลิก
  adminNotes?: string; // หมายเหตุภายในสำหรับทีมแอดมิน

  // Operational Timestamps
  checkInTime?: string; // ISO Timestamp เมื่อแอดมินกดเช็คอิน
  checkOutTime?: string; // ISO Timestamp เมื่อจบการใช้งาน
  createdAt: string; // ISO Timestamp เมื่อสร้างรายการ
  updatedAt?: string; // ISO Timestamp เมื่อมีการเปลี่ยนสถานะล่าสุด

  // Business Logic Flags
  isAutoApproved: boolean; // รายการนี้ผ่านระบบ Auto-Approve หรือไม่
}
