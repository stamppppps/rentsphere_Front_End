import React from 'react';
import type { BillingItem } from '../types';

interface InvoiceInfoProps {
  item: BillingItem;
  isPaid: boolean;
}

const InvoiceInfo: React.FC<InvoiceInfoProps> = ({ item, isPaid }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-6 mb-12">
      <div className="space-y-2">
        <h2 className="text-[#8B5CF6] text-xl font-bold">เดอะโกล3BBTOT</h2>
        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
          123 หมู่บ้านเกษตร เขตศรีราชา ชลบุรี<br />
          โทร: 088-789-6543
        </p>
      </div>
      <div className="text-left sm:text-right space-y-1">
        <div className="flex items-center sm:justify-end gap-2 mb-2">
          <span className="text-gray-400 text-sm">สถานะ:</span>
          {isPaid ? (
            <span className="bg-[#DCFCE7] text-[#22C55E] text-xs px-2 py-0.5 rounded-md font-bold">ชำระแล้ว</span>
          ) : (
            <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-md font-bold">ค้างชำระ</span>
          )}
        </div>
        <div className="text-sm">
          <span className="text-gray-400 font-medium">เลขที่:</span> <span className="text-[#1E293B] font-semibold">12026010002</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-400 font-medium">ห้อง:</span> <span className="text-[#1E293B] font-bold">{item.roomNumber}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-400 font-medium">วันที่:</span> <span className="text-[#1E293B] font-semibold">10/01/2026</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceInfo;