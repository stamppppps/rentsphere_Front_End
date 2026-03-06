import OwnerShell from "@/features/owner/components/OwnerShell";
import { api } from "@/shared/api/http";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type OccupancyStatus = "VACANT" | "OCCUPIED";

type RoomDetail = {
  id: string;
  condoId: string;
  condoName: string | null;
  roomNo: string;
  floor: number | null;
  price: number | null;
  isActive: boolean;
  occupancyStatus: OccupancyStatus;
};

function moneyTHB(n?: number | null) {
  if (n == null || !Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("th-TH").format(n) + " บาท";
}

function StatusPill({ status }: { status?: string }) {
  const vacant = String(status ?? "VACANT").toUpperCase() === "VACANT";
  return (
    <span
      className={[
        "inline-flex items-center justify-center",
        "min-w-[72px] px-3 py-1 rounded-full text-xs font-extrabold",
        vacant
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-rose-50 text-rose-700 border border-rose-200",
      ].join(" ")}
    >
      {vacant ? "ว่าง" : "ไม่ว่าง"}
    </span>
  );
}

/* ====== API ====== */
function normalizeRoom(roomId: string, data: any): RoomDetail {
  const room = data?.room ?? data;
  const condo = data?.condo ?? room?.condo ?? null;

  const occ =
    String(room?.occupancyStatus ?? room?.status ?? "VACANT").toUpperCase() === "OCCUPIED"
      ? "OCCUPIED"
      : "VACANT";

  const priceRaw = room?.price ?? room?.rentPrice ?? null;
  const priceNum =
    priceRaw == null || String(priceRaw).trim() === "" ? null : Number(String(priceRaw).replace(/,/g, ""));

  return {
    id: String(room?.id ?? roomId),
    condoId: String(room?.condoId ?? condo?.id ?? ""),
    condoName: (condo?.nameTh ?? condo?.nameEn ?? room?.condoName ?? null) as string | null,
    roomNo: String(room?.roomNo ?? "—"),
    floor: room?.floor == null ? null : Number(room.floor),
    price: Number.isFinite(priceNum as number) ? (priceNum as number) : null,
    isActive: Boolean(room?.isActive ?? true),
    occupancyStatus: occ,
  };
}

async function fetchRoomDetail(roomId: string): Promise<RoomDetail> {
  const data = await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}`);
  return normalizeRoom(roomId, data);
}

export default function RoomDetailPage() {
  const nav = useNavigate();
  const { roomId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomDetail | null>(null);

  const btnPrimary =
    "inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)] hover:bg-blue-700 active:scale-[0.99] transition";

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!roomId) {
        setLoading(false);
        setRoom(null);
        setError("ไม่พบ roomId");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await fetchRoomDetail(roomId);
        if (cancelled) return;

        setRoom(data);
        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setRoom(null);
        setError(e?.message ?? "เกิดข้อผิดพลาด");
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const condoName = room?.condoName ?? "คอนโดมิเนียม";
  const roomNo = room?.roomNo ?? "-";
  const roomPrice = room?.price ?? null;
  const roomStatus = room?.occupancyStatus ?? "VACANT";

  if (loading) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
          <div className="text-sm font-extrabold text-gray-600">กำลังโหลดข้อมูลห้อง...</div>
        </div>
      </OwnerShell>
    );
  }

  if (!roomId || error || !room) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
          <div className="text-xl font-extrabold text-gray-900 mb-2">ไม่พบข้อมูลห้องนี้</div>
          <div className="text-gray-600 font-bold mb-2">roomId: {roomId}</div>
          {error && <div className="text-rose-600 font-extrabold mb-6">{error}</div>}

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => nav("/owner/rooms")} className={btnPrimary}>
              กลับไปหน้าห้อง
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-xl bg-white border border-gray-200 px-5 py-2.5 text-sm font-extrabold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </OwnerShell>
    );
  }

  return (
    <OwnerShell activeKey="rooms" showSidebar>
      {/* breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
          <button
            onClick={() => nav("/owner/dashboard")}
            className="hover:text-gray-900 underline underline-offset-4"
            type="button"
          >
            หน้าหลัก
          </button>
          <span className="text-gray-400">{">"}</span>

          <button
            onClick={() => nav("/owner/rooms")}
            className="hover:text-gray-900 underline underline-offset-4"
            type="button"
          >
            {condoName}
          </button>

          <span className="text-gray-400">{">"}</span>
          <span className="text-gray-900 font-extrabold">ห้อง {roomNo}</span>

          <span className="ml-3">
            <StatusPill status={roomStatus} />
          </span>
        </div>

        <div className="text-sm font-bold text-gray-600">
          ค่าเช่า: <span className="text-gray-900 font-extrabold">{moneyTHB(roomPrice)}</span>
        </div>
      </div>

      {/* actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contract flow */}
        <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#F3F7FF] border-b border-blue-100/70">
            <div className="text-lg font-extrabold text-gray-900 text-center">ทำสัญญา (รายเดือน)</div>
          </div>

          <div className="p-6">
            <div className="text-sm font-bold text-gray-500 mb-5">
              ไปตั้งค่าสัญญา + ค่าเช่าล่วงหน้า + มิเตอร์น้ำไฟ
            </div>

          
            <button
              type="button"
              className={btnPrimary + " w-full"}
              onClick={() => nav(`/owner/rooms/${roomId}/monthly`)}
            >
              เปิดขั้นตอนทำสัญญา
            </button>

     
            <button
              type="button"
              className={btnPrimary + " w-full mt-3 !bg-blue-100 !text-blue-700 hover:!bg-blue-200 shadow-none"}
              onClick={() => nav(`/owner/rooms/${roomId}/advance-payment`)}
            >
              ไปขั้นตอนค่าเช่าล่วงหน้า
            </button>
          </div>
        </div>

        {/* Meter */}
        <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#F3F7FF] border-b border-blue-100/70">
            <div className="text-lg font-extrabold text-gray-900 text-center">มิเตอร์น้ำ-ไฟ</div>
          </div>

          <div className="p-6">
            <div className="text-sm font-bold text-gray-500 mb-5">
              ตั้งเลขมิเตอร์ + บันทึกหน่วยเดือนปัจจุบัน (เชื่อม backend จริง)
            </div>

        
            <button
              type="button"
              className={btnPrimary + " w-full"}
              onClick={() => nav(`/owner/rooms/${roomId}/meter`)}
            >
              ไปหน้ามิเตอร์
            </button>
          </div>
        </div>

        {/* Access code */}
        <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#F3F7FF] border-b border-blue-100/70">
            <div className="text-lg font-extrabold text-gray-900 text-center">รหัสเข้าสู่ระบบ</div>
          </div>

          <div className="p-6">
            <div className="text-sm font-bold text-gray-500 mb-5">
              สร้าง/ปิด/ลบรหัสให้ผู้เช่าเข้าระบบ (เชื่อม backend จริง)
            </div>

            
            <button
              type="button"
              className={btnPrimary + " w-full"}
              onClick={() => nav(`/owner/rooms/${roomId}/access-code`)}
            >
              ไปหน้ารหัส
            </button>
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}