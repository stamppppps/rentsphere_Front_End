import React, { useState } from 'react';
import { type Booking, BookingStatus } from '../types/booking';
import { bookingService } from '../services/booking.service';
import BookingRow from './BookingRow';
import EmptyState from './EmptyState';
import ApproveRejectModal from '../modals/ApproveRejectModal';
import LateConfirmModal from '../modals/LateConfirmModal';
import NoShowConfirmModal from '../modals/NoShowConfirmModal';
import CancelBookingModal from '../modals/CancelBookingModal';
import { Calendar, User, Users, Info, Settings2, Hash } from 'lucide-react';

interface BookingTableProps {
  bookings: Booking[];
  onRefresh?: () => void;
}

const BookingTable: React.FC<BookingTableProps> = ({ bookings, onRefresh }) => {
  const [modal, setModal] = useState<{ type: string, booking: Booking | null }>({ type: '', booking: null });

  const handleAction = (action: string, booking: Booking) => {
    setModal({ type: action, booking });
  };

  const handleUpdateStatus = async (status: BookingStatus) => {
    if (!modal.booking) return;
    try {
      await bookingService.updateStatus(modal.booking.id, status);
      onRefresh?.();
      setModal({ type: '', booking: null });
    } catch (err) {
      console.error('Failed to update booking status:', err);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="py-20 bg-white">
        <EmptyState 
          title="ไม่พบรายการจอง" 
          description="ยังไม่มีผู้ทำรายการจองสำหรับพื้นที่นี้ในขณะนี้ หรือไม่พบข้อมูลตามตัวกรองที่เลือก" 
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100">
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-300" />
                วันที่ / เวลา
              </div>
            </th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-slate-300" />
                ห้องพัก
              </div>
            </th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-300" />
                ผู้จอง
              </div>
            </th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
              <div className="flex items-center justify-center gap-2">
                <Users size={14} className="text-slate-300" />
                จำนวน
              </div>
            </th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-slate-300" />
                สถานะ
              </div>
            </th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">
              <div className="flex items-center justify-end gap-2">
                <Settings2 size={14} className="text-slate-300" />
                การจัดการ
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {bookings.map((booking) => (
            <BookingRow 
              key={booking.id} 
              booking={booking} 
              onAction={handleAction} 
            />
          ))}
        </tbody>
      </table>

      {/* Action Modals */}
      {modal.type === 'approve' && modal.booking && (
        <ApproveRejectModal 
          type="approve" 
          bookingName={modal.booking.userName} 
          onClose={() => setModal({ type: '', booking: null })}
          onConfirm={() => handleUpdateStatus(BookingStatus.APPROVED)}
        />
      )}
      {modal.type === 'reject' && modal.booking && (
        <ApproveRejectModal 
          type="reject" 
          bookingName={modal.booking.userName} 
          onClose={() => setModal({ type: '', booking: null })}
          onConfirm={() => handleUpdateStatus(BookingStatus.REJECTED)}
        />
      )}
      {modal.type === 'late' && modal.booking && (
        <LateConfirmModal 
          onClose={() => setModal({ type: '', booking: null })}
          onConfirm={() => handleUpdateStatus(BookingStatus.LATE)}
        />
      )}
      {modal.type === 'no_show' && modal.booking && (
        <NoShowConfirmModal 
          userName={modal.booking.userName}
          onClose={() => setModal({ type: '', booking: null })}
          onConfirm={() => handleUpdateStatus(BookingStatus.NO_SHOW)}
        />
      )}
      {modal.type === 'cancel' && modal.booking && (
        <CancelBookingModal 
          onClose={() => setModal({ type: '', booking: null })}
          onConfirm={() => handleUpdateStatus(BookingStatus.CANCELLED)}
        />
      )}
      {modal.type === 'complete' && modal.booking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white p-10 rounded-[40px] max-w-sm w-full text-center">
            <h3 className="text-xl font-black mb-4">ยืนยันการเช็คอิน / เสร็จสิ้น?</h3>
            <p className="text-slate-500 mb-8">บันทึกว่าลูกบ้านเข้าใช้งานพื้นที่เรียบร้อยแล้ว</p>
            <div className="flex gap-4">
              <button onClick={() => setModal({type: '', booking: null})} className="flex-1 py-3 border rounded-xl font-bold">ยกเลิก</button>
              <button onClick={() => handleUpdateStatus(BookingStatus.COMPLETED)} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTable;
