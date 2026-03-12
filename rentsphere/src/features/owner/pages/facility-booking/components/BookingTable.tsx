import {
  Building2,
  Calendar,
  Eye,
  Hash,
  Info,
  User,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

import { type Booking } from "../types/booking";
import BookingRow from "./BookingRow";
import EmptyState from "./EmptyState";

interface BookingTableProps {
  bookings: Booking[];
  onRefresh?: () => void;
}

const BookingTable: React.FC<BookingTableProps> = ({ bookings }) => {
  const navigate = useNavigate();

const handleViewDetail = (booking: Booking) => {
  navigate(`/owner/common-area-booking/${booking.facilityId}/bookings/${booking.id}`);
};

  if (bookings.length === 0) {
    return (
      <div className="py-20 bg-white">
        <EmptyState
          title="ไม่พบรายการจอง"
          description="ยังไม่มีผู้ทำรายการจองสำหรับพื้นที่นี้ในขณะนี้ หรือไม่พบข้อมูลตามตัวกรองที่เลือก"
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100">
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-300" />
                วันที่ / เวลา
              </div>
            </th>

            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-slate-300" />
                ห้องพัก
              </div>
            </th>

            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-300" />
                ผู้จอง
              </div>
            </th>

            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-slate-300" />
                สถานที่
              </div>
            </th>

            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-slate-300" />
                สถานะ
              </div>
            </th>

            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">
              <div className="flex items-center justify-end gap-2">
                <Eye size={14} className="text-slate-300" />
                ดูรายละเอียด
              </div>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
          {bookings.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              onViewDetail={() => handleViewDetail(booking)}
              showFacilityName
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;