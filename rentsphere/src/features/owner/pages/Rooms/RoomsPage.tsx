import OwnerShell from "@/features/owner/components/OwnerShell";
import { useAddCondoStore } from "@/features/owner/pages/AddCondo/store/addCondo.store";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function getRoomLabel(room: any) {
    return room?.roomNo ?? "-";
}

function getRoomRent(room: any) {
    const v = room?.price;
    if (v === null || v === undefined) return "-";
    if (typeof v === "number") return `${v.toLocaleString()} บาท`;
    const n = Number(v);
    if (!Number.isNaN(n)) return `${n.toLocaleString()} บาท`;
    return String(v);
}

function StatusPill({ status }: { status: "VACANT" | "OCCUPIED" | string }) {
    const vacant = status === "VACANT";
    return (
        <span
            className={[
                "inline-flex items-center justify-center",
                "min-w-[56px] px-3 py-1 rounded-full text-xs font-extrabold border",
                vacant
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200",
            ].join(" ")}
        >
            {vacant ? "ว่าง" : "ไม่ว่าง"}
        </span>
    );
}

export default function RoomsPage() {
    const nav = useNavigate();
    const { rooms, generateRoomsIfEmpty } = useAddCondoStore();

    useEffect(() => {
        generateRoomsIfEmpty();
    }, [generateRoomsIfEmpty]);

    const roomsTotal = useMemo(() => rooms?.length ?? 0, [rooms]);

    const roomsVacant = useMemo(
        () => (rooms ?? []).filter((r: any) => r?.isActive && r?.status === "VACANT").length,
        [rooms]
    );

    const advanceBooking = 0;
    const unpaidBills = 0;

    const condoName = "สวัสดีคอนโด";

    const [openPickRoom, setOpenPickRoom] = useState(false);
    const [pickRoomId, setPickRoomId] = useState<string>("");

    const openModal = () => {

        const first = (rooms ?? [])[0];
        setPickRoomId(first?.id ? String(first.id) : "");
        setOpenPickRoom(true);
    };

    const goCreateFlow = () => {
        if (!pickRoomId) return;
        setOpenPickRoom(false);

        nav(`/owner/rooms/${pickRoomId}/monthly-contract`);
    };

    return (
        <OwnerShell title="ห้อง" activeKey="rooms" showSidebar={true}>
            <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-bold text-gray-500">
                    คอนโดมิเนียม : <span className="text-gray-800">{condoName}</span>
                </div>

                <button
                    type="button"
                    onClick={openModal}
                    className="text-sm font-extrabold text-gray-600 underline underline-offset-4 hover:text-gray-900"
                >
                    สร้างรหัสเข้าสู่ระบบ
                </button>
            </div>

            {/* summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white border border-blue-100/70 shadow-sm px-6 py-5 text-center">
                    <div className="text-4xl font-black text-indigo-700">{roomsTotal}</div>
                    <div className="mt-1 text-sm font-bold text-gray-600">ห้องพักทั้งหมด</div>
                </div>

                <div className="rounded-2xl bg-white border border-blue-100/70 shadow-sm px-6 py-5 text-center">
                    <div className="text-4xl font-black text-indigo-700">{roomsVacant}</div>
                    <div className="mt-1 text-sm font-bold text-gray-600">ห้องว่าง</div>
                </div>

                <div className="rounded-2xl bg-white border border-blue-100/70 shadow-sm px-6 py-5 text-center">
                    <div className="text-4xl font-black text-indigo-700">{advanceBooking}</div>
                    <div className="mt-1 text-sm font-bold text-gray-600">จองล่วงหน้า</div>
                </div>

                <div className="rounded-2xl bg-white border border-blue-100/70 shadow-sm px-6 py-5 text-center">
                    <div className="text-4xl font-black text-indigo-700">{unpaidBills}</div>
                    <div className="mt-1 text-sm font-bold text-gray-600">ค้างชำระ</div>
                </div>
            </div>

            {/* table */}
            <div className="mt-6 rounded-2xl border border-blue-100/70 bg-white overflow-hidden">
                <div className="px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/70 flex items-center justify-between">
                    <div className="text-lg font-extrabold text-gray-900">รายการห้อง</div>
                    <div className="text-sm font-bold text-gray-500">ทั้งหมด {roomsTotal} ห้อง</div>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="min-w-[980px] w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-700 border-b border-gray-100">
                                <th className="px-6 py-4 font-extrabold">ห้อง</th>
                                <th className="px-6 py-4 font-extrabold">สถานะ</th>
                                <th className="px-6 py-4 font-extrabold">ลูกค้า</th>
                                <th className="px-6 py-4 font-extrabold">ค่าเช่า</th>
                                <th className="px-6 py-4 font-extrabold">แจ้งออก</th>
                                <th className="px-6 py-4 font-extrabold">จองล่วงหน้า</th>
                                <th className="px-6 py-4 font-extrabold">ค้างชำระ</th>
                                <th className="px-6 py-4 font-extrabold text-right">รายละเอียด</th>
                            </tr>
                        </thead>

                        <tbody>
                            {(rooms ?? []).length === 0 ? (
                                <tr>
                                    <td className="px-6 py-10 text-gray-500 font-bold" colSpan={8}>
                                        ยังไม่มีข้อมูลห้อง (rooms ใน store ว่าง) — ถ้า refresh หน้า ต้องเข้าผ่าน AddCondo
                                    </td>
                                </tr>
                            ) : (
                                (rooms ?? []).map((r: any) => {
                                    const roomId = r?.id ?? r?.roomNo;

                                    const label = getRoomLabel(r);
                                    const rent = getRoomRent(r);
                                    const status = r?.status ?? "VACANT";

                                    const tenant = "-";
                                    const moveOut = "-";
                                    const booking = "-";
                                    const unpaid = "-";

                                    return (
                                        <tr key={roomId} className="border-b border-gray-50 hover:bg-blue-50/30 transition">
                                            <td className="px-6 py-4 font-extrabold text-gray-900">{label}</td>

                                            <td className="px-6 py-4">
                                                <StatusPill status={status} />
                                            </td>

                                            <td className="px-6 py-4 font-bold text-gray-600">{tenant}</td>

                                            <td className="px-6 py-4 font-bold text-gray-600">{rent}</td>

                                            <td className="px-6 py-4 font-bold text-gray-600">{moveOut}</td>

                                            <td className="px-6 py-4 font-bold text-gray-600">{booking}</td>

                                            <td className="px-6 py-4 font-bold text-gray-600">{unpaid}</td>

                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => nav(`/owner/rooms/${roomId}`)}
                                                    className="font-extrabold text-gray-700 underline underline-offset-4 hover:text-gray-900"
                                                >
                                                    รายละเอียด
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {openPickRoom && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* overlay */}
                    <button
                        type="button"
                        onClick={() => setOpenPickRoom(false)}
                        className="absolute inset-0 bg-black/30"
                        aria-label="close"
                    />

                    {/* modal */}
                    <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-blue-100 overflow-hidden">
                        <div className="px-6 py-4 bg-[#EAF2FF] border-b border-blue-100">
                            <div className="text-lg font-extrabold text-gray-900">เลือกห้องเพื่อสร้างรหัสเข้าสู่ระบบ</div>
                            <div className="text-sm font-bold text-gray-600 mt-1">
                                เลือกห้อง แล้วระบบจะพาไปกรอกสัญญา (MonthlyContractPage)
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <div className="text-sm font-extrabold text-gray-800 mb-2">เลือกห้อง</div>
                                <select
                                    value={pickRoomId}
                                    onChange={(e) => setPickRoomId(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800
                             focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                >
                                    <option value="">-- กรุณาเลือกห้อง --</option>
                                    {(rooms ?? []).map((r: any) => (
                                        <option key={String(r.id)} value={String(r.id)}>
                                            ห้อง {r.roomNo ?? "-"} (ชั้น {r.floor ?? "-"})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setOpenPickRoom(false)}
                                    className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    type="button"
                                    onClick={() => nav(`/owner/rooms/${pickRoomId}/monthly`, { replace: true })}
                                    disabled={!pickRoomId}
                                    className="px-6 py-3 rounded-xl !bg-blue-600 text-white font-extrabold hover:!bg-blue-700
                             disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    ต่อไป
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </OwnerShell>
    );
}
