import { ChevronLeft, Info } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FacilityCard from "../components/FacilityCard";
import { BOOKING_TEXT } from "../constants/bookingText";
import { checkBookingQuota, getFacilities } from "../services/booking.service";
import { getBookingPolicy } from "../services/bookingPolicy.service";
import type { Facility } from "../types/facility.types";

const DEFAULT_DAILY_LIMIT = 2;

const FacilityListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(DEFAULT_DAILY_LIMIT);
  const [dailyLimit, setDailyLimit] = useState<number>(DEFAULT_DAILY_LIMIT);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date().toISOString().split("T")[0];

      const facilityData = await getFacilities();
      const safeFacilities = Array.isArray(facilityData) ? facilityData : [];

      setFacilities(safeFacilities);

      const condoId = safeFacilities[0]?.condoId;
      let limit = DEFAULT_DAILY_LIMIT;

      if (condoId) {
        try {
          const policy = await getBookingPolicy(condoId);
          limit = policy?.maxBookingsPerDay ?? DEFAULT_DAILY_LIMIT;
        } catch (policyError) {
          console.error("LOAD TENANT BOOKING POLICY ERROR:", policyError);
        }
      }

      setDailyLimit(limit);

      const quotaData = await checkBookingQuota(today, "any", limit);
      setRemaining(quotaData?.remainingDay ?? limit);
    } catch (err) {
      console.error("LOAD TENANT FACILITIES ERROR:", err);
      setError("โหลดข้อมูลพื้นที่ส่วนกลางไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, location.key]);

  useEffect(() => {
    const handleFocus = () => {
      loadData();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#f0f7ff] via-[#f0f5ff] to-white">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-[#f0f5ff] to-white px-6 pt-10">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/home")}
            className="p-2.5 rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-800 active:scale-90 transition-transform"
          >
            <ChevronLeft size={24} />
          </button>

          <h1 className="text-xl font-black text-gray-800 tracking-tight">
            {BOOKING_TEXT.LIST_TITLE}
          </h1>

          <div className="w-11" />
        </div>

        <div className="bg-white rounded-3xl border border-rose-100 p-6 text-center shadow-sm">
          <p className="text-rose-600 font-bold">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-5 py-3 rounded-2xl bg-rose-50 text-rose-600 font-bold"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-[#f0f5ff] to-white pb-32">
      <div className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-[#f0f7ff]/80 backdrop-blur-xl z-50">
        <button
          onClick={() => navigate("/home")}
          className="p-2.5 rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-800 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>

        <h1 className="text-xl font-black text-gray-800 tracking-tight">
          {BOOKING_TEXT.LIST_TITLE}
        </h1>

        <div className="w-11" />
      </div>

      <div className="px-6 mb-8">
        <div className="bg-white/60 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-xl shadow-purple-900/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Info size={24} />
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                สิทธิ์ของคุณ
              </p>
              <p className="text-sm font-bold text-gray-700">
                สิทธิ์วันนี้เหลือ{" "}
                <span className="text-blue-600">{remaining} ครั้ง</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                จากทั้งหมด {dailyLimit} ครั้ง / วัน
              </p>
            </div>
          </div>

          <div className="text-[10px] font-black text-blue-400/60 vertical-text uppercase tracking-widest hidden sm:block">
            DAILY
          </div>
        </div>
      </div>

      <div className="px-6">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">
          พื้นที่ทั้งหมด
        </p>

        {facilities.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 text-center shadow-sm text-gray-500 font-medium">
            ยังไม่มีพื้นที่ส่วนกลางให้จอง
          </div>
        ) : (
          facilities.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              onClick={() => navigate(`/tenant/booking/${facility.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FacilityListPage;