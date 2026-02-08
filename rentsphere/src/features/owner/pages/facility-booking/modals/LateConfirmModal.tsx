import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LateConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const LateConfirmModal: React.FC<LateConfirmModalProps> = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        
        {/* Decorative Top Border */}
        <div className="h-2 w-full bg-amber-400"></div>

        <div className="p-10 text-center">
          {/* Icon Header */}
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-amber-50 rounded-[32px] flex items-center justify-center text-amber-500 shadow-2xl shadow-amber-100 rotate-3">
              <Clock size={48} strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg">
              <AlertTriangle size={20} />
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
            บันทึกการมาสาย
          </h2>
          
          <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
            <p className="text-lg font-bold text-slate-700 leading-relaxed">
              “ผู้เช่ามาสาย ยืนยันให้เข้าใช้งานหรือไม่”
            </p>
          </div>

          <p className="text-slate-400 text-xs font-medium px-4 mb-8 leading-relaxed uppercase tracking-wider">
            ข้อมูลนี้จะถูกบันทึกในประวัติพฤติกรรมการใช้งาน <br/> และสถานะจะถูกเปลี่ยนเป็น "เช็คอินสาย"
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm}
              className="w-full py-4.5 px-8 rounded-2xl bg-amber-500 text-white font-black hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-100 active:scale-95 group"
            >
              <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
              ยืนยัน
            </button>
            <button 
              onClick={onClose} 
              className="w-full py-4 px-8 rounded-2xl border border-slate-100 text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LateConfirmModal;
