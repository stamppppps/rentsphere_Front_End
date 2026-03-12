export type RoomStatus = 'ว่าง' | 'ไม่ว่าง';

/** Payment status derived from invoice state */
export type PaymentStatus = 'ชำระแล้ว' | 'รอการชำระ' | 'ค้างชำระ';

export interface MeterData {
  current: number;
  previous: number;
  totalUnits: number;
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

export interface BillingItem {
  id: string;
  roomNumber: string;
  status: RoomStatus;
  paymentStatus: PaymentStatus;
  waterMeter?: MeterData;
  elecMeter?: MeterData;
  rentAmount: number;
  estimatedTotal: number;
  isPaid?: boolean;

  waterRate: number;
  electricRate: number;

  invoiceId?: string;
  invoiceNo?: string;
  invoiceStatus?: string;
  tenantName?: string;
  condoName?: string;
  condoAddress?: string;
  invoiceDate?: string;
  billingMonth?: string;
  dueDate?: string;

  items?: PreviewInvoiceItem[]; // ✅ ต้องมีอันนี้
}