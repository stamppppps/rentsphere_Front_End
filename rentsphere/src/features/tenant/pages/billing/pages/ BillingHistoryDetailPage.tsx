import { ChevronLeft } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type BillStatus = "UNPAID" | "PENDING_REVIEW" | "PAID" | "OVERDUE";
type BillItemKey = "rent" | "water" | "electricity" | "commonFee";
type BillItem = { key: BillItemKey; label: string; amount: number };

type HistoryDetail = {
    id: string;
    monthText: string;
    billId?: string;
    status: BillStatus;
    total: number;
    paidAtText?: string;
    dueDateText?: string;
    items: BillItem[];
};

function cx(...cls: Array<string | false | undefined | null>) {
    return cls.filter(Boolean).join(" ");
}
function formatNumber(n: number) {
    return n.toLocaleString("th-TH");
}

function statusText(s: BillStatus) {
    switch (s) {
        case "UNPAID":
            return "ยังไม่ได้ชำระ";
        case "PENDING_REVIEW":
            return "รอตรวจสอบ";
        case "PAID":
            return "ชำระแล้ว";
        case "OVERDUE":
            return "เกินกำหนด";
        default:
            return "—";
    }
}
function statusBadgeClass(s: BillStatus) {
    switch (s) {
        case "PAID":
            return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "PENDING_REVIEW":
            return "bg-amber-100 text-amber-800 border-amber-200";
        case "OVERDUE":
            return "bg-rose-100 text-rose-700 border-rose-200";
        case "UNPAID":
        default:
            return "bg-blue-50 text-blue-700 border-blue-200";
    }
}

/* ================= UI Shells ================= */
function CardShell({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div
            style={style}
            className={[
                "bg-white",
                "rounded-[18px]",
                "shadow-[0_14px_40px_rgba(15,23,42,0.08)]",
                "border border-blue-100/60",
                "overflow-hidden",
                className,
            ].join(" ")}
        >
            {children}
        </div>
    );
}

function SoftPanel({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return <div style={style} className={cx("rounded-[18px]", "bg-[#F4F8FF]", "border border-blue-100/70", "shadow-inner", className)}>{children}</div>;
}

/* ================= SVG Icons ================= */
function IconBox({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-10 h-10 rounded-[14px] bg-white/70 border border-blue-100/70 shadow-[0_10px_18px_rgba(15,23,42,0.06)] flex items-center justify-center text-[#2F6BFF]">
            {children}
        </div>
    );
}

function RentSvg() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 10.5L12 3l9 7.5V21a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 21V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M9.5 22.5V14a2.5 2.5 0 0 1 5 0v8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
function WaterSvg() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2s7 7.5 7 13a7 7 0 0 1-14 0c0-5.5 7-13 7-13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M9.5 16.5c.6 1.3 1.8 2 3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
function ElectricSvg() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
    );
}
function CommonFeeSvg() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M8 8h8M8 12h8M8 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function BillItemIcon({ type }: { type: BillItemKey }) {
    if (type === "rent") return <IconBox><RentSvg /></IconBox>;
    if (type === "water") return <IconBox><WaterSvg /></IconBox>;
    if (type === "electricity") return <IconBox><ElectricSvg /></IconBox>;
    return <IconBox><CommonFeeSvg /></IconBox>;
}

