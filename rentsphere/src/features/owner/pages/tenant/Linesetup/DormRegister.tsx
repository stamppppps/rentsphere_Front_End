import React, { useEffect, useState } from "react";

const API = "http://localhost:3001";

export default function DormRegister() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const lineUserId = localStorage.getItem("lineUserId") || "";

  useEffect(() => {
    // ✅ ถ้ายังไม่มี lineUserId ค่อยไป login
    if (!lineUserId) window.location.replace("/owner/line-login");
  }, [lineUserId]);

  const submit = async () => {
    setErr("");
    setOk("");

    if (!code.trim()) return setErr("กรุณากรอกโค้ดหอพัก");
    if (!lineUserId) return setErr("ไม่พบ LINE User ID (ลอง login ใหม่)");

    setLoading(true);
    try {
      const r = await fetch(`${API}/dorm/link-line`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          lineUserId,
        }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "เชื่อมโค้ดไม่สำเร็จ");

      setOk("เชื่อมโค้ดสำเร็จ ✅ กำลังพาไปหน้าหลัก...");
      setTimeout(() => {
        window.location.replace("/tenant/app");
      }, 700);
    } catch (e: any) {
      const m = e?.message || "error";
      // ให้ข้อความอ่านง่าย
      if (m === "invalid_code") setErr("โค้ดไม่ถูกต้อง");
      else if (m === "code_already_used") setErr("โค้ดนี้ถูกใช้งานแล้ว");
      else setErr(m);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#F3F4FF] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-indigo-100 p-8">
        <div className="text-2xl font-black">ใส่โค้ดหอพัก</div>
        <div className="text-sm text-slate-500 mt-1">
          เพื่อเริ่มใช้งานระบบแจ้งซ่อม/พัสดุ
        </div>

        <div className="mt-6 space-y-4">
          {err && <div className="bg-rose-50 border border-rose-100 text-rose-600 font-bold p-3 rounded-2xl">{err}</div>}
          {ok && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold p-3 rounded-2xl">{ok}</div>}

          <div>
            <div className="text-sm font-bold mb-2">โค้ดหอพัก</div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="เช่น AB12CD34"
              className="w-full border rounded-2xl p-3 font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-black font-black py-3 rounded-2xl disabled:opacity-50"
          >
            {loading ? "กำลังเชื่อม..." : "ยืนยันโค้ด"}
          </button>

          <button
            onClick={() => {
              // เผื่อ user อยากสลับบัญชี LINE
              localStorage.removeItem("lineUserId");
              window.location.replace("/tenant/login");
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-2xl"
          >
            เปลี่ยนบัญชี LINE
          </button>

          <div className="text-[12px] text-slate-400">
            LINE: {lineUserId ? lineUserId.slice(0, 8) + "..." : "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
