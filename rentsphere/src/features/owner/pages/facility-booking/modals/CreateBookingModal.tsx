
import React, { useState } from 'react';
import { 
  X, 
  User, 
  Home, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  Plus,
  MessageSquare
} from 'lucide-react';

interface CreateBookingModalProps {
  onClose: () => void;
  facilityName?: string;
  onConfirm?: (data: Record<string, unknown>) => void;
}

const CreateBookingModal: React.FC<CreateBookingModalProps> = ({ 
  onClose, 
  facilityName = "ฟิตเนส (Fitness)",
  onConfirm 
}) => {
  const [isAutoApprove, setIsAutoApprove] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to collect form data would go here
    if (onConfirm) onConfirm({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="relative p-10 pb-2 border-b border-slate-50">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all active:scale-90 group"
          >
            <X size={20} className="text-slate-400 group-hover:text-slate-600" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
            Manual Booking Entry
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">สร้างการจองใหม่</h2>
          <p className="text-slate-400 font-medium mt-1">บันทึกรายการจองสำหรับพื้นที่: <span className="text-indigo-600 font-bold">{facilityName}</span></p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          {/* Section: User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อลูกบ้าน / ผู้จอง</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-semibold"
                />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เลขที่ห้อง / ยูนิต</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  placeholder="เช่น A-101"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-semibold"
                />
                <Home size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>
          </div>

          {/* Section: Date & Time */}
          <div className="space-y-4">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่ต้องการจอง</label>
              <div className="relative">
                <input 
                  required
                  type="date" 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-semibold"
                />
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เวลาเริ่ม</label>
                <div className="relative">
                  <input 
                    required
                    type="time" 
                    defaultValue="09:00"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none font-bold"
                  />
                  <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เวลาสิ้นสุด</label>
                <div className="relative">
                  <input 
                    required
                    type="time" 
                    defaultValue="10:30"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none font-bold"
                  />
                  <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">จำนวนผู้ใช้งาน (ท่าน)</label>
              <div className="relative">
                <input 
                  required
                  type="number" 
                  defaultValue="1"
                  min="1"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none font-bold"
                />
                <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-5 bg-indigo-50/50 border border-indigo-100 rounded-[28px]">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2.5 rounded-xl text-indigo-600 shadow-sm">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">อนุมัติทันที</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Auto Approve</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAutoApprove(!isAutoApprove)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${isAutoApprove ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isAutoApprove ? 'translate-x-7' : ''}`} />
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">หมายเหตุเพิ่มเติม</label>
            <div className="relative">
              <textarea 
                placeholder="ระบุวัตถุประสงค์ หรือหมายเหตุ (ถ้ามี)..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[28px] h-24 resize-none focus:outline-none font-medium leading-relaxed"
              />
              <MessageSquare size={18} className="absolute left-4 top-5 text-slate-300" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-8 rounded-2xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 px-8 rounded-2xl bg-[#0F172A] text-white font-black hover:bg-indigo-950 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-slate-200 active:scale-95 group"
            >
              <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
              ยืนยันการสร้างการจอง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBookingModal;
