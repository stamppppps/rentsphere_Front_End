import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="mb-6 p-2 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-600">
        <ChevronLeft size={24} />
      </button>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">จองส่วนกลาง</h2>
        <p className="text-gray-400 font-medium">ยังไม่ได้สร้าง</p>
      </div>
    </div>
  );
};

export default BookingPage;
