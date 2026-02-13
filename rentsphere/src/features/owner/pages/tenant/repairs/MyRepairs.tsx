import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3001";

type Repair = {
  id: string;
  created_at: string;
  problem_type: string;
  description: string | null;
  status: string | null;
  location: string | null;
  room: string | null;
  image_url: string | null;
};

export default function MyRepairs() {
  const nav = useNavigate();

  const [items, setItems] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const lineUserId = localStorage.getItem("lineUserId");
      if (!lineUserId) {
        nav("/login", { replace: true });
        return;
      }

      const r = await fetch(`${API}/repair/my?lineUserId=${encodeURIComponent(lineUserId)}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "โหลดรายการแจ้งซ่อมไม่สำเร็จ");

      setItems(data.items || []);
    } catch (e: any) {
      setErr(e?.message || "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const badge = (status?: string | null) => {
    const s = String(status || "").toLowerCase();
    const common = "text-xs font-black px-2 py-1 rounded-full border";

    if (s === "done" || s === "เสร็จแล้ว")
      return <span className={`${common} bg-emerald-50 text-emerald-700 border-emerald-100`}>เสร็จ</span>;
    if (s === "in_progress" || s === "กำลังดำเนินงาน")
      return <span className={`${common} bg-indigo-50 text-indigo-700 border-indigo-100`}>กำลังทำ</span>;
    if (s === "rejected" || s === "ปฏิเสธ")
      return <span className={`${common} bg-rose-50 text-rose-700 border-rose-100`}>ปฏิเสธ</span>;

    return <span className={`${common} bg-amber-50 text-amber-700 border-amber-100`}>ใหม่</span>;
  };

  return (
    <div className="min-h-screen bg-[#D2E8FF] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-black">Ticket ของฉัน</div>
          <div className="flex gap-2">
            <button onClick={() => nav("/tenant/app")} className="bg-white font-bold px-4 py-2 rounded-xl">
              กลับหน้าหลัก
            </button>
            <button onClick={load} className="bg-black text-white font-bold px-4 py-2 rounded-xl" disabled={loading}>
              รีเฟรช
            </button>
          </div>
        </div>

        {err && <div className="mb-3 text-red-600 font-bold">{err}</div>}

        <div className="bg-white rounded-3xl shadow-xl p-4">
          {loading ? (
            <div className="p-6 text-slate-500 font-semibold">กำลังโหลด...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-slate-500 font-semibold">ยังไม่มีรายการแจ้งซ่อม</div>
          ) : (
            <div className="space-y-3">
              {items.map((t) => (
                <button
                  key={t.id}
                  onClick={() => nav(`/tenant/repairs/${t.id}`)}
                  className="w-full text-left border rounded-2xl p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-black">Ticket #{String(t.id).slice(0, 8)}</div>
                    {badge(t.status)}
                  </div>

                  <div className="text-xs text-slate-500 mt-1">{new Date(t.created_at).toLocaleString("th-TH")}</div>

                  <div className="mt-2 text-sm text-slate-800 font-semibold">
                    {t.problem_type || "แจ้งซ่อม"}
                    {t.room ? ` • ห้อง ${t.room}` : ""}
                  </div>

                  <div className="text-sm text-slate-700 mt-1 line-clamp-2">{t.description || "—"}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
