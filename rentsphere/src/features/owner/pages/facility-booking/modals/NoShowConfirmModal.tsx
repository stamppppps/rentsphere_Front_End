
import React, { useState } from 'react';
import { 
  UserX, 
  AlertCircle, 
  MessageSquare, 
  UserMinus,
  AlertTriangle
} from 'lucide-react';

interface NoShowConfirmModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => void;
  userName?: string;
}

const NoShowConfirmModal: React.FC<NoShowConfirmModalProps> = ({ 
  onClose, 
  onConfirm, 
  userName = "ผู้เช่า" 
}) => {
  const [reason, setReason] = useState('');
  const isFormValid = reason.trim().length >= 3;

  const handleConfirm = () => {
    if (isFormValid) {
      onConfirm(reason);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        
        {/* Decorative Top Banner */}
        <div className="h-2 w-full bg-rose-500"></div>

        <div className="p-10 text-center">
          {/* Icon Header */}
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500 shadow-2xl shadow-rose-100 -rotate-3">
              <UserX size={48} strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg">
              <AlertCircle size={20} />
            </div>
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            บันทึกการไม่มา (No Show)
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            ยืนยันว่า <span className="text-slate-900 font-bold">{userName}</span> ไม่ได้เข้าใช้งานตามเวลาที่กำหนด
          </p>

          {/* Warning Banner */}
          <div className="bg-rose-50 rounded-3xl p-5 mb-8 border border-rose-100 flex items-start gap-4 text-left">
            <div className="p-2 bg-white rounded-xl text-rose-500 shadow-sm shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-rose-800 uppercase tracking-wider mb-1">ข้อความเตือน</p>
              <p className="text-xs text-rose-700 leading-relaxed font-medium">
                การบันทึก No-Show จะส่งผลต่อคะแนนความประพฤติของลูกบ้าน และอาจทำให้ถูกจำกัดสิทธิ์การจองในอนาคตตามกฎของโครงการ
              </p>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-3 text-left mb-8">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <MessageSquare size={12} className="text-rose-500" />
              ระบุเหตุผลที่ลูกบ้านไม่มา (บังคับ)
            </label>
            <div className="relative group">
              <textarea 
                autoFocus
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="เช่น ไม่สามารถติดต่อได้หลังจากเลยเวลาเริ่มมาแล้ว 30 นาที..."
                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[28px] h-28 resize-none focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-200 transition-all font-medium leading-relaxed group-hover:bg-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
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
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
              }`}
            >
              <UserMinus size={20} className={`${isFormValid ? 'group-hover:scale-110' : ''} transition-transform`} />
              ยืนยันว่าไม่มา
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoShowConfirmModal;
