import OwnerShell from "@/features/owner/components/OwnerShell";
import { useCondoStore } from "@/features/owner/stores/condoStore";
import {
  Calendar,
  ChevronLeft,
  Clock3,
  Home,
  Loader2,
  ShieldAlert,
  Timer,
  User,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { bookingService } from "../services/booking.service";
import type { Booking } from "../types/booking";
import {
  checkIfExpired,
  checkIfLate,
  getMinutesLate,
} from "../utils/time";

const BookingDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const condoName = useCondoStore((s) => s.condoName);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const bData = await bookingService.getBookingById(bookingId);
      setBooking(bData);
    } catch (err) {
      console.error("Error loading booking details:", err);
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const timeMetrics = useMemo(() => {
    if (!booking) return null;

    const isLate = checkIfLate(booking.date, booking.startTime);
    const isExpired = checkIfExpired(booking.date, booking.endTime);

    return {
      isLate,
      isExpired,
      minutesLate: isLate ? getMinutesLate(booking.date, booking.startTime) : 0,
    };
  }, [booking]);

  const displayStatus = useMemo(() => {
    if (!booking) return null;

    const now = new Date();
    const startAt = new Date(`${booking.date}T${booking.startTime}:00`);
    const endAt = new Date(`${booking.date}T${booking.endTime}:00`);

    if (now < startAt) {
      return {
        label: "จองแล้ว",
        color: "bg-blue-50 text-blue-700 border border-blue-200",
      };
    }

    if (now >= startAt && now <= endAt) {
      return {
        label: "กำลังใช้งาน",
        color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      };
    }

    return {
      label: "เสร็จสิ้น",
      color: "bg-slate-100 text-slate-700 border border-slate-200",
    };
  }, [booking]);

  const formatThaiDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatThaiDateTime = (value?: string | null) => {
    if (!value) return "-";

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";

    return d.toLocaleString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-slate-50/50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          กำลังเตรียมข้อมูลรายการจอง...
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-20 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-800">
          ไม่พบข้อมูลการจอง
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-indigo-600 font-bold"
        >
          กลับไปหน้าก่อนหน้า
        </button>
      </div>
    );
  }

  return (
    <OwnerShell
      activeKey="common-area-booking"
      showSidebar
      condoName={condoName || "คอนโดมิเนียม"}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            aria-label="\u0e01\u0e25\u0e31\u0e1a"
            className="p-3.5 bg-white border border-slate-200 rounded-[20px] text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-90"
          >
            <ChevronLeft size={22} />
          </button>

          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
            ดูรายละเอียดการจอง
          </p>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${displayStatus?.color}`}
                >
                  {displayStatus?.label}
                </span>

                {timeMetrics?.isLate && displayStatus?.label === "กำลังใช้งาน" && (
                  <span className="px-3 py-1.5 bg-amber-500 text-white text-[10px] font-black rounded-full animate-pulse flex items-center gap-1.5">
                    <Timer size={12} />
                    สาย {timeMetrics.minutesLate} นาที
                  </span>
                )}

                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                  รหัสอ้างอิง: {booking.id}
                </span>
              </div>

              <h1 className="text-4xl font-black text-slate-900 mb-2">
                {booking.facilityName}
              </h1>
              <p className="text-slate-500 font-medium">
                ข้อมูลรายละเอียดของรายการจองพื้นที่ส่วนกลาง
              </p>
            </div>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-10">
              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <User size={14} className="text-indigo-500" />
                  ข้อมูลลูกบ้าน
                </h3>

                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100/50">
                  <p className="font-black text-slate-800 text-xl">
                    {booking.userName || "-"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Home size={14} className="text-slate-400" />
                    <p className="text-sm font-bold text-slate-500 tracking-tight">
                      เลขห้อง {booking.unit || "-"}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-500" />
                  วันและช่วงเวลา
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      วันที่จอง
                    </p>
                    <p className="font-black text-slate-800 text-lg">
                      {formatThaiDate(booking.date)}
                    </p>
                  </div>

                  <div className="p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      ช่วงเวลา
                    </p>
                    <p className="font-black text-slate-800 text-lg">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-10">
              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Clock3 size={14} className="text-indigo-500" />
                  เวลาที่กดจอง
                </h3>

                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100/50">
                  <p className="font-black text-slate-800 text-lg">
                    {formatThaiDateTime(booking.createdAt)}
                  </p>
                  <p className="text-sm font-bold text-slate-400 mt-2">
                    เวลาที่ลูกบ้านทำรายการจองในระบบ
                  </p>
                </div>
              </section>

              {displayStatus?.label === "กำลังใช้งาน" && timeMetrics?.isLate && (
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                    สถานะเวลา
                  </h3>

                  <div className="p-5 rounded-[28px] border flex items-start gap-4 bg-amber-50 border-amber-100 text-amber-700">
                    <div className="p-2.5 rounded-2xl shrink-0 bg-amber-500 text-white">
                      <Timer size={18} />
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                        เวลาปัจจุบัน
                      </p>
                      <p className="text-[13px] font-bold leading-tight">
                        มาสาย {timeMetrics.minutesLate} นาที
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </OwnerShell>
  );
};

export default BookingDetailPage;