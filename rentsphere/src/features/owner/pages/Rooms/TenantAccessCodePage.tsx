import OwnerShell from "@/features/owner/components/OwnerShell";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

/* ===== Types ===== */
type RoomDetail = {
    id: string;
    roomNo: string;
    condoName?: string | null;
};

type AccessCodeResponse = {
    accessCode: string;
};

/* ===== Backend calls (แก้ endpoint ให้ตรง backend จริง) ===== */
async function fetchRoomDetail(roomId: string): Promise<RoomDetail> {
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

async function createOrGetAccessCode(roomId: string): Promise<AccessCodeResponse> {
    const res = await fetch(`/api/owner/rooms/${encodeURIComponent(roomId)}/access-code`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
    });

    if (!res.ok) throw new Error("สร้าง/โหลดรหัสเข้าพักไม่สำเร็จ");
    const data = await res.json();
    return { accessCode: String(data.accessCode ?? "") };
}

async function regenerateAccessCode(roomId: string): Promise<AccessCodeResponse> {
    const res = await fetch(`/api/owner/rooms/${encodeURIComponent(roomId)}/access-code/regenerate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
    });

    if (!res.ok) throw new Error("สุ่มรหัสใหม่ไม่สำเร็จ");
    const data = await res.json();
    return { accessCode: String(data.accessCode ?? "") };
}

async function finalizeAccessCode(
    roomId: string,
    payload: { accessCode: string; tenantName?: string; roomNo?: string }
): Promise<void> {
    const res = await fetch(`/api/owner/rooms/${encodeURIComponent(roomId)}/access-code/finalize`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("บันทึกข้อมูลรหัสเข้าพักไม่สำเร็จ");
}

/* ===== Icons ===== */
function UserIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="8" r="4" />
        </svg>
    );
}

/* ===== UI ===== */
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

    const tenantNameFromState: string | undefined = location?.state?.tenantName;
    const roomNoFromState: string | undefined = location?.state?.roomNo;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [room, setRoom] = useState<RoomDetail | null>(null);
    const [accessCode, setAccessCode] = useState<string>("");

    const [regenerating, setRegenerating] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!roomId) {
                setLoading(false);
                setError("ไม่พบ roomId");
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [detail, codeRes] = await Promise.all([
                    fetchRoomDetail(roomId),
                    createOrGetAccessCode(roomId),
                ]);

                if (cancelled) return;

                setRoom(detail);
                setAccessCode(codeRes.accessCode || "");
                setLoading(false);
            } catch (e: any) {
                if (cancelled) return;
                setRoom(null);
                setAccessCode("");
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
    const roomNo = useMemo(() => roomNoFromState ?? room?.roomNo ?? "-", [roomNoFromState, room]);
    const tenantName = useMemo(() => tenantNameFromState ?? "ผู้เช่า", [tenantNameFromState]);

    const regenerate = async () => {
        if (!roomId) return;
        setRegenerating(true);
        try {
            const res = await regenerateAccessCode(roomId);
            setAccessCode(res.accessCode || "");
        } catch (e: any) {
            alert(e?.message ?? "สุ่มโค้ดใหม่ไม่สำเร็จ");
        } finally {
            setRegenerating(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(accessCode);
            alert("คัดลอกโค้ดแล้ว");
        } catch {
            alert("คัดลอกไม่สำเร็จ (ลองคัดลอกด้วยตนเอง)");
        }
    };

    const sendLine = async () => {
        const msg = `โค้ดเข้าพักสำหรับห้อง ${roomNo}: ${accessCode} (คอนโด ${condoName})`;
        try {
            await navigator.clipboard.writeText(msg);
            alert("คัดลอกข้อความสำหรับส่ง LINE แล้ว");
        } catch {
            alert("คัดลอกไม่สำเร็จ");
        }
    };

    const sendSMS = async () => {
        const msg = `โค้ดเข้าพัก ห้อง ${roomNo}: ${accessCode}`;
        try {
            await navigator.clipboard.writeText(msg);
            alert("คัดลอกข้อความสำหรับส่ง SMS แล้ว");
        } catch {
            alert("คัดลอกไม่สำเร็จ");
        }
    };

    const finishAndSave = async () => {
        if (!roomId) return;
        if (!accessCode) {
            alert("ยังไม่มีโค้ดเข้าพัก");
            return;
        }

        setSaving(true);
        try {
            await finalizeAccessCode(roomId, { accessCode, tenantName, roomNo });
            alert("บันทึกสำเร็จ");
            nav(`/owner/rooms/${roomId}`, { replace: true });
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

    if (!roomId || error) {
        return (
            <OwnerShell activeKey="rooms" showSidebar>
                <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
                    <div className="text-xl font-extrabold text-gray-900 mb-2">ไม่สามารถเปิดหน้านี้ได้</div>
                    <div className="text-gray-600 font-bold mb-2">roomId: {roomId}</div>
                    {error && <div className="text-rose-600 font-extrabold mb-6">{error}</div>}

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => nav("/owner/rooms")}
                            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700"
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
                            <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600">
                                <UserIcon className="h-4 w-4" />
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
                                    {accessCode || "------"}
                                </div>

                                <button
                                    type="button"
                                    onClick={regenerate}
                                    disabled={regenerating}
                                    className="w-11 h-11 rounded-2xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center justify-center font-black text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    title="สุ่มโค้ดใหม่"
                                >
                                    ↻
                                </button>
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={copyToClipboard}
                                    disabled={!accessCode}
                                    className="px-5 py-3 rounded-2xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
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
                                disabled={!accessCode}
                                className="px-7 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold hover:bg-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                ส่งทาง LINE
                            </button>
                            <button
                                type="button"
                                onClick={sendSMS}
                                disabled={!accessCode}
                                className="px-7 py-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 font-extrabold hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
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
                            disabled={saving || !accessCode}
                            className="px-9 py-4 rounded-2xl !bg-blue-600 text-white font-extrabold shadow-[0_12px_22px_rgba(37,99,235,0.22)] hover:!bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {saving ? "กำลังบันทึก..." : "เสร็จสิ้นและบันทึก"}
                        </button>
                    </div>
                </div>
            </div>
        </OwnerShell>
    );
}