import OwnerShell from "@/features/owner/components/OwnerShell";
import { useEffect, useMemo, useState } from "react";
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

                        {idx !== items.length - 1 && <div className="w-20 h-[3px] rounded-full bg-blue-100" />}
                    </div>
                );
            })}
        </div>
    );
}

/* ===== helper ===== */
const onlyDigits = (v: string) => v.replace(/\D/g, "");

/* ===== types ===== */
type RoomDetail = {
    id: string;
    roomNo: string;
    condoName?: string | null;
};

type RoomMeters = {
    waterMeter: string;
    elecMeter: string;
};

/* ===== Backend calls (แก้ endpoint ให้ตรง) ===== */
async function fetchRoomDetail(roomId: string): Promise<RoomDetail> {
    // TODO: GET /api/owner/rooms/:roomId
    const res = await fetch(`/api/owner/rooms/${encodeURIComponent(roomId)}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("โหลดข้อมูลห้องไม่สำเร็จ");
    const data = await res.json();

    return {
        id: String(data.id ?? roomId),
        roomNo: String(data.roomNo ?? data.number ?? "-"),
        condoName: data.condoName ?? data.condo?.name ?? null,
    };
}

async function fetchRoomMeters(roomId: string): Promise<RoomMeters | null> {
    // TODO: GET /api/owner/rooms/:roomId/meters
    const res = await fetch(`/api/owner/rooms/${encodeURIComponent(roomId)}/meters`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    // ถ้า backend ยังไม่มี endpoint นี้ อาจคืน 404 ถือว่ายังไม่มีข้อมูล
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("โหลดข้อมูลมิเตอร์ไม่สำเร็จ");

    const data = await res.json();
    return {
        waterMeter: String(data.waterMeter ?? data.water ?? ""),
        elecMeter: String(data.elecMeter ?? data.electric ?? ""),
    };
}

async function saveRoomMeters(roomId: string, payload: RoomMeters): Promise<void> {
    // TODO: POST/PUT /api/owner/rooms/:roomId/meters
    const res = await fetch(`/api/owner/rooms/${encodeURIComponent(roomId)}/meters`, {
        method: "POST",//backend
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("บันทึกเลขมิเตอร์ไม่สำเร็จ");
}

export default function RoomMeterPage() {
    const nav = useNavigate();
    const { roomId } = useParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [room, setRoom] = useState<RoomDetail | null>(null);

    /* ===== form state ===== */
    const [waterMeter, setWaterMeter] = useState("");
    const [elecMeter, setElecMeter] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!roomId) {
                setLoading(false);
                setRoom(null);
                setError("ไม่พบ roomId");
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [detail, meters] = await Promise.all([
                    fetchRoomDetail(roomId),
                    fetchRoomMeters(roomId),
                ]);

                if (cancelled) return;

                setRoom(detail);

                if (meters) {
                    setWaterMeter(onlyDigits(meters.waterMeter));
                    setElecMeter(onlyDigits(meters.elecMeter));
                }

                setLoading(false);
            } catch (e: any) {
                if (cancelled) return;
                setRoom(null);
                setError(e?.message ?? "เกิดข้อผิดพลาด");
                setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [roomId]);

    const condoName = useMemo(() => room?.condoName ?? "คอนโดมิเนียม", [room]);
    const roomNo = useMemo(() => room?.roomNo ?? "-", [room]);

    const goBack = () => {
        if (!roomId) {
            nav("/owner/rooms", { replace: true });
            return;
        }
        nav(-1);
    };

    const onSave = async () => {
        if (!roomId) return;

        if (!waterMeter || !elecMeter) {
            alert("กรุณากรอกเลขมิเตอร์ให้ครบ");
            return;
        }

        setSaving(true);
        try {
            await saveRoomMeters(roomId, { waterMeter, elecMeter });
            nav(`/owner/rooms/${roomId}/access-code`, { replace: true });
        } catch (e: any) {
            alert(e?.message ?? "บันทึกไม่สำเร็จ");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <OwnerShell activeKey="rooms" showSidebar>
                <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
                    <div className="text-sm font-extrabold text-gray-600">กำลังโหลดข้อมูล...</div>
                </div>
            </OwnerShell>
        );
    }

    if (!roomId || error || !room) {
        return (
            <OwnerShell activeKey="rooms" showSidebar>
                <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
                    <div className="text-xl font-extrabold text-gray-900 mb-2">ไม่พบข้อมูลห้อง</div>
                    <div className="text-gray-600 font-bold mb-2">roomId: {roomId}</div>
                    {error && <div className="text-rose-600 font-extrabold mb-6">{error}</div>}

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => nav("/owner/rooms", { replace: true })}
                            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-extrabold"
                        >
                            กลับไปหน้าห้อง
                        </button>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
                        >
                            ลองใหม่
                        </button>
                    </div>
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
                        <div className="text-xl font-extrabold text-gray-900">เลขมิเตอร์วันเข้าพัก</div>
                        <div className="text-sm font-bold text-gray-500 mt-1">กรอกเลขมิเตอร์เริ่มต้น ณ วันที่ทำสัญญา / เข้าอยู่</div>
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
                            className="px-7 py-3 rounded-xl !bg-blue-600 text-white font-extrabold shadow-lg hover:!bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {saving ? "กำลังบันทึก..." : "บันทึก"}
                        </button>
                    </div>
                </div>
            </div>
        </OwnerShell>
    );
}