// src/features/auth/pages/OwnerRegisterPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/api/http";

type RegisterStartResponse = {
  ok: boolean;
  next?: string;     // url หน้า verify เช่น /auth/owner/verify-email?email=...
  message?: string;
};

export default function OwnerRegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("กรุณากรอกชื่อ-นามสกุล");
    if (!email.trim()) return setError("กรุณากรอกอีเมล");
    if (!password) return setError("กรุณากรอกรหัสผ่าน");
    if (password !== confirm) return setError("รหัสผ่านไม่ตรงกัน");

    try {
      setLoading(true);

      // ✅ ต้อง await และเก็บผลลัพธ์
      const data = await api<RegisterStartResponse>("auth/register/start", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          phone,
          role: "OWNER",
        }),
      });

      // ✅ เก็บรหัสผ่านไว้ชั่วคราว (จะเอาไปส่งตอน verify)
      sessionStorage.setItem("pending_password", password);

      // ✅ พาไปหน้า verify-email (ใช้ next ถ้า backend ส่งมา)
      const next = data?.next || `/auth/owner/verify-email?email=${encodeURIComponent(email)}`;
      navigate(next, { replace: true });
    } catch (e: any) {
      setError(e?.message || "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-3">
        <input
          className="input input-bordered w-full"
          placeholder="ชื่อ - นามสกุล"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input input-bordered w-full"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input input-bordered w-full"
          placeholder="หมายเลขโทรศัพท์"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="input input-bordered w-full"
          placeholder="รหัสผ่าน"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="input input-bordered w-full"
          placeholder="ยืนยันรหัสผ่าน"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "กำลังส่ง OTP..." : "ลงทะเบียน (OWNER)"}
        </button>
      </form>
    </div>
  );
}
