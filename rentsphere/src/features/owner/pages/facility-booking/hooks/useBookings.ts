
import { useState, useEffect, useCallback } from 'react';
import type { Booking } from '../types/booking';
import { bookingService } from '../services/booking.service';

/**
 * Custom hook to manage booking data for the admin dashboard.
 * Designed to provide a stable state for tables and allow for 
 * "No-Reload" updates after admin actions.
 */
export const useBookings = (facilityId?: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches bookings from the service.
   * @param silent If true, updates state without triggering the loading spinner.
   */
  const fetchBookings = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      
      const data = await bookingService.getBookings(facilityId);
      
      // Sort: Pending first, then by date (most recent first)
      const sortedData = [...data].sort((a, b) => {
        // First priority: Status order if needed (e.g. pending first)
        // Second priority: Date/Time
        const dateTimeA = new Date(`${a.date}T${a.startTime}`).getTime();
        const dateTimeB = new Date(`${b.date}T${b.startTime}`).getTime();
        return dateTimeB - dateTimeA;
      });

      setBookings(sortedData);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลการจองได้ในขณะนี้');
      console.error('[useBookings] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  // Automatic initial fetch
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { 
    bookings, 
    loading, 
    error, 
    refresh: fetchBookings 
  };
};
