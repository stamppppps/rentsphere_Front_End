import { api } from "@/shared/api/http";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const STEP_CONDO_ID_KEY = "add_condo_condoId";
const STEP_ROOM_NAMES_KEY_PREFIX = "add_condo_room_name_drafts_";

type OccupancyStatus = "VACANT" | "OCCUPIED";
type RoomStatus = "NORMAL" | "MAINTENANCE" | "BROKEN" | string;

type Room = {
  id: string;
  floor: number;
  roomNo: string;
  price: number | null;
  isActive: boolean;
  occupancyStatus?: OccupancyStatus;
  roomStatus?: RoomStatus;
};

type FloorConfigDto = {
  floorCount: number;
  roomsPerFloor: number[];
  totalRooms: number;
};

function sortByFloorAndRoomNo(a: Room, b: Room) {
  if (a.floor !== b.floor) return a.floor - b.floor;
  return a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true });
}

function buildRoomsPerFloorFromRooms(
  rooms: Room[],
  floorCount: number
): number[] {
  const counts = Array.from({ length: floorCount }, () => 0);
  for (const room of rooms) {
    const idx = Number(room.floor) - 1;
    if (idx >= 0 && idx < counts.length) counts[idx] += 1;
  }
  return counts;
}

function roomNamesKey(condoId: string) {
  return `${STEP_ROOM_NAMES_KEY_PREFIX}${condoId}`;
}

