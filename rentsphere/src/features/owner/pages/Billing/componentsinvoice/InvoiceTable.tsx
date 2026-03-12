import React from 'react';
import type { BillingItem } from '../types';

interface InvoiceTableProps {
  item: BillingItem;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ item }) => {
  const waterCost = item.waterMeter ? item.waterMeter.totalUnits * item.waterRate : 0;
  const elecCost = item.elecMeter ? item.elecMeter.totalUnits * item.electricRate : 0;

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
          <tr className="border-b border-gray-50/50">
            <td className="py-5">1</td>
            <td className="py-5 font-medium">ค่าเช่าห้อง/Rent</td>
            <td className="py-5 text-right">{item.rentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td className="py-5 text-right font-bold">{item.rentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
          {item.waterMeter && (
            <tr className="border-b border-gray-50/50">
              <td className="py-5">2</td>
              <td className="py-5 font-medium">
                ค่าน้ำ/Water : {item.waterMeter.totalUnits} หน่วย
                <span className="text-gray-400 font-normal ml-2">({item.waterMeter.previous} - {item.waterMeter.current})</span>
              </td>
              <td className="py-5 text-right">{item.waterRate.toFixed(2)}</td>
              <td className="py-5 text-right font-bold">{waterCost.toFixed(2)}</td>
            </tr>
          )}
          {item.elecMeter && (
            <tr className="border-b border-gray-50/50">
              <td className="py-5">3</td>
              <td className="py-5 font-medium">
                ค่าไฟ/Electricity : {item.elecMeter.totalUnits} หน่วย
                <span className="text-gray-400 font-normal ml-2">({item.elecMeter.previous} - {item.elecMeter.current})</span>
              </td>
              <td className="py-5 text-right">{item.electricRate.toFixed(2)}</td>
              <td className="py-5 text-right font-bold">{elecCost.toFixed(2)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;