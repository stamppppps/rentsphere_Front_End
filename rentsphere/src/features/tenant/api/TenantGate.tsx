import React, { useEffect, useState } from "react";


const API = "https://backendlinefacality.onrender.com";

export default function Gate() {
  const [msg, setMsg] = useState("กำลังตรวจสอบสถานะผู้เช่า...");

  useEffect(() => {
    const run = async () => {
      const lineUserId = localStorage.getItem("lineUserId");
      if (!lineUserId) {
        window.location.replace("/login");
        return;
      }

      try {
        const r = await fetch(`${API}/dorm/status?lineUserId=${encodeURIComponent(lineUserId)}`);
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "status error");

        if (!data?.linked) {
          window.location.replace("/tenant/dorm-register");
          return;
        }

        window.location.replace("/tenant/app");
      } catch (e: any) {
        setMsg(e?.message || "เกิดข้อผิดพลาด");
      }
    };

    run();
  }, []);

  return (
    <div className="w-screen h-screen bg-[#E9E6FF] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl border border-indigo-100 p-8 w-full max-w-lg">
        <div className="text-2xl font-black">Tenant</div>
        <div className="text-slate-500 font-semibold mt-1">{msg}</div>
        <div className="mt-6 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-indigo-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
