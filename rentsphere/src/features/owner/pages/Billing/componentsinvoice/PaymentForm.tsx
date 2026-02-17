import React, { useRef } from 'react';

interface PaymentFormProps {
  paymentAmount: string;
  setPaymentAmount: (val: string) => void;
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  typedDate: string;
  setTypedDate: (val: string) => void;
  handlePayment: () => void;
  isFormValid: boolean;
  estimatedTotal: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentAmount, setPaymentAmount,
  paymentMethod, setPaymentMethod,
  typedDate, setTypedDate,
  handlePayment,
  isFormValid,
  estimatedTotal
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const triggerDatePicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    if (dateVal) {
      const [y, m, d] = dateVal.split('-');
      setTypedDate(`${d}/${m}/${y}`);
    }
  };

  const handleTextDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^\d/]/g, '');
    if (value.length === 2 && !value.includes('/')) value += '/';
    else if (value.length === 5 && value.split('/').length === 2) value += '/';
    const parts = value.split('/');
    if (parts[2] && parts[2].length > 4) {
      parts[2] = parts[2].slice(0, 4);
      value = parts.join('/');
    }
    if (value.length <= 10) setTypedDate(value);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Outstanding Balance */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex justify-between items-center">
        <span className="text-[#1E293B] font-bold text-lg">ค้างชำระ:</span>
        <div className="flex items-baseline">
          <span className="text-[#EF4444] text-3xl font-bold">
            {estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-gray-300 ml-2 font-medium">บาท</span>
        </div>
      </div>

      {/* Recording Form */}
      <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] flex items-center justify-center text-[#8B5CF6]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-[#1E293B] font-bold text-xl">รับเงิน</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[#64748B] text-sm font-medium mb-2.5">
              จำนวนเงินที่ชำระ <span className="text-red-400">* จำเป็น</span>
            </label>
            <input 
              type="number" 
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="ระบุจำนวนเงิน"
              className="w-full bg-[#F8FAFC] border-0 rounded-2xl py-4 px-6 text-[#1E293B] font-bold text-lg focus:ring-2 focus:ring-purple-100 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-[#64748B] text-sm font-medium mb-2.5">
              ชำระเงินโดย <span className="text-red-400">* จำเป็น</span>
            </label>
            <div className="relative">
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="appearance-none w-full bg-[#F8FAFC] border-0 rounded-2xl py-4 px-6 text-[#1E293B] font-medium focus:ring-2 focus:ring-purple-100 transition-all outline-none pr-12 cursor-pointer"
              >
                <option value="เงินสด">เงินสด</option>
                <option value="เงินโอน">เงินโอน</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[#64748B] text-sm font-medium mb-2.5">
              วันที่รับเงิน <span className="text-red-400">* จำเป็น</span>
            </label>
            <div className="relative bg-[#F8FAFC] rounded-2xl flex items-center min-h-[64px] transition-all focus-within:ring-2 focus-within:ring-purple-100 overflow-hidden">
              <button 
                onClick={triggerDatePicker}
                className="pl-5 pr-4 h-full flex items-center group cursor-pointer"
                type="button"
              >
                <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              <input 
                ref={dateInputRef}
                type="date" 
                onChange={handlePickerChange}
                className="absolute opacity-0 pointer-events-none w-0 h-0"
                tabIndex={-1}
              />

              <input 
                type="text"
                placeholder="วว/ดด/ปปปป"
                value={typedDate}
                onChange={handleTextDateChange}
                className="flex-grow bg-transparent border-0 py-4 pr-6 text-[#1E293B] font-bold text-lg focus:ring-0 outline-none"
              />
            </div>
          </div>

          <button 
            onClick={handlePayment}
            disabled={!isFormValid}
            className={`w-full py-5 !rounded-[24px] font-bold text-lg transition-all transform mt-4 shadow-lg ${
              isFormValid 
              ? 'text-white shadow-purple-100 hover:scale-[1.01] active:scale-[0.99] hover:opacity-90' 
              : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-80 shadow-none'
            }`}
            style={{ backgroundColor: isFormValid ? "#8B5CF6" : "#F3F4F6" }}
          >
            บันทึกการชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;