import { api } from "@/shared/api/http";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FloorSection from "../components/FloorSection";
import SetRoomPriceModal from "../components/SetRoomPriceModal";
import type { Room } from "../types/addCondo.types";

const STEP_CONDO_ID_KEY = "add_condo_condoId";
const STEP6_SELECTED_KEY = "add_condo_step6_selectedRoomIds";

type FloorConfigDto = {
  floorCount: number;
  roomsPerFloor: number[];
  totalRooms: number;
};

function normalizeRoom(r: any): Room {
  const occupancy = (r?.occupancyStatus ?? r?.status ?? "VACANT") as any;
  const status = occupancy === "OCCUPIED" ? "OCCUPIED" : "VACANT";

  return {
    id: String(r.id),
    condoId: r.condoId ? String(r.condoId) : undefined,
    floor: Number(r.floor),
    roomNo: String(r.roomNo ?? ""),
    price: r.price === null || r.price === undefined ? null : Number(r.price),
    isActive: r.isActive !== false,
    status,
    occupancyStatus: occupancy,
    roomStatus: r.roomStatus ?? null,
    serviceId: r.serviceId ?? null,
  };
}

export default function Step6RoomPrice() {
  const nav = useNavigate();
  const location = useLocation();

  const condoId: string = useMemo(() => {
    const fromState = (location.state as any)?.condoId;
    const fromStorage = localStorage.getItem(STEP_CONDO_ID_KEY);
    return String(fromState ?? fromStorage ?? "");
  }, [location.state]);

  useEffect(() => {
    if (condoId) localStorage.setItem(STEP_CONDO_ID_KEY, condoId);
    else nav("/owner/add-condo/step-0");
  }, [condoId, nav]);

  const [floorCount, setFloorCount] = useState<number>(0);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

 
  useEffect(() => {
    const raw = localStorage.getItem(STEP6_SELECTED_KEY);
    if (!raw) return;
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) setSelectedRoomIds(arr.map(String));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STEP6_SELECTED_KEY, JSON.stringify(selectedRoomIds));
  }, [selectedRoomIds]);


  useEffect(() => {
    if (!condoId) return;
    let alive = true;

    (async () => {
      setLoading(true);
      setApiError(null);

      try {
        const cfg = await api<FloorConfigDto>(`/owner/condos/${condoId}/floor-config`, { method: "GET" });
        if (!alive) return;

        if (!cfg?.floorCount || cfg.floorCount <= 0) {
          setFloorCount(0);
          setRooms([]);
          return;
        }

        setFloorCount(cfg.floorCount);

        let list = await api<any[]>(`/owner/condos/${condoId}/rooms`, { method: "GET" });
        if (!alive) return;

        if ((list ?? []).length === 0) {
          await api(`/owner/condos/${condoId}/rooms/generate`, { method: "POST" });
          list = await api<any[]>(`/owner/condos/${condoId}/rooms`, { method: "GET" });
          if (!alive) return;
        }

        setRooms((list ?? []).map(normalizeRoom));
      } catch (e: any) {
        if (!alive) return;
        setApiError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [condoId]);


  const roomsByFloor = useMemo(() => {
    const map = new Map<number, Room[]>();
    for (let f = 1; f <= floorCount; f++) map.set(f, []);

    for (const r of rooms) {
      const floor = Number(r.floor);
      if (!Number.isFinite(floor)) continue;
      map.get(floor)?.push(r);
    }


    map.forEach((arr) => arr.sort((a, b) => a.roomNo.localeCompare(b.roomNo)));
    return map;
  }, [rooms, floorCount]);


  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds((prev) => (prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]));
  };


  const selectAllOnFloor = (floor: number) => {
    const ids = rooms
      .filter((r) => Number(r.floor) === floor && r.isActive !== false)
      .map((r) => r.id);

    setSelectedRoomIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const unselectAllOnFloor = (floor: number) => {
    const idsOnFloor = new Set(rooms.filter((r) => Number(r.floor) === floor).map((r) => r.id));
    setSelectedRoomIds((prev) => prev.filter((id) => !idsOnFloor.has(id)));
  };

 
  const setPriceForRooms = async (roomIds: string[], price: number | null) => {
    if (!condoId) return;
    const ids = new Set(roomIds);


    setRooms((prev) => prev.map((r) => (ids.has(r.id) ? { ...r, price } : r)));

    setSaving(true);
    setApiError(null);
    try {
      await api(`/owner/condos/${condoId}/rooms/bulk-price`, {
        method: "PATCH",
        body: JSON.stringify({ roomIds, price }),
      });
    } catch (e: any) {
      setApiError(e?.message ?? "ตั้งค่าห้องไม่สำเร็จ");

    } finally {
      setSaving(false);
    }
  };

  const disableSetPrice = selectedRoomIds.length === 0;

  return (
    <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-[18px] pb-[110px]">
      <h1 className="text-center text-[34px] font-extrabold text-black/85 tracking-[0.2px] mb-[6px] mt-[6px]">
        ตั้งค่าคอนโดมิเนียม
      </h1>

      {apiError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700 font-extrabold">
          {apiError}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white border border-blue-100/60 shadow-[0_18px_50px_rgba(15,23,42,0.12)] px-8 py-10 text-center">
          <div className="text-lg font-extrabold text-gray-900">กำลังโหลด...</div>
        </div>
      ) : floorCount <= 0 ? (
        <div className="rounded-2xl bg-white border border-blue-100/60 shadow-[0_18px_50px_rgba(15,23,42,0.12)] px-8 py-10 text-center">
          <div className="text-lg font-extrabold text-gray-900">ยังไม่มีข้อมูลห้อง</div>
          <div className="mt-2 text-sm font-bold text-gray-600">
            กรุณาตั้งค่า “จำนวนชั้น/จำนวนห้อง” ที่ Step4 ก่อน
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-[18px]">
          {Array.from(roomsByFloor.entries()).map(([floor, floorRooms]) => (
            <div key={floor}>
              <FloorSection
                floor={floor}
                rooms={floorRooms}
                selectedRoomIds={selectedRoomIds}
                onSelectFloor={() => selectAllOnFloor(floor)}
                onUnselectFloor={() => unselectAllOnFloor(floor)}
                onToggleRoom={toggleRoom}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-[10px] flex-wrap">
        <div className="h-[46px] min-w-[260px] rounded-xl bg-[#161A2D] text-white flex items-center justify-center shadow-[0_12px_22px_rgba(0,0,0,0.18)] font-extrabold text-sm px-6">
          จำนวนห้องที่เลือก {selectedRoomIds.length} ห้อง
        </div>

        <button
          type="button"
          onClick={() => setOpenModal(true)}
          disabled={disableSetPrice || saving}
          className={[
            "h-[46px] px-5 rounded-xl text-white border-0 shadow-[0_12px_22px_rgba(0,0,0,0.18)] font-extrabold text-sm transition",
            "focus:outline-none focus:ring-2 focus:ring-blue-300",
            disableSetPrice || saving
              ? "bg-blue-200 cursor-not-allowed text-white/70 shadow-none"
              : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] cursor-pointer",
          ].join(" ")}
        >
          ระบุค่าห้อง
        </button>

        <button
          type="button"
          onClick={() => nav("../step-5", { state: { condoId } })}
          className="h-[46px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
          focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={() => nav("../step-7", { state: { condoId, selectedRoomIds } })}
          disabled={selectedRoomIds.length === 0}
          className={[
            "h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
            "focus:outline-none focus:ring-2 focus:ring-blue-300",
            selectedRoomIds.length === 0
              ? "bg-[#93C5FD]/40 cursor-not-allowed text-white/70"
              : "bg-[#93C5FD] hover:bg-[#7fb4fb] active:scale-[0.98] cursor-pointer",
          ].join(" ")}
        >
          ต่อไป
        </button>
      </div>

      <SetRoomPriceModal
        open={openModal}
        selectedCount={selectedRoomIds.length}
        onClose={() => setOpenModal(false)}
        onSave={(price) => {
          setPriceForRooms(selectedRoomIds, price);
          setOpenModal(false);
        }}
      />
    </div>
  );
}