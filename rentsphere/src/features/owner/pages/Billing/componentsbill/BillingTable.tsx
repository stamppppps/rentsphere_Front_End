import { useState } from 'react';
import type { BillingItem } from '../types';
import BillingRow from './BillingRow';

interface BillingTableProps {
  data: BillingItem[];
  onSelect: (item: BillingItem) => void;
}

const PER_PAGE = 10;

export default function BillingTable({ data, onSelect }: BillingTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / PER_PAGE));
  const pageData = data.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const startIdx = data.length > 0 ? (page - 1) * PER_PAGE + 1 : 0;
  const endIdx = Math.min(page * PER_PAGE, data.length);

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
            {pageData.map((item) => (
              <BillingRow key={item.id} item={item} onSelect={onSelect} />
            ))}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400 font-bold">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="px-8 py-6 !border-t !border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-[#94A3B8] text-sm">
          แสดง {startIdx} ถึง {endIdx} จาก {data.length} รายการ
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              aria-label="หน้าก่อนหน้า"
              className="w-9 h-9 flex items-center justify-center !rounded-xl !border !border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 flex items-center justify-center !rounded-xl text-sm font-bold transition-colors ${page === p
                  ? '!bg-[#8B5CF6] text-white shadow-sm shadow-purple-200'
                  : '!border !border-gray-100 text-[#64748B] font-medium hover:bg-gray-50'
                  }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              aria-label="หน้าถัดไป"
              className="w-9 h-9 flex items-center justify-center !rounded-xl !border !border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}