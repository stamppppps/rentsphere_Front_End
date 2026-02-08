
import { useState, useEffect, useCallback, useMemo } from 'react';
import { type Facility, FacilityStatus } from '../types/facility';
import { type Booking, BookingStatus } from '../types/booking';
import { facilityService } from '../services/facility.service';
import { bookingService } from '../services/booking.service';

/**
 * The core logic hook for the Facility Detail Page.
 * Manages facility information, real-time booking statistics, and status controls.
 */
export const useFacilityDetail = (id?: string) => {
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);

  // Calculation of summary statistics based on loaded bookings
  const stats = useMemo(() => {
    return {
      total: todayBookings.length,
      active: todayBookings.filter(b => b.status === BookingStatus.APPROVED).length,
      late: todayBookings.filter(b => b.status === BookingStatus.LATE).length,
      noShow: todayBookings.filter(b => b.status === BookingStatus.NO_SHOW).length,
    };
  }, [todayBookings]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      
      const [facilityData, bookingData] = await Promise.all([
        facilityService.getFacilityById(id),
        bookingService.getBookings(id)
      ]);

      if (!facilityData) {
        setError('ไม่พบข้อมูลพื้นที่ที่ต้องการ หรือพื้นที่ถูกลบออกจากระบบแล้ว');
        return;
      }

      setFacility(facilityData);
      setTodayBookings(bookingData);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล โปรดลองใหม่อีกครั้ง');
      console.error('[useFacilityDetail] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  /**
   * Universal update function for facility properties (status, settings, etc.)
   */
  const updateFacilityData = async (data: Partial<Facility>) => {
    if (!facility || !id) return;
    const previousState = { ...facility };
    try {
      // Optimistic update
      setFacility(prev => prev ? { ...prev, ...data } : null);
      
      await facilityService.updateFacility(id, data);
      // Optional: re-fetch to ensure sync
      // await fetchData();
    } catch (err) {
      // Revert on failure
      setFacility(previousState);
      console.error('[useFacilityDetail] Update Error:', err);
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
    refresh: fetchData,
    updateStatus: (newStatus: FacilityStatus) => updateFacilityData({ status: newStatus }),
    updateSettings: (settings: Partial<Facility>) => updateFacilityData(settings)
  };
};
