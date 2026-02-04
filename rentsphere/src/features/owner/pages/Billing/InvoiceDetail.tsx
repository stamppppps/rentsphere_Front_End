import React, { useState, useEffect } from 'react';
import type { BillingItem } from './types';
import InvoiceHeader from './componentsinvoice/InvoiceHeader';
import InvoiceInfo from './componentsinvoice/InvoiceInfo';
import InvoiceTable from './componentsinvoice/InvoiceTable';
import InvoiceTotal from './componentsinvoice/InvoiceTotal';
import PaymentPanel from './componentsinvoice/PaymentPanel';
interface InvoiceDetailProps {
  item: BillingItem;
  onBack: () => void;
  onComplete: () => void;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ item, onBack, onComplete }) => {
  const [isPaid, setIsPaid] = useState(false);
  
  // Form States
  const [paymentAmount, setPaymentAmount] = useState<string>(item.estimatedTotal.toString());
  const [paymentMethod, setPaymentMethod] = useState<string>('เงินสด');
  const [typedDate, setTypedDate] = useState<string>('');
  
  // Initialize date to today on mount
  useEffect(() => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    setTypedDate(`${d}/${m}/${y}`);
  }, []);

  const isFormValid = 
    paymentAmount !== '' && 
    parseFloat(paymentAmount) > 0 && 
    paymentMethod !== '' && 
    typedDate.length >= 10;

  const handlePayment = () => {
    if (isFormValid) {
      setIsPaid(true);
    }
  };

  const handleReset = () => {
    setIsPaid(false);
    setPaymentAmount(item.estimatedTotal.toString());
    setPaymentMethod('เงินสด');
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    setTypedDate(`${d}/${m}/${y}`);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Left Panel: Invoice Details Container */}
      <div className="w-full xl:flex-grow bg-white rounded-[40px] shadow-sm border border-gray-100 p-6 sm:p-12 relative overflow-hidden">
        <InvoiceHeader onBack={onBack} />
        <InvoiceInfo item={item} isPaid={isPaid} />
        <InvoiceTable item={item} />
        <InvoiceTotal total={item.estimatedTotal} />
      </div>

      {/* Right Panel: Payment Panel Container */}
      <div className="w-full xl:w-[420px] flex-shrink-0">
        <PaymentPanel 
          isPaid={isPaid}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          typedDate={typedDate}
          setTypedDate={setTypedDate}
          handlePayment={handlePayment}
          isFormValid={isFormValid}
          estimatedTotal={item.estimatedTotal}
          onComplete={onComplete}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};

export default InvoiceDetail;