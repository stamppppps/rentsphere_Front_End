import OwnerShell from "@/features/owner/components/OwnerShell";
import { useAddCondoStore } from "@/features/owner/pages/AddCondo/store/addCondo.store";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function moneyTHB(n?: number | null) {
    if (n == null || Number.isNaN(n)) return "0.00";
    return new Intl.NumberFormat("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
    const items = [
        { n: 1, label: "สัญญา" },
        { n: 2, label: "ค่าเช่าล่วงหน้า" },
        { n: 3, label: "มิเตอร์น้ำ-ไฟ" },
    ] as const;

    return (
        <div className="w-full flex items-center justify-center gap-8 py-2">
            {items.map((it, idx) => {
                const active = it.n === step;
                const done = it.n < step;
                return (
                    <div key={it.n} className="flex items-center gap-3">
                        <div
                            className={[
                                "w-9 h-9 rounded-full flex items-center justify-center font-extrabold",
                                active
                                    ? "bg-blue-600 text-white shadow-[0_12px_22px_rgba(37,99,235,0.25)]"
                                    : done
                                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                                        : "bg-white text-gray-500 border border-gray-200",
                            ].join(" ")}
                        >
                            {it.n}
                        </div>
                        <div className={active ? "font-extrabold text-blue-700" : "font-bold text-gray-600"}>
                            {it.label}
                        </div>

                        {idx !== items.length - 1 ? <div className="w-20 h-[3px] rounded-full bg-blue-100" /> : null}
                    </div>
                );
            })}
        </div>
    );
}

export default function MonthlyContractPage() {
    const nav = useNavigate();
    const { roomId } = useParams();
    const { rooms } = useAddCondoStore();

    const room = useMemo(() => {
        if (!roomId) return null;
        return (rooms ?? []).find((r) => String(r.id) === String(roomId)) ?? null;
    }, [rooms, roomId]);

    const condoName = "สวัสดีคอนโด";
    const roomNo = room?.roomNo ?? "-";
    const rent = room?.price ?? 0;

    // ===== form state (mock) =====
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [monthlyRent, setMonthlyRent] = useState<number>(rent || 0);
    const [deposit, setDeposit] = useState<number>(0);
    const [depositPayBy, setDepositPayBy] = useState<string>("เงินสด");
    const [bookingFee, setBookingFee] = useState<number>(0);
    const [bookingNo, setBookingNo] = useState<string>("");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [citizenId, setCitizenId] = useState("");
    const [address, setAddress] = useState("");

    const [emgName, setEmgName] = useState("");
    const [emgRelation, setEmgRelation] = useState("");
    const [emgPhone, setEmgPhone] = useState("");

    const [note, setNote] = useState("");

    const total = useMemo(() => {
        return (deposit || 0) - (bookingFee || 0);
    }, [deposit, bookingFee]);

    const goNext = () => {
        nav(`/owner/rooms/${roomId}/advance-payment`);
    };

    if (!room) {
        return (
            <OwnerShell activeKey="rooms" showSidebar>
                <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
                    <div className="text-xl font-extrabold text-gray-900 mb-2">ไม่พบข้อมูลห้อง</div>
                    <div className="text-gray-600 font-bold mb-6">roomId: {roomId}</div>
                    <button
                        type="button"
                        onClick={() => nav("/owner/rooms")}
                        className="px-5 py-3 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700"
                    >
                        กลับไปหน้าห้อง
                    </button>
                </div>
            </OwnerShell>
        );
    }

    return (
        <OwnerShell activeKey="rooms" showSidebar>
            {/* top header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-bold text-gray-600">
                    คอนโดมิเนียม : <span className="text-gray-900">{condoName}</span>
                </div>
                <div className="text-sm font-extrabold text-gray-700">ห้อง {roomNo}</div>
            </div>

            <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                <div className="bg-[#EAF2FF] border-b border-blue-100/70 px-6 py-4">
                    <Stepper step={1} />
                </div>

                <div className="p-6">
                    {/* ===== Card header ===== */}
                    <div className="mb-4 flex items-center justify-between">
                        <div className="text-xl font-extrabold text-gray-900">รายชื่อคนจองรอเข้าพัก</div>
                        <div className="text-sm font-extrabold text-gray-700">
                            ค่าห้องต่อเดือน <span className="text-blue-700">{moneyTHB(monthlyRent)} บาท</span>
                        </div>
                    </div>
                    <div className="h-px bg-gray-200 mb-6" />

                    {/* ===== Top form row ===== */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div>
                            <div className="text-sm font-extrabold text-gray-800 mb-2">
                                วันที่เข้าพัก <span className="text-rose-600">*</span>
                            </div>
                            <input
                                type="date"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                            />
                        </div>

                        <div>
                            <div className="text-sm font-extrabold text-gray-800 mb-2">วันที่ออก</div>
                            <input
                                type="date"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                            />
                        </div>

                        <div>
                            <div className="text-sm font-extrabold text-gray-800 mb-2">
                                ค่าเช่าต่อเดือน <span className="text-rose-600">*</span>
                            </div>
                            <div className="flex items-stretch">
                                <input
                                    value={monthlyRent}
                                    onChange={(e) => setMonthlyRent(Number(e.target.value || 0))}
                                    inputMode="numeric"
                                    className="w-full rounded-l-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                />
                                <div className="rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4 py-3 font-extrabold text-gray-700">
                                    บาท / เดือน
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-extrabold text-gray-800 mb-2">
                                เงินประกัน <span className="text-rose-600">*</span>
                            </div>
                            <div className="flex items-stretch">
                                <input
                                    value={deposit}
                                    onChange={(e) => setDeposit(Number(e.target.value || 0))}
                                    inputMode="numeric"
                                    className="w-full rounded-l-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                />
                                <div className="rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4 py-3 font-extrabold text-gray-700">
                                    บาท
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-extrabold text-gray-800 mb-2">
                                ชำระเงินประกันโดย <span className="text-rose-600">*</span>
                            </div>
                            <select
                                value={depositPayBy}
                                onChange={(e) => setDepositPayBy(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                            >
                                <option value="เงินสด">เงินสด</option>
                                <option value="โอน">โอน</option>
                                <option value="บัตร">บัตร</option>
                            </select>
                        </div>

                        <div>
                            <div className="text-sm font-extrabold text-gray-800 mb-2">เงินจอง</div>
                            <div className="flex items-stretch">
                                <input
                                    value={bookingFee}
                                    onChange={(e) => setBookingFee(Number(e.target.value || 0))}
                                    inputMode="numeric"
                                    className="w-full rounded-l-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                />
                                <div className="rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4 py-3 font-extrabold text-gray-700">
                                    บาท
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-extrabold text-gray-800 mb-2">เลขที่ใบจอง</div>
                            <input
                                value={bookingNo}
                                onChange={(e) => setBookingNo(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                            />
                        </div>
                    </div>

                    {/* ===== Summary box ===== */}
                    <div className="mt-6 rounded-2xl border border-blue-100/70 bg-[#F3F7FF] overflow-hidden">
                        <div className="px-6 py-4 font-extrabold text-gray-900 text-lg">สรุป</div>
                        <div className="bg-white mx-6 mb-6 rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="grid grid-cols-3 px-6 py-4 border-b border-gray-100 text-sm">
                                <div className="font-bold text-gray-700">เงินประกัน</div>
                                <div />
                                <div className="text-right font-extrabold text-gray-900">{moneyTHB(deposit)} บาท</div>
                            </div>
                            <div className="grid grid-cols-3 px-6 py-4 border-b border-gray-100 text-sm">
                                <div className="font-bold text-gray-700">เงินจอง</div>
                                <div />
                                <div className="text-right font-extrabold text-gray-900">-{moneyTHB(bookingFee)} บาท</div>
                            </div>
                            <div className="grid grid-cols-3 px-6 py-5 text-sm">
                                <div />
                                <div className="text-right font-extrabold text-gray-900">รวม (เก็บเพิ่มเติม)</div>
                                <div className="text-right font-extrabold text-gray-900">{moneyTHB(total)} บาท</div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Tenant info ===== */}
                    <div className="mt-8">
                        <div className="text-xl font-extrabold text-gray-900">ข้อมูลผู้เช่า</div>
                        <div className="h-px bg-gray-200 my-4" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div>
                                <div className="text-sm font-extrabold text-gray-800 mb-2">
                                    ชื่อจริง <span className="text-rose-600">*</span>
                                </div>
                                <input
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                />
                            </div>

                            <div>
                                <div className="text-sm font-extrabold text-gray-800 mb-2">
                                    นามสกุล <span className="text-rose-600">*</span>
                                </div>
                                <input
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                />
                            </div>

                            <div>
                                <div className="text-sm font-extrabold text-gray-800 mb-2">
                                    เบอร์ติดต่อ <span className="text-rose-600">*</span>
                                </div>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                />
                            </div>

                            <div>
                                <div className="text-sm font-extrabold text-gray-800 mb-2">
                                    เลขบัตรประชาชน / พาสปอร์ต <span className="text-rose-600">*</span>
                                </div>
                                <input
                                    value={citizenId}
                                    onChange={(e) => setCitizenId(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="text-sm font-extrabold text-gray-800 mb-2">ที่อยู่ (สำหรับแสดงในใบแจ้งหนี้/ใบเสร็จ)</div>
                            <input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                            />
                        </div>
                    </div>

                    {/* ===== Emergency ===== */}
                    <div className="mt-8">
                        <div className="text-xl font-extrabold text-gray-900">บุคคลติดต่อฉุกเฉิน</div>
                        <div className="h-px bg-gray-200 my-4" />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div>
                                <div className="text-sm font-extrabold text-gray-800 mb-2">ชื่อบุคคลติดต่อฉุกเฉิน</div>
                                <input
                                    value={emgName}
                                    onChange={(e) => setEmgName(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                />
                            </div>

                            <div>
                                <div className="text-sm font-extrabold text-gray-800 mb-2">ความสัมพันธ์</div>
                                <input
                                    value={emgRelation}
                                    onChange={(e) => setEmgRelation(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                />
                            </div>

                            <div>
                                <div className="text-sm font-extrabold text-gray-800 mb-2">เบอร์ติดต่อ</div>
                                <input
                                    value={emgPhone}
                                    onChange={(e) => setEmgPhone(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ===== Note ===== */}
                    <div className="mt-8">
                        <div className="text-xl font-extrabold text-gray-900">อื่นๆ</div>
                        <div className="h-px bg-gray-200 my-4" />
                        <div className="text-sm font-bold text-gray-700 mb-2">Note</div>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                        />
                    </div>

                    {/* footer actions */}
                    <div className="mt-8 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => nav("/owner/rooms")}
                            className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
                        >
                            ย้อนกลับ
                        </button>

                        <button
                            type="button"
                            onClick={goNext}
                            className="px-7 py-3 rounded-xl !bg-blue-600 text-white font-extrabold shadow-[0_12px_22px_rgba(37,99,235,0.22)] hover:!bg-blue-700"
                        >
                            ต่อไป
                        </button>
                    </div>
                </div>
            </div>
        </OwnerShell>
    );
}
