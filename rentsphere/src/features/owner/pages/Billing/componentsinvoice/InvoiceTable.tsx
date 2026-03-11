import React from "react";
import type { BillingItem } from "../types";

interface InvoiceTableProps {
  item: BillingItem;
}

function formatMoney(num: number) {
  return num.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ item }) => {
  const rows = item.items || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px] mb-8">
        <thead>
          <tr className="text-gray-400 text-xs font-semibold uppercase tracking-wider text-left border-b border-gray-100">
            <th className="py-4 w-12">#</th>
            <th className="py-4">รายการ</th>
            <th className="py-4 text-right">ยอดเงิน</th>
          </tr>
        </thead>

        <tbody className="text-[#1E293B] text-sm">
          {rows.map((row, idx) => (
            <tr key={`${row.itemType}-${idx}`} className="border-b border-gray-50/50">
              <td className="py-5">{idx + 1}</td>
              <td className="py-5 font-medium">{row.itemName}</td>
              <td className="py-5 text-right font-bold">
                {formatMoney(row.amount)}
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="py-10 text-center text-gray-400">
                ไม่มีรายการ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;