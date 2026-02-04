import React from 'react';
import type { BillingItem } from '../types';
import BillingRow from './BillingRow';

interface BillingTableProps {
  data: BillingItem[];
  onSelect: (item: BillingItem) => void;
}

const BillingTable: React.FC<BillingTableProps> = ({ data, onSelect }) => {
  return (
    <div className="!bg-white !rounded-3xl !shadow-sm !border !border-gray-100 !overflow-hidden">
      <div className="!overflow-x-auto">
        <table className="!w-full !text-left !border-collapse">
          <thead>
            <tr className="!border-b !border-gray-100">
              <th className="px-6 py-5 text-[#94A3B8] font-semibold text-sm">ห้อง</th>
              <th className="px-6 py-5 text-[#94A3B8] font-semibold text-sm">สถานะ</th>
              <th className="px-6 py-5 text-[#94A3B8] font-semibold text-sm">มิเตอร์น้ำ (หน่วย)</th>
              <th className="px-6 py-5 text-[#94A3B8] font-semibold text-sm">มิเตอร์ไฟ (หน่วย)</th>
              <th className="px-6 py-5 text-[#94A3B8] font-semibold text-sm">ยอดรวม</th>
              <th className="px-6 py-5 text-[#94A3B8] font-semibold text-sm text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <BillingRow key={item.id} item={item} onSelect={onSelect} />
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-8 py-6 !border-t !border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-[#94A3B8] text-sm">แสดง 1 ถึง 10 จาก 24 รายการ</span>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center !rounded-xl !border !border-gray-100 text-gray-400 hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="w-9 h-9 flex items-center justify-center !rounded-xl !bg-[#8B5CF6] text-white text-sm font-bold shadow-sm shadow-purple-200">1</button>
          <button className="w-9 h-9 flex items-center justify-center !rounded-xl !border !border-gray-100 text-[#64748B] text-sm font-medium hover:bg-gray-50 transition-colors">2</button>
          <button className="w-9 h-9 flex items-center justify-center !rounded-xl !border !border-gray-100 text-[#64748B] text-sm font-medium hover:bg-gray-50 transition-colors">3</button>
          <button className="w-9 h-9 flex items-center justify-center !rounded-xl !border !border-gray-100 text-gray-400 hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingTable;