export interface StaffMember {
  id: number;
  name: string;
  role: Role;
  phone: string;
  email: string;
  properties: string[];
}

export const Role = {
  OWNER: 'เจ้าของ',
  ADMIN: 'แอดมิน',
  STAFF: 'เจ้าหน้าที่ทั่วไป',
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface ChartDataPoint {
  month: string;
  value: number;
}

export interface StatCardProps {
  label: string;
  value: number;
  subLabel?: string;
  colorClass?: string;
}

export interface RoomReading {
  id: string;
  roomNo: string;
  status: 'occupied' | 'vacant';
  previousReading: number;
  currentReading: number | '';
  usage: number;
}

export type MeterType = 'water' | 'electricity';

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  hasSubmenu?: boolean;
}

// Payment Notification Types
export type PaymentStatus = 'ค้างชำระ' | 'ส่งแล้ว' | 'ยังไม่ส่ง' | 'ชำระแล้ว';

export interface PaymentRecord {
  id: number;
  invoiceNo: string;
  room: string;
  tenant: string;
  dueDate?: string;
  amount: number;
  status: PaymentStatus;
  autoNotify: boolean;
}

export interface PaymentSummary {
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  paidPercentage: number;
  unpaidRooms: number;
}

// Report Types
export interface ReportRow {
  room: string;
  invoiceNo: string;
  roomFee: number;
  water: number;
  electric: number;
  other: number;
  pending: number;
  total: number;
  highlight?: boolean;
}

export interface ReportSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  totalRooms: number;
}

export interface ReportTotals {
  roomFee: number;
  water: number;
  electric: number;
  other: number;
  pending: number;
  total: number;
}