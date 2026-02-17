import React from 'react';
import { Headset } from 'lucide-react';

const ContactJuristicCard: React.FC = () => {
  return (
    <div className="px-6 mt-6">
      <button className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-6 flex items-center justify-between shadow-xl shadow-blue-100 border border-white hover:bg-blue-50 transition-colors group">
        <span className="text-xl font-bold text-gray-700">ติดต่อนิติ</span>
        <div className="relative">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Headset size={32} />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
      </button>
    </div>
  );
};

export default ContactJuristicCard;
