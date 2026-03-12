import { useCallback, useEffect, useMemo, useState } from "react";
import { bookingService } from "../services/booking.service";
import { facilityService } from "../services/facility.service";
import { type Booking, BookingStatus } from "../types/booking";
import { type Facility, FacilityStatus } from "../types/facility";

type FacilitySettingFormData = {
  openTime: string;
  closeTime: string;
  slotMinutes: number;
  maxPeople: number | null;
  maxBookingsPerDay: number | null;
  requiresApproval: boolean;
  feePerSlot: number;
  deposit: number;
  cancellationHours: number;
};

export const useFacilityDetail = (id?: string) => {
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);

  const stats = useMemo(() => {
    return {
      total: todayBookings.length,
      active: todayBookings.filter(
        (b) => b.status === BookingStatus.APPROVED
      ).length,
      pending: todayBookings.filter(
        (b) => b.status === BookingStatus.PENDING
      ).length,
      completed: todayBookings.filter(
        (b) => b.status === BookingStatus.COMPLETED
      ).length,
    };
  }, [todayBookings]);

  const fetchData = useCallback(async () => {
    if (!id) {
      setFacility(null);
      setTodayBookings([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [facilityData, bookingData] = await Promise.all([
        facilityService.getFacilityById(id),
        bookingService.getBookingsByFacility(id),
      ]);

      if (!facilityData) {
        setError("ไม่พบข้อมูลพื้นที่ที่ต้องการ หรือพื้นที่ถูกลบออกจากระบบแล้ว");
        setFacility(null);
        setTodayBookings([]);
        return;
      }

      setFacility(facilityData);
      setTodayBookings(Array.isArray(bookingData) ? bookingData : []);
    } catch (err) {
      console.error("[useFacilityDetail] Error:", err);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล โปรดลองใหม่อีกครั้ง");
      setFacility(null);
      setTodayBookings([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateStatus = async (newStatus: FacilityStatus) => {
    if (!facility || !id) return;

    const previousState = { ...facility };

    try {
      setFacility((prev) => (prev ? { ...prev, status: newStatus } : null));

      await facilityService.updateFacility(id, { status: newStatus });
      await fetchData();
    } catch (err) {
      setFacility(previousState);
      console.error("[useFacilityDetail] Update Status Error:", err);
      throw err;
    }
  };

  const updateSettings = async (settings: FacilitySettingFormData) => {
    if (!facility || !id) return;

    const previousState = { ...facility };

    try {
      setFacility((prev) =>
        prev
          ? {
              ...prev,
              bookingSetting: {
                id: prev.bookingSetting?.id ?? "",
                ...settings,
              },
            }
          : null
      );

      await facilityService.saveFacilitySettings(id, settings);
      await fetchData();
    } catch (err) {
      setFacility(previousState);
      console.error("[useFacilityDetail] Update Settings Error:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    facility,
    loading,
    error,
    stats,
    todayBookings,
    refresh: fetchData,
    updateStatus,
    updateSettings,
  };
};