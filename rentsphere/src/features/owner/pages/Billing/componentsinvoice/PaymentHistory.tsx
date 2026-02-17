import React from 'react';

interface PaymentHistoryProps {
  amount: string;
  date: string;
  method: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ amount, date, method }) => {
  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
       <h4 className="text-[#1E293B] font-bold text-lg mb-6">รายการรับเงิน</h4>
       
       <div className="bg-[#F8FAFC] rounded-2xl p-4 flex items-center justify-between group">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#22C55E]">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
            </div>
            <div>
              <div className="text-[#1E293B] font-bold text-base leading-tight">
                {parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-gray-400 text-xs font-normal ml-1">บาท</span>
              </div>
              <div className="text-gray-400 text-[11px] mt-0.5">{date} - {method}</div>
            </div>
         </div>
         
         <button className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
         </button>
       </div>
    </div>
  );
};

export default PaymentHistory;