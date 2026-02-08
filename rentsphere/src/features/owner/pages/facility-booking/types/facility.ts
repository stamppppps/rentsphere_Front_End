
/**
 * Facility Types and Enums
 * This serves as the core contract between the frontend and the backend.
 * Property ordering is maintained to ensure UI consistency.
 */

export enum FacilityStatus {
  AVAILABLE = 'available', // พร้อมให้บริการ
  MAINTENANCE = 'maintenance', // ปิดปรับปรุง
  CLOSED = 'closed' // ปิดชั่วคราว
}

export enum FacilityType {
  SPORT = 'sport', // กีฬาและสุขภาพ
  RELAX = 'relax', // พักผ่อนหย่อนใจ
  WORKING = 'working', // พื้นที่ทำงาน
  OUTDOOR = 'outdoor', // พื้นที่กลางแจ้ง
  ALL = 'all' // สำหรับการฟิลเตอร์เท่านั้น
}

/**
 * Interface representing a Facility managed by the owner.
 * Ensures that all UI components (Card, Header, Settings) have access to stable data.
 */
export interface Facility {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  
  // Categorization & Visibility
  type: FacilityType;
  status: FacilityStatus;
  
  // Operational Rules
  capacity: number;         // ความจุสูงสุดต่อรอบ
  openTime: string;         // 'HH:mm'
  closeTime: string;        // 'HH:mm'
  durationPerSession: number; // ระยะเวลาต่อรอบ (ชั่วโมง)
  
  // Business Logic
  isAutoApprove: boolean;   // ระบบอนุมัติทันทีหรือไม่
  
  // Metadata
  tags: string[];           // ป้ายกำกับสำหรับค้นหา
  location?: string;        // ตำแหน่ง (เช่น ชั้น 5, โซน A)
  lastMaintained?: string;  // วันที่บำรุงรักษาล่าสุด
}
