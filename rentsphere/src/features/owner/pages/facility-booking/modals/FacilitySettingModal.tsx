
import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Clock, 
  Users, 
  Save, 
  Timer,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { Facility } from '../types/facility';

interface FacilitySettingModalProps {
  facility: Facility;
  onClose: () => void;
  onSave?: (updatedFacility: Partial<Facility>) => void;
}

const FacilitySettingModal: React.FC<FacilitySettingModalProps> = ({ facility, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    capacity: facility.capacity,
    openTime: facility.openTime,
    closeTime: facility.closeTime,
    durationPerSession: facility.durationPerSession,
    isAutoApprove: facility.isAutoApprove
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="relative p-10 pb-6 border-b border-slate-50">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all active:scale-90 group"
          >
            <X size={20} className="text-slate-400 group-hover:text-slate-600" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
            Facility Configuration
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">ตั้งค่าพื้นที่ส่วนกลาง</h2>
          <p className="text-slate-400 font-medium mt-1">จัดการกฎเกณฑ์และสิทธิ์การใช้งานของ <span className="text-indigo-600 font-bold">{facility.name}</span></p>
        </div>

        <form onSubmit={handleSave} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          {/* Section: Capacity & Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Users size={12} className="text-indigo-500" />
                ความจุสูงสุด (ท่าน)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 1})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-black text-slate-700"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Timer size={12} className="text-indigo-500" />
                เวลาต่อรอบ (ชั่วโมง/Slot)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.5"
                  min="0.5"
                  value={formData.durationPerSession}
                  onChange={(e) => setFormData({...formData, durationPerSession: parseFloat(e.target.value) || 1})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-black text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Section: Operating Hours */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Clock size={12} className="text-indigo-500" />
              เวลาเปิด-ปิดให้บริการ
            </label>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase ml-1">เวลาเปิด</p>
                <input 
                  type="time" 
                  value={formData.openTime}
                  onChange={(e) => setFormData({...formData, openTime: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none font-bold text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase ml-1">เวลาปิด</p>
                <input 
                  type="time" 
                  value={formData.closeTime}
                  onChange={(e) => setFormData({...formData, closeTime: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none font-bold text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Section: Approval Policy */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Shield size={12} className="text-indigo-500" />
              นโยบายการอนุมัติ
            </label>
            <div className={`p-6 rounded-[32px] border transition-all flex items-center justify-between ${
              formData.isAutoApprove 
                ? 'bg-emerald-50 border-emerald-100' 
                : 'bg-indigo-50 border-indigo-100'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                  formData.isAutoApprove ? 'bg-white text-emerald-600' : 'bg-white text-indigo-600'
                }`}>
                  {formData.isAutoApprove ? <CheckCircle2 size={24} /> : <Shield size={24} />}
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">
                    {formData.isAutoApprove ? 'อนุมัติอัตโนมัติ' : 'ต้องอนุมัติด้วยตนเอง'}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    {formData.isAutoApprove ? 'ลูกบ้านจองแล้วใช้งานได้ทันที' : 'แอดมินต้องตรวจสอบทุกรายการ'}
                  </p>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={() => setFormData({...formData, isAutoApprove: !formData.isAutoApprove})}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${formData.isAutoApprove ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.isAutoApprove ? 'translate-x-7' : ''}`} />
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-[28px] border border-slate-100/50">
            <div className="p-2 bg-white rounded-xl text-slate-400 shadow-sm shrink-0">
              <AlertCircle size={18} />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              การเปลี่ยนแปลงจะมีผลต่อการจองรอบใหม่เท่านั้น รายการจองที่มีอยู่ในระบบจะยังคงยึดตามกฎเดิมที่ตั้งไว้ก่อนหน้า
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-4 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4.5 px-8 rounded-2xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4.5 px-8 rounded-2xl bg-[#0F172A] text-white font-black hover:bg-indigo-950 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 group"
            >
              <Save size={20} className="group-hover:scale-110 transition-transform" />
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacilitySettingModal;
