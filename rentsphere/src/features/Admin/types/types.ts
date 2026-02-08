export interface StaffMember {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  properties: string[];
}

export enum Role {
  OWNER = 'เจ้าของ',
  ADMIN = 'แอดมิน',
  STAFF = 'เจ้าหน้าที่ทั่วไป'
}

export interface ChartDataPoint {
  month: string;
  value: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

export interface StatCardProps {
  label: string;
  value: number;
  subLabel?: string;
  colorClass?: string;
}
