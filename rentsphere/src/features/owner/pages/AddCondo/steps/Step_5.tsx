import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type RoomStatus = "VACANT" | "OCCUPIED";

type Room = {
  id: string;
  floor: number;
  roomNo: string;
  price: number | null;
  serviceId: number | null;
  isActive: boolean;
  status: RoomStatus;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function buildRooms(floorCount: number, roomsPerFloor: number[]): Room[] {
  const rooms: Room[] = [];
  for (let floor = 1; floor <= floorCount; floor++) {
    const count = roomsPerFloor[floor - 1] ?? 1;
    for (let i = 1; i <= count; i++) {
      rooms.push({
        id: `${floor}-${i}`,
        floor,
        roomNo: `${floor}${pad2(i)}`,
        price: null,
        serviceId: null,
        isActive: true,
        status: "VACANT",
      });
    }
  }
  return rooms;
}

function sortByFloorAndIndex(a: Room, b: Room) {
  if (a.floor !== b.floor) return a.floor - b.floor;
  const ai = parseInt(a.id.split("-")[1] ?? "0", 10);
  const bi = parseInt(b.id.split("-")[1] ?? "0", 10);
  return ai - bi;
}

function renumberFloorRooms(allRooms: Room[], floor: number): Room[] {
  const floorRooms = allRooms
    .filter((r) => r.floor === floor)
    .slice()
    .sort(sortByFloorAndIndex);

  const otherRooms = allRooms.filter((r) => r.floor !== floor);

  const renumbered = floorRooms.map((r, idx) => ({
    ...r,
    id: `${floor}-${idx + 1}`,
    roomNo: `${floor}${pad2(idx + 1)}`,
  }));

  return [...otherRooms, ...renumbered].sort(sortByFloorAndIndex);
}

export default function Step_5() {
  const nav = useNavigate();

  // ======================
  // Local state
  // ======================
  const [floorCount, setFloorCount] = useState<number>(0);
  const [rooms, setRooms] = useState<Room[]>([]);

  // ======================
  // TODO: API (backend will connect later)
  // - GET floorCount, roomsPerFloor, rooms
  // - setFloorCount, setRooms
  // ======================
  useEffect(() => {
    // Ex:
    // const mockFloorCount = 3;
    // const mockRoomsPerFloor = [4, 4, 4];
    // setFloorCount(mockFloorCount);
    // setRooms(buildRooms(mockFloorCount, mockRoomsPerFloor));
  }, []);

  // Group rooms by floor (เหมือน Step6)
  const roomsByFloor = useMemo(() => {
    const map = new Map<number, Room[]>();
    for (let f = 1; f <= floorCount; f++) map.set(f, []);
    rooms.forEach((r) => map.get(r.floor)?.push(r));
    map.forEach((arr) => arr.sort((a, b) => a.roomNo.localeCompare(b.roomNo)));
    return map;
  }, [rooms, floorCount]);

  const totalRooms = useMemo(() => rooms.length, [rooms]);

  // ======================
  // Actions (API)
  // ======================
  const toggleRoomActive = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, isActive: !r.isActive } : r))
    );

    // TODO: API
    // await api.toggleRoomActive({ roomId })
  };

  const changeRoomNo = (roomId: string, value: string) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, roomNo: value } : r)));

    // TODO: API
    // await api.updateRoom({ roomId, roomNo: value })
  };

  const addRoomOnFloor = (floor: number) => {
    setRooms((prev) => {
      const current = prev.filter((r) => r.floor === floor);
      const nextIndex = current.length + 1;
      if (nextIndex > 50) return prev;

      const newRoom: Room = {
        id: `${floor}-${nextIndex}`,
        floor,
        roomNo: `${floor}${pad2(nextIndex)}`,
        price: null,
        serviceId: null,
        isActive: true,
        status: "VACANT",
      };

      return [...prev, newRoom].sort(sortByFloorAndIndex);
    });

    // TODO: API
    // await api.addRoom({ floor })
  };

  const deleteRoomOnFloor = (floor: number, roomId: string) => {
    setRooms((prev) => {
      const filtered = prev.filter((r) => r.id !== roomId);
      return renumberFloorRooms(filtered, floor);
    });

    // TODO: API
    // await api.deleteRoom({ roomId })
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-[18px] pb-[110px]">
      <h1 className="text-center text-[34px] font-extrabold text-black/85 tracking-[0.2px] mb-[6px] mt-[6px]">
        ตั้งค่าคอนโดมิเนียม
      </h1>

      {floorCount <= 0 ? (
        <div className="rounded-2xl bg-white border border-blue-100/60 shadow-[0_18px_50px_rgba(15,23,42,0.12)] px-8 py-10 text-center">
          <div className="text-lg font-extrabold text-gray-900">ยังไม่มีข้อมูลห้อง</div>
          <div className="mt-2 text-sm font-bold text-gray-600">
            รอ backend ส่ง floorCount และรายการ rooms มาให้ แล้วหน้าจะพร้อมใช้งานทันที
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
          <div className="flex items-center gap-3 px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
            <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
            <div>
              <div className="text-xl font-extrabold text-gray-900 tracking-tight">ผังห้อง</div>
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
                      <div className="text-lg font-extrabold text-gray-900">ชั้นที่ {floor}</div>
                      <div className="text-sm font-bold text-gray-600">· {floorRooms.length} ห้อง</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => addRoomOnFloor(floor)}
                      className="h-[44px] px-5 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
                                 bg-[#93C5FD] hover:bg-[#7fb4fb] active:scale-[0.98] cursor-pointer
                                 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      เพิ่มห้อง
                    </button>
                  </div>

                  <div className="px-6 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {floorRooms.map((room) => (
                        <div
                          key={room.id}
                          className={[
                            "rounded-2xl border px-6 py-5 bg-white shadow-sm transition",
                            room.isActive ? "border-blue-100/70" : "border-gray-200 opacity-70",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-base font-extrabold text-gray-900">เลขห้อง</div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleRoomActive(room.id)}
                                className={[
                                  "px-4 py-2 rounded-xl text-xs font-extrabold border shadow-sm transition",
                                  "active:scale-[0.98] focus:outline-none focus:ring-2",
                                  room.isActive
                                    ? "bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-200"
                                    : "bg-white border-rose-200 text-rose-700 hover:bg-rose-50 focus:ring-rose-200",
                                ].join(" ")}
                              >
                                {room.isActive ? "เปิดใช้งาน" : "ปิดห้อง"}
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteRoomOnFloor(floor, room.id)}
                                className="px-4 py-2 rounded-xl text-xs font-extrabold border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition active:scale-[0.98]
                                           focus:outline-none focus:ring-2 focus:ring-gray-200"
                              >
                                ลบ
                              </button>
                            </div>
                          </div>

                          <input
                            value={room.roomNo}
                            onChange={(e) => changeRoomNo(room.id, e.target.value)}
                            className="mt-4 w-full h-14 rounded-2xl border border-gray-200 bg-[#fffdf2] px-5 text-xl font-extrabold text-gray-900 shadow-sm
                                       focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
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
                      <span className="font-extrabold text-gray-900">{floorRooms.length}</span> ห้อง
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
          onClick={() => nav("../step-4")}
          className="h-[46px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                     focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={() => nav("../step-6")}
          className="h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
                     bg-[#93C5FD] hover:bg-[#7fb4fb] active:scale-[0.98] cursor-pointer
                     focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          ต่อไป
        </button>
      </div>
    </div>
  );
}