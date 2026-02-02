import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddCondoStore } from "../store/addCondo.store";

type ServiceOption = { id: string; label: string; price: number };

const SERVICE_OPTIONS: ServiceOption[] = [
    { id: "internet", label: "ค่าอินเตอร์เน็ต (Internet)", price: 100 },
    { id: "fitness", label: "ค่าฟิตเนส (Fitness)", price: 100 },
];

export default function Step8_RoomService() {
    const nav = useNavigate();

    const { rooms, floorCount, roomsPerFloor, generateRoomsIfEmpty, setPriceForRooms } =
        useAddCondoStore();

    useEffect(() => {
        generateRoomsIfEmpty();
    }, [generateRoomsIfEmpty]);

    // ===== selection =====
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
    const selectedCount = selectedIds.length;

    const roomsByFloor = useMemo(() => {
        const map = new Map<number, typeof rooms>();
        for (let f = 1; f <= floorCount; f++) map.set(f, []);

        rooms.forEach((r) => {
            if (!r.isActive) return;
            map.get(r.floor)?.push(r);
        });

        map.forEach((arr) => arr.sort((a, b) => a.roomNo.localeCompare(b.roomNo)));
        return map;
    }, [rooms, floorCount]);

    const toggleRoom = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const selectAllOnFloor = (floor: number) => {
        const ids = (roomsByFloor.get(floor) ?? []).map((r) => r.id);
        setSelectedIds((prev) => {
            const s = new Set(prev);
            ids.forEach((id) => s.add(id));
            return Array.from(s);
        });
    };

    const unselectAllOnFloor = (floor: number) => {
        const ids = new Set((roomsByFloor.get(floor) ?? []).map((r) => r.id));
        setSelectedIds((prev) => prev.filter((id) => !ids.has(id)));
    };

    // ===== modal assign fee =====
    const [openModal, setOpenModal] = useState(false);
    const [serviceId, setServiceId] = useState("");

    const selectedService = useMemo(
        () => SERVICE_OPTIONS.find((x) => x.id === serviceId) ?? null,
        [serviceId]
    );

    const openAssign = () => {
        if (selectedCount === 0) return;
        setServiceId("");
        setOpenModal(true);
    };

    const onSaveService = () => {
        if (!selectedService) return;

        setPriceForRooms(selectedIds, selectedService.price);
        setOpenModal(false);
    };

    const canNext = true;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#eef5ff] px-8 py-8 font-sarabun">
            <h1 className="text-center text-4xl font-extrabold text-gray-900 tracking-tight">
                ตั้งค่าคอนโดมิเนียม
            </h1>

            <div className="mx-auto mt-8 w-full max-w-5xl flex flex-col gap-6 pb-32">
                {Array.from({ length: floorCount }, (_, i) => i + 1).map((floor) => {
                    const floorRooms = roomsByFloor.get(floor) ?? [];
                    const countHint = roomsPerFloor?.[floor - 1] ?? floorRooms.length;

                    return (
                        <div
                            key={floor}
                            className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden"
                        >

                            <div className="flex items-center justify-between px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/60">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
                                    <div className="font-extrabold text-gray-900 text-lg">ชั้นที่ {floor}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => selectAllOnFloor(floor)}
                                        className="px-5 py-2.5 rounded-xl bg-white border border-green-200 text-green-700 font-extrabold text-base shadow-sm hover:bg-green-50 active:scale-[0.98]"
                                    >
                                        เลือกทั้งชั้น
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => unselectAllOnFloor(floor)}
                                        className="px-5 py-2.5 rounded-xl bg-white border border-red-200 text-red-700 font-extrabold text-base shadow-sm hover:bg-red-50 active:scale-[0.98]"
                                    >
                                        ยกเลิกเลือกทั้งชั้น
                                    </button>
                                </div>
                            </div>

                            {/* body */}
                            <div className="px-6 py-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {floorRooms.map((r) => {
                                        const isSelected = selectedSet.has(r.id);

                                        const hasServiceSelected = r.price != null;

                                        return (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => toggleRoom(r.id)}
                                                className={[
                                                    "rounded-2xl border shadow-sm px-6 py-5 bg-white transition text-left",
                                                    isSelected
                                                        ? "border-blue-300 ring-2 ring-blue-200"
                                                        : "border-blue-100/70 hover:border-blue-200",
                                                ].join(" ")}
                                            >
                                                <div className="text-xl font-extrabold text-gray-900">
                                                    ห้อง {r.roomNo}
                                                </div>

                                                <div
                                                    className={[
                                                        "mt-3 inline-flex items-center px-4 py-2 rounded-xl border text-base font-extrabold",
                                                        hasServiceSelected
                                                            ? "bg-blue-50 border-blue-200 text-blue-800"
                                                            : "bg-gray-100 border-gray-200 text-gray-700",
                                                    ].join(" ")}
                                                >
                                                    {hasServiceSelected
                                                        ? `ค่าบริการ ${Number(r.price).toFixed(2)} บาท`
                                                        : "ยังไม่ได้เลือกค่าบริการ"}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-5 text-base font-bold text-gray-600">
                                    ชั้นนี้มี{" "}
                                    <span className="font-extrabold text-gray-900">{countHint}</span> ห้อง
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ===== sticky footer  ===== */}
            <div className="sticky bottom-0 w-full pb-6">
                <div className="mx-auto w-full max-w-5xl">
                    <div className="rounded-2xl border border-blue-200/60 bg-white/70 backdrop-blur-md shadow-[0_16px_40px_rgba(15,23,42,0.12)] px-5 py-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            {/* left: badge */}
                            <div className="h-12 px-7 rounded-xl bg-[#121827] text-white font-extrabold text-base flex items-center justify-center shadow-lg">
                                จำนวนห้องที่เลือก {selectedCount} ห้อง
                            </div>

                            {/* middle: actions */}
                            <div className="flex items-center gap-3 flex-wrap justify-end">
                                <button
                                    type="button"
                                    disabled={selectedCount === 0}
                                    onClick={openAssign}
                                    className={[
                                        "h-12 px-8 rounded-xl font-extrabold text-base shadow-lg transition",
                                        selectedCount === 0
                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                            : "bg-[#5B2424] text-white hover:opacity-95 active:scale-[0.98]",
                                    ].join(" ")}
                                >
                                    ระบุค่าห้อง
                                </button>
                            </div>

                            {/* right: next */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    disabled={!canNext}
                                    onClick={() => nav("../step-9")}
                                    className={[
                                        "h-12 px-10 rounded-xl text-white font-extrabold text-base shadow-lg transition",
                                        canNext
                                            ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
                                            : "bg-blue-200 cursor-not-allowed text-white/70",
                                    ].join(" ")}
                                >
                                    ต่อไป
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== modal ===== */}
            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setOpenModal(false)} />

                    <div className="relative w-[760px] max-w-[92vw] rounded-2xl bg-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] overflow-hidden border border-blue-100/60">
                        <div className="px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/60">
                            <div className="text-xl font-extrabold text-gray-900">ระบุค่าบริการเพิ่มเติม</div>
                        </div>

                        <div className="px-6 py-6">
                            <div className="text-base font-bold text-gray-700 mb-2">
                                บริการ <span className="text-red-500">*</span>{" "}
                                <span className="text-red-500 font-extrabold">จำเป็น</span>
                            </div>

                            <select
                                value={serviceId}
                                onChange={(e) => setServiceId(e.target.value)}
                                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-base font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-200"
                            >
                                <option value="">เลือกบริการ</option>
                                {SERVICE_OPTIONS.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.label} - {o.price.toFixed(2)} บาท
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="px-6 py-4 bg-white border-t border-blue-100/60 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setOpenModal(false)}
                                className="h-11 px-7 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-base shadow-sm hover:bg-gray-50"
                            >
                                ปิด
                            </button>

                            <button
                                type="button"
                                disabled={!selectedService}
                                onClick={onSaveService}
                                className={[
                                    "h-11 px-8 rounded-xl font-extrabold text-base shadow-lg transition",
                                    selectedService
                                        ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                                        : "bg-blue-200 cursor-not-allowed text-white/70",
                                ].join(" ")}
                            >
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
