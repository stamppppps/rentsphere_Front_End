import { useState, useEffect, useCallback } from 'react';
import type { Facility } from '../types/facility';
import { facilityService } from '../services/facility.service';

export const useFacilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = useCallback(async () => {
    try {
      // If it's a manual refresh, we might not want the full-page loader 
      // but for this implementation we ensure the loading state is clear
      setLoading(true);
      setError(null);
      
      const data = await facilityService.getFacilities();
      setFacilities(data);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลพื้นที่ส่วนกลางได้ในขณะนี้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      console.error('[useFacilities] Fetch Error:', err);
    } finally {
      // Small artificial delay could be added here if the API is too fast 
      // to ensure the loading animation feels "stable", but we'll stick to performance.
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  return { 
    facilities, 
    loading, 
    error, 
    refresh: fetchFacilities 
  };
};
