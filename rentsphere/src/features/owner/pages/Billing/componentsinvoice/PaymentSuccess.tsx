import React, { useState } from 'react';
import './PaymentSuccess.css';

interface PaymentSuccessProps {
  onComplete: () => void;
  onReset: () => void;
  onNotifyLine?: () => Promise<void>;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onComplete, onReset, onNotifyLine }) => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");

  const handleNotify = async () => {
    if (!onNotifyLine || sending || sent) return;
    setSending(true);
    setSendError("");
    try {
      await onNotifyLine();
      setSent(true);
    } catch (e: any) {
      setSendError(e?.message || "ส่งไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  };

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

        {sendError && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm font-bold rounded-xl">{sendError}</div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleNotify}
            disabled={sending || sent || !onNotifyLine}
            className={`payment-success__notify-btn w-full text-white py-4 !rounded-[20px] font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-purple-50 ${sent ? 'opacity-60 cursor-not-allowed' : sending ? 'opacity-80' : 'hover:bg-[#7C3AED]'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {sent ? "✅ ส่งแล้ว" : sending ? "กำลังส่ง..." : "ส่งใบแจ้งชำระเงินให้ผู้เช่า"}
          </button>

          <button
            onClick={handleNotify}
            disabled={sending || sent || !onNotifyLine}
            className={`payment-success__line-btn w-full text-white py-4 !rounded-[20px] font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-50 ${sent ? 'opacity-60 cursor-not-allowed' : sending ? 'opacity-80' : 'hover:bg-[#05B04B]'
              }`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.066-.022.137-.033.194-.033.195 0 .375.104.515.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            {sent ? "✅ ส่งทาง LINE แล้ว" : sending ? "กำลังส่ง..." : "ส่งทาง LINE"}
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