import {
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  MapPin,
  Sofa,
  User,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BOOKING_TEXT } from "../constants/bookingText";
import { createBooking, getFacilities } from "../services/booking.service";
import type { Facility } from "../types/facility.types";

type LocationState = {
  facilityId: string;
  date: string;
  slots: string[];
};

function toSlotStartDate(date: string, slot: string): Date {
  const startTime = slot.split(" - ")[0] ?? "00:00";
  const [hour = 0, minute = 0] = startTime.split(":").map(Number);

  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function isPastSlot(date: string, slot: string): boolean {
  return toSlotStartDate(date, slot).getTime() <= Date.now();
}

function isWithin30Minutes(date: string, slot: string): boolean {
  const diffMs = toSlotStartDate(date, slot).getTime() - Date.now();
  return diffMs > 0 && diffMs < 30 * 60 * 1000;
}

const BookingConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const bookingState = state as LocationState | null;

  const [facility, setFacility] = useState<Facility | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedSlots = useMemo(() => {
    if (!bookingState?.slots) return [];

    return [...bookingState.slots].sort(
      (a, b) =>
        toSlotStartDate(bookingState.date, a).getTime() -
        toSlotStartDate(bookingState.date, b).getTime()
    );
  }, [bookingState]);

  useEffect(() => {
    if (
      !bookingState?.facilityId ||
      !bookingState?.date ||
      !bookingState?.slots?.length
    ) {
      navigate("/tenant/booking", { replace: true });
      return;
    }

    const loadFacility = async () => {
      try {
        const all = await getFacilities();
        const match = all.find((f) => f.id === bookingState.facilityId);

        if (!match) {
          navigate("/tenant/booking", { replace: true });
          return;
        }

        setFacility(match);
      } catch (error) {
        console.error("LOAD FACILITY FOR CONFIRM ERROR:", error);
        navigate("/tenant/booking", { replace: true });
      }
    };

    loadFacility();
  }, [bookingState, navigate]);

  const handleConfirm = async () => {
    if (!agreed || !facility || !bookingState || isSubmitting) return;

    const hasPast = sortedSlots.some((slot) =>
      isPastSlot(bookingState.date, slot)
    );
    if (hasPast) {
      alert("ไม่สามารถจองได้");
      return;
    }

    const hasCutoff = sortedSlots.some((slot) =>
      isWithin30Minutes(bookingState.date, slot)
    );
    if (hasCutoff) {
      alert("ไม่สามารถจองในเวลานี้ได้ กรุณาเลือกรอบถัดไป");
      return;
    }

    try {
      setIsSubmitting(true);

      await createBooking({
        facilityId: facility.id,
        date: bookingState.date,
        slots: sortedSlots,
      });

      navigate("/tenant/booking/success", {
        replace: true,
        state: {
          facilityName: facility.name,
          date: bookingState.date,
          slots: sortedSlots,
        },
      });
    } catch (error: any) {
      console.error("CREATE BOOKING ERROR:", error);
      alert(error?.message || "จองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingState || !facility) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-[#f0f5ff] to-white pb-32">
      <div className="px-6 pt-10 pb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          aria-label="ย้อนกลับ"
          className="p-2 rounded-xl bg-white/40 backdrop-blur-md text-gray-800 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>

        <h1 className="text-xl font-black text-gray-800 tracking-tight">
          ยืนยันการจอง
        </h1>

        <div className="w-10" />
      </div>

      <div className="px-6 space-y-5">
        <div className="relative h-44 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-purple-900/10 border-4 border-white">
          <img
            src={facility.imageUrl ?? ""}
            className="w-full h-full object-cover brightness-90"
            alt={facility.name}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent flex items-center p-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black text-blue-700 tracking-tight leading-none">
                {facility.name}
              </h2>
              <div className="w-12 h-12 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-white/50">
                <Sofa size={28} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-7 border border-white shadow-xl shadow-blue-900/5">
          <h3 className="font-black text-gray-500 text-base uppercase tracking-[0.15em] mb-6">
            สรุปการจอง
          </h3>

          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#135ced]/10 rounded-2xl flex items-center justify-center text-[#135ced] shadow-sm shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-gray-700 font-bold text-sm">
                  สถานที่: {facility.name}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#135ced]/10 rounded-2xl flex items-center justify-center text-[#135ced] shadow-sm shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-gray-700 font-bold text-sm">
                  {bookingState.date}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#135ced]/10 rounded-2xl flex items-center justify-center text-[#135ced] shadow-sm shrink-0">
                <Clock size={20} />
              </div>
              <div className="space-y-0.5">
                {sortedSlots.map((s) => (
                  <p key={s} className="text-gray-700 font-bold text-sm">
                    {s}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#135ced]/10 rounded-2xl flex items-center justify-center text-[#135ced] shadow-sm shrink-0">
                <User size={20} />
              </div>
              <div>
                <p className="text-gray-700 font-bold text-sm">ผู้จอง: ฉัน</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-7 border border-white shadow-xl shadow-blue-900/5">
          <h3 className="font-black text-gray-500 text-base uppercase tracking-[0.15em] mb-4">
            กฎการใช้งาน
          </h3>

          <div className="space-y-3 mb-8">
            {BOOKING_TEXT.RULES_LIST.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-0.5 text-[#135ced] shrink-0">
                  <Check size={18} strokeWidth={3} />
                </div>
                <p className="text-gray-500 text-xs font-bold leading-relaxed">
                  {rule}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setAgreed(!agreed)}
            className="flex items-center gap-3 active:opacity-70 transition-opacity"
            type="button"
          >
            <div
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${agreed
                  ? "bg-[#135ced] border-[#135ced] text-white shadow-md"
                  : "border-[#135ced]/30 bg-white/50"
                }`}
            >
              {agreed && <Check size={14} strokeWidth={4} />}
            </div>
            <span className="text-[11px] font-bold text-gray-400">
              ฉันได้อ่านและยอมรับกฎและเงื่อนไขแล้ว
            </span>
          </button>
        </div>

        <div className="pt-4 px-2">
          <button
            disabled={!agreed || isSubmitting}
            onClick={handleConfirm}
            className={`w-full py-5 font-black text-xl rounded-[2rem] transition-all duration-300 shadow-2xl ${agreed && !isSubmitting
                ? "bg-gradient-to-r from-[#135ced] to-[#2467ed] text-white shadow-blue-500/30 active:scale-95"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
          >
            {isSubmitting ? "กำลังยืนยัน..." : "ยืนยันการจอง"}
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full opacity-5 pointer-events-none -z-10">
        <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#000"
            d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default BookingConfirmPage;