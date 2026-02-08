
import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Save, 
  ArrowRight,
  Info
} from 'lucide-react';
import type { Booking } from '../types/booking';

interface EditBookingModalProps {
  booking: Booking;
  onClose: () => void;
  onSave?: (updatedData: Partial<Booking>) => void;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({ booking, onClose, onSave }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, collect form data here
    if (onSave) onSave({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all active:scale-90 group z-10"
        >
          <X size={20} className="text-slate-400 group-hover:text-slate-600" />
        </button>

        {/* Header Section */}
        <div className="p-10 pb-6 border-b border-slate-50">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
            Modification Mode
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">แก้ไขข้อมูลการจอง</h2>
          <p className="text-slate-400 font-medium mt-1">
            กำลังแก้ไขรายการของ <span className="text-slate-900 font-bold">{booking.userName}</span>
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          
          {/* Section: Date */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Calendar size={12} className="text-indigo-500" />
              วันที่ต้องการเปลี่ยนแปลง
            </label>
            <div className="relative">
              <input 
                required
                type="date" 
                defaultValue={booking.date}
                className="w-full pl-6 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-slate-700"
              />
            </div>
          </div>

          {/* Section: Time Range */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Clock size={12} className="text-indigo-500" />
                เวลาเริ่ม
              </label>
              <input 
                required
                type="time" 
                defaultValue={booking.startTime}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-black text-slate-700"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Clock size={12} className="text-indigo-500" />
                เวลาสิ้นสุด
              </label>
              <input 
                required
                type="time" 
                defaultValue={booking.endTime}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-black text-slate-700"
              />
            </div>
          </div>

          {/* Section: Participants */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Users size={12} className="text-indigo-500" />
              จำนวนผู้ใช้งาน (ท่าน)
            </label>
            <div className="relative">
              <input 
                required
                type="number" 
                min="1"
                defaultValue={booking.participants}
                className="w-full pl-6 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-black text-slate-700"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Persons</div>
            </div>
          </div>

          {/* Warning/Info Box */}
          <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-[28px] border border-amber-100/50">
            <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm shrink-0">
              <Info size={18} />
            </div>
            <p className="text-xs text-amber-700/80 leading-relaxed font-medium">
              การแก้ไขข้อมูลจะไม่มีการส่งคำขออนุมัติใหม่ ระบบจะทำการอัปเดตข้อมูลเดิมและแจ้งเตือนให้ลูกบ้านทราบถึงการเปลี่ยนแปลงทันที
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4.5 px-8 rounded-2xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4.5 px-8 rounded-2xl bg-[#0F172A] text-white font-black hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 group"
            >
              <Save size={20} className="group-hover:scale-110 transition-transform" />
              บันทึกการเปลี่ยนแปลง
              <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingModal;
