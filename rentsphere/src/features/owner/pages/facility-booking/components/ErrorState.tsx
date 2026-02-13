import React from 'react';
import { ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "เกิดข้อผิดพลาดในการโหลดข้อมูล", 
  onRetry 
}) => (
  <div className="flex flex-col items-center justify-center py-32 px-6 text-center animate-in fade-in duration-700">
    <div className="relative mb-10">
      {/* Visual backdrop for the error state */}
      <div className="absolute inset-0 bg-rose-100/40 rounded-full scale-[1.8] blur-3xl animate-pulse"></div>
      
      <div className="relative w-28 h-28 bg-white rounded-[40px] flex items-center justify-center text-rose-500 border border-rose-100 shadow-[0_20px_50px_rgba(244,63,94,0.15)]">
        <ShieldAlert size={56} strokeWidth={1.2} />
      </div>
      
      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white">
        <AlertCircle size={20} />
      </div>
    </div>

    <div className="max-w-md mx-auto mb-12">
      <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">
        ขออภัย เกิดข้อผิดพลาดบางอย่าง
      </h3>
      <p className="text-slate-400 font-medium leading-relaxed">
        {message}
      </p>
      <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] mt-6">
        โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ
      </p>
    </div>
    
    {onRetry && (
      <button 
        onClick={onRetry}
        className="flex items-center gap-3 px-10 py-4.5 bg-slate-900 text-white rounded-[22px] font-black hover:bg-rose-600 transition-all shadow-2xl shadow-slate-200 active:scale-95 group"
      >
        <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
        ลองโหลดใหม่อีกครั้ง
      </button>
    )}

    {/* Decorative element */}
    <div className="mt-16 flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-rose-200"></div>
      <div className="w-8 h-1 rounded-full bg-rose-100"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-rose-200"></div>
    </div>
  </div>
);

export default ErrorState;
