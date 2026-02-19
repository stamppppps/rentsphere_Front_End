import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="mb-6 p-2 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-600">
        <ChevronLeft size={24} />
      </button>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">บิล / การชำระเงิน</h2>
        <p className="text-gray-400 font-medium">ยังไม่ได้สร้าง</p>
      </div>
    </div>
  );
};

export default BillingPage;
