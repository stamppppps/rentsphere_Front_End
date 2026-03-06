import OwnerShell from "@/features/owner/components/OwnerShell";
import { api } from "@/shared/api/http";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type RoomDetail = {
  id: string;
  condoId: string;
  condoName: string | null;
  roomNo: string;
  floor: number | null;
  price: number | null;
};

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = [
    { n: 1, label: "สัญญา" },
    { n: 2, label: "ค่าเช่าล่วงหน้า" },
    { n: 3, label: "มิเตอร์น้ำ-ไฟ" },
  ] as const;

  return (
    <div className="w-full flex items-center justify-center gap-8 py-2">
      {items.map((it, idx) => {
        const active = it.n === step;
        const done = it.n < step;

        return (
          <div key={it.n} className="flex items-center gap-3">
            <div
              className={[
                "w-9 h-9 rounded-full flex items-center justify-center font-extrabold",
                active
                  ? "bg-blue-600 text-white shadow-[0_12px_22px_rgba(37,99,235,0.25)]"
                  : done
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-white text-gray-500 border border-gray-200",
              ].join(" ")}
            >
              {it.n}
            </div>

            <div className={active ? "font-extrabold text-blue-700" : "font-bold text-gray-600"}>{it.label}</div>

            {idx !== items.length - 1 ? <div className="w-20 h-[3px] rounded-full bg-blue-100" /> : null}
          </div>
        );
      })}
    </div>
  );
}

function moneyTHB(n?: number | null) {
  if (n == null || !Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("th-TH").format(n) + " บาท";
}

/* ===== backend room detail ===== */
function normalizeRoom(roomId: string, data: any): RoomDetail {
  const room = data?.room ?? data;
  const condo = data?.condo ?? room?.condo ?? null;

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
  };
}

async function fetchRoomDetail(roomId: string): Promise<RoomDetail> {
  const data = await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}`);
  return normalizeRoom(roomId, data);
}

export default function MonthlyContractPage() {
  const nav = useNavigate();
  const { roomId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomDetail | null>(null);

  // form state
  const [tenantName, setTenantName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rentPerMonth, setRentPerMonth] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(0);
  const [note, setNote] = useState("");

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
        setRentPerMonth(Number(data.price ?? 0) || 0);

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

  const canNext = useMemo(() => {
    if (!tenantName.trim()) return false;
    if (!startDate) return false;
    // endDate optional (บางที่สัญญาไม่กำหนด)
    if (!Number.isFinite(rentPerMonth) || rentPerMonth < 0) return false;
    if (!Number.isFinite(deposit) || deposit < 0) return false;
    return true;
  }, [tenantName, startDate, rentPerMonth, deposit]);

  const goNext = async () => {
    if (!roomId) return nav("/owner/rooms", { replace: true });

    // TODO: ถ้ามี endpoint สัญญาจริง ให้ยิง API ตรงนี้
    // await api(`/owner/rooms/${roomId}/contracts`, { method:"POST", body: JSON.stringify({...}) })

    nav(`/owner/rooms/${roomId}/advance-payment`, { replace: true });
  };

  if (loading) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
          <div className="text-sm font-extrabold text-gray-600">กำลังโหลดข้อมูล...</div>
        </div>
      </OwnerShell>
    );
  }

  if (!room || error) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
          <div className="text-xl font-extrabold text-gray-900 mb-2">ไม่พบข้อมูลห้อง</div>
          <div className="text-gray-600 font-bold mb-2">roomId: {roomId}</div>
          {error && <div className="text-rose-600 font-extrabold mb-6">{error}</div>}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nav("/owner/rooms", { replace: true })}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700"
            >
              กลับไปหน้าห้อง
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
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
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-gray-600">
          คอนโดมิเนียม : <span className="text-gray-900">{condoName}</span>
        </div>
        <div className="text-sm font-extrabold text-gray-700">
          ห้อง {roomNo} • ค่าเช่าเดิม: <span className="text-gray-900">{moneyTHB(room.price ?? null)}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div className="bg-[#EAF2FF] border-b border-blue-100/70 px-6 py-4">
          <Stepper step={1} />
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="text-xl font-extrabold text-gray-900">ทำสัญญารายเดือน</div>
            <div className="text-sm font-bold text-gray-500 mt-1">กรอกข้อมูลพื้นฐานของสัญญา แล้วไปขั้นตอนค่าเช่าล่วงหน้า</div>
          </div>
          <div className="h-px bg-gray-200 mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="lg:col-span-2">
              <div className="text-sm font-extrabold text-gray-800 mb-2">
                ชื่อผู้เช่า <span className="text-rose-600">*</span>
              </div>
              <input
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="เช่น นายสมชาย ใจดี"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
              />
            </div>

            <div>
              <div className="text-sm font-extrabold text-gray-800 mb-2">
                วันเริ่มสัญญา <span className="text-rose-600">*</span>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
              />
            </div>

            <div>
              <div className="text-sm font-extrabold text-gray-800 mb-2">วันสิ้นสุดสัญญา (ถ้ามี)</div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
              />
            </div>

            <div>
              <div className="text-sm font-extrabold text-gray-800 mb-2">ค่าเช่าต่อเดือน</div>
              <div className="flex items-stretch">
                <input
                  value={rentPerMonth}
                  onChange={(e) => setRentPerMonth(Number(e.target.value || 0))}
                  inputMode="numeric"
                  className="w-full rounded-l-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                />
                <div className="rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4 py-3 font-extrabold text-gray-700">
                  บาท
                </div>
              </div>
              <div className="mt-2 text-xs font-bold text-gray-500">
                (ค่าเริ่มต้นดึงจากห้อง) • {moneyTHB(room.price ?? 0)}
              </div>
            </div>

            <div>
              <div className="text-sm font-extrabold text-gray-800 mb-2">เงินประกัน (Deposit)</div>
              <div className="flex items-stretch">
                <input
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value || 0))}
                  inputMode="numeric"
                  className="w-full rounded-l-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                />
                <div className="rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4 py-3 font-extrabold text-gray-700">
                  บาท
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="text-sm font-bold text-gray-700 mb-2">Note</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => nav(`/owner/rooms/${roomId}`)}
              className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
            >
              ย้อนกลับ
            </button>

            <button
              type="button"
              onClick={() => {
                if (!canNext) return alert("กรุณากรอกข้อมูลให้ครบ (อย่างน้อย: ชื่อผู้เช่า + วันเริ่มสัญญา)");
                goNext();
              }}
              className={[
                "px-7 py-3 rounded-xl font-extrabold",
                canNext
                  ? "!bg-blue-600 text-white shadow-[0_12px_22px_rgba(37,99,235,0.22)] hover:!bg-blue-700"
                  : "bg-blue-200 text-white/70 cursor-not-allowed",
              ].join(" ")}
              disabled={!canNext}
            >
              ต่อไป
            </button>
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}