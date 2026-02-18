import React from 'react';
import { MapPin, Calendar, Clock, User } from 'lucide-react';
import { BOOKING_TEXT } from '../constants/bookingText';

interface BookingSummaryCardProps {
  facilityName: string;
  date: string;
  times: string[];
  userName: string;
}

const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({ facilityName, date, times, userName }) => {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl shadow-purple-100/50 border border-white mb-6">
      <h3 className="font-bold text-gray-800 text-lg mb-4">{BOOKING_TEXT.SUMMARY_LABEL}</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-400">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{BOOKING_TEXT.LOCATION}</p>
            <p className="font-bold text-gray-700">{facilityName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-400">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{BOOKING_TEXT.DATE}</p>
            <p className="font-bold text-gray-700">{date}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{BOOKING_TEXT.TIME}</p>
            {times.map((t, idx) => (
              <p key={idx} className="font-bold text-gray-700 leading-tight">{t}</p>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-400">
            <User size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{BOOKING_TEXT.BOOKER}</p>
            <p className="font-bold text-gray-700">{userName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummaryCard;
