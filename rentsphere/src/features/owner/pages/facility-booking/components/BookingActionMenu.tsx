import React, { useState } from 'react';
import { MoreVertical, Ban, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import { type Booking, BookingStatus } from '../types/booking';
import type { Facility } from '../types/facility';
import { useNavigate } from 'react-router-dom';
import { bookingRules } from '../utils/bookingRules';
import { getAllowedActions } from '../utils/statusMapper';
import { checkIfLate, checkIfBeyondGracePeriod } from '../utils/time';

interface BookingActionMenuProps {
  booking: Booking;
  facility?: Facility;
  allBookings?: Booking[];
  onAction: (action: string) => void;
}

const BookingActionMenu: React.FC<BookingActionMenuProps> = ({ 
  booking, 
  facility, 
  allBookings = [], 
  onAction 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Validate current booking against business rules
  const validationErrors = facility 
    ? bookingRules.getValidationErrors(booking, facility, allBookings)
    : [];
  
  const hasCriticalError = validationErrors.length > 0;
  
  const isLate = booking.status === BookingStatus.APPROVED && checkIfLate(booking.date, booking.startTime);
  const isBeyondGrace = isLate && checkIfBeyondGracePeriod(booking.date, booking.startTime);

  // Use Centralized Mapper to get actions based on state
  const actions = getAllowedActions(booking);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all active:scale-90 ${
          isOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-400'
        } ${isBeyondGrace ? 'ring-2 ring-rose-500 bg-rose-50 text-rose-600' : isLate ? 'ring-2 ring-amber-200 bg-amber-50 text-amber-600' : ''}`}
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-[24px] shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="p-2 space-y-1">
              <div className="px-4 py-3 mb-1 border-b border-slate-50">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">การจัดการ</p>
                <p className="text-xs font-bold text-slate-600 truncate">{booking.userName}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">รหัสอ้างอิง: {booking.id}</p>
                
                {isBeyondGrace ? (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-black text-rose-600 uppercase bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                    <AlertCircle size={10} strokeWidth={3} /> เกินเวลาผ่อนปรน
                  </div>
                ) : isLate && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-black text-amber-600 uppercase">
                    <Clock size={10} /> ยังไม่มาเข้าใช้งาน
                  </div>
                )}
              </div>

              {/* Show Validation Warning */}
              {hasCriticalError && booking.status === BookingStatus.PENDING && (
                <div className="mx-2 mb-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-600 mb-1">
                    <AlertTriangle size={14} strokeWidth={3} />
                    <p className="text-[10px] font-black uppercase tracking-tight">ตรวจพบความเสี่ยง</p>
                  </div>
                  <p className="text-[10px] text-amber-700 leading-tight font-medium">
                    {validationErrors[0]}
                  </p>
                </div>
              )}

              {actions.map((item) => {
                const isApprove = item.action === 'approve';
                const isDisabled = isApprove && hasCriticalError;
                
                let textColor = 'text-slate-600 hover:bg-slate-50';
                if (item.primary) textColor = 'text-indigo-600 hover:bg-indigo-50 font-black';
                if (isApprove) textColor = isDisabled ? 'text-slate-300 opacity-50' : 'text-emerald-600 hover:bg-emerald-50';
                if (item.danger) textColor = 'text-rose-600 hover:bg-rose-50';

                return (
                  <React.Fragment key={item.action}>
                    {item.divider && <div className="h-px bg-slate-50 my-1 mx-2" />}
                    <button
                      disabled={isDisabled}
                      onClick={() => { 
                        if (item.action === 'view') {
                          navigate(`/owner/common-area-booking/${booking.facilityId}/bookings/${booking.id}`);
                        } else if (!isDisabled) {
                          onAction(item.action); 
                        }
                        setIsOpen(false); 
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all ${textColor} ${isDisabled ? 'cursor-not-allowed' : ''}`}
                    >
                      <div className="relative flex items-center gap-3 w-full">
                        <item.icon size={16} className="shrink-0" />
                        <span className="whitespace-nowrap flex-1 text-left">{item.label}</span>
                        {isDisabled && <Ban size={12} className="text-slate-300" />}
                      </div>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingActionMenu;
