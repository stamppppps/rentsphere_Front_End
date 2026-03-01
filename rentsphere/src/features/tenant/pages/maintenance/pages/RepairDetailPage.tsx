import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { maintenanceService } from '../services/maintenance.service';

const RepairDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const request = id ? maintenanceService.getRequestById(id) : undefined;

  if (!request) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pb-24">
        <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/tenant/maintenance/history', { replace: true })}
              className="p-2.5 rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">รายละเอียดการแจ้งซ่อม</h1>
          </div>
        </div>

        <div className="px-6 mt-10">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center space-y-3">
            <div className="flex justify-center text-amber-500">
              <AlertCircle size={34} />
            </div>
            <p className="text-base font-bold text-gray-800">ยังไม่มีข้อมูลจาก backend</p>
            <p className="text-sm text-gray-500">รอ backend จริงแล้วหน้ารายละเอียดจะแสดงข้อมูลอัตโนมัติ</p>
            <button
              onClick={() => navigate('/tenant/maintenance/history', { replace: true })}
              className="mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              กลับไปรายการ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RepairDetailPage;
