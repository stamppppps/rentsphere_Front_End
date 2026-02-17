import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/booking.service';
import { auditService } from '../services/audit.service';
import { type Booking, BookingStatus } from '../types/booking';
import { type AuditLog, AuditAction } from '../types/audit';
import { 
  ChevronLeft, 
  Check, 
  X, 
  Clock, 
  User, 
  Home, 
  Calendar, 
  MessageSquare, 
  History, 
  Ban, 
  UserX, 
  CheckCircle2,
  Loader2,
  Plus,
  ShieldAlert,
  Edit,
  Timer,
  AlertCircle,
  Hourglass
} from 'lucide-react';
import { BOOKING_STATUS_CONFIG } from '../constants/bookingStatus';
import { checkIfLate, getMinutesLate, checkIfBeyondGracePeriod, checkIfExpired, getMinutesOver } from '../utils/time';

import OwnerShell from "@/features/owner/components/OwnerShell";

const BookingDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [bData, lData] = await Promise.all([
        bookingService.getBookingById(bookingId),
        auditService.getLogs(bookingId)
      ]);
      setBooking(bData);
      setLogs(lData);
    } catch (err) {
      console.error('Error loading booking details:', err);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const timeMetrics = useMemo(() => {
    if (!booking) return null;
    const isLate = (booking.status === BookingStatus.APPROVED || booking.status === BookingStatus.LATE || booking.status === BookingStatus.PENDING) && checkIfLate(booking.date, booking.startTime);
    const isExpired = (booking.status === BookingStatus.APPROVED || booking.status === BookingStatus.LATE) && checkIfExpired(booking.date, booking.endTime);
    const isBeyondGrace = isLate && checkIfBeyondGracePeriod(booking.date, booking.startTime);
    
    return {
      isLate,
      isExpired,
      isBeyondGrace,
      minutesLate: isLate ? getMinutesLate(booking.date, booking.startTime) : 0,
      minutesOver: isExpired ? getMinutesOver(booking.date, booking.endTime) : 0
    };
  }, [booking]);

  const handleUpdateStatus = async (status: BookingStatus) => {
    if (!bookingId) return;
    try {
      await bookingService.updateStatus(bookingId, status);
      await loadData();
    } catch {
      alert('ไม่สามารถอัปเดตสถานะได้ในขณะนี้');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-slate-50/50">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">กำลังเตรียมข้อมูลรายการจอง...</p>
    </div>
  );

  if (!booking) return (
    <div className="p-20 text-center">
      <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShieldAlert size={40} />
      </div>
      <h2 className="text-xl font-black text-slate-800">ไม่พบข้อมูลการจอง</h2>
      <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 font-bold">กลับไปหน้าก่อนหน้า</button>
    </div>
  );

  const statusConfig = BOOKING_STATUS_CONFIG[booking.status];

  const getLogStyle = (action: AuditAction | string) => {
    switch (action) {
      case AuditAction.BOOKING_CREATE:
        return { color: 'bg-indigo-500 text-white', icon: Plus };
      case AuditAction.BOOKING_APPROVE:
      case AuditAction.BOOKING_CHECK_IN:
        return { color: 'bg-emerald-500 text-white', icon: Check };
      case AuditAction.BOOKING_CHECK_OUT:
        return { color: 'bg-emerald-600 text-white', icon: CheckCircle2 };
      case AuditAction.BOOKING_REJECT:
      case AuditAction.BOOKING_CANCEL:
        return { color: 'bg-rose-500 text-white', icon: Ban };
      case AuditAction.BOOKING_NO_SHOW:
        return { color: 'bg-rose-600 text-white', icon: UserX };
      case AuditAction.BOOKING_LATE:
        return { color: 'bg-amber-500 text-white', icon: Clock };
      case AuditAction.BOOKING_EDIT:
        return { color: 'bg-blue-500 text-white', icon: Edit };
      default:
        return { color: 'bg-slate-400 text-white', icon: History };
    }
  };

  return (
    <OwnerShell activeKey="common-area-booking" showSidebar>
      <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3.5 bg-white border border-slate-200 rounded-[20px] text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-90">
          <ChevronLeft size={22} />
        </button>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">ดูรายละเอียดการจอง</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm ${statusConfig.color}`}>{statusConfig.label}</span>
                    {timeMetrics?.isExpired ? (
                      <span className="px-3 py-1.5 bg-rose-600 text-white text-[10px] font-black rounded-full animate-pulse flex items-center gap-1.5">
                        <AlertCircle size={12} /> เกินเวลา {timeMetrics.minutesOver} นาที
                      </span>
                    ) : timeMetrics?.isLate ? (
                      <span className={`px-3 py-1.5 text-[10px] font-black rounded-full flex items-center gap-1.5 ${timeMetrics.isBeyondGrace ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-white animate-pulse'}`}>
                        <Timer size={12} /> สาย {timeMetrics.minutesLate} นาที
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">รหัสอ้างอิง: {booking.id}</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">{booking.facilityName}</h1>
                <p className="text-slate-500 font-medium">จัดการรายการจองรายบุคคลและตรวจสอบประวัติการทำรายการ</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] flex flex-col items-center gap-2 shadow-lg border border-slate-50 min-w-[140px]">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl font-black text-indigo-600">{booking.participants}</div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">จำนวนคน</p>
              </div>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-10">
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><User size={14} className="text-indigo-500" /> ข้อมูลลูกบ้าน</h3>
                  <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[32px] border border-slate-100/50">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center font-bold text-white text-2xl shadow-lg">{booking.userName.charAt(0)}</div>
                    <div>
                      <p className="font-black text-slate-800 text-xl">{booking.userName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Home size={14} className="text-slate-400" />
                        <p className="text-sm font-bold text-slate-500 tracking-tight">เลขห้อง {booking.unit}</p>
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Calendar size={14} className="text-indigo-500" /> วันและช่วงเวลา</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">วันที่</p>
                      <p className="font-black text-slate-800 text-lg">{booking.date}</p>
                    </div>
                    <div className="p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">ช่วงเวลา</p>
                      <p className="font-black text-slate-800 text-lg">{booking.startTime} - {booking.endTime}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-10">
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><MessageSquare size={14} className="text-indigo-500" /> หมายเหตุการจอง</h3>
                  <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 text-slate-600 italic min-h-[140px] leading-relaxed">"{booking.reason || 'ลูกบ้านไม่ได้ระบุหมายเหตุเพิ่มเติมมาในคำขอนี้'}"</div>
                </section>

                <section className="pt-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">ดำเนินการด่วน (QUICK ACTIONS)</h3>
                  
                  {/* Time Awareness Alert */}
                  {(timeMetrics?.isExpired || timeMetrics?.isLate) && booking.status !== BookingStatus.COMPLETED && (
                    <div className={`mb-5 p-5 rounded-[28px] border flex items-start gap-4 ${timeMetrics.isExpired || timeMetrics.isBeyondGrace ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                      <div className={`p-2.5 rounded-2xl shrink-0 ${timeMetrics.isExpired || timeMetrics.isBeyondGrace ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>
                        {timeMetrics.isExpired ? <Hourglass size={18} /> : <Timer size={18} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">สถานะเวลาปัจจุบัน</p>
                        <p className="text-[13px] font-bold leading-tight">
                          {timeMetrics.isExpired 
                            ? `เลยเวลาจองมาแล้ว ${timeMetrics.minutesOver} นาที`
                            : `มาสาย ${timeMetrics.minutesLate} นาที ${timeMetrics.isBeyondGrace ? '(เกินช่วงผ่อนปรน)' : ''}`
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {/* Pending State Row */}
                    {booking.status === BookingStatus.PENDING && (
                      <div className="flex flex-row gap-3">
                        <button onClick={() => handleUpdateStatus(BookingStatus.APPROVED)} className="flex-[2] py-5 bg-emerald-600 text-white rounded-[24px] font-black shadow-lg hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                          <Check size={18} /> อนุมัติคำขอ
                        </button>
                        <button onClick={() => handleUpdateStatus(BookingStatus.REJECTED)} className="flex-1 py-5 bg-rose-50 text-rose-600 rounded-[24px] font-black hover:bg-rose-100 transition-all border border-rose-100 flex items-center justify-center gap-2 text-xs">
                          <X size={18} /> ปฏิเสธ
                        </button>
                      </div>
                    )}

                    {/* Approved/Late/Active State Row (Horizontal 3 Buttons) */}
                    {(booking.status === BookingStatus.APPROVED || booking.status === BookingStatus.LATE) && (
                      <div className="flex flex-row gap-3 items-stretch">
                        {/* Check-in (Primary Action) */}
                        <button 
                          onClick={() => handleUpdateStatus(BookingStatus.COMPLETED)} 
                          className="flex-[2] flex flex-col items-center justify-center gap-1.5 py-4 bg-[#0F172A] text-white rounded-[24px] font-black shadow-xl hover:bg-indigo-600 transition-all active:scale-95 group"
                        >
                          <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                          <span className="text-[13px]">ยืนยันเช็คอิน</span>
                        </button>

                        {/* Late Action */}
                        <button 
                          onClick={() => handleUpdateStatus(BookingStatus.LATE)} 
                          className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-[24px] font-black border transition-all active:scale-95 ${
                            timeMetrics?.isLate ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-100' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                          }`}
                        >
                          <Clock size={18} />
                          <span className="text-[11px] text-center leading-tight">
                            บันทึกสาย<br/>
                            {timeMetrics?.isLate ? `(${timeMetrics.minutesLate}น.)` : ''}
                          </span>
                        </button>

                        {/* No-Show Action */}
                        <button 
                          onClick={() => handleUpdateStatus(BookingStatus.NO_SHOW)} 
                          className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-[24px] font-black border transition-all active:scale-95 ${
                            timeMetrics?.isBeyondGrace ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-100' : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                          }`}
                        >
                          <UserX size={18} />
                          <span className="text-[11px] text-center leading-tight">บันทึก<br/>No-Show</span>
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Log Section */}
        <div className="space-y-8 h-full">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-10 flex flex-col h-full">
            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><History size={20} /></div>
              ประวัติการดำเนินการ
            </h2>
            <div className="flex-1 space-y-8 relative before:absolute before:inset-0 before:left-[19px] before:w-0.5 before:bg-slate-100 before:h-full overflow-y-auto no-scrollbar pr-2">
              {logs.map((log) => {
                const style = getLogStyle(log.action);
                const IconComp = style.icon;
                return (
                  <div key={log.id} className="relative pl-12">
                    <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm z-10 border-4 border-white ${style.color}`}><IconComp size={16} /></div>
                    <div>
                      <div className="flex items-center justify-between mb-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.timestamp).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p></div>
                      <p className="font-bold text-slate-800 leading-snug text-sm">{log.details}</p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-bold uppercase">โดย {log.performedBy}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-12 p-6 bg-slate-50 rounded-[32px] border border-slate-100 border-dashed">
               <div className="flex items-center gap-3 mb-2"><ShieldAlert size={16} className="text-slate-400" /><h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">ระบบควบคุมความโปร่งใส</h4></div>
               <p className="text-[10px] text-slate-400 leading-relaxed font-medium">รายการประวัติไม่สามารถลบหรือแก้ไขได้ เพื่อความโปร่งใสในการจัดการพื้นที่ส่วนกลางภายในโครงการ</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </OwnerShell>
  );
};

export default BookingDetailPage;
