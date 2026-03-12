import {
  Ban,
  CheckCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import React from "react";
import { BOOKING_STATUS_CONFIG } from "../constants/bookingStatus";
import { BookingStatus } from "../types/booking";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

const STATUS_ICONS: Record<BookingStatus, React.ElementType> = {
  [BookingStatus.PENDING]: Clock,
  [BookingStatus.APPROVED]: CheckCircle2,
  [BookingStatus.REJECTED]: XCircle,
  [BookingStatus.CANCELLED]: Ban,
  [BookingStatus.COMPLETED]: CheckCircle,
};

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status }) => {
  const config = BOOKING_STATUS_CONFIG[status];
  const Icon = STATUS_ICONS[status];

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap shadow-sm
        ${config.color}
      `}
    >
      <Icon size={14} strokeWidth={2.5} />
      <span className="text-[11px] font-black uppercase tracking-tight">
        {config.label}
      </span>
    </div>
  );
};

export default BookingStatusBadge;