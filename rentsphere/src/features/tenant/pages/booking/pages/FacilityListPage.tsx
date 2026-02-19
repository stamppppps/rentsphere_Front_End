import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Info } from "lucide-react";
import FacilityCard from "../components/FacilityCard";
import type { Facility } from "../types/facility.types";
import { getFacilities, checkBookingQuota } from "../services/booking.service";
import { BOOKING_TEXT } from "../constants/bookingText";

const FacilityListPage: React.FC = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ตรวจสอบโควตารวมของเดือนนี้ (ยังคงของเพื่อนได้ก่อน)
  const globalQuota = checkBookingQuota(new Date().toISOString(), "any");
  const remaining = globalQuota.remainingMonth ?? 10;

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const data = await getFacilities(); // ✅ ดึงจาก backend จริง
        if (!alive) return;

        setFacilities(data);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "โหลดรายการพื้นที่ส่วนกลางไม่สำเร็จ");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (err)
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-[#f0f5ff] to-white p-6 pt-10">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow">
          <div className="font-black text-gray-800 text-lg mb-2">เกิดข้อผิดพลาด</div>
          <div className="text-sm text-red-600 font-bold">{err}</div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-3 rounded-2xl bg-blue-600 text-white font-black shadow active:scale-95"
            >
              ลองใหม่
            </button>
            <button
              onClick={() => navigate("/tenant/home")}
              className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-black active:scale-95"
            >
              กลับหน้า Home
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-[#f0f5ff] to-white pb-32">
      {/* Header */}
      <div className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-[#f0f7ff]/80 backdrop-blur-xl z-50">
        <button
          onClick={() => navigate("/tenant/home")}
          className="p-2.5 rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-800 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>

        <h1 className="text-xl font-black text-gray-800 tracking-tight">
          {BOOKING_TEXT.LIST_TITLE}
        </h1>
        <div className="w-11"></div>
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
                คงเหลือ{" "}
                <span className="text-blue-600">{remaining} ครั้ง</span> / เดือน
              </p>
            </div>
          </div>
          <div className="text-[10px] font-black text-blue-400/60 vertical-text uppercase tracking-widest hidden sm:block">
            QUOTA
          </div>
        </div>
      </div>

      {/* Facilities List */}
      <div className="px-6">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">
          พื้นที่ทั้งหมด
        </p>

        {facilities.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white shadow text-gray-600 font-bold">
            ยังไม่มีพื้นที่ส่วนกลาง
          </div>
        ) : (
          facilities.map((f) => (
            <FacilityCard
              key={f.id}
              facility={f}
              onClick={() => navigate(`/tenant/booking/${f.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FacilityListPage;
