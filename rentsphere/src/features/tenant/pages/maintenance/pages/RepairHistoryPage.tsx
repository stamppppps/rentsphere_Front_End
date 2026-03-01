import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { RepairRequest, RepairStatus } from '../types/maintenance.types';
import { maintenanceService } from '../services/maintenance.service';

const StatusBadge: React.FC<{ status: RepairStatus }> = ({ status }) => {
  const config = {
    pending: { label: 'Pending', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: AlertCircle },
    completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'bg-gray-50 text-gray-600 border-gray-100', icon: AlertCircle },
  };

  const { label, color, icon: Icon } = config[status];

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${color}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

const RepairHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const requests: RepairRequest[] = maintenanceService.getRequests();

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/tenant/maintenance')}
              className="p-2.5 rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">รายการแจ้งซ่อม</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MY REPAIR TICKETS</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/tenant/maintenance', { replace: true })}
            className="w-11 h-11 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-4">
        {requests.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/tenant/maintenance/${item.id}`)}
            className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4 transition-all cursor-pointer relative"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {item.id}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <h3 className="text-base font-bold text-gray-800 line-clamp-1">{item.issueType}</h3>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={14} />
                <span className="text-[10px] font-medium">
                  {new Date(item.createdAt).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tenant/maintenance/${item.id}`);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                ดูรายละเอียดเพิ่มเติม
              </button>
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center space-y-4">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-800">ยังไม่มีรายการแจ้งซ่อม</h3>
            <p className="text-sm text-gray-400">รอเชื่อมต่อ backend เพื่อแสดงรายการจริง</p>
          </div>
          <button
            onClick={() => navigate('/tenant/maintenance', { replace: true })}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            ไปหน้าแจ้งซ่อม
          </button>
        </div>
      )}
    </div>
  );
};

export default RepairHistoryPage;
