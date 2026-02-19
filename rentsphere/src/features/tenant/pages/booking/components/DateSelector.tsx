import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DaySelection } from '../types/facility.types';

interface DateSelectorProps {
  days: DaySelection[];
  selectedDate: string;
  onSelect: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ days, selectedDate, onSelect }) => {
  return (
    <div className="relative mb-6">
      <div className="flex items-center bg-white/40 backdrop-blur-md rounded-2xl p-2 border border-white/40 shadow-sm overflow-x-auto no-scrollbar gap-2">
        <button className="flex-shrink-0 p-2 text-gray-400">
          <ChevronLeft size={18} />
        </button>
        {days.map((day) => {
          const isSelected = day.fullDate === selectedDate;
          return (
            <button
              key={day.fullDate}
              onClick={() => onSelect(day.fullDate)}
              className={`flex-1 flex flex-col items-center min-w-[50px] py-2 rounded-xl transition-all ${
                isSelected ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'
              }`}
            >
              <span className="text-[10px] font-bold uppercase">{day.dayName}</span>
              <span className="text-lg font-bold">{day.date}</span>
            </button>
          );
        })}
        <button className="flex-shrink-0 p-2 text-gray-400">
          <ChevronRight size={18} />
        </button>
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default DateSelector;
