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

                        <div
                            className={
                                active ? "font-extrabold text-blue-700" : "font-bold text-gray-600"
                            }
                        >
                            {it.label}
                        </div>

                        {idx !== items.length - 1 ? (
                            <div className="w-20 h-[3px] rounded-full bg-blue-100" />
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

export default function AdvancePaymentPage() {
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

    // ===== state (mock) =====
    const [roundDate, setRoundDate] = useState("");
    const [detail, setDetail] = useState("");
    const [payBy, setPayBy] = useState("เงินสด");
    const [note, setNote] = useState("");

    const [advanceMonths, setAdvanceMonths] = useState<number>(1);

    const advanceAmount = useMemo(() => {
        const m = Number.isFinite(advanceMonths) ? Math.max(0, advanceMonths) : 0;
        return (rent || 0) * m;
    }, [rent, advanceMonths]);

    const goBack = () => {
        if (!roomId) {
            nav("/owner/rooms", { replace: true });
            return;
        }
        nav(`/owner/rooms/${roomId}/monthly-contract`, { replace: true });
    };

    const goNext = () => {
        if (!roomId) {
            nav("/owner/rooms", { replace: true });
            return;
        }
        nav(`/owner/rooms/${roomId}/meter`, { replace: true });
    };

    if (!room) {
        return (
            <OwnerShell activeKey="rooms" showSidebar>
                <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
                    <div className="text-xl font-extrabold text-gray-900 mb-2">
                        ไม่พบข้อมูลห้อง
                    </div>
                    <div className="text-gray-600 font-bold mb-6">roomId: {roomId}</div>
                    <button
                        type="button"
                        onClick={() => nav("/owner/rooms", { replace: true })}
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
                    <Stepper step={2} />
                </div>

                <div className="p-6">
                    {/* header */}
                    <div className="mb-4">
                        <div className="text-xl font-extrabold text-gray-900">
                            รับเงินค่าเช่าล่วงหน้า ตอนทำสัญญา
                        </div>
                        <div className="text-sm font-bold text-gray-500 mt-1">
                            คำนวณจากจำนวนเดือนล่วงหน้า × ค่าเช่าต่อเดือน
                        </div>
                    </div>
                    <div className="h-px bg-gray-200 mb-6" />

                    {/* form */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div>
                            <div className="text-sm font-extrabold text-gray-800 mb-2">
                                รอบบิล / วันที่ <span className="text-rose-600">*</span>
                            </div>
                            <input
                                type="date"
                                value={roundDate}
                                onChange={(e) => setRoundDate(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                            />
                        </div>

                        <div>
                            <div className="text-sm font-extrabold text-gray-800 mb-2">
                                ชำระเงินโดย <span className="text-rose-600">*</span>
                            </div>
                            <select
                                value={payBy}
                                onChange={(e) => setPayBy(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                            >
                                <option value="เงินสด">เงินสด</option>
                                <option value="โอน">โอน</option>
                                <option value="บัตร">บัตร</option>
                            </select>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="text-sm font-extrabold text-gray-800 mb-2">
                                รายละเอียด (สำหรับแสดงในสัญญา/ใบเสร็จ)
                            </div>
                            <input
                                value={detail}
                                onChange={(e) => setDetail(e.target.value)}
                                placeholder="เช่น ค่าเช่าล่วงหน้า 1 เดือน"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                            />
                        </div>

                        {/* months + amount */}
                        <div>
                            <div className="text-sm font-extrabold text-gray-800 mb-2">
                                จำนวนเดือนล่วงหน้า <span className="text-rose-600">*</span>
                            </div>
                            <div className="flex items-stretch">
                                <input
                                    value={advanceMonths}
                                    onChange={(e) => setAdvanceMonths(Number(e.target.value || 0))}
                                    inputMode="numeric"
                                    className="w-full rounded-l-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                />
                                <div className="rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4 py-3 font-extrabold text-gray-700">
                                    เดือน
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-extrabold text-gray-800 mb-2">
                                จำนวนเงินค่าเช่าล่วงหน้า <span className="text-rose-600">*</span>
                            </div>
                            <div className="flex items-stretch">
                                <input
                                    value={moneyTHB(advanceAmount)}
                                    readOnly
                                    className="w-full rounded-l-xl border border-gray-200 bg-white px-4 py-3 font-extrabold text-gray-900 focus:outline-none"
                                />
                                <div className="rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4 py-3 font-extrabold text-gray-700">
                                    บาท
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="text-sm font-bold text-gray-700 mb-2">Note</div>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                            />
                        </div>
                    </div>

                    {/* footer */}
                    <div className="mt-8 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => nav(-1)}
                            className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
                        >
                            ย้อนกลับ
                        </button>

                        <button
                            type="button"
                            onClick={() => nav(`/owner/rooms/${roomId}/meter`)}
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
