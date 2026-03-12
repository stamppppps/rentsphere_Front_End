import React from 'react';
import type { BillingItem } from '../types';

interface InvoiceInfoProps {
  item: BillingItem;
  isPaid: boolean;
}

const InvoiceInfo: React.FC<InvoiceInfoProps> = ({ item, isPaid }) => {
  // Dynamic date
  const dateStr = item.invoiceDate
    ? new Date(item.invoiceDate).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok", day: "2-digit", month: "2-digit", year: "numeric" })
    : new Date().toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok", day: "2-digit", month: "2-digit", year: "numeric" });

  const invoiceNo = item.invoiceId
    ? `INV-${item.invoiceId.slice(-8).toUpperCase()}`
    : `DRAFT-${item.roomNumber}`;

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-6 mb-12">
      <div className="space-y-2">
        <h2 className="text-blue-600 text-xl font-bold">{item.condoName || "RentSphere"}</h2>
        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
          {item.condoAddress || ""}<br />
          {item.tenantName ? `ผู้เช่า: ${item.tenantName}` : ""}
        </p>
      </div>
      <div className="text-left sm:text-right space-y-1">
        <div className="flex items-center sm:justify-end gap-2 mb-2">
          <span className="text-gray-400 text-sm">สถานะ:</span>
          {(() => {
            const ps = item.paymentStatus;
            if (isPaid || item.isPaid || ps === 'ชำระแล้ว')
              return <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-md font-bold">ชำระแล้ว</span>;
            if (ps === 'รอการชำระ')
              return <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-md font-bold">รอการชำระ</span>;
            return <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-md font-bold">ค้างชำระ</span>;
          })()}
        </div>
        <div className="text-sm">
          <span className="text-gray-400 font-medium">เลขที่:</span> <span className="text-[#1E293B] font-semibold">{invoiceNo}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-400 font-medium">ห้อง:</span> <span className="text-[#1E293B] font-bold">{item.roomNumber}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-400 font-medium">วันที่:</span> <span className="text-[#1E293B] font-semibold">{dateStr}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceInfo;