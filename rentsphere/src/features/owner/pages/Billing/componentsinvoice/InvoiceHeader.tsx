import React from 'react';

interface InvoiceHeaderProps {
  onBack: () => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="text-gray-400 hover:text-purple-600 transition-colors p-1"
          aria-label="กลับ"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[#1E293B] text-2xl sm:text-3xl font-bold">ใบแจ้งหนี้ / Invoice</h1>
      </div>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-800 transition shadow-sm"
          style={{ backgroundColor: "#0F172A" }}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          พิมพ์
        </button>
        <button className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition shadow-sm"
          style={{ backgroundColor: "#460a0a" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          ดาวน์โหลด
        </button>
      </div>
    </div>
  );
};

export default InvoiceHeader;