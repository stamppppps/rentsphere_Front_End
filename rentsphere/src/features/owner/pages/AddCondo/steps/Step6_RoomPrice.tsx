import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import FloorSection from "../components/FloorSection";
import SetRoomPriceModal from "../components/SetRoomPriceModal";
import { useAddCondoStore } from "../store/addCondo.store";

export default function Step6RoomPrice() {
    const nav = useNavigate();

    const {
        floorCount,
        rooms,
        selectedRoomIds,
        generateRoomsIfEmpty,
        toggleRoom,
        selectAllOnFloor,
        unselectAllOnFloor,
        setPriceForRooms,
    } = useAddCondoStore();

    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        generateRoomsIfEmpty();
    }, [generateRoomsIfEmpty]);

    const roomsByFloor = useMemo(() => {
        const map = new Map<number, typeof rooms>();
        for (let f = 1; f <= floorCount; f++) map.set(f, []);
        rooms.forEach((r) => map.get(r.floor)!.push(r));
        return map;
    }, [rooms, floorCount]);

    const disableSetPrice = selectedRoomIds.length === 0;

    return (
        <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-[18px] pb-[110px]">
            <h1 className="text-center text-[34px] font-extrabold text-black/85 tracking-[0.2px] mb-[6px] mt-[6px]">
                ตั้งค่าคอนโดมิเนียม
            </h1>

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