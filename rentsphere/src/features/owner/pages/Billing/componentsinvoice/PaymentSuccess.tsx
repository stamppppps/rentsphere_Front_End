import React from 'react';

interface PaymentSuccessProps {
  onComplete: () => void;
  onReset: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onComplete, onReset }) => {
  return (
    <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 text-center relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#F0FDF4] rounded-full opacity-50 blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="w-24 h-24 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto mb-6 shadow-sm shadow-green-100">
          <svg className="w-12 h-12 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-[#1E293B] font-bold text-2xl mb-2">บันทึกสำเร็จ</h3>
        <p className="text-gray-400 text-sm mb-8">รับชำระเงินเรียบร้อยแล้ว</p>

        <div className="space-y-4">
          <button className="w-full hover:bg-[#7C3AED] text-white py-4 !rounded-[20px] font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-purple-50"
            style={{ backgroundColor: "#A78BFA" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            ส่งใบแจ้งชำระเงินให้ผู้เช่า
          </button>
          
          <button className="w-full hover:bg-[#05B04B] text-white py-4 !rounded-[20px] font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-50"
            style={{ backgroundColor: "#07ac59" }}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 2C6.48 2 2 6.48 2 12c0 4.8 3.39 8.81 7.97 9.81.45.1.61-.19.61-.43v-1.52c-3.33.72-4.03-1.61-4.03-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.23-3.22-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.31 1.23.96-.27 1.99-.41 3.02-.41s2.06.14 3.02.41c2.3-1.55 3.31-1.23 3.31-1.23.66 1.65.24 2.87.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.47 5.92.43.37.81 1.1.81 2.22v3.29c0 .24.16.54.62.44A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z" />
            </svg>
            ส่งทาง Line
          </button>

          <button 
            onClick={onComplete}
            className="w-full !border-2 !border-[#8B5CF6] text-[#8B5CF6] py-4 !rounded-[20px] font-bold text-base flex items-center justify-center gap-3 transition-all hover:bg-purple-50"
          >
            เสร็จสิ้น
          </button>

          <button 
            onClick={onReset}
            className="text-gray-400 hover:text-[#8B5CF6] font-medium text-sm pt-2 transition-colors underline underline-offset-4"
          >
            ทำรายการใหม่
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;