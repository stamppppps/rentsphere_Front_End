export type RepairStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface RepairRequest {
  id: string;
  issueType: string;
  roomNumber: string;
  location: string;
  details: string;
  images: string[];
  status: RepairStatus;
  createdAt: string;
  updatedAt: string;
}

export const ISSUE_TYPES = [
  'ไฟฟ้า (Electricity)',
  'ประปา (Plumbing)',
  'เครื่องปรับอากาศ (Air Conditioning)',
  'เฟอร์นิเจอร์ (Furniture)',
  'โครงสร้างห้อง (Structure)',
  'อื่นๆ (Others)'
];
