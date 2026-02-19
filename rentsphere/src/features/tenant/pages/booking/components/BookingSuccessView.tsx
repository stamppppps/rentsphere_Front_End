import React from 'react';
import { Check } from 'lucide-react';
import { BOOKING_TEXT } from '../constants/bookingText';

interface BookingSuccessViewProps {
  onFinish: () => void;
}

const BookingSuccessView: React.FC<BookingSuccessViewProps> = ({ onFinish }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center animate-in fade-in zoom-in duration-700">
      <div className="relative mb-12">
        <div className="w-32 h-32 bg-white/40 backdrop-blur-xl rounded-full border border-white/60 shadow-2xl flex items-center justify-center relative z-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
            <Check size={48} strokeWidth={4} />
          </div>
        </div>
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl -z-10"></div>
      </div>

      <h2 className="text-3xl font-black text-gray-800 mb-2">{BOOKING_TEXT.SUCCESS_TITLE}</h2>
      <p className="text-gray-500 font-bold mb-12">{BOOKING_TEXT.SUCCESS_DESC}</p>

      <button 
        onClick={onFinish}
        className="w-full py-4 bg-gradient-to-r from-blue-400 to-indigo-400 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-200 active:scale-95 transition-all"
      >
        {BOOKING_TEXT.FINISH}
      </button>
    </div>
  );
};

export default BookingSuccessView;
