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
        <div className="flex-1 px-10 py-8">
            {/* title */}
            <h1 className="text-center text-[34px] font-extrabold text-black/85 tracking-[0.2px] mb-[22px] mt-[6px]">
                ตั้งค่าคอนโดมิเนียม
            </h1>

            {/* content container */}
            <div className="w-full max-w-[1120px] mx-auto">
                <div className="flex flex-col gap-[18px] pb-[110px]">
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
            </div>

            {/* sticky footer */}
            <div className="sticky bottom-0 w-full bg-[rgba(238,244,255,0.9)] backdrop-blur-[8px] border-t border-[rgba(147,197,253,0.45)] py-[18px]">
                <div className="w-full max-w-[1120px] mx-auto">
                    <div className="flex justify-end items-center gap-[14px]">
                        {/* count badge */}
                        <div className="h-[46px] min-w-[260px] rounded-xl bg-[#161A2D] text-white flex items-center justify-center shadow-[0_12px_22px_rgba(0,0,0,0.18)] font-extrabold text-sm">
                            จำนวนห้องที่เลือก {selectedRoomIds.length} ห้อง
                        </div>

                        {/* set price */}
                        <button
                            type="button"
                            onClick={() => setOpenModal(true)}
                            disabled={disableSetPrice}
                            className={[
                                "h-[46px] px-5 rounded-xl text-white border-0 shadow-[0_12px_22px_rgba(0,0,0,0.18)] font-extrabold text-sm transition",
                                disableSetPrice
                                    ? "bg-[#5B2424]/40 cursor-not-allowed text-white/70"
                                    : "!bg-[#5B2424] hover:!bg-[#4a1d1d] active:scale-[0.98] cursor-pointer",
                            ].join(" ")}
                        >
                            ระบุค่าห้อง
                        </button>


                        {/* next */}
                        <button
                            type="button"
                            onClick={() => nav("../step-7")}
                            className={[
                                "h-[46px] w-24 rounded-xl border-0 text-white font-black shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
                                "!bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer",
                            ].join(" ")}
                        >
                            ต่อไป
                        </button>
                    </div>
                </div>
            </div>

            {/* modal */}
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
