import OwnerShell from "@/features/owner/components/OwnerShell";
import { useAddCondoStore } from "@/features/owner/pages/AddCondo/store/addCondo.store";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function moneyTHB(n?: number | null) {
    if (n == null) return "-";
    return new Intl.NumberFormat("th-TH").format(n) + " บาท";
}

function StatusPill({ status }: { status?: string }) {
    const vacant = status === "VACANT";
    return (
        <span
            className={[
                "inline-flex items-center justify-center",
                "min-w-[72px] px-3 py-1 rounded-full text-xs font-extrabold",
                vacant
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200",
            ].join(" ")}
        >
            {vacant ? "ว่าง" : "ไม่ว่าง"}
        </span>
    );
}

export default function RoomDetailPage() {
    const nav = useNavigate();
    const { roomId } = useParams();
    const { rooms } = useAddCondoStore();

    const btnPrimary =
        "inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)] hover:bg-blue-700 active:scale-[0.99] transition";

    const btnSoft =
        "inline-flex items-center justify-center rounded-xl bg-blue-50 px-5 py-2.5 text-sm font-extrabold text-blue-700 border border-blue-100 hover:bg-blue-100 transition";

    const tableHead = "bg-[#F3F7FF] text-gray-800 border-b border-blue-100/70";

    const room = useMemo(() => {
        if (!roomId) return null;
        return (rooms ?? []).find((r: any) => String(r?.id) === String(roomId)) ?? null;
    }, [rooms, roomId]);

    const condoName = "สวัสดีคอนโด";
    const roomNo = room?.roomNo ?? "-";
    const roomPrice = room?.price ?? null;
    const roomStatus = room?.status ?? (room?.isActive ? "VACANT" : "OCCUPIED");

    // ===== Monthly service mock =====
    const serviceOptions = [
        { id: "allin", name: "แพ็กเกจ (All-in-One Maintenance)", price: 650 },
        { id: "housekeeping", name: "บริการทำความสะอาด (Housekeeping)", price: 300 },
        { id: "ev", name: "ชาร์จรถยนต์ไฟฟ้า (EV Charging)", price: 200 },
    ];
    const [selectedServiceId, setSelectedServiceId] = useState(serviceOptions[0]?.id);
    const selectedService = serviceOptions.find((s) => s.id === selectedServiceId);
    const [monthlyServices, setMonthlyServices] = useState<{ id: string; name: string; price: number }[]>([]);
    const addMonthlyService = () => {
        if (!selectedService) return;
        setMonthlyServices((prev) => {
            if (prev.some((x) => x.id === selectedService.id)) return prev;
            return [...prev, selectedService];
        });
    };

    // ===== Booking modal + rows (mock) =====
    const [openBookingModal, setOpenBookingModal] = useState(false);

    type BookingRow = {
        ref: string;
        customer: string;
        checkIn: string;
        price: number;
        deposit: number;
        status: string;
    };

    const [bookingRows, setBookingRows] = useState<BookingRow[]>([]);

    const [bkRef, setBkRef] = useState("");
    const [bkCustomer, setBkCustomer] = useState("");
    const [bkCheckIn, setBkCheckIn] = useState("");
    const [bkPrice, setBkPrice] = useState<number>(Number(roomPrice ?? 0) || 0);
    const [bkDeposit, setBkDeposit] = useState<number>(0);
    const [bkStatus, setBkStatus] = useState<string>("รอเข้าพัก");

    const resetBookingForm = () => {
        setBkRef("");
        setBkCustomer("");
        setBkCheckIn("");
        setBkPrice(Number(roomPrice ?? 0) || 0);
        setBkDeposit(0);
        setBkStatus("รอเข้าพัก");
    };

    const openBooking = () => {
        resetBookingForm();
        setOpenBookingModal(true);
    };

    const saveBooking = () => {
        if (!bkCustomer.trim()) return alert("กรุณากรอกชื่อลูกค้า");
        if (!bkCheckIn) return alert("กรุณาเลือกวันที่เข้าพัก");

        const ref = bkRef.trim()
            ? bkRef.trim()
            : `BK-${new Date().toISOString().slice(0, 10)}-${String(bookingRows.length + 1).padStart(3, "0")}`;

        setBookingRows((prev) => [
            ...prev,
            {
                ref,
                customer: bkCustomer.trim(),
                checkIn: bkCheckIn,
                price: Number.isFinite(bkPrice) ? bkPrice : 0,
                deposit: Number.isFinite(bkDeposit) ? bkDeposit : 0,
                status: bkStatus || "รอเข้าพัก",
            },
        ]);

        setOpenBookingModal(false);
    };

    // ===== moved out mock =====
    const movedOutRows: Array<{ inDate: string; customer: string; outDate: string }> = [];

    if (!room) {
        return (
            <OwnerShell title={undefined} activeKey="rooms" showSidebar>
                <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
                    <div className="text-xl font-extrabold text-gray-900 mb-2">ไม่พบข้อมูลห้องนี้</div>
                    <div className="text-gray-600 font-bold mb-6">roomId: {roomId}</div>
                    <button type="button" onClick={() => nav("/owner/rooms")} className={btnPrimary}>
                        กลับไปหน้าห้อง
                    </button>
                </div>
            </OwnerShell>
        );
    }

    return (
        <OwnerShell title={undefined} activeKey="rooms" showSidebar>
            {/* breadcrumb */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <button
                        onClick={() => nav("/owner/dashboard")}
                        className="hover:text-gray-900 underline underline-offset-4"
                        type="button"
                    >
                        หน้าหลัก
                    </button>
                    <span className="text-gray-400">{">"}</span>

                    <button
                        onClick={() => nav("/owner/rooms")}
                        className="hover:text-gray-900 underline underline-offset-4"
                        type="button"
                    >
                        {condoName}
                    </button>

                    <span className="text-gray-400">{">"}</span>
                    <span className="text-gray-900 font-extrabold">ห้อง {roomNo}</span>

                    <span className="ml-3">
                        <StatusPill status={roomStatus} />
                    </span>
                </div>

                <div className="text-sm font-bold text-gray-600">
                    ค่าเช่า: <span className="text-gray-900 font-extrabold">{moneyTHB(roomPrice)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* รายละเอียดสัญญา */}
                <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
                    <div className="px-6 py-4 bg-[#F3F7FF] border-b border-blue-100/70">
                        <div className="text-lg font-extrabold text-gray-900 text-center">รายละเอียดสัญญา</div>
                    </div>

                    <div className="p-10 flex items-center justify-center">
                        <button
                            type="button"
                            className={[
                                "w-full max-w-sm",
                                "rounded-2xl",
                                "!bg-gradient-to-r !from-blue-600 !to-sky-500",
                                "text-white",
                                "px-7 py-6",
                                "flex items-center justify-center gap-3",
                                "font-extrabold",
                                "shadow-[0_18px_30px_rgba(37,99,235,0.25)]",
                                "hover:brightness-110 hover:shadow-[0_22px_36px_rgba(37,99,235,0.28)]",
                                "active:scale-[0.99] transition",
                                "focus:outline-none focus-visible:ring-4 focus-visible:!ring-blue-200/70",
                            ].join(" ")}
                            onClick={() => nav(`/owner/rooms/${roomId}/monthly`)}
                        >
                            <span className="text-2xl">📅</span>
                            <span className="text-xl tracking-wide">รายเดือน</span>
                        </button>
                    </div>
                </div>

                {/* ค่าบริการรายเดือน */}
                <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
                    <div className="px-6 py-4 bg-[#F3F7FF] border-b border-blue-100/70">
                        <div className="text-lg font-extrabold text-gray-900 text-center">ค่าบริการรายเดือน</div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex gap-3">
                            <select
                                value={selectedServiceId}
                                onChange={(e) => setSelectedServiceId(e.target.value)}
                                className={[
                                    "flex-1 rounded-xl",
                                    "border border-blue-100 bg-white",
                                    "px-4 py-3",
                                    "font-bold text-gray-800",
                                    "focus:outline-none focus:ring-4 focus:ring-blue-200/60",
                                ].join(" ")}
                            >
                                {serviceOptions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={addMonthlyService}
                                className={[
                                    "h-[52px] min-w-[88px]",
                                    "rounded-xl",
                                    "!bg-blue-600 text-white",
                                    "font-extrabold",
                                    "shadow-[0_10px_20px_rgba(37,99,235,0.22)]",
                                    "border border-blue-700/10",
                                    "hover:!bg-blue-700 active:scale-[0.99] transition",
                                    "focus:outline-none focus-visible:ring-4 focus-visible:!ring-blue-200/70",
                                ].join(" ")}
                            >
                                เพิ่ม
                            </button>
                        </div>

                        <div className="rounded-xl border border-blue-100 overflow-hidden">
                            <div className="grid grid-cols-2 bg-[#F3F7FF] px-4 py-3 text-sm font-extrabold text-gray-700 border-b border-blue-100/70">
                                <div>ค่าบริการ</div>
                                <div className="text-right">ราคา</div>
                            </div>

                            {monthlyServices.length === 0 ? (
                                <div className="px-4 py-4 text-sm font-bold text-gray-500">ยังไม่มีค่าบริการรายเดือน</div>
                            ) : (
                                monthlyServices.map((s) => (
                                    <div key={s.id} className="grid grid-cols-2 px-4 py-3 border-t border-blue-50 text-sm">
                                        <div className="font-bold text-gray-800">{s.name}</div>
                                        <div className="text-right font-extrabold text-gray-900">{moneyTHB(s.price)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Booking ===== */}
            <div className="mt-6 rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-blue-100/70">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-lg font-extrabold text-gray-900">รายชื่อคนจองรอเข้าพัก</div>
                            <div className="text-sm font-bold text-gray-500 mt-1">เพิ่มรายการจองก่อนเข้าพัก</div>
                        </div>

                        <button
                            type="button"
                            onClick={openBooking}
                            className={[
                                "h-[52px] min-w-[88px]",
                                "rounded-xl",
                                "!bg-blue-600 text-white",
                                "font-extrabold",
                                "shadow-[0_10px_20px_rgba(37,99,235,0.22)]",
                                "border border-blue-700/10",
                                "hover:!bg-blue-700 active:scale-[0.99] transition",
                                "focus:outline-none focus-visible:ring-4 focus-visible:!ring-blue-200/70",
                            ].join(" ")}
                        >
                            เพิ่ม
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="w-full overflow-x-auto">
                        <table className="min-w-[980px] w-full text-sm">
                            <thead>
                                <tr className={tableHead}>
                                    <th className="px-6 py-4 font-extrabold rounded-l-xl">เลขที่/วันที่จอง</th>
                                    <th className="px-6 py-4 font-extrabold">ลูกค้า</th>
                                    <th className="px-6 py-4 font-extrabold">วันที่เข้าพัก</th>
                                    <th className="px-6 py-4 font-extrabold">ราคา</th>
                                    <th className="px-6 py-4 font-extrabold">เงินจอง</th>
                                    <th className="px-6 py-4 font-extrabold rounded-r-xl">สถานะ</th>
                                </tr>
                            </thead>

                            <tbody>
                                {bookingRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-gray-500 font-bold">
                                            ยังไม่มีรายการจอง
                                        </td>
                                    </tr>
                                ) : (
                                    bookingRows.map((r) => (
                                        <tr key={r.ref} className="border-b border-blue-50">
                                            <td className="px-6 py-4 font-bold">{r.ref}</td>
                                            <td className="px-6 py-4 font-bold">{r.customer}</td>
                                            <td className="px-6 py-4 font-bold">{r.checkIn}</td>
                                            <td className="px-6 py-4 font-extrabold">{moneyTHB(r.price)}</td>
                                            <td className="px-6 py-4 font-extrabold">{moneyTHB(r.deposit)}</td>
                                            <td className="px-6 py-4 font-bold">{r.status}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ===== Moved out ===== */}
            <div className="mt-6 rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-blue-100/70">
                    <div className="flex items-center justify-between">
                        <div className="text-lg font-extrabold text-gray-900">สัญญาที่ย้ายออก</div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="w-full overflow-x-auto">
                        <table className="min-w-[820px] w-full text-sm">
                            <thead>
                                <tr className={tableHead}>
                                    <th className="px-6 py-4 font-extrabold rounded-l-xl">วันที่เข้า</th>
                                    <th className="px-6 py-4 font-extrabold">ลูกค้า</th>
                                    <th className="px-6 py-4 font-extrabold rounded-r-xl">แจ้งออก ณ วันที่</th>
                                </tr>
                            </thead>

                            <tbody>
                                {movedOutRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-10 text-gray-500 font-bold">
                                            ยังไม่มีประวัติย้ายออก
                                        </td>
                                    </tr>
                                ) : (
                                    movedOutRows.map((r, i) => (
                                        <tr key={i} className="border-b border-blue-50">
                                            <td className="px-6 py-4 font-bold">{r.inDate}</td>
                                            <td className="px-6 py-4 font-bold">{r.customer}</td>
                                            <td className="px-6 py-4 font-bold">{r.outDate}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ===== Booking Modal ===== */}
            {openBookingModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    {/* overlay */}
                    <button
                        type="button"
                        onClick={() => setOpenBookingModal(false)}
                        className="absolute inset-0 bg-black/30"
                        aria-label="close"
                    />

                    <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-blue-100 overflow-hidden">
                        <div className="px-6 py-4 bg-[#EAF2FF] border-b border-blue-100">
                            <div className="text-lg font-extrabold text-gray-900">เพิ่มรายการจองก่อนเข้าพัก</div>
                            <div className="text-sm font-bold text-gray-600 mt-1">กรอกข้อมูลสำหรับการจองของห้อง {roomNo}</div>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="lg:col-span-2">
                                    <div className="text-sm font-extrabold text-gray-800 mb-2">เลขที่/วันที่จอง</div>
                                    <input
                                        value={bkRef}
                                        onChange={(e) => setBkRef(e.target.value)}
                                        placeholder="ปล่อยว่างได้ ระบบจะสร้างให้อัตโนมัติ"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800
                               focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                    />
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="text-sm font-extrabold text-gray-800 mb-2">
                                        ลูกค้า <span className="text-rose-600">*</span>
                                    </div>
                                    <input
                                        value={bkCustomer}
                                        onChange={(e) => setBkCustomer(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800
                               focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                    />
                                </div>

                                <div>
                                    <div className="text-sm font-extrabold text-gray-800 mb-2">
                                        วันที่เข้าพัก <span className="text-rose-600">*</span>
                                    </div>
                                    <input
                                        type="date"
                                        value={bkCheckIn}
                                        onChange={(e) => setBkCheckIn(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800
                               focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                    />
                                </div>

                                <div>
                                    <div className="text-sm font-extrabold text-gray-800 mb-2">สถานะ</div>
                                    <select
                                        value={bkStatus}
                                        onChange={(e) => setBkStatus(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800
                               focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                    >
                                        <option value="รอเข้าพัก">รอเข้าพัก</option>
                                        <option value="ยืนยันแล้ว">ยืนยันแล้ว</option>
                                        <option value="ยกเลิก">ยกเลิก</option>
                                    </select>
                                </div>

                                <div>
                                    <div className="text-sm font-extrabold text-gray-800 mb-2">ราคา</div>
                                    <div className="flex items-stretch">
                                        <input
                                            value={bkPrice}
                                            onChange={(e) => setBkPrice(Number(e.target.value || 0))}
                                            inputMode="numeric"
                                            className="w-full rounded-l-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800
                                 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                        />
                                        <div className="rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4 py-3 font-extrabold text-gray-700">
                                            บาท
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-extrabold text-gray-800 mb-2">เงินจอง</div>
                                    <div className="flex items-stretch">
                                        <input
                                            value={bkDeposit}
                                            onChange={(e) => setBkDeposit(Number(e.target.value || 0))}
                                            inputMode="numeric"
                                            className="w-full rounded-l-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800
                                 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                        />
                                        <div className="rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4 py-3 font-extrabold text-gray-700">
                                            บาท
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setOpenBookingModal(false)}
                                    className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    type="button"
                                    onClick={saveBooking}
                                    className="px-6 py-3 rounded-xl !bg-blue-600 text-white font-extrabold hover:!bg-blue-700"
                                >
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </OwnerShell>
    );
}
