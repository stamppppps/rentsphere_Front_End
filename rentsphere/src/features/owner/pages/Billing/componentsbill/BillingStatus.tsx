import React from 'react';
import type { PaymentStatus } from '../types';

interface BillingStatusProps {
  paymentStatus: PaymentStatus;
}

const statusConfig: Record<PaymentStatus, { bg: string; text: string; dot: string; label: string }> = {
  'ชำระแล้ว':   { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'ชำระแล้ว' },
  'รอการชำระ':  { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-500', label: 'รอการชำระ' },
  'ค้างชำระ':   { bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-500',    label: 'ค้างชำระ' },
};

const BillingStatus: React.FC<BillingStatusProps> = ({ paymentStatus }) => {
  const cfg = statusConfig[paymentStatus] ?? statusConfig['ค้างชำระ'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default BillingStatus;
