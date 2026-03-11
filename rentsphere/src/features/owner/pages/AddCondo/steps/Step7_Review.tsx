import { api } from "@/shared/api/http";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type { Room } from "../types/addCondo.types";

const STEP_CONDO_ID_KEY = "add_condo_condoId";
const STEP6_SELECTED_KEY = "add_condo_step6_selectedRoomIds";
const STEP_ROOM_NAMES_KEY_PREFIX = "add_condo_room_name_drafts_";

type NavState = {
  condoId?: string;
  selectedRoomIds?: string[];
};

type FloorConfigDto = {
  floorCount: number;
  roomsPerFloor: number[];
  totalRooms: number;
};

type OccupancyStatus = "VACANT" | "OCCUPIED";
type RoomNameDrafts = Record<string, string>;

function normalizeRoom(r: any): Room {
  const occupancy = (r?.occupancyStatus ?? r?.status ?? "VACANT") as OccupancyStatus;
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

function roomNamesKey(condoId: string) {
  return `${STEP_ROOM_NAMES_KEY_PREFIX}${condoId}`;
}

function readRoomNameDrafts(condoId: string): RoomNameDrafts {
  try {
    const raw = localStorage.getItem(roomNamesKey(condoId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, String(v ?? "")])
    );
  } catch {
    return {};
  }
}

function getDisplayRoomNo(room: Room, drafts: RoomNameDrafts) {
  const draft = drafts[room.id];
  if (typeof draft === "string" && draft.trim() !== "") {
    return draft;
  }
  return room.roomNo ?? "";
}

function applyRoomNameDrafts(rooms: Room[], drafts: RoomNameDrafts): Room[] {
  return rooms.map((room) => ({
    ...room,
    roomNo: getDisplayRoomNo(room, drafts),
  }));
}

function sortRooms(a: Room, b: Room) {
  if (a.floor !== b.floor) return a.floor - b.floor;
  return a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true });
}

