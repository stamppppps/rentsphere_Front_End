import React, { useState } from 'react';
import { 
  Check, 
  X, 
  AlertCircle, 
  MessageSquare, 
  Send,
  ShieldCheck,
  ShieldX,
  AlertTriangle
} from 'lucide-react';
import { BookingStatus } from '../types/booking';
import { getStatusConfig } from '../utils/statusMapper';

interface ApproveRejectModalProps {
  type: 'approve' | 'reject';
  onClose: () => void;
  onConfirm: (reason: string) => void;
  bookingName: string;
  warning?: string;
}

const ApproveRejectModal: React.FC<ApproveRejectModalProps> = ({ 
  type, 
  onClose, 
  onConfirm, 
  bookingName,
  warning
}) => {
  const isApprove = type === 'approve';
  const targetStatus = isApprove ? BookingStatus.APPROVED : BookingStatus.REJECTED;
  const config = getStatusConfig(targetStatus);
  
  const [reason, setReason] = useState(isApprove ? `ข้อมูลครบถ้วน ${config.actionLabel}` : '');
  const isFormValid = reason.trim().length >= 5;

  const handleConfirm = () => {
    if (isFormValid) {
      onConfirm(reason);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        
        <div className={`h-2 w-full ${isApprove ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

        <div className="p-10 text-center">
          <div className="relative inline-block mb-8">
            <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl transition-all duration-500 ${
              isApprove 
                ? 'bg-emerald-50 text-emerald-500 shadow-emerald-100 rotate-3' 
                : 'bg-rose-50 text-rose-500 shadow-rose-100 -rotate-3'
            }`}>
              {isApprove ? <ShieldCheck size={48} strokeWidth={1.5} /> : <ShieldX size={48} strokeWidth={1.5} />}
            </div>
            <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg ${
              isApprove ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              {isApprove ? <Check size={20} /> : <X size={20} />}
            </div>
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            ยืนยันการ{config.label}?
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            ระบุเหตุผลในการ{config.label}การจองของคุณ <span className="text-slate-900 font-bold">{bookingName}</span>
          </p>

          {warning && isApprove && (
            <div className="mb-8 p-5 bg-amber-50 border border-amber-100 rounded-[28px] text-left flex gap-4">
              <div className="text-amber-500 mt-1 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">คำเตือนจากระบบ</p>
                <p className="text-xs text-amber-700 font-bold leading-relaxed">{warning}</p>
              </div>
            </div>
          )}

          <div className="space-y-3 text-left mb-8">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <MessageSquare size={12} className={isApprove ? 'text-emerald-500' : 'text-rose-500'} />
              ระบุเหตุผลหรือหมายเหตุ
            </label>
            <div className="relative group">
              <textarea 
                autoFocus
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`ระบุเหตุผลการ${config.label}...`}
                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[28px] h-32 resize-none focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-300 transition-all font-medium leading-relaxed group-hover:bg-white"
              />
              {!isFormValid && reason.length > 0 && (
                <div className="absolute bottom-4 right-6 flex items-center gap-1.5 text-rose-500 text-[10px] font-bold uppercase animate-pulse">
                  <AlertCircle size={12} /> สั้นเกินไป
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onClose} 
              className="flex-1 py-4.5 px-8 rounded-2xl border border-slate-200 text-slate-500 font-black hover:bg-slate-50 transition-all active:scale-95"
            >
              ยกเลิก
            </button>
            <button 
              disabled={!isFormValid}
              onClick={handleConfirm}
              className={`flex-[2] py-4.5 px-8 rounded-2xl text-white font-black shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group ${
                !isFormValid 
                  ? 'bg-slate-200 cursor-not-allowed shadow-none' 
                  : isApprove 
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
              }`}
            >
              <Send size={18} className={`${isFormValid ? 'group-hover:translate-x-1 group-hover:-translate-y-1' : ''} transition-transform`} />
              ยืนยันการ{config.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveRejectModal;
