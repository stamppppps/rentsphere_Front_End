import React from 'react';

interface InvoiceTotalProps {
  total: number;
}

const InvoiceTotal: React.FC<InvoiceTotalProps> = ({ total }) => {
  return (
    <div className="flex justify-end items-center gap-6 mt-8">
      <span className="text-gray-400 font-bold text-xl uppercase tracking-wider">รวม</span>
      <span className="text-[#8B5CF6] text-5xl font-bold tracking-tight">
        {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
};

export default InvoiceTotal;