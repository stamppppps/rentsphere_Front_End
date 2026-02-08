
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useFacilityDetail } from '../hooks/useFacilityDetail';
import { useBookings } from '../hooks/useBookings';
import FacilityHeader from '../components/FacilityHeader';
import BookingTable from '../components/BookingTable';
import FacilitySummary from '../components/FacilitySummary';
import FacilitySettingModal from '../modals/FacilitySettingModal';
import { BookingStatus } from '../types/booking';
import { type Facility, FacilityStatus } from '../types/facility';
import { bookingService } from '../services/booking.service';
import { checkIfExpired } from '../utils/time';
import { 
  Loader2, 
  CalendarDays,
  Sparkles
} from 'lucide-react';
import ErrorState from '../components/ErrorState';

const FacilityDetailPage: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const { 
    facility, 
    loading: fLoading, 
    error, 
    refresh: fRefresh,
    updateStatus,
    updateSettings
  } = useFacilityDetail(facilityId);
  
  const { bookings, loading: bLoading, refresh: bRefresh } = useBookings(facilityId);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  // Statistics calculation
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      active: bookings.filter(b => b.status === BookingStatus.APPROVED).length,
      late: bookings.filter(b => b.status === BookingStatus.LATE).length,
      noShow: bookings.filter(b => b.status === BookingStatus.NO_SHOW).length,
      expired: bookings.filter(b => b.status === BookingStatus.APPROVED && checkIfExpired(b.date, b.endTime)).length,
    };
  }, [bookings]);

  const handleToggleStatus = async () => {
    if (!facility) return;
    // User requested specifically to toggle to "Maintenance" (ปิดปรับปรุงพื้นที่)
    const newStatus = facility.status === FacilityStatus.AVAILABLE 
      ? FacilityStatus.MAINTENANCE 
      : FacilityStatus.AVAILABLE;
    
    await updateStatus(newStatus);
  };

  const handleSaveSettings = async (data: Partial<Facility>) => {
    await updateSettings(data);
    setIsSettingsOpen(false);
  };

  const handleAutoCleanup = async () => {
    const expiredBookings = bookings.filter(b => 
      b.status === BookingStatus.APPROVED && checkIfExpired(b.date, b.endTime)
    );

    if (expiredBookings.length === 0) {
      alert('ไม่มีรายการที่หมดเวลาจอง (Expired) ในขณะนี้');
      return;
    }

    setIsCleaning(true);
    try {
      for (const b of expiredBookings) {
        await bookingService.updateStatus(b.id, BookingStatus.COMPLETED, {
          notes: 'ระบบปิดรายการอัตโนมัติ (Soft Complete) เนื่องจากหมดเวลาและไม่มีการลงโทษ No-Show'
        });
      }
      await bRefresh();
    } catch {
      alert('เกิดข้อผิดพลาดในการกวาดล้างรายการ');
    } finally {
      setIsCleaning(false);
    }
  };

  if (fLoading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50/50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">กำลังดึงข้อมูลพื้นที่...</p>
      </div>
    </div>
  );

  if (error || !facility) return <ErrorState message={error || 'ไม่พบข้อมูลพื้นที่ที่ต้องการ'} onRetry={fRefresh} />;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header with toggle action */}
      <FacilityHeader 
        facility={facility} 
        onSettings={() => setIsSettingsOpen(true)} 
        onToggleStatus={handleToggleStatus}
      />

      {/* Summary Statistics */}
      <FacilitySummary 
        today={stats.total}
        active={stats.active}
        late={stats.late}
        noShow={stats.noShow}
      />

      {/* Bookings Table Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
              <CalendarDays size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">ตารางการจอง</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {stats.expired > 0 && (
              <button 
                disabled={isCleaning}
                onClick={handleAutoCleanup}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl text-xs font-black hover:bg-indigo-100 transition-all shadow-sm active:scale-95 animate-pulse"
              >
                {isCleaning ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                ปิดรายการหมดเวลา ({stats.expired})
              </button>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500">
               <span className="w-2 h-2 rounded-full bg-amber-500"></span> {bookings.filter(b => b.status === BookingStatus.PENDING).length} รออนุมัติ
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {stats.active} อนุมัติแล้ว
            </div>
          </div>
        </div>

        {bLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <p className="text-slate-400 font-bold text-xs uppercase">กำลังดึงรายการล่าสุด...</p>
          </div>
        ) : (
          <BookingTable bookings={bookings} onRefresh={bRefresh} />
        )}
      </div>

      {isSettingsOpen && (
        <FacilitySettingModal 
          facility={facility} 
          onClose={() => setIsSettingsOpen(false)} 
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
};

export default FacilityDetailPage;
