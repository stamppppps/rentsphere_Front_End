import React, { useEffect, useMemo, useState } from "react";

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

export default function RepairDetail() {
  const lineUserId = localStorage.getItem("lineUserId") || "";

  const repairId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || params.get("repairId") || "";
  }, []);

  const [item, setItem] = useState<Repair | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        if (!lineUserId) {
          window.location.href = "/login";
          return;
        }
        if (!repairId) {
          setErr("ไม่พบ repairId");
          return;
        }

        const r = await fetch(
          `${API}/repair/${encodeURIComponent(repairId)}?lineUserId=${encodeURIComponent(
            lineUserId
          )}`
        );
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "load failed");

        setItem(data.item);
      } catch (e: any) {
        setErr(e.message || "error");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [lineUserId, repairId]);

  if (!repairId) {
    return (
      <div className="min-h-screen bg-[#E9E6FF] p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow p-6">
          <div className="text-red-600 font-bold">ไม่พบ repairId</div>
          <button
            className="mt-4 bg-black text-white font-bold px-4 py-2 rounded-xl"
            onClick={() => (window.location.href = "/tenant/repairs")}
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E9E6FF] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">รายละเอียดการแจ้งซ่อม</h1>
          <div className="flex gap-2">
            <button
              onClick={() => (window.location.href = "/tenant/repairs")}
              className="bg-white font-bold px-4 py-2 rounded-xl"
            >
              กลับ
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-black text-white font-bold px-4 py-2 rounded-xl"
            >
              หน้าหลัก
            </button>
          </div>
        </div>

        {loading && <div>กำลังโหลด...</div>}
        {err && !loading && <div className="text-red-600">{err}</div>}

        {!loading && item && (
          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-black">{item.problem_type}</div>
              <div className="text-xs px-2 py-1 rounded-lg bg-gray-100">
                {item.status || "-"}
              </div>
            </div>

            <div className="text-sm text-gray-600 mt-2">
              {item.room ? `ห้อง ${item.room}` : ""}{" "}
              {item.location ? `• ${item.location}` : ""}
            </div>

            <div className="text-xs text-gray-500 mt-2">
              {new Date(item.created_at).toLocaleString()}
            </div>

            {item.image_url && (
              <div className="mt-4">
                <div className="text-sm font-bold mb-2">รูปประกอบ</div>
                <img
                  src={item.image_url}
                  alt="repair"
                  className="w-full max-h-[420px] object-contain rounded-2xl border"
                />
              </div>
            )}

            <div className="mt-4">
              <div className="text-sm font-bold mb-2">รายละเอียด</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {item.description || "-"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
