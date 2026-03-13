import {
  Building2,
  Calendar,
  ChevronLeft,
  Filter,
  Loader2,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import OwnerShell from "@/features/owner/components/OwnerShell";
import { useCondoStore } from "@/features/owner/stores/condoStore";
import BookingTable from "../components/BookingTable";
import EmptyState from "../components/EmptyState";
import { bookingService } from "../services/booking.service";
import type { Booking } from "../types/booking";

const STEP_CONDO_ID_KEY = "add_condo_condoId";

type NavState = {
  condoId?: string;
};

const BookingHistoryPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const st = (location.state as NavState | null) ?? null;

  const condoId = useMemo(() => {
    const fromQuery = searchParams.get("condoId");
    const fromState = st?.condoId;
    const fromStorage = localStorage.getItem(STEP_CONDO_ID_KEY);
    return String(fromQuery ?? fromState ?? fromStorage ?? "").trim();
  }, [searchParams, st?.condoId]);

  const condoName = useCondoStore((s) => s.condoName);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [facilityFilter, setFacilityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      if (!condoId) {
        setBookings([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await bookingService.getBookingsByCondo(condoId);
        setBookings(data ?? []);
      } catch (err) {
        console.error("BOOKING HISTORY ERROR:", err);
        setError("โหลดประวัติการจองไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [condoId]);

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const roomKeyword = roomFilter.trim().toLowerCase();
    const facilityKeyword = facilityFilter.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !keyword ||
        String(booking.userName ?? "").toLowerCase().includes(keyword) ||
        String(booking.unit ?? "").toLowerCase().includes(keyword) ||
        String(booking.facilityName ?? "").toLowerCase().includes(keyword) ||
        String(booking.id ?? "").toLowerCase().includes(keyword);

      const matchesRoom =
        !roomKeyword ||
        String(booking.unit ?? "").toLowerCase().includes(roomKeyword);

      const matchesFacility =
        !facilityKeyword ||
        String(booking.facilityName ?? "")
          .toLowerCase()
          .includes(facilityKeyword);

      const matchesDate = !dateFilter || booking.date === dateFilter;

      return matchesSearch && matchesRoom && matchesFacility && matchesDate;
    });
  }, [bookings, search, roomFilter, facilityFilter, dateFilter]);

  const clearFilters = () => {
    setSearch("");
    setRoomFilter("");
    setFacilityFilter("");
    setDateFilter("");
  };

  const backHref = condoId
    ? `/owner/common-area-booking?condoId=${encodeURIComponent(condoId)}`
    : "/owner/common-area-booking";

  return (
    <OwnerShell
      activeKey="common-area-booking"
      showSidebar
      condoId={condoId}
      condoName={condoName || "คอนโดมิเนียม"}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-10">
          <Link
            to={backHref}
            state={condoId ? { condoId } : undefined}
            className="p-3.5 bg-white border border-slate-200 rounded-[20px] text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-90"
          >
            <ChevronLeft size={22} />
          </Link>

          <div>
            <h1 className="text-3xl font-black text-slate-900">
              ประวัติการจอง
            </h1>
            <p className="text-slate-500 text-sm">
              รายการการจองพื้นที่ส่วนกลางทั้งหมด
            </p>
          </div>
        </div>

        {!condoId ? (
          <EmptyState
            title="ไม่พบคอนโด"
            description="กรุณาเลือกคอนโดก่อน แล้วค่อยเข้ามาดูประวัติการจอง"
          />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-slate-400 font-bold text-sm">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <p className="text-rose-600 font-bold">{error}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Filter size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    ตัวกรองข้อมูล
                  </h2>
                  <p className="text-sm text-slate-500">
                    การจองทั้งหมด {filteredBookings.length} รายการ
                  </p>
                </div>

                {(search || roomFilter || facilityFilter || dateFilter) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-all"
                  >
                    <X size={14} />
                    ล้างตัวกรอง
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาชื่อผู้จอง / ห้อง / สถานที่"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="relative">
                  <Building2
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={facilityFilter}
                    onChange={(e) => setFacilityFilter(e.target.value)}
                    placeholder="กรองตามชื่อสถานที่"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={roomFilter}
                    onChange={(e) => setRoomFilter(e.target.value)}
                    placeholder="กรองตามเลขห้อง"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    aria-label="\u0e01\u0e23\u0e2d\u0e07\u0e15\u0e32\u0e21\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-200">
                  <Search size={40} />
                </div>
                <p className="text-slate-500 font-bold text-lg">
                  ไม่พบประวัติการจอง
                </p>
                <p className="text-slate-400 text-sm">
                  ลองปรับตัวกรองใหม่อีกครั้ง
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <BookingTable bookings={filteredBookings} />
              </div>
            )}
          </>
        )}
      </div>
    </OwnerShell>
  );
};

export default BookingHistoryPage;