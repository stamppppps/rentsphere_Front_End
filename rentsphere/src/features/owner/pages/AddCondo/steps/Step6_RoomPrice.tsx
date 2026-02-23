import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import FloorSection from "../components/FloorSection";
import SetRoomPriceModal from "../components/SetRoomPriceModal";
import type { Room } from "../types/addCondo.types";

export default function Step6RoomPrice() {
    const nav = useNavigate();

    // ======================
    // Local state (no store)
    // ======================
    const [floorCount, setFloorCount] = useState<number>(0);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
    const [openModal, setOpenModal] = useState(false);

    // ======================
    // TODO: API (backend will connect later)
    // - GET floors/rooms
    // - setFloorCount, setRooms
    // ======================
    useEffect(() => {
    }, []);

    // Group rooms by floor
    const roomsByFloor = useMemo(() => {
        const map = new Map<number, Room[]>();
        for (let f = 1; f <= floorCount; f++) map.set(f, []);
        rooms.forEach((r) => map.get(r.floor)?.push(r));
        return map;
    }, [rooms, floorCount]);

    // Toggle selection
    const toggleRoom = (roomId: string) => {
        setSelectedRoomIds((prev) =>
            prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
        );
    };

    const selectAllOnFloor = (floor: number) => {
        const ids = rooms.filter((r) => r.floor === floor && r.isActive).map((r) => r.id);
        setSelectedRoomIds((prev) => Array.from(new Set([...prev, ...ids])));
    };

    const unselectAllOnFloor = (floor: number) => {
        const idsOnFloor = new Set(rooms.filter((r) => r.floor === floor).map((r) => r.id));
        setSelectedRoomIds((prev) => prev.filter((id) => !idsOnFloor.has(id)));
    };

    // Apply price to selected rooms
    const setPriceForRooms = (roomIds: string[], price: number | null) => {
        const ids = new Set(roomIds);
        setRooms((prev) => prev.map((r) => (ids.has(r.id) ? { ...r, price } : r)));

        // TODO: API
        // await api.setRoomPrices({ roomIds, price })
    };

    const disableSetPrice = selectedRoomIds.length === 0;

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
                    disabled={disableSetPrice}
                    className={[
                        "h-[46px] px-5 rounded-xl text-white border-0 shadow-[0_12px_22px_rgba(0,0,0,0.18)] font-extrabold text-sm transition",
                        "focus:outline-none focus:ring-2 focus:ring-blue-300",
                        disableSetPrice
                            ? "bg-blue-200 cursor-not-allowed text-white/70 shadow-none"
                            : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] cursor-pointer",
                    ].join(" ")}
                >
                    ระบุค่าห้อง
                </button>

                <button
                    type="button"
                    onClick={() => nav("../step-5")}
                    className="h-[46px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                     focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                    ย้อนกลับ
                </button>

                <button
                    type="button"
                    onClick={() => nav("../step-7")}
                    className="h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
                     bg-[#93C5FD] hover:bg-[#7fb4fb] active:scale-[0.98] cursor-pointer
                     focus:outline-none focus:ring-2 focus:ring-blue-300"
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