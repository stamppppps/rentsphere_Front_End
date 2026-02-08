
import React from 'react';
import { Inbox, CalendarX, PlusCircle } from 'lucide-react';
import { UI_TEXT } from '../constants/uiText';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description,
  icon: Icon = CalendarX,
  actionLabel,
  onAction
}) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
    <div className="relative mb-10">
      {/* Decorative background pulse */}
      <div className="absolute inset-0 bg-indigo-100/30 rounded-full scale-150 blur-3xl animate-pulse"></div>
      
      <div className="relative w-28 h-28 bg-white rounded-[40px] flex items-center justify-center text-slate-300 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <Icon size={56} strokeWidth={1.2} className="text-slate-200" />
      </div>
      
      <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 border-4 border-white">
        <Inbox size={22} />
      </div>
    </div>

    <div className="max-w-md mx-auto">
      <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">
        {title || UI_TEXT.EMPTY_STATE.BOOKING_TITLE}
      </h3>
      <p className="text-slate-400 font-medium leading-relaxed mb-8">
        {description || UI_TEXT.EMPTY_STATE.BOOKING_DESC}
      </p>
    </div>
    
    {actionLabel && onAction ? (
      <button 
        onClick={onAction}
        className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 group"
      >
        <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        {actionLabel}
      </button>
    ) : (
      <div className="flex items-center gap-4 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100/50">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          ระบบกำลังรอรายการใหม่จากลูกบ้าน
        </span>
      </div>
    )}
    
    <div className="mt-12 grid grid-cols-3 gap-3">
      <div className="w-12 h-1.5 rounded-full bg-slate-100"></div>
      <div className="w-12 h-1.5 rounded-full bg-indigo-100"></div>
      <div className="w-12 h-1.5 rounded-full bg-slate-100"></div>
    </div>
  </div>
);

export default EmptyState;