function readRoomNameDrafts(condoId: string): Record<string, string> {
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

function writeRoomNameDrafts(condoId: string, drafts: Record<string, string>) {
  localStorage.setItem(roomNamesKey(condoId), JSON.stringify(drafts));
}

function getDisplayRoomNo(room: Room, drafts: Record<string, string>) {
  const draft = drafts[room.id];
  if (typeof draft === "string" && draft.trim() !== "") {
    return draft;
  }
  return room.roomNo ?? "";
}

export default function Step_5() {
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isSettingsPath = location.pathname.startsWith("/owner/settings");
  const mode =
    searchParams.get("mode") === "edit" || isSettingsPath ? "edit" : "create";

  const condoId: string = useMemo(() => {
    const fromQuery = searchParams.get("condoId");
    const fromState = (location.state as any)?.condoId;
    const fromStorage = localStorage.getItem(STEP_CONDO_ID_KEY);
    return String(fromQuery ?? fromState ?? fromStorage ?? "").trim();
  }, [location.state, searchParams]);

  useEffect(() => {
    if (condoId) localStorage.setItem(STEP_CONDO_ID_KEY, condoId);
  }, [condoId]);

  useEffect(() => {
    if (!condoId) nav("/owner/add-condo/step-0");
  }, [condoId, nav]);

  const [floorCount, setFloorCount] = useState<number>(0);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const syncFloorConfigFromRooms = useCallback(
    async (nextRooms: Room[], nextFloorCount: number) => {
      if (!condoId || nextFloorCount <= 0) return;

      await api(`/owner/condos/${condoId}/floor-config`, {
        method: "PUT",
        body: JSON.stringify({
          floorCount: nextFloorCount,
          roomsPerFloor: buildRoomsPerFloorFromRooms(nextRooms, nextFloorCount),
          totalRooms: nextRooms.length,
        }),
      });
    },
    [condoId]
  );

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

        if (!cfg?.floorCount || cfg.floorCount <= 0) {
          setFloorCount(0);
          setRooms([]);
          return;
        }

        setFloorCount(cfg.floorCount);

        let list = await api<Room[]>(`/owner/condos/${condoId}/rooms`, {
          method: "GET",
        });
        if (!alive) return;

        if ((list ?? []).length === 0 && mode === "create") {
          await api(`/owner/condos/${condoId}/rooms/generate`, {
            method: "POST",
          });
          list = await api<Room[]>(`/owner/condos/${condoId}/rooms`, {
            method: "GET",
          });
          if (!alive) return;
        }

        const drafts = readRoomNameDrafts(condoId);
        const seededDrafts = { ...drafts };

        for (const room of list ?? []) {
          if (!(room.id in seededDrafts)) {
            seededDrafts[room.id] = room.roomNo ?? "";
          }
        }

        writeRoomNameDrafts(condoId, seededDrafts);

        const sortedRooms = (list ?? [])
          .map((room) => ({
            ...room,
            roomNo: getDisplayRoomNo(room, seededDrafts),
          }))
          .slice()
          .sort(sortByFloorAndRoomNo);

        setRooms(sortedRooms);
        await syncFloorConfigFromRooms(sortedRooms, cfg.floorCount);
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
  }, [condoId, mode, syncFloorConfigFromRooms]);

  const roomsByFloor = useMemo(() => {
    const map = new Map<number, Room[]>();
    for (let f = 1; f <= floorCount; f++) map.set(f, []);
    rooms.forEach((r) => map.get(r.floor)?.push(r));
    map.forEach((arr) => arr.sort(sortByFloorAndRoomNo));
    return map;
  }, [rooms, floorCount]);

  const totalRooms = useMemo(() => rooms.length, [rooms]);
  const disabledAll = loading || saving;

  const toggleRoomActive = async (room: Room) => {
    if (!condoId || saving) return;

    setSuccessMsg(null);
    const next = !room.isActive;

    setRooms((prev) =>
      prev.map((r) => (r.id === room.id ? { ...r, isActive: next } : r))
    );

    setSaving(true);
    setApiError(null);

    try {
      const updated = await api<Room>(
        `/owner/condos/${condoId}/rooms/${room.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive: next }),
        }
      );

      const drafts = readRoomNameDrafts(condoId);

      setRooms((prev) =>
        prev
          .map((r) =>
            r.id === room.id
              ? {
                ...r,
                ...updated,
                roomNo: getDisplayRoomNo(updated, drafts),
              }
              : r
          )
          .slice()
          .sort(sortByFloorAndRoomNo)
      );
    } catch (e: any) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === room.id ? { ...r, isActive: room.isActive } : r
        )
      );
      setApiError(e?.message ?? "อัปเดตสถานะห้องไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const changeRoomNoLocal = (roomId: string, value: string) => {
    setSuccessMsg(null);

    if (condoId) {
      const drafts = readRoomNameDrafts(condoId);
      drafts[roomId] = value;
      writeRoomNameDrafts(condoId, drafts);
    }

    setRooms((prev) =>
      prev
        .map((r) => (r.id === roomId ? { ...r, roomNo: value } : r))
        .slice()
        .sort(sortByFloorAndRoomNo)
    );
  };

  const saveRoomNo = async (roomId: string) => {
    if (!condoId || saving) return;

    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const roomNo = room.roomNo.trim();
    if (!roomNo) return;

    setSaving(true);
    setApiError(null);

    try {
      const updated = await api<Room>(
        `/owner/condos/${condoId}/rooms/${room.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ roomNo }),
        }
      );

      const drafts = readRoomNameDrafts(condoId);
      drafts[room.id] = updated.roomNo ?? roomNo;
      writeRoomNameDrafts(condoId, drafts);

      setRooms((prev) =>
        prev
          .map((r) =>
            r.id === room.id
              ? {
                ...r,
                ...updated,
                roomNo: updated.roomNo ?? roomNo,
              }
              : r
          )
          .slice()
          .sort(sortByFloorAndRoomNo)
      );
    } catch (e: any) {
      setApiError(e?.message ?? "บันทึกเลขห้องไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const addRoomOnFloor = async (floor: number) => {
    if (!condoId || saving) return;

    setSuccessMsg(null);
    setSaving(true);
    setApiError(null);

    try {
      const created = await api<Room>(`/owner/condos/${condoId}/rooms`, {
        method: "POST",
        body: JSON.stringify({ floor }),
      });

      const drafts = readRoomNameDrafts(condoId);
      drafts[created.id] = created.roomNo ?? "";
      writeRoomNameDrafts(condoId, drafts);

      let nextRooms: Room[] = [];
      setRooms((prev) => {
        nextRooms = [...prev, { ...created, roomNo: created.roomNo ?? "" }]
          .slice()
          .sort(sortByFloorAndRoomNo);
        return nextRooms;
      });

      await syncFloorConfigFromRooms(nextRooms, floorCount);
    } catch (e: any) {
      setApiError(e?.message ?? "เพิ่มห้องไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const deleteRoomOnFloor = async (room: Room) => {
    if (!condoId || saving) return;

    setSuccessMsg(null);
    setSaving(true);
    setApiError(null);

    try {
      await api(`/owner/condos/${condoId}/rooms/${room.id}`, {
        method: "DELETE",
      });

      const list = await api<Room[]>(`/owner/condos/${condoId}/rooms`, {
        method: "GET",
      });

      const drafts = readRoomNameDrafts(condoId);
      delete drafts[room.id];

      for (const r of list ?? []) {
        if (!(r.id in drafts)) drafts[r.id] = r.roomNo ?? "";
      }

      writeRoomNameDrafts(condoId, drafts);

      const nextRooms = (list ?? [])
        .map((r) => ({
          ...r,
          roomNo: getDisplayRoomNo(r, drafts),
        }))
        .slice()
        .sort(sortByFloorAndRoomNo);

      setRooms(nextRooms);
      await syncFloorConfigFromRooms(nextRooms, floorCount);
    } catch (e: any) {
      setApiError(e?.message ?? "ลบห้องไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!condoId || saving) return;

    setSaving(true);
    setApiError(null);
    setSuccessMsg(null);

    try {
      const saveTasks = rooms
        .map((room) => {
          const roomNo = room.roomNo.trim();
          if (!roomNo) return null;

          return api(`/owner/condos/${condoId}/rooms/${room.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              roomNo,
              isActive: room.isActive,
            }),
          });
        })
        .filter(Boolean) as Promise<any>[];

      if (saveTasks.length > 0) {
        await Promise.all(saveTasks);
      }

      const refreshedRooms = await api<Room[]>(
        `/owner/condos/${condoId}/rooms`,
        {
          method: "GET",
        }
      );

      const drafts = readRoomNameDrafts(condoId);
      for (const room of refreshedRooms ?? []) {
        drafts[room.id] = room.roomNo ?? "";
      }
      writeRoomNameDrafts(condoId, drafts);

      const sortedRooms = (refreshedRooms ?? [])
        .map((room) => ({
          ...room,
          roomNo: room.roomNo ?? "",
        }))
        .slice()
        .sort(sortByFloorAndRoomNo);

      setRooms(sortedRooms);
      await syncFloorConfigFromRooms(sortedRooms, floorCount);

      if (mode === "edit") {
        setSuccessMsg("บันทึกผังห้องเรียบร้อยแล้ว");
      } else {
        nav("../step-6", { state: { condoId } });
      }
    } catch (e: any) {
      setApiError(e?.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (!condoId) return;

    if (mode === "edit") {
      nav(
        `/owner/settings/step-4?condoId=${encodeURIComponent(condoId)}&mode=edit`
      );
      return;
    }

    nav("../step-4", { state: { condoId } });
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-[18px] pb-[110px]">
      <h1 className="text-center text-[34px] font-extrabold text-black/85 tracking-[0.2px] mb-[6px] mt-[6px]">
        {mode === "edit" ? "แก้ไขผังห้อง" : "ตั้งค่าคอนโดมิเนียม"}
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
        <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
          <div className="flex items-center gap-3 px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
            <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
            <div>
              <div className="text-xl font-extrabold text-gray-900 tracking-tight">
                ผังห้อง
              </div>
              <div className="mt-1 text-sm font-bold text-gray-600">
                เปิด/ปิดห้อง, แก้เลขห้อง และเพิ่ม/ลบห้องในแต่ละชั้นได้
              </div>
            </div>
          </div>

          <div className="px-8 py-7">
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

                    <button
                      type="button"
                      disabled={disabledAll}
                      onClick={() => addRoomOnFloor(floor)}
                      className="h-[44px] px-5 rounded-xl border-0 text-white font-black text-sm shadow-[0_10px_10px_rgba(0,0,0,0.10)] transition
                                 bg-[#4B91FB] hover:bg-[#7fb4fb] active:scale-[0.98] cursor-pointer
                                 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
                    >
                      {saving ? "กำลังบันทึก..." : "เพิ่มห้อง"}
                    </button>
                  </div>

                  <div className="px-6 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {floorRooms.map((room) => (
                        <div
                          key={room.id}
                          className={[
                            "rounded-2xl border px-6 py-5 bg-white shadow-sm transition",
                            room.isActive
                              ? "border-blue-100/70"
                              : "border-gray-200 opacity-70",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-base font-extrabold text-gray-900">
                              เลขห้อง <span className="text-rose-600">*</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={disabledAll}
                                onClick={() => toggleRoomActive(room)}
                                className={[
                                  "px-4 py-2 rounded-xl text-xs font-extrabold border shadow-sm transition",
                                  "active:scale-[0.98] focus:outline-none focus:ring-2 disabled:opacity-60",
                                  room.isActive
                                    ? "bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-200"
                                    : "bg-white border-rose-200 text-rose-700 hover:bg-rose-50 focus:ring-rose-200",
                                ].join(" ")}
                              >
                                {room.isActive ? "เปิดใช้งาน" : "ปิดห้อง"}
                              </button>

                              <button
                                type="button"
                                disabled={disabledAll}
                                onClick={() => deleteRoomOnFloor(room)}
                                className="px-4 py-2 rounded-xl text-xs font-extrabold border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition active:scale-[0.98]
                                           focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-60"
                              >
                                ลบ
                              </button>
                            </div>
                          </div>

                          <input
                            value={room.roomNo}
                            disabled={disabledAll}
                            onChange={(e) =>
                              changeRoomNoLocal(room.id, e.target.value)
                            }
                            onBlur={() => saveRoomNo(room.id)}
                            aria-label="Room number"
                            placeholder="เลขห้อง"
                            className="mt-4 w-full h-14 rounded-2xl border border-gray-200 bg-[#fffdf2] px-5 text-xl font-extrabold text-gray-900 shadow-sm
                                       focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300 disabled:opacity-60"
                          />

                          <div className="mt-4 text-sm font-bold text-gray-600">
                            สถานะ:{" "}
                            <span
                              className={
                                room.isActive
                                  ? "text-emerald-700 font-extrabold"
                                  : "text-rose-700 font-extrabold"
                              }
                            >
                              {room.isActive ? "เปิด" : "ปิด"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 text-sm font-bold text-gray-600">
                      ชั้นนี้มีทั้งหมด{" "}
                      <span className="font-extrabold text-gray-900">
                        {floorRooms.length}
                      </span>{" "}
                      ห้อง
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-[10px] flex-wrap">
        <div className="h-[46px] min-w-[260px] rounded-xl bg-[#161A2D] text-white flex items-center justify-center shadow-[0_12px_22px_rgba(0,0,0,0.18)] font-extrabold text-sm px-6">
          จำนวนชั้น {floorCount} · รวม {totalRooms} ห้อง
        </div>

        <button
          type="button"
          disabled={loading || saving}
          onClick={handleBack}
          className="h-[46px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                     focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-60"
        >
          ย้อนกลับ
        </button>

        <button
          type="button"
          disabled={loading || saving}
          onClick={handleSave}
          className="h-[46px] min-w-[110px] rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
                     bg-[#1F80DB] hover:bg-[#7fb4fb] active:scale-[0.98] cursor-pointer
                     focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
        >
          {saving ? "กำลังบันทึก..." : mode === "edit" ? "บันทึก" : "ต่อไป"}
        </button>
      </div>
    </div>
  );
}