import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddCondoStore } from "../store/addCondo.store";

export default function Step7_Review() {
    const nav = useNavigate();

    const {
        rooms,
        floorCount,
        selectedRoomIds,
        generateRoomsIfEmpty,
        setStatusForRooms,
        toggleRoomStatus,
    } = useAddCondoStore();

    useEffect(() => {
        generateRoomsIfEmpty();
    }, [generateRoomsIfEmpty]);

    const [pickedIds, setPickedIds] = useState<string[]>([]);

    useEffect(() => {
        setPickedIds(selectedRoomIds);
    }, [selectedRoomIds]);

    const selectedRooms = useMemo(() => {
        const set = new Set(selectedRoomIds);
        return rooms.filter((r) => set.has(r.id));
    }, [rooms, selectedRoomIds]);

    const roomsByFloor = useMemo(() => {
        const map = new Map<number, typeof selectedRooms>();
        for (let f = 1; f <= floorCount; f++) map.set(f, []);
        selectedRooms.forEach((r) => map.get(r.floor)!.push(r));
        map.forEach((arr) => arr.sort((a, b) => a.roomNo.localeCompare(b.roomNo)));
        return map;
    }, [selectedRooms, floorCount]);

    const pickedSet = useMemo(() => new Set(pickedIds), [pickedIds]);
    const pickedCount = pickedIds.length;

    const canGoNext = selectedRoomIds.length > 0;

    const pickAll = () => setPickedIds(selectedRoomIds);
    const clearPick = () => setPickedIds([]);

    const togglePick = (roomId: string) => {
        setPickedIds((prev) =>
            prev.includes(roomId) ? prev.filter((x) => x !== roomId) : [...prev, roomId]
        );
    };

    const pickAllOnFloor = (floor: number) => {
        const ids = roomsByFloor.get(floor)?.map((r) => r.id) ?? [];
        setPickedIds((prev) => {
            const s = new Set(prev);
            ids.forEach((id) => s.add(id));
            return Array.from(s);
        });
    };

    const unpickAllOnFloor = (floor: number) => {
        const ids = new Set(roomsByFloor.get(floor)?.map((r) => r.id) ?? []);
        setPickedIds((prev) => prev.filter((id) => !ids.has(id)));
    };

    const applyVacant = () => {
        if (pickedCount === 0) return;
        setStatusForRooms(pickedIds, "VACANT");
    };

    const applyOccupied = () => {
        if (pickedCount === 0) return;
        setStatusForRooms(pickedIds, "OCCUPIED");
    };

    const disableBulk = pickedCount === 0;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#eef5ff] px-8 py-8 font-sarabun">
            {/* title  */}
            <h1 className="text-center text-4xl font-extrabold text-gray-900 tracking-tight">
                ตั้งค่าคอนโดมิเนียม
            </h1>

            <div className="mx-auto mt-6 w-full max-w-5xl flex flex-col gap-6 pb-32">
                {Array.from(roomsByFloor.entries()).map(([floor, floorRooms]) => (
                    <div
                        key={floor}
                        className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden"
                    >
                        {/* header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/60">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1.5 rounded-full bg-[#5b86ff]" />
                                <div className="text-lg font-extrabold text-gray-900">
                                    ชั้นที่ {floor}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => pickAllOnFloor(floor)}
                                    className="px-5 py-2.5 rounded-xl bg-white border border-green-200 text-green-700 font-extrabold text-base shadow-sm hover:bg-green-50 active:scale-[0.98]"
                                >
                                    เลือกทั้งชั้น
                                </button>

                                <button
                                    type="button"
                                    onClick={() => unpickAllOnFloor(floor)}
                                    className="px-5 py-2.5 rounded-xl bg-white border border-red-200 text-red-700 font-extrabold text-base shadow-sm hover:bg-red-50 active:scale-[0.98]"
                                >
                                    ยกเลิกทั้งชั้น
                                </button>
                            </div>
                        </div>

                        {/* body */}
                        <div className="px-6 py-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {floorRooms.map((room) => {
                                    const isPicked = pickedSet.has(room.id);

                                    return (
                                        <div
                                            key={room.id}
                                            className={[
                                                "rounded-2xl border shadow-sm px-5 py-5 bg-white transition",
                                                isPicked
                                                    ? "border-blue-300 ring-2 ring-blue-200"
                                                    : "border-blue-100/70",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-lg font-extrabold text-gray-900">
                                                    ห้อง {room.roomNo}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => togglePick(room.id)}
                                                    className={[
                                                        "px-4 py-2 rounded-xl text-sm font-extrabold border shadow-sm",
                                                        isPicked
                                                            ? "!bg-blue-600 text-white border-blue-600 hover:!bg-blue-700"
                                                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
                                                    ].join(" ")}
                                                >
                                                    {isPicked ? "เลือกแล้ว" : "เลือก"}
                                                </button>
                                            </div>

                                            {/* status badge + toggle */}
                                            <div className="mt-4 flex items-center justify-between">
                                                <div
                                                    className={[
                                                        "px-4 py-2 rounded-xl text-sm font-extrabold border",
                                                        room.status === "VACANT"
                                                            ? "border-green-200 text-green-700 bg-green-50"
                                                            : "border-red-200 text-red-700 bg-red-50",
                                                    ].join(" ")}
                                                >
                                                    สถานะ: {room.status === "VACANT" ? "ว่าง" : "ไม่ว่าง"}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleRoomStatus(room.id)}
                                                    className="px-4 py-2 rounded-xl text-sm font-extrabold border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                                                >
                                                    สลับสถานะ
                                                </button>
                                            </div>

                                            {/* price preview */}
                                            <div className="mt-4 text-base font-bold text-gray-700">
                                                ราคา:{" "}
                                                <span className="font-extrabold text-gray-900 text-lg">
                                                    {room.price ?? 0}
                                                </span>{" "}
                                                บาท
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-5 text-base font-bold text-gray-600">
                                ชั้นนี้มี{" "}
                                <span className="font-extrabold text-gray-900">
                                    {floorRooms.length}
                                </span>{" "}
                                ห้อง
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* sticky footer */}
            <div className="sticky bottom-0 w-full">
                <div className="mx-auto w-full max-w-5xl">
                    <div className="rounded-2xl border border-blue-200/60 bg-white/70 backdrop-blur-md shadow-[0_16px_40px_rgba(15,23,42,0.12)] px-5 py-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            {/* left: count */}
                            <div className="h-[48px] px-6 rounded-xl bg-[#121827] text-white font-extrabold text-base flex items-center justify-center shadow-lg">
                                เลือกเพื่อกำหนดสถานะ {pickedCount} ห้อง
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <button
                                    type="button"
                                    disabled={disableBulk}
                                    onClick={applyVacant}
                                    className={[
                                        "h-[48px] px-6 rounded-xl text-base font-extrabold shadow-sm border transition",
                                        disableBulk
                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                            : "bg-white text-green-700 border-green-200 hover:bg-green-50 active:scale-[0.98]",
                                    ].join(" ")}
                                >
                                    ตั้งเป็น “ว่าง”
                                </button>

                                <button
                                    type="button"
                                    disabled={disableBulk}
                                    onClick={applyOccupied}
                                    className={[
                                        "h-[48px] px-6 rounded-xl text-base font-extrabold shadow-sm border transition",
                                        disableBulk
                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                            : "bg-white text-red-700 border-red-200 hover:bg-red-50 active:scale-[0.98]",
                                    ].join(" ")}
                                >
                                    ตั้งเป็น “ไม่ว่าง”
                                </button>

                                <button
                                    type="button"
                                    onClick={pickAll}
                                    className="h-[48px] px-5 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-base shadow-sm hover:bg-gray-50 active:scale-[0.98]"
                                >
                                    เลือกทั้งหมด
                                </button>

                                <button
                                    type="button"
                                    onClick={clearPick}
                                    className="h-[48px] px-5 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-base shadow-sm hover:bg-gray-50 active:scale-[0.98]"
                                >
                                    ล้างที่เลือก
                                </button>
                            </div>

                            {/* right: nav */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => nav("../step-6")}
                                    className="h-[48px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-base shadow-sm hover:bg-gray-50 active:scale-[0.98]"
                                >
                                    ย้อนกลับ
                                </button>

                                <button
                                    type="button"
                                    disabled={!canGoNext}
                                    onClick={() => nav("../step-8")}
                                    className={[
                                        "h-[48px] px-8 rounded-xl text-white font-extrabold text-base shadow-lg transition",
                                        canGoNext
                                            ? "!bg-blue-600 hover:!bg-blue-700 active:scale-[0.98]"
                                            : "bg-blue-200 cursor-not-allowed text-white/70",
                                    ].join(" ")}
                                >
                                    ต่อไป
                                </button>
                            </div>
                        </div>

                        {selectedRoomIds.length === 0 && (
                            <div className="mt-3 text-right text-sm font-bold text-gray-500">
                                กรุณาเลือกห้องใน Step 6 ก่อน
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
