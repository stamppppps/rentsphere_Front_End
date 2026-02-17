import React from 'react';
import PaymentForm from './PaymentForm';
import PaymentSuccess from './PaymentSuccess';
import PaymentHistory from './PaymentHistory';

interface PaymentPanelProps {
  isPaid: boolean;
  paymentAmount: string;
  setPaymentAmount: (val: string) => void;
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  typedDate: string;
  setTypedDate: (val: string) => void;
  handlePayment: () => void;
  isFormValid: boolean;
  estimatedTotal: number;
  onComplete: () => void;
  onReset: () => void;
}

const PaymentPanel: React.FC<PaymentPanelProps> = ({
  isPaid,
  paymentAmount, setPaymentAmount,
  paymentMethod, setPaymentMethod,
  typedDate, setTypedDate,
  handlePayment,
  isFormValid,
  estimatedTotal,
  onComplete,
  onReset
}) => {
  return (
    <div className="lg:w-[420px] flex flex-col gap-6">
      {!isPaid ? (
        <PaymentForm 
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          typedDate={typedDate}
          setTypedDate={setTypedDate}
          handlePayment={handlePayment}
          isFormValid={isFormValid}
          estimatedTotal={estimatedTotal}
        />
      ) : (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          <PaymentSuccess onComplete={onComplete} onReset={onReset} />
          <PaymentHistory amount={paymentAmount} date={typedDate} method={paymentMethod} />
        </div>
      )}
    </div>
  );
};

export default PaymentPanel;