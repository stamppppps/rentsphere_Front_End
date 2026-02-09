import type { ReactNode } from 'react';
export interface StaffMember {
  id: number;
  name: string;
  role: string;
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

export interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
}

export interface StatCardProps {
  label: string;
  value: number;
  subLabel?: string;
  colorClass?: string;
}
