export type RoomStatus = "ว่าง" | "ไม่ว่าง";

export interface MeterData {
  current: number;
  previous: number;
  totalUnits: number;
}

export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

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

  waterMeter?: MeterData;
  elecMeter?: MeterData;

  rentAmount: number;
  estimatedTotal: number;

  waterRate: number;
  electricRate: number;

  invoiceId?: string;
  invoiceNo?: string;
  invoiceStatus?: InvoiceStatus;
  isPaid?: boolean;

  tenantName?: string;
  condoName?: string;
  condoAddress?: string;

  invoiceDate?: string;
  billingMonth?: string;
  dueDate?: string;

  items?: PreviewInvoiceItem[];
}