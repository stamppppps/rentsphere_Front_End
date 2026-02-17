import OwnerShell from "@/features/owner/components/OwnerShell";
import { useAddCondoStore } from "@/features/owner/pages/AddCondo/store/addCondo.store";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* ===== stepper ===== */
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

                        {idx !== items.length - 1 && (
                            <div className="w-20 h-[3px] rounded-full bg-blue-100" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ===== helper ===== */
const onlyDigits = (v: string) => v.replace(/\D/g, "");

export default function RoomMeterPage() {
    const nav = useNavigate();
    const { roomId } = useParams();
    const { rooms } = useAddCondoStore();

    const room = useMemo(() => {
        if (!roomId) return null;
        return (rooms ?? []).find((r) => String(r.id) === String(roomId)) ?? null;
    }, [rooms, roomId]);

    const condoName = "สวัสดีคอนโด";
    const roomNo = room?.roomNo ?? "-";

    /* ===== state ===== */
    const [waterMeter, setWaterMeter] = useState("");
    const [elecMeter, setElecMeter] = useState("");
    const [saving, setSaving] = useState(false);

    const goBack = () => nav(-1);

    const onSave = async () => {
        if (!waterMeter || !elecMeter) {
            alert("กรุณากรอกเลขมิเตอร์ให้ครบ");
            return;
        }

        setSaving(true);
        try {
            nav(`/owner/rooms/${roomId}/access-code`);
        } finally {
            setSaving(false);
        }
    };

    if (!room) {
        return (
            <OwnerShell activeKey="rooms" showSidebar>
                <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
                    <div className="text-xl font-extrabold text-gray-900 mb-2">ไม่พบข้อมูลห้อง</div>
                    <button
                        type="button"
                        onClick={() => nav("/owner/rooms")}
                        className="px-5 py-3 rounded-xl bg-blue-600 text-white font-extrabold"
                    >
                        กลับไปหน้าห้อง
                    </button>
                </div>
            </OwnerShell>
        );
    }

    return (
        <OwnerShell activeKey="rooms" showSidebar>
            {/* header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-bold text-gray-600">
                    คอนโดมิเนียม : <span className="text-gray-900">{condoName}</span>
                </div>
                <div className="text-sm font-extrabold text-gray-700">ห้อง {roomNo}</div>
            </div>

            <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                <div className="bg-[#EAF2FF] border-b border-blue-100/70 px-6 py-4">
                    <Stepper step={3} />
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <div className="text-xl font-extrabold text-gray-900">
                            เลขมิเตอร์วันเข้าพัก
                        </div>
                        <div className="text-sm font-bold text-gray-500 mt-1">
                            กรอกเลขมิเตอร์เริ่มต้น ณ วันที่ทำสัญญา / เข้าอยู่
                        </div>
                    </div>

                    <div className="h-px bg-gray-200 mb-6" />

                    <div className="rounded-2xl border border-blue-100/70 bg-[#F3F7FF] p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div>
                                <div className="text-sm font-extrabold text-gray-800 mb-2">
                                    เลขมิเตอร์ค่าน้ำ <span className="text-rose-600">*</span>
                                </div>
                                <input
                                    value={waterMeter}
                                    onChange={(e) => setWaterMeter(onlyDigits(e.target.value))}
                                    inputMode="numeric"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-extrabold text-gray-900
                                    focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                />
                            </div>

                            <div>
                                <div className="text-sm font-extrabold text-gray-800 mb-2">
                                    เลขมิเตอร์ค่าไฟ <span className="text-rose-600">*</span>
                                </div>
                                <input
                                    value={elecMeter}
                                    onChange={(e) => setElecMeter(onlyDigits(e.target.value))}
                                    inputMode="numeric"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-extrabold text-gray-900
                                    focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={goBack}
                            className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold"
                        >
                            ย้อนกลับ
                        </button>

                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving}
                            className="px-7 py-3 rounded-xl !bg-blue-600 text-white font-extrabold shadow-lg hover:!bg-blue-700 disabled:opacity-60"
                        >
                            {saving ? "กำลังบันทึก..." : "บันทึก"}
                        </button>
                    </div>
                </div>
            </div>
        </OwnerShell>
    );
}
