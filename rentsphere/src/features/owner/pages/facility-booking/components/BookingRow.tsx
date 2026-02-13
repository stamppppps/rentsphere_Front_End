import React from 'react';
import { type Booking, BookingStatus } from '../types/booking';
import type { Facility } from '../types/facility';
import { 
  Calendar, 
  Clock, 
  Home, 
  Users, 
  Timer, 
  LogIn, 
  AlertCircle, 
  UserX, 
  CheckCircle,
  Hourglass
} from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';
import BookingActionMenu from './BookingActionMenu';
import { useNavigate } from 'react-router-dom';
import { bookingRules } from '../utils/bookingRules';
import { checkIfLate, getMinutesLate, checkIfBeyondGracePeriod, checkIfExpired, getMinutesOver } from '../utils/time';

interface BookingRowProps {
  booking: Booking;
  facility?: Facility;
  allBookings?: Booking[];
  onAction: (action: string, booking: Booking) => void;
}

const BookingRow: React.FC<BookingRowProps> = ({ booking, facility, allBookings = [], onAction }) => {
  const navigate = useNavigate();

  // 1. Validation for Pending bookings
  const errors = (facility && booking.status === BookingStatus.PENDING)
    ? bookingRules.getValidationErrors(booking, facility, allBookings)
    : [];
  
  const hasError = errors.length > 0;

  // 2. Real-time Status Detection
  const isTimePassed = checkIfLate(booking.date, booking.startTime);
  const isLate = (booking.status === BookingStatus.PENDING || booking.status === BookingStatus.APPROVED || booking.status === BookingStatus.LATE) && isTimePassed;
  const isBeyondGrace = isLate && checkIfBeyondGracePeriod(booking.date, booking.startTime);
  const isExpired = (booking.status === BookingStatus.APPROVED || booking.status === BookingStatus.LATE) && checkIfExpired(booking.date, booking.endTime);
  
  const minutesLate = isLate ? getMinutesLate(booking.date, booking.startTime) : 0;
  const minutesOver = isExpired ? getMinutesOver(booking.date, booking.endTime) : 0;

  return (
    <tr className={`hover:bg-slate-50/50 transition-all group border-b border-slate-50 last:border-0 ${
      hasError ? 'bg-amber-50/5' : isExpired ? 'bg-rose-50/5' : isBeyondGrace ? 'bg-rose-50/20' : isLate ? 'bg-amber-50/10' : ''
    }`}>
      {/* Column 1: Date/Time */}
      <td className="px-8 py-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm font-black text-slate-800 tracking-tight">
            <Calendar size={14} className="text-indigo-400" />
            {booking.date}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <Clock size={14} className="text-slate-300" />
            {booking.startTime} - {booking.endTime}
          </div>
        </div>
      </td>

      {/* Column 2: Unit Number */}
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm transition-colors ${
            isExpired ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-rose-100/20' :
            isBeyondGrace ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-100 text-slate-400'
          }`}>
            <Home size={18} />
          </div>
          <span className={`text-sm font-black ${isExpired ? 'text-rose-700' : isBeyondGrace ? 'text-rose-700' : 'text-slate-700'}`}>{booking.unit}</span>
        </div>
      </td>

      {/* Column 3: User Details (Removed minutes badges from here) */}
      <td className="px-8 py-6">
        <div 
          className="flex items-center gap-4 cursor-pointer group/user inline-flex" 
          onClick={() => navigate(`/owner/common-area-booking/${booking.facilityId}/bookings/${booking.id}`)}
        >
          <div className="relative">
            <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-white font-black text-lg shadow-lg transition-transform group-hover/user:scale-105 ${
              isExpired ? 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-100' :
              isBeyondGrace ? 'bg-gradient-to-br from-rose-600 to-rose-700 shadow-rose-200' :
              isLate ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-100' : 
              'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-100'
            }`}>
              {booking.userName.charAt(0)}
            </div>
            {(hasError || isLate || isExpired) && (
              <div className={`absolute -top-1 -right-1 w-5 h-5 border-2 border-white rounded-full flex items-center justify-center text-white animate-bounce shadow-sm ${
                isExpired ? 'bg-rose-600' : isBeyondGrace ? 'bg-rose-600' : 'bg-amber-500'
              }`}>
                {isExpired ? <Hourglass size={10} /> : isBeyondGrace ? <UserX size={10} strokeWidth={3} /> : <Timer size={10} strokeWidth={3} />}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className={`font-black text-[15px] transition-colors ${isExpired ? 'text-rose-800' : isBeyondGrace ? 'text-rose-800' : 'text-slate-800'} group-hover/user:text-indigo-600`}>
                {booking.userName}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">รหัสลูกบ้าน: {booking.userId.padStart(4, '0')}</p>
          </div>
        </div>
      </td>

      {/* Column 4: Participants */}
      <td className="px-8 py-6 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
          isExpired ? 'bg-rose-50 border-rose-100 text-rose-600' :
          isBeyondGrace ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600'
        }`}>
          <Users size={14} />
          {booking.participants} <span className="text-[10px] text-slate-400 font-bold ml-1">ท่าน</span>
        </div>
      </td>

      {/* Column 5: Status with Detailed Time Subtext (Kept here) */}
      <td className="px-8 py-6">
        <div className="flex flex-col gap-1.5">
          <BookingStatusBadge status={booking.status} />
          
          {/* Real-time Detailed Status Subtext */}
          {isExpired ? (
             <div className="flex items-center gap-1 text-[9px] text-rose-600 font-black uppercase tracking-tight ml-1 animate-pulse">
                <AlertCircle size={10} /> ใช้งานเกินเวลา {minutesOver} นาที
             </div>
          ) : isBeyondGrace ? (
             <div className="flex items-center gap-1 text-[9px] text-rose-600 font-black uppercase tracking-tight ml-1 animate-pulse">
                <AlertCircle size={10} /> สายเกินกำหนด 15 นาที
             </div>
          ) : isLate ? (
             <div className="flex items-center gap-1 text-[9px] text-amber-600 font-black uppercase tracking-tight ml-1">
                <Timer size={10} /> เลยเวลาเริ่ม {minutesLate} นาที
             </div>
          ) : booking.status === BookingStatus.COMPLETED ? (
             <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-black uppercase tracking-tight ml-1 opacity-60">
                <CheckCircle size={10} /> ทำรายการเสร็จสิ้น
             </div>
          ) : null}
        </div>
      </td>

      {/* Column 6: Actions */}
      <td className="px-8 py-6 text-right">
        <div className="flex justify-end items-center gap-2">
          {isExpired ? (
            <div className="flex gap-1.5">
               <button 
                onClick={(e) => { e.stopPropagation(); onAction('complete', booking); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                <CheckCircle size={14} /> ปิดรายการ
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onAction('no_show', booking); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black hover:bg-rose-100 transition-all active:scale-95"
              >
                <UserX size={14} /> ไม่มาใช้งาน
              </button>
            </div>
          ) : isBeyondGrace ? (
            <div className="flex gap-1.5">
              <button 
                onClick={(e) => { e.stopPropagation(); onAction('no_show', booking); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded-xl text-[10px] font-black hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-95"
              >
                <UserX size={14} /> ไม่มาใช้งาน
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onAction('complete', booking); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-slate-800 transition-all active:scale-95"
              >
                <LogIn size={14} /> ใช้งานจริง
              </button>
            </div>
          ) : isLate && booking.status !== BookingStatus.PENDING ? (
            <button 
              onClick={(e) => { e.stopPropagation(); onAction('complete', booking); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
            >
              <LogIn size={14} /> เช็คอินสาย
            </button>
          ) : null}
          
          <BookingActionMenu 
            booking={booking} 
            facility={facility}
            allBookings={allBookings}
            onAction={(action) => onAction(action, booking)} 
          />
        </div>
      </td>
    </tr>
  );
};

export default BookingRow;