/* ================= Page ================= */
export default function BillingHistoryDetailPage() {
    const nav = useNavigate();
    const { historyId } = useParams();

    const location = useLocation() as {
        state?: { historyId?: string; monthText?: string; amount?: number; status?: "PAID" | "PENDING_REVIEW"; paidAtISO?: string };
    };

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 10);
        return () => clearTimeout(t);
    }, []);

    // ให้ id มาจาก URL เป็นหลัก
    const id = historyId ?? location.state?.historyId ?? "";

    // MOCK: key ต้องตรงกับ BillingHistoryPage (h-YYYY-MM)
    const mockDetailMap: Record<string, HistoryDetail> = useMemo(
        () => ({
            "h-2024-05": {
                id: "h-2024-05",
                billId: "1025",
                monthText: "พฤษภาคม 2024",
                status: "PENDING_REVIEW",
                total: 4200,
                paidAtText: "10 พฤษภาคม 2024",
                dueDateText: "31 พฤษภาคม 2024",
                items: [
                    { key: "rent", label: "ค่าเช่า", amount: 3500 },
                    { key: "water", label: "ค่าน้ำ", amount: 300 },
                    { key: "electricity", label: "ค่าไฟฟ้า", amount: 350 },
                    { key: "commonFee", label: "ค่าส่วนกลาง", amount: 50 },
                ],
            },
            "h-2024-04": {
                id: "h-2024-04",
                billId: "1024",
                monthText: "เมษายน 2024",
                status: "PAID",
                total: 4150,
                paidAtText: "07 เมษายน 2024",
                dueDateText: "30 เมษายน 2024",
                items: [
                    { key: "rent", label: "ค่าเช่า", amount: 3500 },
                    { key: "water", label: "ค่าน้ำ", amount: 280 },
                    { key: "electricity", label: "ค่าไฟฟ้า", amount: 320 },
                    { key: "commonFee", label: "ค่าส่วนกลาง", amount: 50 },
                ],
            },
            "h-2024-03": {
                id: "h-2024-03",
                billId: "1023",
                monthText: "มีนาคม 2024",
                status: "PAID",
                total: 4100,
                paidAtText: "06 มีนาคม 2024",
                dueDateText: "31 มีนาคม 2024",
                items: [
                    { key: "rent", label: "ค่าเช่า", amount: 3500 },
                    { key: "water", label: "ค่าน้ำ", amount: 250 },
                    { key: "electricity", label: "ค่าไฟฟ้า", amount: 300 },
                    { key: "commonFee", label: "ค่าส่วนกลาง", amount: 50 },
                ],
            },
            "h-2024-02": {
                id: "h-2024-02",
                billId: "1022",
                monthText: "กุมภาพันธ์ 2024",
                status: "OVERDUE",
                total: 4080,
                dueDateText: "29 กุมภาพันธ์ 2024",
                items: [
                    { key: "rent", label: "ค่าเช่า", amount: 3500 },
                    { key: "water", label: "ค่าน้ำ", amount: 240 },
                    { key: "electricity", label: "ค่าไฟฟ้า", amount: 290 },
                    { key: "commonFee", label: "ค่าส่วนกลาง", amount: 50 },
                ],
            },
            "h-2024-01": {
                id: "h-2024-01",
                billId: "1021",
                monthText: "มกราคม 2024",
                status: "PAID",
                total: 4050,
                paidAtText: "10 มกราคม 2024",
                dueDateText: "31 มกราคม 2024",
                items: [
                    { key: "rent", label: "ค่าเช่า", amount: 3500 },
                    { key: "water", label: "ค่าน้ำ", amount: 230 },
                    { key: "electricity", label: "ค่าไฟฟ้า", amount: 270 },
                    { key: "commonFee", label: "ค่าส่วนกลาง", amount: 50 },
                ],
            },
            "h-2023-12": {
                id: "h-2023-12",
                billId: "1020",
                monthText: "ธันวาคม 2023",
                status: "PAID",
                total: 4000,
                paidAtText: "10 ธันวาคม 2023",
                dueDateText: "31 ธันวาคม 2023",
                items: [
                    { key: "rent", label: "ค่าเช่า", amount: 3500 },
                    { key: "water", label: "ค่าน้ำ", amount: 200 },
                    { key: "electricity", label: "ค่าไฟฟ้า", amount: 250 },
                    { key: "commonFee", label: "ค่าส่วนกลาง", amount: 50 },
                ],
            },
        }),
        []
    );

    const detail = mockDetailMap[id];

    // fallback กันกรณี detail ยังไม่ fetch แต่มี state จากหน้า list
    const fallbackDetail: HistoryDetail | null = useMemo(() => {
        if (detail) return detail;
        if (!location.state?.monthText) return null;

        return {
            id,
            monthText: location.state.monthText,
            status: (location.state.status === "PENDING_REVIEW" ? "PENDING_REVIEW" : "PAID") as BillStatus,
            total: location.state.amount ?? 0,
            paidAtText: location.state.paidAtISO ? new Date(location.state.paidAtISO).toLocaleDateString("th-TH") : undefined,
            items: [],
        };
    }, [detail, id, location.state]);

    const finalDetail = detail ?? fallbackDetail;

    return (
        <div className="min-h-screen bg-[#F8FAFF] pb-24">
            <style>{`
        @keyframes pop { 0% { transform: translateY(10px); opacity: 0;} 100% { transform: translateY(0); opacity: 1;} }
      `}</style>

            {/* glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-[#2F6BFF]/10 blur-3xl" />
                <div className="absolute -bottom-24 right-0 w-[360px] h-[360px] rounded-full bg-indigo-400/10 blur-3xl" />
            </div>

            {/* Top bar */}
            <div className="sticky top-0 z-40">
                <div className="bg-[#F8FAFF]/85 backdrop-blur supports-[backdrop-filter]:backdrop-blur-lg border-b border-blue-100/40">
                    <div className="px-6 pt-7 pb-3">
                        <div className="relative flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => nav(-1)}
                                className="absolute left-0 p-2.5 rounded-[16px] bg-white/70 backdrop-blur border border-white/60 text-slate-800 shadow-sm active:scale-95 transition"
                                aria-label="Back"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div className="text-2xl font-black text-slate-900">รายละเอียดการชำระ</div>
                            <div className="absolute right-0 w-10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 relative">
                {!finalDetail ? (
                    <CardShell className="mt-4 p-5">
                        <div className="text-[16px] font-black text-slate-900">ไม่พบข้อมูลเดือนนี้</div>
                        <div className="mt-1 text-sm font-bold text-slate-500">ลองกลับไปหน้าเดิมแล้วกดเข้ามาใหม่</div>
                    </CardShell>
                ) : (
                    <>
                        {/* Header card */}
                        <CardShell className={cx("mt-4", mounted ? "opacity-100" : "opacity-0")} style={{ animation: mounted ? "pop .32s ease-out both" : undefined }}>
                            <div className="relative p-5">
                                <div className="absolute inset-0 pointer-events-none opacity-[0.13]">
                                    <div className="h-full w-full bg-gradient-to-br from-blue-300 via-indigo-200 to-transparent" />
                                </div>

                                <div className="relative flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-[18px] font-black text-slate-900 leading-tight">{finalDetail.monthText}</div>
                                        <div className="mt-1 text-[12px] font-bold text-slate-500">
                                            {finalDetail.billId ? `ใบแจ้งหนี้ #${finalDetail.billId}` : "ใบแจ้งหนี้"}
                                        </div>

                                        <div className="mt-3 text-[12px] font-black text-slate-600 tracking-widest">ยอดรวม</div>
                                        <div className="mt-1 text-[32px] font-black text-slate-900 leading-none">
                                            {formatNumber(finalDetail.total)} <span className="text-[14px] font-black text-slate-600">บาท</span>
                                        </div>

                                        <div className="mt-3 space-y-1 text-sm font-bold text-slate-600">
                                            {finalDetail.dueDateText && <div>วันครบกำหนด: {finalDetail.dueDateText}</div>}
                                            {finalDetail.paidAtText && <div>วันที่ชำระ: {finalDetail.paidAtText}</div>}
                                        </div>
                                    </div>

                                    <div className={cx("px-4 py-2 rounded-full border text-xs font-black whitespace-nowrap", statusBadgeClass(finalDetail.status))}>
                                        {statusText(finalDetail.status)}
                                    </div>
                                </div>
                            </div>
                        </CardShell>

                        {/* Detail items */}
                        <div className="mt-4">
                            <CardShell className={cx(mounted ? "opacity-100" : "opacity-0")} style={{ animation: mounted ? "pop .32s ease-out .06s both" : undefined }}>
                                <div className="px-5 py-4">
                                    <div className="text-[18px] font-black text-slate-900">รายละเอียดค่าใช้จ่าย</div>
                                    <div className="mt-1 text-[12px] font-bold text-slate-500">รายการของเดือนนี้</div>
                                </div>

                                <div className="h-px bg-blue-100/70" />

                                <div className="px-5 pb-5 pt-4">
                                    <SoftPanel className="p-5">
                                        {finalDetail.items.length === 0 ? (
                                            <div className="text-sm font-bold text-slate-500">ยังไม่มีรายการรายละเอียด (รอเชื่อม API)</div>
                                        ) : (
                                            <>
                                                <div className="space-y-4">
                                                    {finalDetail.items.map((it, idx) => (
                                                        <div
                                                            key={it.key}
                                                            className="flex items-center justify-between"
                                                            style={{
                                                                animation: mounted ? "pop .32s ease-out both" : undefined,
                                                                animationDelay: `${120 + idx * 60}ms`,
                                                                animationFillMode: "both",
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <BillItemIcon type={it.key} />
                                                                <div className="text-[16px] font-extrabold text-slate-800">{it.label}</div>
                                                            </div>
                                                            <div className="text-[20px] font-black text-slate-900">{formatNumber(it.amount)}</div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-5 pt-4 border-t border-blue-100/80">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-[17px] font-black text-slate-900">รวมทั้งหมด</div>
                                                        <div className="text-[24px] font-black text-slate-900">{formatNumber(finalDetail.total)}</div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </SoftPanel>

                                    <div className="mt-4 text-[12px] font-bold text-slate-500">
                                        {finalDetail.status === "PENDING_REVIEW" && "ระบบกำลังตรวจสอบสลิป/การชำระเงิน"}
                                        {finalDetail.status === "OVERDUE" && "บิลนี้เกินกำหนดชำระ กรุณาชำระโดยเร็ว"}
                                        {finalDetail.status === "UNPAID" && "บิลนี้ยังไม่ได้ชำระ"}
                                        {finalDetail.status === "PAID" && "บิลนี้ชำระเรียบร้อยแล้ว"}
                                    </div>
                                </div>
                            </CardShell>
                        </div>
                    </>
                )}

                <div className="h-10" />
            </div>
        </div>
    );
}