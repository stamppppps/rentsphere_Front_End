import React from 'react';
import type { Resident } from '@/features/tenant/pages/home/types/home.types';

interface ResidentCardProps {
  resident: Resident;
}

const ResidentCard: React.FC<ResidentCardProps> = ({ resident }) => {
  return (
    <div className="p-6 pt-4">
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl shadow-blue-100 border border-white relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="relative z-10">
          <p className="text-blue-500 font-semibold text-xs tracking-wider uppercase mb-1">ยินดีต้อนรับ</p>
          <h2 className="text-2xl font-bold text-gray-800 leading-tight mb-4">{resident.name}</h2>
          <div className="space-y-0.5 border-t border-gray-100 pt-3">
            <p className="text-gray-700 font-medium text-sm">{resident.condo}</p>
            <p className="text-gray-400 text-xs">{resident.unit}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentCard;
