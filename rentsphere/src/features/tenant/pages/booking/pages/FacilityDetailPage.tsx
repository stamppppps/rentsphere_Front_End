import {
  AlertCircle,
  CalendarRange,
  ChevronLeft,
  Info,
  ShieldCheck,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DateSelector from "../components/DateSelector";
import TimeSlotItem from "../components/TimeSlotItem";
import {
  checkBookingQuota,
  getAvailability,
  getFacilities,
} from "../services/booking.service";
import { getBookingPolicy } from "../services/bookingPolicy.service";
import type { DaySelection, Facility, TimeSlot } from "../types/facility.types";

type QuotaStatus = {
  allowed: boolean;
  reason?: string;
  dailyCount?: number;
  remainingDay?: number;
  occupiedTimes?: string[];
};

const DEFAULT_DAILY_LIMIT = 2;

function formatLocalDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const FacilityDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [facility, setFacility] = useState<Facility | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyLimit, setDailyLimit] = useState<number>(DEFAULT_DAILY_LIMIT);

  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus>({
    allowed: true,
    dailyCount: 0,
    remainingDay: DEFAULT_DAILY_LIMIT,
    occupiedTimes: [],
  });

  const days = useMemo((): DaySelection[] => {
    const result: DaySelection[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayNames = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      result.push({
        dayName: dayNames[date.getDay()],
        date: date.getDate(),
        fullDate: formatLocalDate(date),
      });
    }

    return result;
  }, []);

  useEffect(() => {
    if (days.length > 0 && !selectedDate) {
      setSelectedDate(days[0].fullDate);
    }
  }, [days, selectedDate]);

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        setLoading(true);
        const all = await getFacilities();
        const match = all.find((f) => f.id === id) ?? null;
        setFacility(match);
      } catch (error) {
        console.error("LOAD FACILITY DETAIL ERROR:", error);
        setFacility(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFacility();
  }, [id]);

  useEffect(() => {
    const loadBookingPolicy = async () => {
      if (!facility?.condoId) return;

      try {
        const policy = await getBookingPolicy(facility.condoId);
        setDailyLimit(policy?.maxBookingsPerDay ?? DEFAULT_DAILY_LIMIT);
      } catch (error) {
        console.error("LOAD TENANT BOOKING POLICY ERROR:", error);
        setDailyLimit(DEFAULT_DAILY_LIMIT);
      }
    };

    loadBookingPolicy();
  }, [facility?.condoId]);

  useEffect(() => {
    const loadDetailData = async () => {
      if (!facility || !selectedDate) return;

      try {
        const [availability, quota] = await Promise.all([
          getAvailability(facility.id, selectedDate),
          checkBookingQuota(selectedDate, "any", dailyLimit),
        ]);

        setSlots(availability);
        setQuotaStatus({
          allowed: quota.allowed,
          reason: quota.reason,
          dailyCount: quota.dailyCount ?? 0,
          remainingDay: quota.remainingDay ?? dailyLimit,
          occupiedTimes: quota.occupiedTimes ?? [],
        });
        setSelectedSlots([]);
      } catch (error) {
        console.error("LOAD FACILITY AVAILABILITY ERROR:", error);
        setSlots([]);
        setQuotaStatus({
          allowed: false,
          reason: "โหลดข้อมูลช่วงเวลาไม่สำเร็จ",
          dailyCount: 0,
          remainingDay: 0,
          occupiedTimes: [],
        });
      }
    };

    loadDetailData();
  }, [facility, selectedDate, dailyLimit]);

  const toggleSlot = (slot: TimeSlot) => {
    const isSelected = selectedSlots.includes(slot.time);
    const isBlockedBySlotReason = Boolean(slot.reason);
    const isBookedElsewhere = quotaStatus.occupiedTimes?.includes(slot.time);

    if (isBlockedBySlotReason || isBookedElsewhere) return;

    if (!facility?.isQuotaExempt) {
      if (!quotaStatus.allowed && !isSelected) return;

      if (!isSelected) {
        const currentSelectionCount = selectedSlots.length;
        const alreadyBookedCount = quotaStatus.dailyCount || 0;

        if (alreadyBookedCount + currentSelectionCount >= dailyLimit) return;
      }
    }

    setSelectedSlots((prev) =>
      prev.includes(slot.time)
        ? prev.filter((t) => t !== slot.time)
        : [...prev, slot.time].sort()
    );
  };

  if (loading) {
    return null;
  }

  if (!facility) {
    return null;
  }

  const imageUrl =
    facility.coverImageUrl ||
    facility.imageUrl ||
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";

  const currentSelected = selectedSlots.length;
  const alreadyBooked = quotaStatus.dailyCount || 0;
  const totalDailyPlanned = alreadyBooked + currentSelected;

  const isSelectionLimitReached =
    !facility.isQuotaExempt && totalDailyPlanned >= dailyLimit;

  const hasSelection = selectedSlots.length > 0;
  const isMaintenance = facility.status === "MAINTENANCE";

  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-52">
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={imageUrl}
          className="w-full h-full object-cover brightness-75 scale-105"
          alt={facility.name}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#F8FAFF]" />

        <div className="absolute top-8 left-0 right-0 px-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/tenant/booking")}
            className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <h1 className="text-xl font-bold text-white drop-shadow-md">
            {facility.name}
          </h1>

          <div className="w-10" />
        </div>
      </div>

      <div className="px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-blue-900/5 mb-6 border border-gray-100/50">
          <DateSelector
            days={days}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />
        </div>

        {isMaintenance ? (
          <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl mb-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-amber-900 font-black text-sm uppercase tracking-tight">
                ปิดปรับปรุงชั่วคราว
              </p>
              <p className="text-amber-700 text-xs mt-1 font-bold leading-relaxed">
                พื้นที่ส่วนกลางนี้ยังไม่เปิดให้จองในขณะนี้
              </p>
            </div>
          </div>
        ) : facility.isQuotaExempt ? (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl mb-6 flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-emerald-800 font-bold text-sm leading-tight">
                สิทธิพิเศษไม่จำกัดการใช้งาน
              </p>
              <p className="text-emerald-600 text-[11px] mt-0.5 font-medium">
                พื้นที่นี้ไม่นับรวมในโควตาการจองปกติ
              </p>
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
                  <p className="text-rose-900 font-black text-sm uppercase tracking-tight">
                    ไม่สามารถจองได้
                  </p>
                  <p className="text-rose-600 text-xs mt-1 font-bold leading-relaxed">
                    {quotaStatus.reason}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-purple-50 border border-purple-100 p-4 rounded-3xl flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-purple-500 shadow-sm shrink-0">
                  <Info size={20} />
                </div>
                <div>
                  <p className="text-purple-800 font-bold text-sm">
                    สิทธิ์วันที่เลือก
                  </p>
                  <p className="text-purple-600 text-[11px] mt-0.5 font-medium">
                    เหลือ {quotaStatus.remainingDay ?? dailyLimit} ครั้ง
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <span className="text-sm font-black text-gray-800 uppercase tracking-widest">
              เลือกช่วงเวลา
            </span>
          </div>
        </div>

        <div className="space-y-1">
          {slots.map((slot, i) => {
            const isSelected = selectedSlots.includes(slot.time);
            const isBookedElsewhere = quotaStatus.occupiedTimes?.includes(
              slot.time
            );
            const isLimitOnThisDay = isSelectionLimitReached && !isSelected;
            const isBlockedBySlotReason = Boolean(slot.reason);

            const shouldDisable =
              isMaintenance ||
              isBookedElsewhere ||
              isLimitOnThisDay ||
              isBlockedBySlotReason ||
              (!quotaStatus.allowed && !isSelected);

            return (
              <div key={i} className="relative">
                <TimeSlotItem
                  slot={slot}
                  isSelected={isSelected}
                  onToggle={() => toggleSlot(slot)}
                  disabled={shouldDisable}
                />

                {isBookedElsewhere && (
                  <div className="absolute top-2 right-4 flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 pointer-events-none">
                    <CalendarRange size={10} className="text-amber-500" />
                    <span className="text-[9px] font-black text-amber-600 uppercase">
                      จองช่วงเวลาอื่นอยู่
                    </span>
                  </div>
                )}

                {!isBookedElsewhere && slot.message && (
                  <div className="px-2 pb-2">
                    <p className="text-[11px] font-bold text-rose-500 ml-3">
                      {slot.message}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-[105px] left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-[60] pointer-events-none">
        <button
          disabled={!hasSelection || isMaintenance}
          onClick={() =>
            navigate("/tenant/booking/confirm", {
              state: {
                facilityId: id,
                date: selectedDate,
                slots: selectedSlots,
              },
            })
          }
          className={`w-full py-5 font-bold text-xl rounded-2xl transition-all duration-300 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] pointer-events-auto ${
            hasSelection && !isMaintenance
              ? "bg-[#135ced] text-white shadow-[#97c1fc]/40 active:scale-95"
              : "bg-[#E5E7EB] text-gray-400 cursor-not-allowed shadow-none"
          }`}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};

export default FacilityDetailPage;