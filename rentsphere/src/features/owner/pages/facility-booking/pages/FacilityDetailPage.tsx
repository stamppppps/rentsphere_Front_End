import { CalendarDays, Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import OwnerShell from "@/features/owner/components/OwnerShell";
import { useCondoStore } from "@/features/owner/stores/condoStore";
import BookingTable from "../components/BookingTable";
import ErrorState from "../components/ErrorState";
import FacilityHeader from "../components/FacilityHeader";
import FacilitySummary from "../components/FacilitySummary";
import { useBookings } from "../hooks/useBookings";
import { useFacilityDetail } from "../hooks/useFacilityDetail";
import FacilitySettingModal from "../modals/FacilitySettingModal";
import { facilityService } from "../services/facility.service";
import { BookingStatus } from "../types/booking";
import { FacilityStatus } from "../types/facility";
import { checkIfExpired } from "../utils/time";

type FacilitySettingFormData = {
  facilityName: string;
  imageFile?: File | null;
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

const FacilityDetailPage: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();
  const condoName = useCondoStore((s) => s.condoName);

  const {
    facility,
    loading: fLoading,
    error,
    refresh: fRefresh,
    updateStatus,
  } = useFacilityDetail(facilityId);

  const {
    bookings,
    loading: bLoading,
    refresh: bRefresh,
  } = useBookings(facilityId);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [roomFilter, setRoomFilter] = useState("");

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      active: bookings.filter(
        (b) =>
          b.status === BookingStatus.APPROVED &&
          !checkIfExpired(b.date, b.endTime)
      ).length,
      completed: bookings.filter(
        (b) =>
          b.status === BookingStatus.COMPLETED ||
          (b.status === BookingStatus.APPROVED &&
            checkIfExpired(b.date, b.endTime))
      ).length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const keyword = roomFilter.trim().toLowerCase();

    const sorted = [...bookings].sort((a, b) => {
      const aDateTime = new Date(`${a.date}T${a.startTime}:00`).getTime();
      const bDateTime = new Date(`${b.date}T${b.startTime}:00`).getTime();
      return bDateTime - aDateTime;
    });

    if (!keyword) return sorted;

    return sorted.filter((booking) =>
      String(booking.unit ?? "").toLowerCase().includes(keyword)
    );
  }, [bookings, roomFilter]);

  const handleToggleStatus = async () => {
    if (!facility) return;

    const newStatus =
      facility.status === FacilityStatus.AVAILABLE
        ? FacilityStatus.MAINTENANCE
        : FacilityStatus.AVAILABLE;

    try {
      await updateStatus(newStatus);
      await fRefresh();
    } catch (error) {
      console.error("UPDATE FACILITY STATUS ERROR:", error);
      alert("อัปเดตสถานะพื้นที่ไม่สำเร็จ");
    }
  };

  const handleSaveSettings = async (data: FacilitySettingFormData) => {
    if (!facility) return;

    try {
      await facilityService.updateFacility(facility.id, {
        facilityName: data.facilityName,
      });

      await facilityService.saveFacilitySettings(facility.id, {
        openTime: data.openTime,
        closeTime: data.closeTime,
        slotMinutes: data.slotMinutes,
        maxPeople: data.maxPeople,
        maxBookingsPerDay: data.maxBookingsPerDay,
        requiresApproval: data.requiresApproval,
        feePerSlot: data.feePerSlot,
        deposit: data.deposit,
        cancellationHours: data.cancellationHours,
      });

      if (data.imageFile) {
        await facilityService.uploadFacilityImage(facility.id, data.imageFile);
      }

      await fRefresh();
      setIsSettingsOpen(false);
    } catch (error) {
      console.error("UPDATE FACILITY SETTINGS ERROR:", error);
      alert("บันทึกการตั้งค่าไม่สำเร็จ");
      throw error;
    }
  };

  const handleDeleteFacility = async () => {
    if (!facility) return;

    try {
      await facilityService.deleteFacility(facility.id);
      alert("ลบพื้นที่ส่วนกลางเรียบร้อยแล้ว");
      navigate("/owner/common-area-booking");
    } catch (error) {
      console.error("DELETE FACILITY ERROR:", error);
      alert("ลบพื้นที่ส่วนกลางไม่สำเร็จ");
      throw error;
    }
  };

  if (fLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
            กำลังดึงข้อมูลพื้นที่...
          </p>
        </div>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <ErrorState
        message={error || "ไม่พบข้อมูลพื้นที่ที่ต้องการ"}
        onRetry={fRefresh}
      />
    );
  }

  return (
    <OwnerShell
      activeKey="common-area-booking"
      showSidebar
      condoName={condoName || "คอนโดมิเนียม"}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <FacilityHeader
          facility={facility}
          onSettings={() => setIsSettingsOpen(true)}
          onToggleStatus={handleToggleStatus}
        />

        <FacilitySummary
          total={stats.total}
          active={stats.active}
          completed={stats.completed}
        />

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                <CalendarDays size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">
                ตารางการจอง
              </h2>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                placeholder="กรองตามหมายเลขห้อง"
                className="h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
              />

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {stats.total} การจองทั้งหมด
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {stats.active} กำลังใช้งาน
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                {stats.completed} เสร็จสิ้น
              </div>
            </div>
          </div>

          {bLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
              <p className="text-slate-400 font-bold text-xs uppercase">
                กำลังดึงรายการล่าสุด...
              </p>
            </div>
          ) : (
            <BookingTable bookings={filteredBookings} onRefresh={bRefresh} />
          )}
        </div>

        {isSettingsOpen && (
          <FacilitySettingModal
            facility={facility}
            onClose={() => setIsSettingsOpen(false)}
            onSave={handleSaveSettings}
            onDelete={handleDeleteFacility}
          />
        )}
      </div>
    </OwnerShell>
  );
};

export default FacilityDetailPage;