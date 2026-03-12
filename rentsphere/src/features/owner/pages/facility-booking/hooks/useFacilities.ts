import { useCallback, useEffect, useState } from "react";
import { facilityService } from "../services/facility.service";
import type { Facility } from "../types/facility";

export const useFacilities = (condoId?: string) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = useCallback(async () => {
    if (!condoId) {
      setFacilities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await facilityService.getFacilities(condoId);
      setFacilities(data);
    } catch (err) {
      setError(
        "ไม่สามารถโหลดข้อมูลพื้นที่ส่วนกลางได้ในขณะนี้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต"
      );
      console.error("[useFacilities] Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [condoId]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  return {
    facilities,
    loading,
    error,
    refresh: fetchFacilities,
  };
};