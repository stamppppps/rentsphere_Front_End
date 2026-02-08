
import React, { useState } from 'react';
import { Ban, X, User, ShieldAlert, Check, AlertCircle } from 'lucide-react';

interface CancelBookingModalProps {
  onClose: () => void;
  onConfirm: (initiator: 'tenant' | 'admin', reason: string) => void;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({ onClose, onConfirm }) => {
  const [initiator, setInitiator] = useState<'tenant' | 'admin'>('tenant');
  const [selectedReason, setSelectedReason] = useState<string>('');

  const tenantReasons = [
    "ธุระส่วนตัว / ไม่สะดวกเข้าใช้งาน",
    "เปลี่ยนแผนการเดินทาง",
    "จองผิดพลาด (ระบุวัน/เวลาผิด)",
    "ติดขัดปัญหาด้านสุขภาพ"
  ];

  const adminReasons = [
    "พื้นที่ปิดซ่อมบำรุงกะทันหัน",
    "เกิดเหตุฉุกเฉินในอาคาร",
    "พบการทำผิดกฎระเบียบการใช้งาน",
    "รายการจองซ้ำซ้อน (System Error)"
  ];

  const currentReasons = initiator === 'tenant' ? tenantReasons : adminReasons;

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm(initiator, selectedReason);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="p-10 pb-6 text-center border-b border-slate-50 relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all active:scale-90 group"
          >
            <X size={20} className="text-slate-400 group-hover:text-slate-600" />
          </button>

          <div className="w-20 h-20 mx-auto bg-slate-100 text-slate-500 rounded-[28px] flex items-center justify-center mb-6 shadow-inner">
            <Ban size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">ยกเลิกการจอง</h2>
          <p className="text-slate-400 font-medium mt-1">โปรดระบุรายละเอียดการยกเลิกรายการนี้</p>
        </div>

        <div className="p-10 space-y-8">
          {/* Initiator Selector */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              ผู้ขอยกเลิก
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50">
              <button
                onClick={() => { setInitiator('tenant'); setSelectedReason(''); }}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${
                  initiator === 'tenant' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <User size={16} />
                ผู้เช่ายกเลิก
              </button>
              <button
                onClick={() => { setInitiator('admin'); setSelectedReason(''); }}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${
                  initiator === 'admin' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <ShieldAlert size={16} />
                แอดมินยกเลิก
              </button>
            </div>
          </div>

          {/* Reason Selection List */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              ระบุเหตุผลในการยกเลิก
            </label>
            <div className="space-y-2">
              {currentReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-[20px] border transition-all text-left group ${
                    selectedReason === reason 
                      ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-sm font-bold ${selectedReason === reason ? 'text-rose-700' : 'text-slate-600'}`}>
                    {reason}
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedReason === reason 
                      ? 'bg-rose-600 border-rose-600 text-white' 
                      : 'border-slate-200 group-hover:border-slate-300'
                  }`}>
                    {selectedReason === reason && <Check size={12} strokeWidth={4} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Warning Note */}
          <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-[28px] border border-slate-100/50">
            <div className="p-2 bg-white rounded-xl text-slate-400 shadow-sm shrink-0">
              <AlertCircle size={18} />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              เมื่อยืนยัน ระบบจะส่งการแจ้งเตือน Push Notification และ Email ไปยังลูกบ้านโดยทันที
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button 
              onClick={onClose} 
              className="flex-1 py-4.5 px-8 rounded-2xl border border-slate-200 text-slate-500 font-black hover:bg-slate-50 transition-all active:scale-95"
            >
              ย้อนกลับ
            </button>
            <button 
              disabled={!selectedReason}
              onClick={handleConfirm}
              className={`flex-[2] py-4.5 px-8 rounded-2xl text-white font-black shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group ${
                !selectedReason 
                  ? 'bg-slate-200 cursor-not-allowed shadow-none' 
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
              }`}
            >
              <Ban size={20} className={`${selectedReason ? 'group-hover:scale-110' : ''} transition-transform`} />
              ยืนยันยกเลิกการจอง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
