import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const ParcelPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="mb-6 p-2 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-600">
        <ChevronLeft size={24} />
      </button>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-purple-500 mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">พัสดุ</h2>
        <p className="text-gray-400 font-medium">ยังไม่ได้สร้าง</p>
      </div>
    </div>
  );
};

export default ParcelPage;
