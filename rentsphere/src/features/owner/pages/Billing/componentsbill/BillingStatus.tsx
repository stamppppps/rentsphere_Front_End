import React from 'react';
import type { RoomStatus } from '../types';

interface BillingStatusProps {
  status: RoomStatus;
}

const BillingStatus: React.FC<BillingStatusProps> = ({ status }) => {
  const isOccupied = status === 'OCCUPIED';

  return (
    <span
      className={`px-4 py-1 rounded-full text-sm font-medium ${
        isOccupied ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#DCFCE7] text-[#16A34A]'
      }`}
    >
      {isOccupied ? 'ไม่ว่าง' : 'ว่าง'}
    </span>
  );
};

export default BillingStatus;
