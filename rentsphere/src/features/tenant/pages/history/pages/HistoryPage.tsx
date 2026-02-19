import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, History as HistoryIcon, Clock } from 'lucide-react';
import { getMyBookings, updateBookingStatus } from '../../booking/services/booking.service';
import type { BookingRecord, BookingStatus } from '../../booking/types/booking.types';
import BookingHistoryItem from '../components/BookingHistoryItem';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  const loadBookings = () => {
    setBookings(getMyBookings());
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleUpdateStatus = (id: string, status: BookingStatus) => {
    updateBookingStatus(id, status);
    loadBookings();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-[#f0f5ff] to-white pb-24">
      {/* Header */}
      <div className="p-6 pt-8 flex items-center justify-between sticky top-0 bg-[#f0f7ff]/80 backdrop-blur-md z-10">
        <button 
          onClick={() => navigate('/home')} 
          className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">ประวัติการใช้งาน</h1>
        <div className="w-10"></div>
      </div>
      
      <div className="px-6">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <HistoryIcon size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">ไม่พบประวัติการใช้งาน</h2>
            <p className="text-gray-400 font-medium text-sm">รายการจองของคุณจะแสดงที่นี่</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
               <Clock size={16} className="text-blue-500" />
               <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">รายการจองพื้นที่</span>
            </div>
            {bookings.map((booking) => (
              <BookingHistoryItem 
                key={booking.id} 
                booking={booking} 
                onUpdateStatus={handleUpdateStatus} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
