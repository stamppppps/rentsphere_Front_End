import OwnerShell from "@/features/owner/components/OwnerShell";
import { useAddCondoStore } from "@/features/owner/pages/AddCondo/store/addCondo.store";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

/** สร้างโค้ด 6 ตัว (A-Z, 0-9) */
function generateAccessCode(len = 6) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < len; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
}

function Stepper() {
    const items = [
        { n: 1, label: "สรุปรายละเอียด" },
        { n: 2, label: "สร้างรหัสเข้าพัก" },
    ] as const;

    return (
        <div className="w-full flex items-center justify-center gap-10 py-2">
            {items.map((it, idx) => {
                const active = it.n === 2;
                const done = it.n < 2;

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

                        {idx !== items.length - 1 ? <div className="w-56 h-[3px] rounded-full bg-blue-100" /> : null}
                    </div>
                );
            })}
        </div>
    );
}

export default function TenantAccessCodePage() {
    const nav = useNavigate();
    const { roomId } = useParams();
    const location = useLocation() as any;

    const { rooms } = useAddCondoStore();

    const room = useMemo(() => {
        if (!roomId) return null;
        return (rooms ?? []).find((r: any) => String(r?.id) === String(roomId)) ?? null;
    }, [rooms, roomId]);

    const tenantNameFromState: string | undefined = location?.state?.tenantName;
    const roomNoFromState: string | undefined = location?.state?.roomNo;

    const condoName = "สวัสดีคอนโด";
    const roomNo = roomNoFromState ?? room?.roomNo ?? "-";
    const tenantName = tenantNameFromState ?? "ผู้เช่า";

    const [accessCode, setAccessCode] = useState<string>("");

    useEffect(() => {
        const key = `tenant_access_code:${roomId}`;
        const saved = roomId ? localStorage.getItem(key) : null;

        if (saved) {
            setAccessCode(saved);
        } else {
            const code = generateAccessCode(6);
            setAccessCode(code);
            if (roomId) localStorage.setItem(key, code);
        }
    }, [roomId]);

    const regenerate = () => {
        const code = generateAccessCode(6);
        setAccessCode(code);
        if (roomId) localStorage.setItem(`tenant_access_code:${roomId}`, code);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(accessCode);
            alert("คัดลอกโค้ดแล้ว");
        } catch {
            alert("คัดลอกไม่สำเร็จ (ลองคัดลอกด้วยตนเอง)");
        }
    };

    const sendLine = () => {
        const msg = `โค้ดเข้าพักสำหรับห้อง ${roomNo}: ${accessCode} (คอนโด ${condoName})`;
        navigator.clipboard.writeText(msg);
        alert("คัดลอกข้อความสำหรับส่ง LINE แล้ว");
    };

    const sendSMS = () => {
        const msg = `โค้ดเข้าพัก ห้อง ${roomNo}: ${accessCode}`;
        navigator.clipboard.writeText(msg);
        alert("คัดลอกข้อความสำหรับส่ง SMS แล้ว");
    };

    const finishAndSave = () => {
        // backend : POST {roomId, accessCode, tenantId...}
        alert("บันทึกสำเร็จ");
        nav(`/owner/rooms/${roomId}`, { replace: true });
    };

    if (!roomId) {
        return (
            <OwnerShell activeKey="rooms" showSidebar>
                <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
                    <div className="text-xl font-extrabold text-gray-900 mb-2">ไม่พบ roomId</div>
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
                    <Stepper />
                </div>

                <div className="p-8">
                    <div className="text-center">
                        <div className="text-3xl font-extrabold text-gray-900">สร้างรหัสเข้าพักสำเร็จ</div>
                        <div className="text-sm font-bold text-gray-500 mt-1">Tenant Access Code Generated</div>

                        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-5 py-2">
                            <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 font-black">
                                👤
                            </span>
                            <span className="text-sm font-extrabold text-gray-700">
                                {tenantName} : ห้อง {roomNo}
                            </span>
                        </div>
                    </div>

                    {/* code box */}
                    <div className="mt-8 mx-auto max-w-xl">
                        <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-[#F6F9FF] px-8 py-7 text-center">
                            <div className="text-xs font-extrabold tracking-widest text-gray-500 mb-2">LOGIN CODE</div>

                            <div className="flex items-center justify-center gap-4">
                                <div className="text-5xl md:text-6xl font-black tracking-[0.25em] text-blue-600 select-text">
                                    {accessCode}
                                </div>

                                <button
                                    type="button"
                                    onClick={regenerate}
                                    className="w-11 h-11 rounded-2xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center justify-center font-black text-gray-700"
                                    title="สุ่มโค้ดใหม่"
                                >
                                    ↻
                                </button>
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={copyToClipboard}
                                    className="px-5 py-3 rounded-2xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
                                >
                                    คัดลอกโค้ด
                                </button>
                            </div>

                            <div className="mt-3 text-xs font-bold text-gray-500">
                                โค้ดนี้ใช้สำหรับให้ผู้เช่าเข้าสู่ระบบครั้งแรก และระบุว่าผู้เช่าอยู่ห้องไหน (ผูกกับห้อง {roomNo})
                            </div>
                        </div>

                        {/* send buttons */}
                        <div className="mt-6 flex items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={sendLine}
                                className="px-7 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold hover:bg-emerald-100"
                            >
                                ส่งทาง LINE
                            </button>
                            <button
                                type="button"
                                onClick={sendSMS}
                                className="px-7 py-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 font-extrabold hover:bg-blue-100"
                            >
                                ส่งทาง SMS
                            </button>
                        </div>
                    </div>

                    {/* footer actions */}
                    <div className="mt-10 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => nav(-1)}
                            className="inline-flex items-center gap-2 text-sm font-extrabold text-gray-600 hover:text-gray-900"
                        >
                            ← ย้อนกลับ
                        </button>

                        <button
                            type="button"
                            onClick={finishAndSave}
                            className="px-9 py-4 rounded-2xl !bg-blue-600 text-white font-extrabold shadow-[0_12px_22px_rgba(37,99,235,0.22)] hover:!bg-blue-700"
                        >
                            เสร็จสิ้นและบันทึก
                        </button>
                    </div>
                </div>
            </div>
        </OwnerShell>
    );
}
