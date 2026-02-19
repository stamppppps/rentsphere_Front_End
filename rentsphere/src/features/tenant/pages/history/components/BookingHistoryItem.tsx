import React from 'react';
import type { BookingRecord, BookingStatus } from '../../booking/types/booking.types';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';

interface BookingHistoryItemProps {
  booking: BookingRecord;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
}

const BookingHistoryItem: React.FC<BookingHistoryItemProps> = ({ booking, onUpdateStatus }) => {
  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case 'BOOKED': return { label: 'จองแล้ว', bg: 'bg-purple-100 text-purple-600' };
      case 'CHECKED_IN': return { label: 'เข้าใช้งานแล้ว', bg: 'bg-green-100 text-green-600' };
      case 'COMPLETED': return { label: 'เสร็จสิ้น', bg: 'bg-blue-100 text-blue-600' };
      case 'CANCELLED': return { label: 'ยกเลิก', bg: 'bg-red-100 text-red-600' };
      default: return { label: status, bg: 'bg-gray-100 text-gray-600' };
    }
  };

  const { label, bg } = getStatusStyle(booking.status);

  // Logic สำหรับแสดงปุ่ม "เข้าใช้งาน"
  // ในโปรเจกต์จริงจะเช็คเวลาปัจจุบันกับ slot
  // สำหรับ Demo นี้เราจะอนุญาตให้กดได้ถ้าสถานะเป็น BOOKED
  const canCheckIn = booking.status === 'BOOKED';
  const canFinish = booking.status === 'CHECKED_IN';

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-4 overflow-hidden relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-100">
            <img src={booking.imageUrl} className="w-full h-full object-cover" alt="" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">{booking.facilityName}</h4>
            <div className={`inline-flex px-3 py-0.5 rounded-full text-[10px] font-bold ${bg}`}>
              {label}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Calendar size={14} className="text-gray-300" />
          <span>{booking.displayDate}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Clock size={14} className="text-gray-300" />
          <span>{booking.slots.join(', ')}</span>
        </div>
      </div>

      {canCheckIn && (
        <button 
          onClick={() => onUpdateStatus(booking.id, 'CHECKED_IN')}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={18} />
          เข้าใช้งาน
        </button>
      )}

      {canFinish && (
        <button 
          onClick={() => onUpdateStatus(booking.id, 'COMPLETED')}
          className="w-full py-3 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 active:scale-95 transition-all"
        >
          ใช้งานเสร็จแล้ว
        </button>
      )}
    </div>
  );
};

export default BookingHistoryItem;
