import React from 'react';
import type { BillingItem } from '../types';

interface InvoiceTableProps {
  item: BillingItem;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ item }) => {
  const waterCost = item.waterMeter ? item.waterMeter.totalUnits * item.waterRate : 0;
  const elecCost = item.elecMeter ? item.elecMeter.totalUnits * item.electricRate : 0;

  const previewItems = Array.isArray(item.items) ? item.items : [];

  const fallbackRows = [
    {
      key: "RENT",
      label: "ค่าเช่าห้อง/Rent",
      unitPrice: item.rentAmount,
      amount: item.rentAmount,
    },
    ...(item.waterMeter
      ? [
          {
            key: "WATER",
            label: `ค่าน้ำ/Water : ${item.waterMeter.totalUnits} หน่วย`,
            subLabel: `(${item.waterMeter.previous} - ${item.waterMeter.current})`,
            unitPrice: item.waterRate,
            amount: waterCost,
          },
        ]
      : []),
    ...(item.elecMeter
      ? [
          {
            key: "ELECTRIC",
            label: `ค่าไฟ/Electricity : ${item.elecMeter.totalUnits} หน่วย`,
            subLabel: `(${item.elecMeter.previous} - ${item.elecMeter.current})`,
            unitPrice: item.electricRate,
            amount: elecCost,
          },
        ]
      : []),
  ];

  const rows =
    previewItems.length > 0
      ? previewItems.map((row) => {
          const type = String(row.itemType || "").toUpperCase();

          if (type === "WATER") {
            return {
              key: `${type}-${row.itemName}`,
              label: row.itemName || "ค่าน้ำ/Water",
              subLabel: item.waterMeter
                ? `(${item.waterMeter.previous} - ${item.waterMeter.current})`
                : undefined,
              unitPrice: item.waterRate,
              amount: Number(row.amount ?? 0),
            };
          }

          if (type === "ELECTRIC") {
            return {
              key: `${type}-${row.itemName}`,
              label: row.itemName || "ค่าไฟ/Electricity",
              subLabel: item.elecMeter
                ? `(${item.elecMeter.previous} - ${item.elecMeter.current})`
                : undefined,
              unitPrice: item.electricRate,
              amount: Number(row.amount ?? 0),
            };
          }

          if (type === "RENT") {
            return {
              key: `${type}-${row.itemName}`,
              label: row.itemName || "ค่าเช่าห้อง/Rent",
              unitPrice: item.rentAmount,
              amount: Number(row.amount ?? item.rentAmount ?? 0),
            };
          }

          return {
            key: `${type}-${row.itemName}`,
            label: row.itemName || "ค่าบริการเพิ่มเติม",
            unitPrice: Number(row.amount ?? 0),
            amount: Number(row.amount ?? 0),
          };
        })
      : fallbackRows;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px] mb-8">
        <thead>
          <tr className="text-gray-400 text-xs font-semibold uppercase tracking-wider text-left border-b border-gray-100 pb-4">
            <th className="py-4 font-semibold w-12">#</th>
            <th className="py-4 font-semibold">รายการ</th>
            <th className="py-4 font-semibold text-right">ราคาต่อหน่วย</th>
            <th className="py-4 font-semibold text-right">ยอดเงิน</th>
          </tr>
        </thead>
        <tbody className="text-[#1E293B] text-sm">
          {rows.map((row, index) => (
            <tr key={row.key || index} className="border-b border-gray-50/50">
              <td className="py-5">{index + 1}</td>
              <td className="py-5 font-medium">
                {row.label}
                {row.subLabel && (
                  <span className="text-gray-400 font-normal ml-2">{row.subLabel}</span>
                )}
              </td>
              <td className="py-5 text-right">
                {Number(row.unitPrice ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td className="py-5 text-right font-bold">
                {Number(row.amount ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;