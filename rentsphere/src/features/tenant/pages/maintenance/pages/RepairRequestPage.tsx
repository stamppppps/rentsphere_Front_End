import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ListFilter } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2.5 rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{editId ? 'แก้ไขการแจ้งซ่อม' : 'แจ้งซ่อม'}</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{editId ? 'EDIT REPAIR REQUEST' : 'REPAIR REQUEST FORM'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/tenant/maintenance/history', { replace: true })}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <ListFilter size={18} />
            รายการของฉัน
          </button>
        </div>
      </div>

      <div className="px-6 mt-6">
        {err && (
          <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold">
            {err}
          </div>
        )}
        {isSubmitting ? (
          <div className="text-center font-bold text-gray-500 py-10">กำลังส่งข้อมูล...</div>
        ) : isEditNotFound ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center space-y-2">
            <p className="text-base font-bold text-gray-800">ยังไม่มีข้อมูลสำหรับแก้ไข</p>
            <p className="text-sm text-gray-500">รอ backend จริงเพื่อดึงข้อมูลรายการแจ้งซ่อม</p>
          </div>
        ) : (
          <RepairForm onSubmit={handleSubmit} initialData={initialData} />
        )}
      </div>
    </div>
  );
};

export default RepairRequestPage;
