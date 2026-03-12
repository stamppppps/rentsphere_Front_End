import { useCallback, useEffect, useState } from "react";
import { bookingService } from "../services/booking.service";
import type { Booking } from "../types/booking";

export const useBookings = (facilityId?: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        setError(null);

        const data = facilityId
          ? await bookingService.getBookingsByFacility(facilityId)
          : await bookingService.getBookings();

        const sortedData = [...(data ?? [])].sort((a, b) => {
          const dateTimeA = Date.parse(`${a.date}T${a.startTime || "00:00"}:00`) || 0
          const dateTimeB = new Date(`${b.date}T${b.startTime}`).getTime();
          return dateTimeB - dateTimeA;
        });

        setBookings(sortedData);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลการจองได้ในขณะนี้");
        console.error("[useBookings] Error:", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    },
    [facilityId]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refresh: fetchBookings,
  };
};