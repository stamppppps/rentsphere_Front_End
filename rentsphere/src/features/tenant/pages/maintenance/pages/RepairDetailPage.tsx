import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Clock, CheckCircle2, Image as ImageIcon } from 'lucide-react';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === "OPEN") {
    return <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-amber-50 text-amber-600 border-amber-100"><Clock size={14} />Pending</span>;
  }
  if (status === "IN_PROGRESS" || status === "WAITING_PARTS") {
    return <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-blue-50 text-blue-600 border-blue-100"><AlertCircle size={14} />In Progress</span>;
  }
  if (status === "DONE") {
    return <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-100"><CheckCircle2 size={14} />Completed</span>;
  }
  return <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-gray-50 text-gray-600 border-gray-100"><AlertCircle size={14} />Cancelled</span>;
};

const RepairDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const lineUserId = localStorage.getItem("lineUserId");

        if (!token && !lineUserId) {
          navigate("/role", { replace: true });
          return;
        }

        const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const query = lineUserId ? `?lineUserId=${encodeURIComponent(lineUserId)}` : '';
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API}/repair/${id}${query}`, { headers });

        if (!res.ok) throw new Error("ไม่พบข้อมูล");
        const data = await res.json();
        setRequest(data);
      } catch (e: any) {
        setErr(e.message || "Failed to load repair detail");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id, navigate]);

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
          <h1 className="text-xl font-bold text-gray-800">รายละเอียดแจ้งซ่อม</h1>
        </div>
      </div>

      <div className="px-6 mt-6">
        {loading ? (
          <div className="text-center py-20 text-blue-600 font-bold">กำลังโหลด...</div>
        ) : err ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center space-y-3">
            <div className="flex justify-center text-rose-500"><AlertCircle size={34} /></div>
            <p className="text-base font-bold text-gray-800">{err}</p>
            <button onClick={() => navigate('/tenant/maintenance/history')} className="mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              กลับไปรายการ
            </button>
          </div>
        ) : request ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">ID: {request.id.slice(-6)}</p>
                <h2 className="text-xl font-bold text-gray-800">{request.problem_type}</h2>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1">วันที่แจ้ง</p>
                <p className="text-sm font-bold text-gray-800">
                  {new Date(request.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1">เลขห้อง</p>
                <p className="text-sm font-bold text-gray-800">{request.room || "-"}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-400 font-semibold mb-2">รายละเอียด</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.description || "-"}</p>
            </div>

            {request.images && request.images.length > 0 && (
              <div className="pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400 font-semibold mb-3 flex items-center gap-2"><ImageIcon size={14} /> รูปประกอบ ({request.images.length} รูป)</p>
                <div className="grid grid-cols-2 gap-3">
                  {request.images.map((url: string, idx: number) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`repair-${idx}`} className="w-full rounded-2xl border border-gray-100 hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RepairDetailPage;
