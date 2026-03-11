export type RoomStatus = 'VACANT' | 'OCCUPIED';

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
  waterRate: number;
  electricRate: number;
  invoiceId?: string; // backend invoice id if exists
  invoiceNo?: string;
  invoiceStatus?: string;
  tenantName?: string;
  condoName?: string;
  condoAddress?: string;
  invoiceDate?: string; // created_at / recorded_at
  billingMonth?: string;
  dueDate?: string;
  items?: PreviewInvoiceItem[];
}

export interface PreviewInvoiceItem {
  itemType: string;
  itemName: string;
  amount: number;
  condoChargeId?: string | null;
  extraChargeTemplateId?: string | null;
  meterReadingId?: string | null;
  facilityBookingId?: string | null;
}

