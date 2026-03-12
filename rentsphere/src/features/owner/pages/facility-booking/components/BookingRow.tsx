import { Eye } from "lucide-react";
import React from "react";

import type { Booking } from "../types/booking";
import { BookingStatus } from "../types/booking";
import { checkIfExpired } from "../utils/time";

interface BookingRowProps {
  booking: Booking;
  onViewDetail: () => void;
  showFacilityName?: boolean;
}

function formatThaiDate(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const BookingRow: React.FC<BookingRowProps> = ({ booking, onViewDetail }) => {
  const isCompleted =
    booking.status === BookingStatus.COMPLETED ||
    (booking.status === BookingStatus.APPROVED &&
      checkIfExpired(booking.date, booking.endTime));

  const statusLabel = isCompleted ? "เสร็จสิ้น" : "กำลังใช้งาน";

  const statusClass = isCompleted
    ? "bg-slate-100 text-slate-600 border-slate-200"
    : "bg-emerald-50 text-emerald-600 border-emerald-100";

  return (
    <tr className="hover:bg-slate-50/60 transition-colors">
      <td className="px-8 py-6">
        <div className="flex flex-col">
          <span className="text-sm font-extrabold text-slate-800">
            {formatThaiDate(booking.date)}
          </span>
          <span className="text-xs font-bold text-slate-400 mt-1">
            {booking.startTime} - {booking.endTime}
          </span>
        </div>
      </td>

      <td className="px-8 py-6">
        <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-black text-slate-700">
          {booking.unit || "-"}
        </span>
      </td>

      <td className="px-8 py-6">
        <span className="text-sm font-extrabold text-slate-800">
          {booking.userName || "-"}
        </span>
      </td>

      {/* เปลี่ยนจากจำนวนคน -> ชื่อสถานที่ */}
      <td className="px-8 py-6">
        <span className="text-sm font-extrabold text-slate-800">
          {booking.facilityName || "-"}
        </span>
      </td>

      <td className="px-8 py-6">
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-black ${statusClass}`}
        >
          {statusLabel}
        </span>
      </td>

      <td className="px-8 py-6 text-right">
        <button
          onClick={onViewDetail}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-all active:scale-95"
        >
          <Eye size={14} />
          ดูรายละเอียด
        </button>
      </td>
    </tr>
  );
};

export default BookingRow;