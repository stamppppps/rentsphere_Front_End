export const GRACE_PERIOD_MINUTES = 15; 

/**
 * แปลงวันที่เป็นรูปแบบภาษาไทย
 */
export const formatThaiDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * เพิ่มหน่วย "น." ท้ายเวลา
 */
export const formatThaiTime = (timeStr: string) => {
  if (!timeStr) return '';
  return `${timeStr} น.`;
};

/**
 * ตรวจสอบว่ารายการจองนี้ "กำลังมาสาย" หรือยัง (Real-time Detection)
 */
export const checkIfLate = (bookingDate: string, startTime: string): boolean => {
  const now = new Date();
  const [hours, minutes] = startTime.split(':').map(Number);
  const bookingStart = new Date(bookingDate);
  bookingStart.setHours(hours, minutes, 0, 0);
  return now > bookingStart;
};

/**
 * ตรวจสอบว่า "เกินระยะผ่อนปรน" หรือยัง (Critical Late Candidate for No-Show)
 */
export const checkIfBeyondGracePeriod = (bookingDate: string, startTime: string): boolean => {
  const now = new Date();
  const [hours, minutes] = startTime.split(':').map(Number);
  const bookingStart = new Date(bookingDate);
  bookingStart.setHours(hours, minutes, 0, 0);

  const graceThreshold = new Date(bookingStart.getTime() + GRACE_PERIOD_MINUTES * 60000);
  return now > graceThreshold;
};

/**
 * ตรวจสอบว่า "หมดเวลาจองแล้ว" หรือยัง (Expired)
 * ระบบจะใช้ตรวจสอบเพื่อปิดรายการแบบ Soft Complete หากแอดมินไม่ได้ตัดสินใจ
 */
export const checkIfExpired = (bookingDate: string, endTime: string): boolean => {
  const now = new Date();
  const [hours, minutes] = endTime.split(':').map(Number);
  const bookingEnd = new Date(bookingDate);
  bookingEnd.setHours(hours, minutes, 0, 0);
  return now > bookingEnd;
};

/**
 * คำนวณว่า "สายไปแล้วกี่นาที"
 */
export const getMinutesLate = (bookingDate: string, startTime: string): number => {
  const now = new Date();
  const [hours, minutes] = startTime.split(':').map(Number);
  const bookingStart = new Date(bookingDate);
  bookingStart.setHours(hours, minutes, 0, 0);
  
  if (now <= bookingStart) return 0;
  
  const diffMs = now.getTime() - bookingStart.getTime();
  return Math.floor(diffMs / 60000);
};

/**
 * คำนวณว่า "ใช้งานเกินเวลาไปแล้วกี่นาที"
 */
export const getMinutesOver = (bookingDate: string, endTime: string): number => {
  const now = new Date();
  const [hours, minutes] = endTime.split(':').map(Number);
  const bookingEnd = new Date(bookingDate);
  bookingEnd.setHours(hours, minutes, 0, 0);
  
  if (now <= bookingEnd) return 0;
  
  const diffMs = now.getTime() - bookingEnd.getTime();
  return Math.floor(diffMs / 60000);
};
