import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAddCondoStore } from "../store/addCondo.store";

export default function Step_5() {
  const nav = useNavigate();

  const floorCount = useAddCondoStore((s) => s.floorCount);
  const rooms = useAddCondoStore((s) => s.rooms);
  const generateRoomsIfEmpty = useAddCondoStore((s) => s.generateRoomsIfEmpty);

  const toggleRoomActive = useAddCondoStore((s) => s.toggleRoomActive);
  const changeRoomNo = useAddCondoStore((s) => s.changeRoomNo);
  const addRoomOnFloor = useAddCondoStore((s) => s.addRoomOnFloor);
  const deleteRoomOnFloor = useAddCondoStore((s) => s.deleteRoomOnFloor);

  useEffect(() => {
    generateRoomsIfEmpty();
  }, [generateRoomsIfEmpty]);

  const roomsByFloor = useMemo(() => {
    const map = new Map<number, typeof rooms>();
    for (let f = 1; f <= floorCount; f++) map.set(f, []);
    rooms.forEach((r) => map.get(r.floor)?.push(r));
    map.forEach((arr) => arr.sort((a, b) => a.roomNo.localeCompare(b.roomNo)));
    return map;
  }, [rooms, floorCount]);

  const totalRooms = useMemo(() => rooms.length, [rooms]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#eef5ff] px-10 py-8 font-sarabun">
      {/* ===== title ===== */}
      <h1 className="text-center text-4xl font-extrabold text-gray-900 tracking-tight mb-8">
        ตั้งค่าคอนโดมิเนียม
      </h1>

      <div className="mx-auto w-full max-w-5xl flex flex-col gap-6 pb-28">
        {/* ===== info card  ===== */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h3 className="text-2xl font-extrabold mb-4">ผังห้อง</h3>
          <ul className="list-disc pl-6 text-lg text-gray-700 space-y-2">
            <li>เปิด/ปิดห้องได้</li>
            <li>แก้เลขห้องได้</li>
            <li>เพิ่ม/ลบห้องในแต่ละชั้นได้</li>
          </ul>
        </div>

        {/* ===== floors ===== */}
        {Array.from(roomsByFloor.entries()).map(([floor, floorRooms]) => (
          <div
            key={floor}
            className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden"
          >
            {/* header */}
            <div className="flex items-center justify-between px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
              <div className="flex items-center gap-3">
                <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
                <div className="text-xl font-extrabold text-gray-900">
                  ชั้นที่ {floor}
                </div>
              </div>

              <button
                type="button"
                onClick={() => addRoomOnFloor(floor)}
                className={[
                  "px-6 py-3 rounded-xl text-base font-extrabold text-white shadow-lg transition",
                  "focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-[0.98]",
                  "!bg-gray-900 hover:!bg-gray-800",
                ].join(" ")}
              >
                เพิ่มห้อง
              </button>
            </div>

            {/* body */}
            <div className="px-8 py-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {floorRooms.map((room) => (
                  <div
                    key={room.id}
                    className={[
                      "rounded-2xl border shadow-sm px-6 py-5 bg-white transition",
                      room.isActive
                        ? "border-blue-100/70"
                        : "border-gray-200 opacity-70",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg font-extrabold text-gray-900">
                        เลขห้อง
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleRoomActive(room.id)}
                          className={[
                            "px-4 py-2 rounded-xl text-sm font-extrabold border shadow-sm transition",
                            "active:scale-[0.98] focus:outline-none focus:ring-2",
                            room.isActive
                              ? "bg-white border-green-200 text-green-700 hover:bg-green-50 focus:ring-green-200"
                              : "bg-white border-red-200 text-red-700 hover:bg-red-50 focus:ring-red-200",
                          ].join(" ")}
                        >
                          {room.isActive ? "เปิดใช้งาน" : "ปิดห้อง"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteRoomOnFloor(floor, room.id)}
                          className="px-4 py-2 rounded-xl text-sm font-extrabold border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition active:scale-[0.98]
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
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <div className="mt-4 text-base font-bold text-gray-600">
                      สถานะ:{" "}
                      <span
                        className={
                          room.isActive
                            ? "text-green-700 font-extrabold"
                            : "text-red-700 font-extrabold"
                        }
                      >
                        {room.isActive ? "เปิด" : "ปิด"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-base font-bold text-gray-600">
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

      {/* ===== fixed footer  ===== */}
      <div className="fixed left-0 right-0 bottom-0 z-40 w-full bg-[rgba(238,244,255,0.9)] backdrop-blur-[8px] border-t border-[rgba(147,197,253,0.45)] py-[18px]">
        <div className="w-full max-w-[1120px] mx-auto px-6">
          <div className="flex items-center justify-end gap-[14px] flex-wrap">
            {/* count badge */}
            <div className="h-[46px] min-w-[260px] px-6 rounded-xl bg-[#161A2D] text-white flex items-center justify-center shadow-[0_12px_22px_rgba(0,0,0,0.18)] font-extrabold text-sm">
              จำนวนชั้น {floorCount} · รวม {totalRooms} ห้อง
            </div>

            {/* back */}
            <button
              type="button"
              onClick={() => nav("../step-4")}
              className="h-[46px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                   focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              ย้อนกลับ
            </button>

            {/* next */}
            <button
              type="button"
              onClick={() => nav("../step-6")}
              className={[
                "h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
                "!bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-blue-300",
              ].join(" ")}
            >
              ต่อไป
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
