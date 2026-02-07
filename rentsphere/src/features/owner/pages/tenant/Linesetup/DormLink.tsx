import React, { useEffect, useMemo, useState } from "react";

const API = "http://localhost:3001";

export default function DormLink() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const lineUserId = (params.get("lineUserId") || localStorage.getItem("lineUserId") || "").trim();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [err, setErr] = useState("");

  // ถ้าไม่มี lineUserId ให้กลับไป login
  useEffect(() => {
    if (!lineUserId) {
      window.location.replace("/login");
      return;
    }

    // เช็คสถานะก่อน ถ้าผูกแล้วให้ไปหน้าหลักเลย
    const run = async () => {
      try {
        const r = await fetch(`${API}/dorm/status?lineUserId=${encodeURIComponent(lineUserId)}`);
        const data = await r.json();
        if (data?.linked) {
          window.location.replace("/");
          return;
        }
      } catch {
        // เงียบไว้ก่อน
      } finally {
        setChecking(false);
      }
    };

    run();
  }, [lineUserId]);

  const submit = async () => {
    setErr("");
    const normalized = code.trim().toUpperCase();
    if (!normalized) return setErr("กรุณากรอกโค้ดหอพัก");

    setLoading(true);
    try {
      const r = await fetch(`${API}/dorm/link-line`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalized, lineUserId }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "link failed");

      // ผูกสำเร็จ -> ไปหน้าหลัก
      window.location.replace("/");
    } catch (e: any) {
      const msg = e?.message || "error";
      if (msg === "invalid_code") setErr("โค้ดไม่ถูกต้อง");
      else if (msg === "code_already_used") setErr("โค้ดนี้ถูกใช้ไปแล้ว");
      else setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9E6FF] p-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8">
          <div className="text-xl font-black">กำลังตรวจสอบบัญชี...</div>
          <div className="text-sm text-gray-600 mt-2">โปรดรอสักครู่</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E9E6FF] p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-black mb-2">ผูกโค้ดหอพัก</h1>
        <p className="text-sm text-gray-600 mb-6">
          ใส่โค้ดหอพักเพื่อเชื่อมบัญชี LINE และเข้าใช้งานระบบ
        </p>

        <div className="text-xs bg-gray-100 rounded-xl p-3 mb-4 break-all">
          LINE User ID: {lineUserId}
        </div>

        <label className="block text-sm font-bold mb-2">โค้ดหอพัก</label>
        <input
          className="w-full border rounded-2xl p-3 text-lg tracking-widest uppercase"
          placeholder="เช่น A1B2C3D4"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        {err && <div className="text-sm text-red-600 mt-3">{err}</div>}

        <button
          disabled={loading}
          onClick={submit}
          className="mt-4 w-full bg-black text-white font-bold py-3 rounded-2xl hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "กำลังผูกโค้ด..." : "ยืนยันโค้ดและเข้าใช้งาน"}
        </button>

        <button
          onClick={() => window.location.href = "/tenant/dorm-register"}
          className="mt-3 w-full bg-white border font-bold py-3 rounded-2xl hover:opacity-90"
        >
          สมัครให้คนเช่า (สร้างโค้ดใหม่)
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("lineUserId");
            window.location.replace("/login");
          }}
          className="mt-3 w-full text-sm text-gray-600 hover:underline"
        >
          ออกจากระบบ (เปลี่ยนบัญชี LINE)
        </button>
      </div>
    </div>
  );
}
