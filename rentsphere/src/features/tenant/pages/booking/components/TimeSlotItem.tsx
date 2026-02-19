import React from "react";
import type { TimeSlot } from "../types/facility.types";

interface TimeSlotItemProps {
  slot: TimeSlot;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean; // ใช้สำหรับโควตา/สิทธิ์เต็ม
}

const TimeSlotItem: React.FC<TimeSlotItemProps> = ({ slot, isSelected, onToggle, disabled }) => {
  // ✅ EXCLUSIVE: มีคนจองแล้ว 1 คนขึ้นไป = ล็อกทันที
  const used = Number((slot as any).currentOccupancy ?? 0);
  const bookedAlready = used > 0;

  // เผื่อบางที่ยังส่ง status=full มา
  const isFull = slot.status === "full" || bookedAlready;

  const isDisabled = isFull || (!!disabled && !isSelected); 
  // ✅ ถ้า disabled (สิทธิ์เต็ม) แต่ slot นี้ "ถูกเลือกอยู่" ให้กดยกเลิกได้

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => {
        if (!isDisabled || isSelected) onToggle();
      }}
      className={`w-full flex items-center justify-between p-4 mb-3 rounded-2xl border-2 transition-all duration-200 ${
        isDisabled
          ? "bg-gray-50 border-gray-50 cursor-not-allowed opacity-50"
          : isSelected
          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
          : "bg-white border-blue-100 hover:border-blue-400"
      }`}
    >
      <div className="flex flex-col items-start">
        <span
          className={`text-base font-bold ${
            isDisabled && !isFull
              ? "text-gray-400"
              : isDisabled && isFull
              ? "text-gray-300"
              : isSelected
              ? "text-white"
              : "text-gray-700"
          }`}
        >
          {slot.time}
        </span>

        {/* ✅ แสดงจำนวนคนจอง/เข้าใช้ได้เสมอ */}
        {slot.currentOccupancy !== undefined && (
          <span className={`text-[10px] ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
            เข้าใช้แล้ว {used} คน
          </span>
        )}

        {/* โควตาเต็ม (แต่ไม่ใช่กรณีถูกจองแล้ว) */}
        {disabled && !isFull && !isSelected && (
          <span className="text-[9px] text-rose-400 font-bold uppercase tracking-tighter">
            เลือกได้สูงสุด 2 ชม./วัน
          </span>
        )}
      </div>

      <div
        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
          isFull
            ? "bg-gray-200 text-gray-500"
            : disabled && !isSelected
            ? "bg-gray-100 text-gray-400 border border-gray-200"
            : isSelected
            ? "bg-white/20 text-white"
            : "bg-blue-50 text-blue-600 border border-blue-100"
        }`}
      >
        {isFull ? "ถูกจองแล้ว" : disabled && !isSelected ? "สิทธิ์เต็ม" : isSelected ? "เลือกแล้ว" : "กดจองได้"}
      </div>
    </button>
  );
};

export default TimeSlotItem;