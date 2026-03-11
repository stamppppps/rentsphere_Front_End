import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ListFilter, Wrench } from 'lucide-react';
import RepairForm from '../components/RepairForm';
import { maintenanceService } from '../services/maintenance.service';
import { useState } from 'react';

const RepairRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const editId = id ?? (location.state as { editId?: string } | null)?.editId;
  const initialData = editId ? maintenanceService.getRequestById(editId) : undefined;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (data: any) => {
    try {
      setErr("");
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const lineUserId = localStorage.getItem("lineUserId");

      if (!token && !lineUserId) {
        setErr("กรุณาเข้าสู่ระบบก่อนทำรายการ");
        return;
      }
      const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const payload: Record<string, any> = {
        problem_type: data.issueType,
        room: data.roomNumber,
        location: data.location,
        description: data.details,
        images: data.images || [],
      };

      if (lineUserId && !token) {
        payload.lineUserId = lineUserId;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API}/repair/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create request");
      }

      navigate('/tenant/maintenance/history', { replace: true });
    } catch (e: any) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditNotFound = Boolean(editId && !initialData);

  return (
    <div className="min-h-screen bg-[#F6F8FF] pb-28">
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(260%); } }
        @keyframes pop { 0% { transform: translateY(6px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-[#2F6BFF]/10 blur-3xl" />
        <div className="absolute -bottom-24 right-0 w-[360px] h-[360px] rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      {/* Top Bar */}
      <div className="sticky top-0 z-40">
        <div className="bg-[#F6F8FF]/85 backdrop-blur supports-[backdrop-filter]:backdrop-blur-lg border-b border-blue-100/50">
          <div className="px-5 pt-6 pb-3">
            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={() => navigate('/tenant')}
                className="absolute left-0 p-3 rounded-2xl bg-white/80 border border-blue-100/70 shadow-sm active:scale-95 transition"
                aria-label="Back"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="text-center">
                <div className="text-[22px] font-black text-slate-900">
                  {editId ? 'แก้ไขการแจ้งซ่อม' : 'แจ้งซ่อม'}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {editId ? 'EDIT REQUEST' : 'REPAIR REQUEST'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/tenant/maintenance/history', { replace: true })}
                className="absolute right-0 p-3 rounded-2xl bg-white/80 border border-blue-100/70 shadow-sm active:scale-95 transition"
                aria-label="History"
              >
                <ListFilter size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 mt-5 relative" style={{ animation: "pop .26s ease-out both" }}>
        {err && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-[13px] font-black text-rose-700 flex items-center gap-2">
            <span className="text-[18px]">⚠️</span> {err}
          </div>
        )}

        {isSubmitting ? (
          <div className="rounded-[22px] border border-blue-100/70 bg-white p-10 shadow-[0_14px_40px_rgba(15,23,42,0.08)] text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EAF0FF] border border-blue-100/70 flex items-center justify-center mb-4">
              <Wrench className="text-[#2F6BFF] animate-spin" size={24} />
            </div>
            <div className="text-[16px] font-black text-slate-900">กำลังส่งข้อมูล...</div>
            <div className="text-[12px] font-bold text-slate-500 mt-1">กรุณารอสักครู่</div>
          </div>
        ) : isEditNotFound ? (
          <div className="rounded-[22px] border border-blue-100/70 bg-white p-8 shadow-[0_14px_40px_rgba(15,23,42,0.08)] text-center space-y-2">
            <div className="text-[16px] font-black text-slate-900">ยังไม่มีข้อมูลสำหรับแก้ไข</div>
            <div className="text-[13px] font-bold text-slate-500">รอ backend จริงเพื่อดึงข้อมูลรายการแจ้งซ่อม</div>
          </div>
        ) : (
          <RepairForm onSubmit={handleSubmit} initialData={initialData} />
        )}
      </div>
    </div>
  );
};

export default RepairRequestPage;
