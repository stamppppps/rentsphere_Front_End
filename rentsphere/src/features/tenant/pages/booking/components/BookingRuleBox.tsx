import React from 'react';
import { Check } from 'lucide-react';
import { BOOKING_TEXT } from '../constants/bookingText';

interface BookingRuleBoxProps {
  checked: boolean;
  onToggle: () => void;
}

const BookingRuleBox: React.FC<BookingRuleBoxProps> = ({ checked, onToggle }) => {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl shadow-purple-100/50 border border-white mb-8">
      <h3 className="font-bold text-gray-800 text-lg mb-3">{BOOKING_TEXT.RULES_TITLE}</h3>
      <div className="space-y-2 mb-6">
        {BOOKING_TEXT.RULES_LIST.map((rule, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="mt-1 w-4 h-4 bg-purple-100 rounded flex items-center justify-center text-purple-600">
              <Check size={12} strokeWidth={3} />
            </div>
            <p className="text-gray-500 text-xs font-medium leading-relaxed">{rule}</p>
          </div>
        ))}
      </div>
      
      <button 
        onClick={onToggle}
        className="flex items-center gap-3 active:opacity-70 transition-opacity"
      >
        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          checked ? 'bg-purple-500 border-purple-500 text-white' : 'border-purple-200 bg-white'
        }`}>
          {checked && <Check size={16} strokeWidth={3} />}
        </div>
        <span className="text-xs font-bold text-gray-500">{BOOKING_TEXT.RULES_AGREE}</span>
      </button>
    </div>
  );
};

export default BookingRuleBox;
