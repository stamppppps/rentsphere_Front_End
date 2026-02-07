import React, { useState } from "react";

export default function AdminLogin() {
  const [secret, setSecret] = useState("");
  const [err, setErr] = useState("");

  const go = (to: string) => {
    window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const submit = () => {
    setErr("");
    if (!secret.trim()) return setErr("กรุณากรอก Admin Secret");

    localStorage.setItem("adminSecret", secret.trim());
    go("/owner/admin-repairs"); // ✅ ไปหน้าแอดมินใหม่
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#E9E6FF] p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-black mb-2">Admin Login</h1>
        <p className="text-sm text-gray-600 mb-6">
          ใส่ secret เพื่อเข้าใช้งานหน้าแอดมิน (ไม่ต้อง login LINE)
        </p>

        <input
          className="w-full border rounded-xl p-3 mb-3"
          placeholder="Admin Secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />

        {err && <div className="text-sm text-red-600 mb-3">{err}</div>}

        <button
          onClick={submit} // ✅ ต้องเรียก submit เพื่อ set adminSecret ก่อน
          className="w-full bg-black text-white font-bold py-3 rounded-2xl hover:opacity-90" // ✅ text ต้องเป็น white
        >
          เข้าสู่ระบบแอดมิน
        </button>

        <button
          onClick={() => go("/role")} // ✅ ถ้าคุณย้าย role มาอยู่ใต้ /owner
          className="mt-3 w-full bg-white font-bold py-3 rounded-2xl border hover:opacity-90"
        >
          กลับหน้าเลือกโหมด
        </button>
      </div>
    </div>
  );
}
