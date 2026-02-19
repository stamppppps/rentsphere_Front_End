import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, AlertCircle, ShieldCheck, CalendarRange, Info } from 'lucide-react';
import DateSelector from '../components/DateSelector';
import TimeSlotItem from '../components/TimeSlotItem';
import type { Facility, TimeSlot, DaySelection } from '../types/facility.types';
import { getFacilities, getAvailability, checkBookingQuota } from '../services/booking.service';

const FacilityDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotaStatus, setQuotaStatus] = useState<{ 
    allowed: boolean; 
    reason?: string; 
    dailyCount?: number;
    remainingMonth?: number;
    occupiedTimes?: string[];
  }>({ allowed: true, dailyCount: 0, remainingMonth: 10, occupiedTimes: [] });

  // สร้างวันที่แบบไดนามิกเพื่อให้สัมพันธ์กับเดือนปัจจุบัน (ใช้สำหรับทดสอบการหักสิทธิ์)
  const generateDays = (): DaySelection[] => {
    const d = [];
    const now = new Date();
    const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(now.getDate() + i);
      d.push({
        dayName: dayNames[date.getDay()],
        date: date.getDate(),
        fullDate: date.toISOString().split('T')[0]
      });
    }
    return d;
  };

  const days = generateDays();

  useEffect(() => {
    setSelectedDate(days[0].fullDate); 
    const fetch = async () => {
      const all = await getFacilities();
      const match = all.find(f => f.id === id);
      if (match) setFacility(match);
      setLoading(false);
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (facility && selectedDate) {
      getAvailability(facility.id, selectedDate).then(setSlots);
      setSelectedSlots([]);
      const result = checkBookingQuota(selectedDate, facility.id);
      setQuotaStatus(result);
    }
  }, [facility, selectedDate]);

  const toggleSlot = (time: string) => {
    if (quotaStatus.occupiedTimes?.includes(time)) return;

    if (!facility?.isQuotaExempt) {
      if (!quotaStatus.allowed) return; 

      const isAlreadySelected = selectedSlots.includes(time);
      if (!isAlreadySelected) {
        const currentSelectionCount = selectedSlots.length;
        const alreadyBookedCount = quotaStatus.dailyCount || 0;
        if (alreadyBookedCount + currentSelectionCount >= 2) return;
      }
    }

    setSelectedSlots(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  if (loading || !facility) return null;

  const alreadyBooked = quotaStatus.dailyCount || 0;
  const currentSelected = selectedSlots.length;
  const totalDailyPlanned = alreadyBooked + currentSelected;
  const isSelectionLimitReached = !facility.isQuotaExempt && totalDailyPlanned >= 2;
  const hasSelection = selectedSlots.length > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-52">
      <div className="relative h-56 w-full overflow-hidden">
        <img src={facility.imageUrl} className="w-full h-full object-cover brightness-75 scale-105" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#F8FAFF]"></div>
        <div className="absolute top-8 left-0 right-0 px-6 flex items-center justify-between">
          <button onClick={() => navigate('/tenant/booking')} className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white drop-shadow-md">{facility.name}</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-blue-900/5 mb-6 border border-gray-100/50">
           <DateSelector days={days} selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>

        {/* Quota Info Display */}
        {facility.isQuotaExempt ? (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl mb-6 flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
               <p className="text-emerald-800 font-bold text-sm leading-tight">สิทธิพิเศษไม่จำกัดการใช้งาน</p>
               <p className="text-emerald-600 text-[11px] mt-0.5 font-medium">พื้นที่นี้ไม่นับรวมในโควตาการจองปกติ</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {!quotaStatus.allowed ? (
              <div className="bg-rose-50 border border-rose-100 p-5 rounded-3xl flex items-start gap-4">
                <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                   <p className="text-rose-900 font-black text-sm uppercase tracking-tight">ไม่สามารถจองได้</p>
                   <p className="text-rose-600 text-xs mt-1 font-bold leading-relaxed">{quotaStatus.reason}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Monthly Limit Info (Sessions) */}
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-3xl flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-purple-500 shadow-sm shrink-0">
                     <Info size={20} />
                   </div>
                   <div>
                      <p className="text-purple-800 font-bold text-sm">สิทธิ์คงเหลือเดือนนี้</p>
                      <p className="text-purple-600 text-[11px] mt-0.5 font-medium">เหลือ {quotaStatus.remainingMonth} ครั้ง (1 การจอง = 1 ครั้ง)</p>
                   </div>
                </div>
                {/* Daily Limit Info (Hours) */}
                <div className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-3xl flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                     <Clock size={20} />
                   </div>
                   <div>
                      <p className="text-blue-800 font-bold text-sm">โควตาวันนี้ของ {facility.name}</p>
                      <p className="text-blue-600 text-[11px] mt-0.5 font-medium">จองไปแล้ว {alreadyBooked} / 2 ชม.</p>
                   </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-4 px-2">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-black text-gray-800 uppercase tracking-widest">เลือกช่วงเวลา</span>
           </div>
        </div>

        <div className="space-y-1">
          {slots.map((slot, i) => {
            const isSelected = selectedSlots.includes(slot.time);
            const isBookedElsewhere = quotaStatus.occupiedTimes?.includes(slot.time);
            const isLimitOnThisFacility = isSelectionLimitReached && !isSelected;
            const shouldDisable = isBookedElsewhere || isLimitOnThisFacility || (!quotaStatus.allowed && !isSelected);
            
            return (
              <div key={i} className="relative">
                <TimeSlotItem 
                  slot={slot} 
                  isSelected={isSelected} 
                  onToggle={() => toggleSlot(slot.time)} 
                  disabled={shouldDisable}
                />
                {isBookedElsewhere && (
                   <div className="absolute top-2 right-4 flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 pointer-events-none">
                      <CalendarRange size={10} className="text-amber-500" />
                      <span className="text-[9px] font-black text-amber-600 uppercase">จองพื้นที่อื่นอยู่</span>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-[105px] left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-[60] pointer-events-none">
         <button 
           disabled={!hasSelection}
           onClick={() => navigate('/tenant/booking/confirm', { state: { facilityId: id, date: selectedDate, slots: selectedSlots } })}
           className={`w-full py-5 font-bold text-xl rounded-2xl transition-all duration-300 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] pointer-events-auto ${
             hasSelection 
               ? 'bg-[#135ced] text-white shadow-[#97c1fc]/40 active:scale-95' 
               : 'bg-[#E5E7EB] text-gray-400 cursor-not-allowed shadow-none'
           }`}
         >
           ถัดไป
         </button>
      </div>
    </div>
  );
};

export default FacilityDetailPage;

