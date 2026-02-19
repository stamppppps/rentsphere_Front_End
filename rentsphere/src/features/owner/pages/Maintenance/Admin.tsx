import React, { useEffect, useMemo, useState } from "react";


const API = "https://backendlinefacality.onrender.com";

type Ticket = {
  id: string;
  created_at: string;
  problem_type: string;
  description: string | null;
  status: string;
  location: string | null;
  room: string | null;
  image_url: string | null;
  line_user_id: string | null;
};

export default function Admin() {
  const adminSecret = localStorage.getItem("adminSecret") || "";
  const lineUserId = localStorage.getItem("lineUserId") || "";

  const [items, setItems] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const headers = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    // ✅ โหมดเทสแอดมิน
    if (adminSecret) h["x-admin-secret"] = adminSecret;
    // ✅ โหมดจริงแอดมิน (ผูก LINE)
    if (!adminSecret && lineUserId) h["x-line-user-id"] = lineUserId;
    return h;
  }, [adminSecret, lineUserId]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`${API}/admin/repairs`, { headers });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || `load failed (${r.status})`);
      setItems(data.items || []);
    } catch (e: any) {
      setErr(e.message || "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ ถ้าไม่ได้เป็นแอดมินจริง และไม่ได้ใส่ secret -> เด้งไปหน้า admin-login
    if (!adminSecret && !lineUserId) {
      window.location.href = "/admin-login";
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const message = window.prompt("ข้อความแจ้งผู้เช่า (ไม่ใส่ก็ได้)", "");
      const r = await fetch(`${API}/admin/repair/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, message }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || `update failed (${r.status})`);
      await load();
      alert("อัปเดตสถานะ + ส่งแจ้งเตือนแล้ว");
    } catch (e: any) {
      alert(e.message || "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E6FF] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black">Admin: งานแจ้งซ่อม</h1>
            <div className="text-gray-600 mt-1">
              กดอัปเดตสถานะ + ส่งแจ้งเตือน LINE ให้ผู้เช่า
            </div>
            {adminSecret ? (
              <div className="text-xs text-green-700 mt-2">
                ✅ เข้าแบบโหมดเทส (ADMIN_DEV_SECRET)
              </div>
            ) : (
              <div className="text-xs text-blue-700 mt-2">
                ✅ เข้าแบบโหมดจริง (role=admin)
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-white font-bold px-4 py-2 rounded-xl"
            >
              หน้าหลัก
            </button>
            {adminSecret && (
              <button
                onClick={() => {
                  localStorage.removeItem("adminSecret");
                  window.location.href = "/admin-login";
                }}
                className="bg-black text-white font-bold px-4 py-2 rounded-xl"
              >
                ออกจากโหมดเทส
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={load}
            className="bg-black text-white font-bold px-4 py-2 rounded-xl"
          >
            รีเฟรช
          </button>
        </div>

        {loading && <div className="mt-6">กำลังโหลด...</div>}
        {err && (
          <div className="mt-6 bg-white rounded-2xl p-5 shadow">
            <div className="text-red-600 font-bold">{err}</div>
            <div className="text-gray-600 mt-2">
              ถ้าเข้าไม่ได้ ให้ไปใส่รหัสที่ <b>/admin-login</b>
            </div>
            <button
              onClick={() => (window.location.href = "/admin-login")}
              className="mt-4 bg-black text-white font-bold px-4 py-2 rounded-xl"
            >
              ไปหน้า Admin Login
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-3">
          {items.map((it) => (
            <div key={it.id} className="bg-white rounded-3xl shadow p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-black">{it.problem_type}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {it.room ? `ห้อง ${it.room}` : ""}{" "}
                    {it.location ? `• ${it.location}` : ""}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(it.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-gray-100">
                  {it.status}
                </div>
              </div>

              {it.description && (
                <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                  {it.description}
                </div>
              )}

              {it.image_url && (
                <div className="mt-4">
                  <img
                    src={it.image_url}
                    alt="repair"
                    className="max-h-64 rounded-2xl border"
                  />
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => updateStatus(it.id, "กำลังดำเนินงาน")}
                  className="bg-black text-white font-bold px-4 py-2 rounded-xl"
                >
                  รับเรื่อง
                </button>
                <button
                  onClick={() => updateStatus(it.id, "เสร็จแล้ว")}
                  className="bg-green-600 text-white font-bold px-4 py-2 rounded-xl"
                >
                  เสร็จแล้ว
                </button>
                <button
                  onClick={() => updateStatus(it.id, "ปฏิเสธ")}
                  className="bg-red-600 text-white font-bold px-4 py-2 rounded-xl"
                >
                  ปฏิเสธ
                </button>
              </div>
            </div>
          ))}

          {!loading && !err && items.length === 0 && (
            <div className="bg-white rounded-3xl shadow p-6 text-gray-600">
              ยังไม่มีรายการแจ้งซ่อม
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
