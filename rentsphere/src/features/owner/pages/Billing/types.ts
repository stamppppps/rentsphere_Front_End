export type RoomStatus = 'ว่าง' | 'ไม่ว่าง';

export interface MeterData {
  current: number;
  previous: number;
  totalUnits: number;
}

export interface BillingItem {
  id: string;
  roomNumber: string;
  status: RoomStatus;
  waterMeter?: MeterData;
  elecMeter?: MeterData;
  rentAmount: number;
  estimatedTotal: number;
  isPaid?: boolean;
  /* — added for backend integration — */
  waterRate: number;
  electricRate: number;
  invoiceId?: string;      // backend invoice id if exists
  tenantName?: string;
  condoName?: string;
  condoAddress?: string;
  invoiceDate?: string;     // created_at / recorded_at
}