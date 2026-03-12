import React from "react";
import type { TimeSlot } from "../types/facility.types";
import { getSlotDisplayStatus } from "../utils/time";

interface TimeSlotItemProps {
  slot: TimeSlot;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const TimeSlotItem: React.FC<TimeSlotItemProps> = ({
  slot,
  isSelected,
  onToggle,
  disabled,
}) => {
  const displayStatus = getSlotDisplayStatus(slot.time);

  const isFull = slot.status === "full";
  const isTimePassed =
    displayStatus === "กำลังใช้งาน" || displayStatus === "เสร็จสิ้น";

  const isDisabled = isFull || isTimePassed || disabled;

  const badgeText =
    isFull
      ? slot.message ?? "จองแล้ว"
      : displayStatus === "กำลังใช้งาน"
        ? "กำลังใช้งาน"
        : displayStatus === "เสร็จสิ้น"
          ? "เสร็จสิ้น"
          : disabled && !isSelected
            ? "สิทธิ์เต็ม"
            : isSelected
              ? "เลือกแล้ว"
              : "กดจองได้";

  const subMessage =
    slot.reason === "past"
      ? "ไม่สามารถจองได้"
      : slot.reason === "cutoff"
        ? "กรุณาเลือกรอบถัดไป"
        : slot.reason === "booked"
          ? "ถูกจองแล้ว"
          : displayStatus === "กำลังใช้งาน"
            ? "ช่วงเวลานี้เริ่มใช้งานแล้ว"
            : displayStatus === "เสร็จสิ้น"
              ? "ช่วงเวลานี้ผ่านไปแล้ว"
              : disabled && !isFull && !isSelected
                ? "เลือกได้สูงสุด 2 ครั้ง/วัน"
                : null;

  const badgeClass = isFull
    ? slot.reason === "booked"
      ? "bg-gray-200 text-gray-500"
      : slot.reason === "cutoff"
        ? "bg-orange-100 text-orange-600 border border-orange-200"
        : slot.reason === "past"
          ? "bg-rose-100 text-rose-600 border border-rose-200"
          : "bg-gray-200 text-gray-500"
    : displayStatus === "กำลังใช้งาน"
      ? "bg-amber-100 text-amber-700 border border-amber-200"
      : displayStatus === "เสร็จสิ้น"
        ? "bg-slate-200 text-slate-600 border border-slate-300"
        : disabled && !isSelected
          ? "bg-gray-100 text-gray-400 border border-gray-200"
          : isSelected
            ? "bg-white/20 text-white"
            : "bg-blue-50 text-blue-600 border border-blue-100";

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 mb-3 rounded-2xl border-2 transition-all duration-200 ${isDisabled
          ? "bg-gray-50 border-gray-50 cursor-not-allowed opacity-60"
          : isSelected
            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
            : "bg-white border-blue-100 hover:border-blue-400"
        }`}
    >
      <div className="flex flex-col items-start">
        <span
          className={`text-base font-bold ${isDisabled
              ? "text-gray-400"
              : isSelected
                ? "text-white"
                : "text-gray-700"
            }`}
        >
          {slot.time}
        </span>

        {slot.currentOccupancy !== undefined && !isFull && !isTimePassed && !isDisabled && (
          <span
            className={`text-[10px] ${isSelected ? "text-blue-100" : "text-gray-400"
              }`}
          >
            เข้าใช้แล้ว {slot.currentOccupancy} คน
          </span>
        )}

        {subMessage && (
          <span
            className={`text-[9px] font-bold uppercase tracking-tighter ${slot.reason === "booked"
                ? "text-amber-500"
                : slot.reason === "cutoff"
                  ? "text-orange-500"
                  : displayStatus === "กำลังใช้งาน"
                    ? "text-amber-600"
                    : "text-rose-400"
              }`}
          >
            {subMessage}
          </span>
        )}
      </div>

      <div
        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeClass}`}
      >
        {badgeText}
      </div>
    </button>
  );
};

export default TimeSlotItem;