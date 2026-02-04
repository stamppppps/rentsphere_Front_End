import type { BillingItem } from './types';

export const mockBillingData: BillingItem[] = [
  {
    id: '1',
    roomNumber: '101',
    status: 'ไม่ว่าง',
    waterMeter: { current: 10, previous: 0, totalUnits: 10 },
    elecMeter: { current: 165, previous: 120, totalUnits: 45 },
    rentAmount: 4000,
    estimatedTotal: 4495
  },
  {
    id: '2',
    roomNumber: '102',
    status: 'ไม่ว่าง',
    waterMeter: { current: 13, previous: 5, totalUnits: 8 },
    elecMeter: { current: 100, previous: 88, totalUnits: 12 },
    rentAmount: 4000,
    estimatedTotal: 4228
  },
  {
    id: '3',
    roomNumber: '201',
    status: 'ว่าง',
    rentAmount: 4000,
    estimatedTotal: 0
  },
  {
    id: '4',
    roomNumber: '202',
    status: 'ไม่ว่าง',
    waterMeter: { current: 10, previous: 10, totalUnits: 0 },
    elecMeter: { current: 45, previous: 45, totalUnits: 0 },
    rentAmount: 4000,
    estimatedTotal: 4000
  }
];
