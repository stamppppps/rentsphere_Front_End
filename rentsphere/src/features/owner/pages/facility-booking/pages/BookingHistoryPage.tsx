
import React, { useState, useEffect, useMemo } from 'react';
import { bookingService } from '../services/booking.service';
import { facilityService } from '../services/facility.service';
import type { Booking, BookingStatus } from '../types/booking';
import type { Facility } from '../types/facility';
import { 
  ChevronLeft, 
  Filter, 
  Search, 
  Download, 
  Loader2, 
  Calendar, 
  Home, 
  Tag, 
  X,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookingTable from '../components/BookingTable';
import { BOOKING_STATUS_CONFIG } from '../constants/bookingStatus';

const BookingHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [facilityFilter, setFacilityFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [bData, fData] = await Promise.all([
        bookingService.getBookings(),
        facilityService.getFacilities()
      ]);
      setBookings(bData);
      setFacilities(fData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.userName.toLowerCase().includes(search.toLowerCase()) || 
                           b.unit.toLowerCase().includes(search.toLowerCase()) ||
                           b.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const matchesFacility = facilityFilter === 'ALL' || b.facilityId === facilityFilter;
      const matchesDate = !dateFilter || b.date === dateFilter;

      return matchesSearch && matchesStatus && matchesFacility && matchesDate;
    });
  }, [bookings, search, statusFilter, facilityFilter, dateFilter]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setFacilityFilter('ALL');
    setDateFilter('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Back Button Section - Improved UI */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/owner/common-area-booking')} 
          className="p-3.5 bg-white border border-slate-200 rounded-[20px] text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-90"
          title="กลับไปหน้าหลัก"
        >
          <ChevronLeft size={22} />
        </button>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Back to Dashboard</p>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-md">Archive Management</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">ประวัติการจองทั้งหมด</h1>
          <p className="text-slate-500 font-medium mt-1">ตรวจสอบและวิเคราะห์พฤติกรรมการใช้งานย้อนหลังของลูกบ้านทั้งหมดในโครงการ</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-[22px] font-bold hover:bg-indigo-950 transition-all shadow-xl shadow-slate-200 active:scale-95">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Filter size={18} />
          </div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">ตัวกรองข้อมูลอัจฉริยะ</h2>
          {(search || statusFilter !== 'ALL' || facilityFilter !== 'ALL' || dateFilter) && (
            <button 
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
            >
              <X size={14} /> ล้างการค้นหา
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อผู้จอง / เลขที่ห้อง</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาข้อมูล..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all font-semibold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">พื้นที่ส่วนกลาง</label>
            <div className="relative">
              <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <select 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl appearance-none focus:outline-none font-semibold cursor-pointer"
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
              >
                <option value="ALL">เลือกพื้นที่ทั้งหมด</option>
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">สถานะ</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <select 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl appearance-none focus:outline-none font-semibold cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'ALL')}
              >
                <option value="ALL">ทุกสถานะ</option>
                {Object.entries(BOOKING_STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="date" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none font-semibold"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Table Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">รายการประวัติ</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total: {filteredBookings.length} bookings found</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing data logs...</p>
          </div>
        ) : (
          <div className="pb-10">
            <BookingTable bookings={filteredBookings} />
            {filteredBookings.length === 0 && (
              <div className="py-24 text-center flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-200">
                  <Search size={40} />
                </div>
                <div>
                   <p className="text-slate-500 font-bold text-lg">ไม่พบข้อมูลตามตัวกรอง</p>
                   <p className="text-slate-400 text-sm font-medium">ลองปรับเงื่อนไขการค้นหาใหม่อีกครั้ง</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistoryPage;
