import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Room, RoomStatus } from "../types/addCondo.types";

type NavState = {
    selectedRoomIds?: string[];
};

export default function Step7_Review() {
    const nav = useNavigate();
    const location = useLocation();

    // ======================
    // Local state (no store)
    // ======================
    const [floorCount, setFloorCount] = useState<number>(0);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
    const [pickedIds, setPickedIds] = useState<string[]>([]);

    // ======================
    // Init selectedRoomIds from nav state
    // ======================
    useEffect(() => {
        const st = (location.state as NavState | null) ?? null;
        if (st?.selectedRoomIds && Array.isArray(st.selectedRoomIds)) {
            setSelectedRoomIds(st.selectedRoomIds);
        }
    }, [location.state]);

    // ======================
    // TODO: API (backend will connect later)
    // - GET rooms + floorCount + selectedRoomIds (if you want)
    // - setFloorCount(...)
    // - setRooms(...)
    // - setSelectedRoomIds(...) (optional)
    // ======================
    useEffect(() => {
        // Example:
        // const res = await api.getCondoSetupDraft(...)
        // setFloorCount(res.floorCount)
        // setRooms(res.rooms)
        // setSelectedRoomIds(res.selectedRoomIds ?? selectedRoomIds)
    }, []);

    useEffect(() => {
        setPickedIds(selectedRoomIds);
    }, [selectedRoomIds]);

    const selectedRooms = useMemo(() => {
        const set = new Set(selectedRoomIds);
        return rooms.filter((r) => set.has(r.id));
    }, [rooms, selectedRoomIds]);

    const roomsByFloor = useMemo(() => {
        const map = new Map<number, Room[]>();
        for (let f = 1; f <= floorCount; f++) map.set(f, []);
        selectedRooms.forEach((r) => map.get(r.floor)?.push(r));
        map.forEach((arr) => arr.sort((a, b) => a.roomNo.localeCompare(b.roomNo)));
        return map;
    }, [selectedRooms, floorCount]);

    const pickedSet = useMemo(() => new Set(pickedIds), [pickedIds]);
    const pickedCount = pickedIds.length;

    const canGoNext = selectedRoomIds.length > 0;

    const pickAll = () => setPickedIds(selectedRoomIds);
    const clearPick = () => setPickedIds([]);

    const togglePick = (roomId: string) => {
        setPickedIds((prev) => (prev.includes(roomId) ? prev.filter((x) => x !== roomId) : [...prev, roomId]));
    };

    const pickAllOnFloor = (floor: number) => {
        const ids = roomsByFloor.get(floor)?.map((r) => r.id) ?? [];
        setPickedIds((prev) => Array.from(new Set([...prev, ...ids])));
    };

    const unpickAllOnFloor = (floor: number) => {
        const ids = new Set(roomsByFloor.get(floor)?.map((r) => r.id) ?? []);
        setPickedIds((prev) => prev.filter((id) => !ids.has(id)));
    };

    const setStatusForRooms = (roomIds: string[], status: RoomStatus) => {
        const ids = new Set(roomIds);
        setRooms((prev) => prev.map((r) => (ids.has(r.id) ? { ...r, status } : r)));

        // TODO: API
        // await api.setRoomStatusBulk({ roomIds, status })
    };

    const toggleRoomStatus = (roomId: string) => {
        setRooms((prev) =>
            prev.map((r) =>
                r.id === roomId ? { ...r, status: r.status === "VACANT" ? "OCCUPIED" : "VACANT" } : r
            )
        );

        // TODO: API
        // await api.toggleRoomStatus({ roomId })
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

    const formatPrice = (v: number | null) => {
        const n = typeof v === "number" ? v : 0;
        return n.toLocaleString();
    };

    return (
        <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-[18px] pb-[110px]">
            <h1 className="text-center text-[34px] font-extrabold text-black/85 tracking-[0.2px] mb-[6px] mt-[6px]">
                ตั้งค่าคอนโดมิเนียม
            </h1>

            <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
                <div className="flex items-center gap-3 px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
                    <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
                    <div>
                        <div className="text-xl font-extrabold text-gray-900 tracking-tight">สถานะห้อง (ว่าง / ไม่ว่าง)</div>
                        <div className="mt-1 text-sm font-bold text-gray-600">
                            เลือกห้องที่ต้องการ แล้วตั้งสถานะเป็น “ว่าง” หรือ “ไม่ว่าง”
                        </div>
                    </div>
                </div>

                <div className="px-8 py-7">
                    {/* ถ้ายังไม่มีข้อมูลจาก backend */}
                    {floorCount <= 0 ? (
                        <div className="rounded-2xl border border-blue-100/60 bg-white px-6 py-8 shadow-sm text-center">
                            <div className="text-sm font-extrabold text-gray-900">ยังไม่มีข้อมูลห้อง</div>
                            <div className="mt-1 text-sm font-bold text-gray-600">
                                รอ backend ส่ง floorCount และ rooms มาให้ แล้วหน้านี้จะพร้อมใช้งานทันที
                            </div>
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
                                            <div className="text-lg font-extrabold text-gray-900">ชั้นที่ {floor}</div>
                                            <div className="text-sm font-bold text-gray-600">· {floorRooms.length} ห้อง</div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => pickAllOnFloor(floor)}
                                                className="h-[44px] px-5 rounded-xl bg-white border border-blue-200 text-blue-700 font-extrabold text-sm shadow-sm hover:bg-blue-50 active:scale-[0.98]
                                   focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            >
                                                เลือกทั้งชั้น
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => unpickAllOnFloor(floor)}
                                                className="h-[44px] px-5 rounded-xl bg-white border border-gray-200 text-gray-700 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98]
                                   focus:outline-none focus:ring-2 focus:ring-gray-200"
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
                                                            isPicked ? "border-blue-300 ring-4 ring-blue-200/60" : "border-blue-100/70",
                                                        ].join(" ")}
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="text-base font-extrabold text-gray-900">ห้อง {room.roomNo}</div>

                                                            <button
                                                                type="button"
                                                                onClick={() => togglePick(room.id)}
                                                                className={[
                                                                    "h-[40px] px-4 rounded-xl text-xs font-extrabold border shadow-sm transition",
                                                                    "active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-200",
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
                                                                onClick={() => toggleRoomStatus(room.id)}
                                                                className="h-[40px] px-4 rounded-xl text-xs font-extrabold border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition active:scale-[0.98]
                                           focus:outline-none focus:ring-2 focus:ring-gray-200"
                                                            >
                                                                สลับสถานะ
                                                            </button>
                                                        </div>

                                                        <div className="mt-4 text-sm font-bold text-gray-700">
                                                            ราคา:{" "}
                                                            <span className="font-extrabold text-gray-900 text-base">{formatPrice(room.price)}</span>{" "}
                                                            บาท
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-6 text-sm font-bold text-gray-600">
                                            ชั้นนี้มีทั้งหมด{" "}
                                            <span className="font-extrabold text-gray-900">{floorRooms.length}</span> ห้อง
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {selectedRoomIds.length === 0 && (
                                <div className="rounded-2xl border border-blue-100/60 bg-white px-6 py-5 shadow-sm">
                                    <div className="text-sm font-extrabold text-gray-900">ยังไม่มีห้องที่เลือกจาก Step 6</div>
                                    <div className="mt-1 text-sm font-bold text-gray-600">
                                        กรุณากลับไปเลือกห้องและกำหนดราคาใน Step 6 ก่อน
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => nav("../step-6")}
                                        className="mt-4 h-[44px] px-5 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
                               bg-[#93C5FD] hover:bg-[#7fb4fb] active:scale-[0.98] cursor-pointer
                               focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    >
                                        กลับไป Step 6
                                    </button>
                                </div>
                            )}
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
                    className="h-[46px] px-5 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                     focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                    เลือกทั้งหมด
                </button>

                <button
                    type="button"
                    onClick={clearPick}
                    className="h-[46px] px-5 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                     focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                    ล้างที่เลือก
                </button>

                <button
                    type="button"
                    onClick={() => nav("../step-6")}
                    className="h-[46px] px-5 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                     focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                    ย้อนกลับ
                </button>

                <button
                    type="button"
                    disabled={!canGoNext}
                    onClick={() => nav("../step-8")}
                    className={[
                        "h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
                        "focus:outline-none focus:ring-2 focus:ring-blue-300",
                        canGoNext
                            ? "bg-[#93C5FD] hover:bg-[#7fb4fb] active:scale-[0.98] cursor-pointer"
                            : "bg-[#93C5FD]/40 cursor-not-allowed text-white/70",
                    ].join(" ")}
                >
                    ต่อไป
                </button>
            </div>
        </div>
    );
}