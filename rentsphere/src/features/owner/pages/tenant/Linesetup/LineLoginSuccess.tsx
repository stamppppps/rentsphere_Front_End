import React, { useEffect, useState } from "react";

const API = "http://localhost:3001";

export default function LineLoginSuccess() {
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const lineUserId = params.get("lineUserId") || "";

        if (!lineUserId) {
          setStatus("error");
          setMsg("ไม่พบ lineUserId");
          return;
        }

        // ✅ เก็บ lineUserId ไว้ใช้งานทุกหน้า
        localStorage.setItem("lineUserId", lineUserId);

        // ✅ เช็คว่าผูกโค้ดหอแล้วหรือยัง
        const r = await fetch(`${API}/dorm/status?lineUserId=${encodeURIComponent(lineUserId)}`);
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "เช็คสถานะไม่สำเร็จ");

        if (data?.linked) {
          // ✅ ผูกแล้ว ไปหน้าหลัก
          window.location.replace("/tenant/app");
        } else {
          // ✅ ยังไม่ผูก บังคับไปหน้าใส่โค้ดหอ
          window.location.replace("/tenant/dorm-register");
        }

        setStatus("ok");
      } catch (e: any) {
        setStatus("error");
        setMsg(e?.message || "error");
      }
    };

    run();
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4FF] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl border border-indigo-100 p-8 w-full max-w-lg">
        <div className="text-2xl font-black mb-1">เข้าสู่ระบบ LINE</div>
        <div className="text-sm text-slate-500 mb-6">กำลังตรวจสอบข้อมูลผู้ใช้...</div>

        {status === "checking" && (
          <div className="text-slate-700 font-bold">กำลังตรวจสอบสถานะการผูกโค้ดหอ...</div>
        )}

        {status === "error" && (
          <div className="text-rose-600 font-bold">
            {msg}
            <div className="mt-4">
              <button
                onClick={() => (window.location.href = "/login")}
                className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl"
              >
                กลับไป Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
