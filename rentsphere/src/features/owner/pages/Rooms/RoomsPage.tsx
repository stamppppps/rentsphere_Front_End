import OwnerShell from "@/features/owner/components/OwnerShell";
import { api } from "@/shared/api/http";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type CondoPick = { id: string; name: string };

type RoomRow = {
  id: string;
  floor: number;
  roomNo: string;
  price: number;
  isActive: boolean;
  occupancyStatus: "VACANT" | "OCCUPIED";
  roomStatus?: string | null;
  serviceId?: string | null;
  serviceIds?: string[];
};

type LocationState = { condoId?: string } | null;

function moneyTHB(n?: number | null) {
  if (n == null || !Number.isFinite(n)) return "0.00";
  return new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

/* =========================
   API
   ========================= */
async function fetchMyCondos(): Promise<CondoPick[]> {
  const data = await api<any>("/owner/condos"); // GET /owner/condos
  const arr = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return arr.map((c: any) => ({
    id: String(c?.id),
    name: String(c?.nameTh ?? c?.nameEn ?? c?.condoName ?? "—"),
  }));
}

async function fetchRooms(condoId: string): Promise<RoomRow[]> {
  const data = await api<any>(`/owner/condos/${encodeURIComponent(condoId)}/rooms`);
  const arr = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return arr.map((r: any) => ({
    id: String(r?.id),
    floor: Number(r?.floor ?? 0),
    roomNo: String(r?.roomNo ?? "—"),
    price: Number(r?.price ?? 0),
    isActive: Boolean(r?.isActive ?? true),
    occupancyStatus: String(r?.occupancyStatus ?? "VACANT").toUpperCase() === "OCCUPIED" ? "OCCUPIED" : "VACANT",
    roomStatus: r?.roomStatus ?? null,
    serviceId: r?.serviceId ?? null,
    serviceIds: Array.isArray(r?.serviceIds) ? r.serviceIds.map((x: any) => String(x)) : [],
  }));
}

/* =========================
   UI bits
   ========================= */
function StatusPill({ status }: { status: "VACANT" | "OCCUPIED" }) {
  const vacant = status === "VACANT";
  return (
    <span
      className={[
        "inline-flex items-center justify-center min-w-[78px] px-3 py-1 rounded-full text-xs font-extrabold",
        vacant
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-rose-50 text-rose-700 border border-rose-200",
      ].join(" ")}
    >
      {vacant ? "ว่าง" : "ไม่ว่าง"}
    </span>
  );
}

export default function RoomsPage() {
  const nav = useNavigate();
  const location = useLocation();
  const state = (location.state ?? null) as LocationState;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [condoId, setCondoId] = useState<string | null>(state?.condoId ?? null);
  const [condoName, setCondoName] = useState<string>("—");

  const [rooms, setRooms] = useState<RoomRow[]>([]);

  // modal pick room (ไปหน้า access codes)
  const [openPickRoom, setOpenPickRoom] = useState(false);
  const [pickRoomId, setPickRoomId] = useState("");

  const btnPrimary =
    "inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)] hover:bg-blue-700 active:scale-[0.99] transition";

  const retry = () => setCondoId((x) => (x ? `${x}` : x)); // trigger useEffect

  // 1) ensure condoId
  useEffect(() => {
    let cancelled = false;

    const ensure = async () => {
      if (condoId) return;

      try {
        setLoading(true);
        setError(null);

        const condos = await fetchMyCondos();
        if (cancelled) return;

        if (!condos.length) {
          setCondoName("—");
          setRooms([]);
          setLoading(false);
          return;
        }

        setCondoId(condos[0].id);
        setCondoName(condos[0].name);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "โหลดคอนโดไม่สำเร็จ");
        setLoading(false);
      }
    };

    ensure();
    return () => {
      cancelled = true;
    };
  }, [condoId]);

  // 2) load rooms
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!condoId) return;

      try {
        setLoading(true);
        setError(null);

        // ถ้ายังไม่รู้ชื่อคอนโด (เช่นมาจาก state condoId อย่างเดียว)
        if (condoName === "—") {
          const condos = await fetchMyCondos();
          const found = condos.find((c) => c.id === condoId);
          if (!cancelled && found) setCondoName(found.name);
        }

        const data = await fetchRooms(condoId);
        if (cancelled) return;

        setRooms(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setRooms([]);
        setError(e?.message ?? "โหลดรายการห้องไม่สำเร็จ");
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [condoId, condoName]);

  const roomsTotal = rooms.length;

  const roomsActive = useMemo(() => rooms.filter((r) => r.isActive).length, [rooms]);
  const roomsVacant = useMemo(
    () => rooms.filter((r) => r.isActive && r.occupancyStatus === "VACANT").length,
    [rooms]
  );
  const roomsOccupied = useMemo(
    () => rooms.filter((r) => r.isActive && r.occupancyStatus === "OCCUPIED").length,
    [rooms]
  );

  const avgRent = useMemo(() => {
    const list = rooms.filter((r) => r.isActive);
    if (!list.length) return 0;
    const sum = list.reduce((acc, r) => acc + (Number.isFinite(r.price) ? r.price : 0), 0);
    return Math.round(sum / list.length);
  }, [rooms]);

  const openAccessCodeModal = () => {
    const first = rooms[0];
    setPickRoomId(first?.id ?? "");
    setOpenPickRoom(true);
  };

  return (
    <OwnerShell title="ห้อง" activeKey="rooms" showSidebar>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-gray-500">
          คอนโดมิเนียม : <span className="text-gray-800">{condoName}</span>
        </div>

        <button
          type="button"
          onClick={openAccessCodeModal}
          className="text-sm font-extrabold text-gray-600 underline underline-offset-4 hover:text-gray-900 disabled:opacity-50"
          disabled={roomsTotal === 0}
        >
          สร้างรหัสเข้าสู่ระบบ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <div className="rounded-2xl border border-blue-100/70 bg-white p-5 shadow-sm">
          <div className="text-xs font-extrabold text-gray-500">จำนวนห้องทั้งหมด</div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{roomsTotal}</div>
          <div className="mt-1 text-xs font-bold text-gray-500">Active {roomsActive}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-sm">
          <div className="text-xs font-extrabold text-gray-500">ห้องว่าง</div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700">{roomsVacant}</div>
        </div>
        <div className="rounded-2xl border border-rose-100/70 bg-white p-5 shadow-sm">
          <div className="text-xs font-extrabold text-gray-500">ห้องไม่ว่าง</div>
          <div className="mt-2 text-2xl font-extrabold text-rose-700">{roomsOccupied}</div>
        </div>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-5 shadow-sm">
          <div className="text-xs font-extrabold text-gray-500">ค่าเช่าเฉลี่ย (โดยประมาณ)</div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{moneyTHB(avgRent)}</div>
          <div className="mt-1 text-xs font-bold text-gray-500">บาท/เดือน</div>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="rounded-2xl bg-white border border-blue-100/70 shadow-sm px-6 py-8 text-center">
          <div className="text-sm font-extrabold text-gray-600">กำลังโหลดรายการห้อง...</div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 shadow-sm px-6 py-6">
          <div className="font-extrabold text-rose-700">โหลดข้อมูลไม่สำเร็จ</div>
          <div className="mt-1 text-sm font-bold text-rose-600">{error}</div>

          <button
            type="button"
            onClick={retry}
            className="mt-4 h-[44px] px-6 rounded-xl bg-white border border-rose-200 text-rose-700 font-extrabold text-sm shadow-sm hover:bg-rose-100/40 active:scale-[0.98]"
          >
            ลองใหม่
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#F3F7FF] border-b border-blue-100/70">
            <div className="text-lg font-extrabold text-gray-900">รายการห้อง</div>
            <div className="text-sm font-bold text-gray-500 mt-1">กดที่แถวเพื่อดูรายละเอียดห้อง</div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead>
                <tr className="bg-[#F3F7FF] text-gray-800 border-b border-blue-100/70">
                  <th className="px-6 py-4 font-extrabold text-left">ชั้น</th>
                  <th className="px-6 py-4 font-extrabold text-left">ห้อง</th>
                  <th className="px-6 py-4 font-extrabold text-left">สถานะ</th>
                  <th className="px-6 py-4 font-extrabold text-right">ค่าเช่า</th>
                  <th className="px-6 py-4 font-extrabold text-right">Active</th>
                  <th className="px-6 py-4 font-extrabold text-right">ไปจัดการ</th>
                </tr>
              </thead>

              <tbody>
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-gray-500 font-bold">
                      ยังไม่มีห้อง (ลองทำ Step5 generate rooms ก่อน)
                    </td>
                  </tr>
                ) : (
                  rooms.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-blue-50 hover:bg-blue-50/30 cursor-pointer"
                      onClick={() => nav(`/owner/rooms/${r.id}`)}
                      role="button"
                    >
                      <td className="px-6 py-4 font-bold">{r.floor}</td>
                      <td className="px-6 py-4 font-extrabold text-gray-900">{r.roomNo}</td>
                      <td className="px-6 py-4">
                        <StatusPill status={r.occupancyStatus} />
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold">{moneyTHB(r.price)}</td>
                      <td className="px-6 py-4 text-right font-bold">
                        {r.isActive ? <span className="text-emerald-700">ใช้งาน</span> : <span className="text-gray-400">ปิด</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            nav(`/owner/rooms/${r.id}`);
                          }}
                          className="px-4 py-2 rounded-xl bg-white border border-gray-200 font-extrabold text-gray-700 hover:bg-gray-50"
                        >
                          เปิด
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== Pick Room Modal (Access Codes) ===== */}
      {openPickRoom && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setOpenPickRoom(false)}
            className="absolute inset-0 bg-black/30"
            aria-label="close"
          />

          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-blue-100 overflow-hidden">
            <div className="px-6 py-4 bg-[#EAF2FF] border-b border-blue-100">
              <div className="text-lg font-extrabold text-gray-900">สร้างรหัสเข้าสู่ระบบ</div>
              <div className="text-sm font-bold text-gray-600 mt-1">เลือกห้องที่ต้องการสร้างรหัส</div>
            </div>

            <div className="p-6 space-y-5">
              <select
                value={pickRoomId}
                onChange={(e) => setPickRoomId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    ห้อง {r.roomNo} (ชั้น {r.floor})
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpenPickRoom(false)}
                  className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  className={btnPrimary}
                  disabled={!pickRoomId}
                  onClick={() => nav(`/owner/rooms/${pickRoomId}/access-codes`)}
                >
                  ไปหน้ารหัส
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </OwnerShell>
  );
}