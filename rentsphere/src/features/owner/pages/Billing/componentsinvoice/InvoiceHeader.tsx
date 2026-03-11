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
    
      </div>
    </div>
  );
};

export default InvoiceHeader;