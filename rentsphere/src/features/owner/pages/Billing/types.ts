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
}