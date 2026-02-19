import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Wrench,
  Receipt,
  Package,
  Calendar,
  ChevronRight,
  Headset,
  Home,
  Menu,
  CheckCircle2,
  MapPin,
} from "lucide-react";


const API = "https://backendlinefacality.onrender.com";

type DormUser = {
  id: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  registered_at?: string | null;
  line_user_id?: string | null;
  room?: string | null; // ถ้าคุณเพิ่มคอลัมน์ room ใน dorm_users แล้ว
};

export default function TenantHome() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [fullName, setFullName] = useState("Tenant");
  const [condoName, setCondoName] = useState("RentSphere"); // อยากให้เป็นอะไรปรับได้
  const [unit, setUnit] = useState(""); // จะเอา room มาใส่

  useEffect(() => {
    const run = async () => {
      const lineUserId = localStorage.getItem("lineUserId");
      if (!lineUserId) {
        nav("/role", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setErr("");

        const r = await fetch(
          `${API}/dorm/status?lineUserId=${encodeURIComponent(lineUserId)}`
        );
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.error || "status error");

        if (!data?.linked) {
          // ยังไม่ผูกโค้ดหอ
          nav("/tenant/dorm-register", { replace: true });
          return;
        }

        const dormUser: DormUser = data.dormUser;
        setFullName(dormUser?.full_name || "Tenant");

        // ถ้ามีห้อง (room) ในตาราง dorm_users
        setUnit(dormUser?.room ? `Room ${dormUser.room}` : "");
      } catch (e: any) {
        setErr(e?.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [nav]);

  const logout = () => {
    localStorage.removeItem("lineUserId");
    nav("/role", { replace: true });
  };
}