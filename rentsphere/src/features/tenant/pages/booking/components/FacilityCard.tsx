import React, { useEffect, useState } from "react";
import {
  checkBookingQuota,
  getFacilityBookingSummary,
} from "../services/booking.service";
import type { Facility } from "../types/facility.types";

interface FacilityCardProps {
  facility: Facility;
  onClick: () => void;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onClick }) => {
  const [remaining, setRemaining] = useState<number>(0);
  const [bookedCount, setBookedCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        const [quota, summary] = await Promise.all([
          checkBookingQuota(today, "any"),
          getFacilityBookingSummary(facility.id, today),
        ]);

        if (!mounted) return;

        setRemaining(quota?.remainingDay ?? 0);
        setBookedCount(summary?.bookedCount ?? 0);
      } catch (error) {
        console.error("LOAD FACILITY CARD ERROR:", error);
        if (!mounted) return;
        setRemaining(0);
        setBookedCount(0);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [facility.id]);

  const imageUrl =
    facility.coverImageUrl ||
    facility.imageUrl ||
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";

  const openTime = facility.bookingSetting?.openTime ?? "-";
  const closeTime = facility.bookingSetting?.closeTime ?? "-";
  const capacity = facility.bookingSetting?.maxPeople ?? "-";

  const isMaintenance = facility.status === "MAINTENANCE";

  return (
    <button
      onClick={onClick}
      disabled={isMaintenance}
      className="relative w-full aspect-[16/9] rounded-[2.5rem] overflow-hidden mb-4 shadow-lg active:scale-[0.98] transition-all group text-left border-4 border-white disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <img
        src={imageUrl}
        alt={facility.name}
        className="absolute inset-0 w-full h-full object-cover brightness-[0.65] group-hover:scale-105 transition-transform duration-700"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 p-6 text-white w-full">
        <h3 className="text-xl font-bold mb-1 tracking-tight">
          {facility.name}
        </h3>

        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase tracking-wider flex-wrap">
            <span>
              เปิด {openTime} - {closeTime}
            </span>
            <span className="w-1 h-1 bg-white/30 rounded-full"></span>
            <span>ความจุ {capacity} คน/รอบ</span>
          </div>

          {!facility.isQuotaExempt && (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 text-[11px] font-black uppercase tracking-[0.05em]">
                สิทธิ์วันนี้เหลือ{" "}
                <span className="text-white text-xs">{remaining} ครั้ง</span>
              </span>
            </div>
          )}
        </div>

        <div
          className={`inline-flex px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase backdrop-blur-md border ${
            isMaintenance
              ? "bg-amber-500/20 text-amber-200 border-amber-200/20"
              : "bg-white/10 text-white border-white/20"
          }`}
        >
          {isMaintenance ? "ปิดปรับปรุง" : `ถูกจองไปแล้ว ${bookedCount} รอบ`}
        </div>
      </div>
    </button>
  );
};

export default FacilityCard;