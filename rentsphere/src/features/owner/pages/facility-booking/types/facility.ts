export const FacilityStatus = {
  AVAILABLE: 'available', // พร้อมให้บริการ
  MAINTENANCE: 'maintenance', // ปิดปรับปรุง
  CLOSED: 'closed', // ปิดชั่วคราว
} as const;

export type FacilityStatus = (typeof FacilityStatus)[keyof typeof FacilityStatus];

export const FacilityType = {
  SPORT: 'sport', // กีฬาและสุขภาพ
  RELAX: 'relax', // พักผ่อนหย่อนใจ
  WORKING: 'working', // พื้นที่ทำงาน
  OUTDOOR: 'outdoor', // พื้นที่กลางแจ้ง
  ALL: 'all', // สำหรับการฟิลเตอร์เท่านั้น
} as const;

export type FacilityType = (typeof FacilityType)[keyof typeof FacilityType];

export interface Facility {
  id: string;
  name: string;
  description: string;
  imageUrl: string;

  // Categorization & Visibility
  type: FacilityType;
  status: FacilityStatus;

  // Operational Rules
  capacity: number; // ความจุสูงสุดต่อรอบ
  openTime: string; // 'HH:mm'
  closeTime: string; // 'HH:mm'
  durationPerSession: number; // ระยะเวลาต่อรอบ (ชั่วโมง)

  // Business Logic
  isAutoApprove: boolean; // ระบบอนุมัติทันทีหรือไม่

  // Metadata
  tags: string[]; // ป้ายกำกับสำหรับค้นหา
  location?: string; // ตำแหน่ง (เช่น ชั้น 5, โซน A)
  lastMaintained?: string; // วันที่บำรุงรักษาล่าสุด
}