export default function Step7_Review() {
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const st = (location.state as NavState | null) ?? null;

  const isSettingsPath = location.pathname.startsWith("/owner/settings");
  const mode =
    searchParams.get("mode") === "edit" || isSettingsPath ? "edit" : "create";

  const condoId = useMemo(() => {
    const fromQuery = searchParams.get("condoId");
    const fromState = st?.condoId;
    const fromStorage = localStorage.getItem(STEP_CONDO_ID_KEY);
    return String(fromQuery ?? fromState ?? fromStorage ?? "").trim();
  }, [searchParams, st?.condoId]);

  const [floorCount, setFloorCount] = useState<number>(0);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [pickedIds, setPickedIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!condoId) {
      nav("/owner/add-condo/step-0");
      return;
    }
    localStorage.setItem(STEP_CONDO_ID_KEY, condoId);
  }, [condoId, nav]);

  useEffect(() => {
    if (!condoId) return;

    if (mode === "edit") {
      setSelectedRoomIds([]);
      return;
    }

    if (st?.selectedRoomIds?.length) {
      const ids = st.selectedRoomIds.map(String);
      setSelectedRoomIds(ids);
      localStorage.setItem(STEP6_SELECTED_KEY, JSON.stringify(ids));
      return;
    }

    const raw = localStorage.getItem(STEP6_SELECTED_KEY);
    if (!raw) {
      setSelectedRoomIds([]);
      return;
    }

    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        setSelectedRoomIds(arr.map(String));
      } else {
        setSelectedRoomIds([]);
      }
    } catch {
      setSelectedRoomIds([]);
    }
  }, [condoId, st?.selectedRoomIds, mode]);

  useEffect(() => {
    setPickedIds([]);
  }, [selectedRoomIds]);

  useEffect(() => {
    if (!condoId) return;

    let alive = true;

    (async () => {
      setLoading(true);
      setApiError(null);
      setSuccessMsg(null);

      try {
        const cfg = await api<FloorConfigDto>(
          `/owner/condos/${condoId}/floor-config`,
          { method: "GET" }
        );
        if (!alive) return;

        setFloorCount(cfg?.floorCount ?? 0);

        const list = await api<any[]>(`/owner/condos/${condoId}/rooms`, {
          method: "GET",
        });
        if (!alive) return;

        const drafts = readRoomNameDrafts(condoId);
        const finalRooms = applyRoomNameDrafts(
          (list ?? []).map(normalizeRoom),
          drafts
        )
          .slice()
          .sort(sortRooms);

        setRooms(finalRooms);

        const fallbackSelectedIds =
          mode === "edit"
            ? finalRooms
              .filter(
                (room) =>
                  room.isActive !== false && Number(room.price ?? 0) > 0
              )
              .map((room) => room.id)
            : finalRooms
              .filter((room) => room.isActive !== false)
              .map((room) => room.id);

        setSelectedRoomIds((prev) => {
          if (mode === "edit") {
            return fallbackSelectedIds;
          }

          if (prev.length > 0) return prev;
          if (st?.selectedRoomIds?.length) return st.selectedRoomIds.map(String);
          return fallbackSelectedIds;
        });
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
  }, [condoId, st?.selectedRoomIds, mode]);

  const selectedRooms = useMemo(() => {
    if (mode === "edit") {
      return rooms
        .filter((r) => r.isActive !== false && Number(r.price ?? 0) > 0)
        .slice()
        .sort(sortRooms);
    }

    const set = new Set(selectedRoomIds);
    return rooms.filter((r) => set.has(r.id)).slice().sort(sortRooms);
  }, [rooms, selectedRoomIds, mode]);

  const roomsByFloor = useMemo(() => {
    const map = new Map<number, Room[]>();

    for (let f = 1; f <= floorCount; f++) {
      map.set(f, []);
    }

    selectedRooms.forEach((r) => {
      const floor = Number(r.floor);
      if (!Number.isFinite(floor)) return;
      map.get(floor)?.push(r);
    });

    map.forEach((arr) => arr.sort(sortRooms));
    return map;
  }, [selectedRooms, floorCount]);

  const pickedSet = useMemo(() => new Set(pickedIds), [pickedIds]);
  const pickedCount = pickedIds.length;
  const canGoNext = selectedRooms.length > 0;

  const pickAll = () => setPickedIds(selectedRooms.map((r) => r.id));
  const clearPick = () => setPickedIds([]);

  const togglePick = (roomId: string) => {
    setSuccessMsg(null);
    setPickedIds((prev) =>
      prev.includes(roomId)
        ? prev.filter((x) => x !== roomId)
        : [...prev, roomId]
    );
  };

  const pickAllOnFloor = (floor: number) => {
    const ids = roomsByFloor.get(floor)?.map((r) => r.id) ?? [];
    setPickedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const unpickAllOnFloor = (floor: number) => {
    const ids = new Set(roomsByFloor.get(floor)?.map((r) => r.id) ?? []);
    setPickedIds((prev) => prev.filter((id) => !ids.has(id)));
  };

  const setStatusForRooms = async (
    roomIds: string[],
    occupancyStatus: OccupancyStatus
  ) => {
    if (!condoId || roomIds.length === 0) return;

    const ids = new Set(roomIds);

    setRooms((prev) =>
      prev.map((r) =>
        ids.has(r.id)
          ? {
            ...r,
            status: occupancyStatus,
            occupancyStatus,
          }
          : r
      )
    );

    setSaving(true);
    setApiError(null);
    setSuccessMsg(null);

    try {
      await api(`/owner/condos/${condoId}/rooms/bulk-occupancy`, {
        method: "PATCH",
        body: JSON.stringify({ roomIds, occupancyStatus }),
      });

      setPickedIds([]);

      if (mode === "edit") {
        setSuccessMsg("บันทึกสถานะห้องเรียบร้อยแล้ว");
      }
    } catch (e: any) {
      setApiError(e?.message ?? "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const toggleRoomStatus = async (roomId: string) => {
    const curr = rooms.find((x) => x.id === roomId);
    if (!curr) return;

    const next: OccupancyStatus =
      curr.status === "VACANT" ? "OCCUPIED" : "VACANT";

    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
            ...r,
            status: next,
            occupancyStatus: next,
          }
          : r
      )
    );

    setSaving(true);
    setApiError(null);
    setSuccessMsg(null);

    try {
      await api(`/owner/condos/${condoId}/rooms/${roomId}`, {
        method: "PATCH",
        body: JSON.stringify({ occupancyStatus: next }),
      });

      setPickedIds((prev) => prev.filter((id) => id !== roomId));

      if (mode === "edit") {
        setSuccessMsg("บันทึกสถานะห้องเรียบร้อยแล้ว");
      }
    } catch (e: any) {
      setApiError(e?.message ?? "สลับสถานะไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const applyVacant = () =>
    pickedCount > 0 && setStatusForRooms(pickedIds, "VACANT");

  const applyOccupied = () =>
    pickedCount > 0 && setStatusForRooms(pickedIds, "OCCUPIED");

  const disableBulk = pickedCount === 0 || saving;

  const formatPrice = (v: number | null) =>
    (typeof v === "number" ? v : 0).toLocaleString();

  const handleNextOrSave = () => {
    if (!condoId) return;

    if (mode === "edit") {
      setSuccessMsg("บันทึกสถานะห้องเรียบร้อยแล้ว");
      return;
    }

    nav(`../step-8?condoId=${encodeURIComponent(condoId)}`, {
      state: {
        condoId,
        selectedRoomIds,
      },
    });
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-[18px] pb-[110px]">
      <h1 className="text-center text-[34px] font-extrabold text-black/85 tracking-[0.2px] mb-[6px] mt-[6px]">
        {mode === "edit" ? "แก้ไขสถานะห้อง" : "ตั้งค่าคอนโดมิเนียม"}
      </h1>

      {apiError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700 font-extrabold">
          {apiError}
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-700 font-extrabold">
          {successMsg}
        </div>
      )}

      <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
        <div className="flex items-center gap-3 px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
          <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
          <div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">
              สถานะห้อง (ว่าง / ไม่ว่าง)
            </div>
            <div className="mt-1 text-sm font-bold text-gray-600">
              เลือกห้องที่ต้องการ แล้วตั้งสถานะเป็น “ว่าง” หรือ “ไม่ว่าง”
            </div>
          </div>
        </div>

        <div className="px-8 py-7">
          {loading ? (
            <div className="rounded-2xl border border-blue-100/60 bg-white px-6 py-8 shadow-sm text-center">
              <div className="text-sm font-extrabold text-gray-900">กำลังโหลด...</div>
            </div>
          ) : floorCount <= 0 ? (
            <div className="rounded-2xl border border-blue-100/60 bg-white px-6 py-8 shadow-sm text-center">
              <div className="text-sm font-extrabold text-gray-900">ยังไม่มีข้อมูลห้อง</div>
              <div className="mt-1 text-sm font-bold text-gray-600">
                รอ backend ส่ง floorCount และ rooms มาให้ แล้วหน้านี้จะพร้อมใช้งานทันที
              </div>
            </div>
          ) : selectedRooms.length === 0 ? (
            <div className="rounded-2xl border border-blue-100/60 bg-white px-6 py-5 shadow-sm">
              <div className="text-sm font-extrabold text-gray-900">
                {mode === "edit"
                  ? "ยังไม่มีห้องที่ตั้งราคาไว้"
                  : "ยังไม่มีห้องที่เลือกจาก Step 6"}
              </div>
              <div className="mt-1 text-sm font-bold text-gray-600">
                {mode === "edit"
                  ? "กรุณาตั้งราคาห้องใน Step 6 ก่อน แล้วห้องจะมาแสดงในหน้านี้อัตโนมัติ"
                  : "กรุณากลับไปเลือกห้องและกำหนดราคาใน Step 6 ก่อน"}
              </div>

              {mode !== "edit" && (
                <button
                  type="button"
                  onClick={() => nav("../step-6", { state: { condoId } })}
                  className="mt-4 h-[44px] px-5 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
                  bg-[#1F80DB] hover:bg-[#7fb4fb] active:scale-[0.98] cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  กลับไป Step 6
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {Array.from(roomsByFloor.entries()).map(([floor, floorRooms]) => (
                <div
                  key={floor}
                  className="rounded-2xl border border-blue-100/60 bg-white shadow-sm overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4 px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/60">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1.5 rounded-full bg-[#5b86ff]" />
                      <div className="text-lg font-extrabold text-gray-900">
                        ชั้นที่ {floor}
                      </div>
                      <div className="text-sm font-bold text-gray-600">
                        · {floorRooms.length} ห้อง
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => pickAllOnFloor(floor)}
                        className="h-[44px] px-5 rounded-xl bg-white border border-blue-200 text-blue-700 font-extrabold text-sm shadow-sm hover:bg-blue-50 active:scale-[0.98]
                        focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
                      >
                        เลือกทั้งชั้น
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => unpickAllOnFloor(floor)}
                        className="h-[44px] px-5 rounded-xl bg-white border border-gray-200 text-gray-700 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98]
                        focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-60"
                      >
                        ยกเลิกทั้งชั้น
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {floorRooms.map((room) => {
                        const isPicked = pickedSet.has(room.id);
                        const isVacant = room.status === "VACANT";

                        return (
                          <div
                            key={room.id}
                            className={[
                              "rounded-2xl border px-6 py-5 bg-white shadow-sm transition",
                              isPicked
                                ? "border-blue-300 ring-4 ring-blue-200/60"
                                : "border-blue-100/70",
                            ].join(" ")}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-base font-extrabold text-gray-900">
                                ห้อง {room.roomNo}
                              </div>

                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => togglePick(room.id)}
                                className={[
                                  "h-[40px] px-4 rounded-xl text-xs font-extrabold border shadow-sm transition",
                                  "active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60",
                                  isPicked
                                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
                                ].join(" ")}
                              >
                                {isPicked ? "เลือกแล้ว" : "เลือก"}
                              </button>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <div
                                className={[
                                  "h-[40px] px-4 rounded-xl text-xs font-extrabold border flex items-center",
                                  isVacant
                                    ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                                    : "border-rose-200 text-rose-700 bg-rose-50",
                                ].join(" ")}
                              >
                                สถานะ: {isVacant ? "ว่าง" : "ไม่ว่าง"}
                              </div>

                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => toggleRoomStatus(room.id)}
                                className="h-[40px] px-4 rounded-xl text-xs font-extrabold border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition active:scale-[0.98]
                                focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-60"
                              >
                                สลับสถานะ
                              </button>
                            </div>

                            <div className="mt-4 text-sm font-bold text-gray-700">
                              ราคา:{" "}
                              <span className="font-extrabold text-gray-900 text-base">
                                {formatPrice(room.price)}
                              </span>{" "}
                              บาท
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-[14px] flex-wrap pt-5">
        <div className="h-[46px] min-w-[260px] px-6 rounded-xl bg-[#161A2D] text-white flex items-center justify-center shadow-[0_12px_22px_rgba(0,0,0,0.18)] font-extrabold text-sm">
          เลือกเพื่อกำหนดสถานะ {pickedCount} ห้อง
        </div>

        <button
          type="button"
          disabled={disableBulk}
          onClick={applyVacant}
          className={[
            "h-[46px] px-5 rounded-xl border-0 shadow-[0_12px_22px_rgba(0,0,0,0.18)] font-extrabold text-sm transition",
            "focus:outline-none focus:ring-2 focus:ring-blue-300",
            disableBulk
              ? "bg-blue-200 cursor-not-allowed text-white/70 shadow-none"
              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] cursor-pointer",
          ].join(" ")}
        >
          ตั้งเป็น “ว่าง”
        </button>

        <button
          type="button"
          disabled={disableBulk}
          onClick={applyOccupied}
          className={[
            "h-[46px] px-5 rounded-xl border-0 shadow-[0_12px_22px_rgba(0,0,0,0.18)] font-extrabold text-sm transition",
            "focus:outline-none focus:ring-2 focus:ring-blue-300",
            disableBulk
              ? "bg-blue-200 cursor-not-allowed text-white/70 shadow-none"
              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] cursor-pointer",
          ].join(" ")}
        >
          ตั้งเป็น “ไม่ว่าง”
        </button>

        <button
          type="button"
          onClick={pickAll}
          disabled={selectedRooms.length === 0}
          className="h-[46px] px-5 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
          focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-60"
        >
          เลือกทั้งหมด
        </button>

        <button
          type="button"
          onClick={clearPick}
          disabled={pickedCount === 0}
          className="h-[46px] px-5 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
          focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-60"
        >
          ล้างที่เลือก
        </button>

        {mode !== "edit" && (
          <button
            type="button"
            onClick={() => nav("../step-6", { state: { condoId } })}
            className="h-[46px] px-5 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
            focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            ย้อนกลับ
          </button>
        )}

        <button
          type="button"
          disabled={mode === "create" ? !canGoNext : saving}
          onClick={handleNextOrSave}
          className={[
            "h-[46px] min-w-[110px] rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
            "focus:outline-none focus:ring-2 focus:ring-blue-300",
            mode === "create" && !canGoNext
              ? "bg-[#1F80DB]/40 cursor-not-allowed text-white/70"
              : "bg-[#1F80DB] hover:bg-[#7fb4fb] active:scale-[0.98] cursor-pointer",
          ].join(" ")}
        >
          {saving ? "กำลังบันทึก..." : mode === "edit" ? "บันทึก" : "ต่อไป"}
        </button>
      </div>
    </div>
  );
}