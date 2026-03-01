import { ChevronLeft, Search, SlidersHorizontal, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type RangeMonths = 1 | 3 | 6 | 12 | "ALL";
type PayStatus = "PAID" | "PENDING_REVIEW";

type PaymentHistory = {
    id: string; // ต้องตรงกับ key ใน HistoryDetail
    monthText: string;
    amount: number;
    status: PayStatus;
    paidAtISO: string;
};

function cx(...cls: Array<string | false | undefined | null>) {
    return cls.filter(Boolean).join(" ");
}
function formatNumber(n: number) {
    return n.toLocaleString("th-TH");
}

function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addMonths(d: Date, m: number) {
    return new Date(d.getFullYear(), d.getMonth() + m, 1);
}
function inRange(date: Date, from: Date, to: Date) {
    return date.getTime() >= from.getTime() && date.getTime() <= to.getTime();
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cx(
                "bg-white rounded-[18px] shadow-[0_14px_40px_rgba(15,23,42,0.08)] border border-blue-100/60 overflow-hidden",
                className
            )}
        >
            {children}
        </div>
    );
}

function StatusPill({ status }: { status: PayStatus }) {
    const cls =
        status === "PAID"
            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
            : "bg-amber-100 text-amber-800 border-amber-200";
    const text = status === "PAID" ? "ชำระแล้ว" : "รอตรวจสอบ";
    return <span className={cx("px-4 py-2 rounded-full border text-xs font-black whitespace-nowrap", cls)}>{text}</span>;
}

function rangeLabel(r: RangeMonths) {
    if (r === "ALL") return "ทั้งหมด";
    return `${r} เดือน`;
}

export default function BillingHistoryPage() {
    const nav = useNavigate();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 10);
        return () => clearTimeout(t);
    }, []);

    // MOCK DATA (id ต้องตรงกับ Detail)
    const historyAll: PaymentHistory[] = useMemo(
        () => [
            { id: "h-2024-05", monthText: "พฤษภาคม 2024", amount: 4200, status: "PENDING_REVIEW", paidAtISO: "2024-05-10" },
            { id: "h-2024-04", monthText: "เมษายน 2024", amount: 4150, status: "PAID", paidAtISO: "2024-04-07" },
            { id: "h-2024-03", monthText: "มีนาคม 2024", amount: 4100, status: "PAID", paidAtISO: "2024-03-06" },
            { id: "h-2024-02", monthText: "กุมภาพันธ์ 2024", amount: 4080, status: "PAID", paidAtISO: "2024-02-09" },
            { id: "h-2024-01", monthText: "มกราคม 2024", amount: 4050, status: "PAID", paidAtISO: "2024-01-10" },
            { id: "h-2023-12", monthText: "ธันวาคม 2023", amount: 4000, status: "PAID", paidAtISO: "2023-12-10" },
        ],
        []
    );

    // ===== Filters =====
    const [range, setRange] = useState<RangeMonths>("ALL");
    const [q, setQ] = useState("");

    const period = useMemo(() => {
        if (range === "ALL") return null;

        const now = new Date();
        const to = endOfMonth(now);
        const from = startOfMonth(addMonths(to, -(range - 1)));

        return { from, to };
    }, [range]);

    const filtered = useMemo(() => {
        const sorted = [...historyAll].sort((a, b) => new Date(b.paidAtISO).getTime() - new Date(a.paidAtISO).getTime());

        const byRange = period === null ? sorted : sorted.filter((h) => inRange(new Date(h.paidAtISO), period.from, period.to));

        const keyword = q.trim().toLowerCase();
        if (!keyword) return byRange;

        return byRange.filter((h) => {
            const hay = `${h.monthText} ${h.amount} ${h.status}`.toLowerCase();
            return hay.includes(keyword);
        });
    }, [historyAll, period, q]);

    // ===== Summary numbers =====
    const summary = useMemo(() => {
        const total = filtered.reduce((s, r) => s + r.amount, 0);
        const paid = filtered.filter((r) => r.status === "PAID").reduce((s, r) => s + r.amount, 0);
        const pending = filtered.filter((r) => r.status === "PENDING_REVIEW").reduce((s, r) => s + r.amount, 0);
        return { total, paid, pending, count: filtered.length };
    }, [filtered]);

    const goDetail = (h: PaymentHistory) => {
        nav(`/tenant/billing/history/${h.id}`, {
            state: {
                historyId: h.id,
                monthText: h.monthText,
                amount: h.amount,
                status: h.status,
                paidAtISO: h.paidAtISO,
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFF] pb-24">
            <style>{`
        @keyframes pop { 0% { transform: translateY(10px); opacity: 0;} 100% { transform: translateY(0); opacity: 1;} }
      `}</style>

            {/* soft glow */}
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

                            <div className="text-2xl font-black text-slate-900">ประวัติการชำระเงิน</div>
                            <div className="absolute right-0 w-10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 relative">
                {/* Header */}
                <div className={cx("mt-3", mounted ? "opacity-100" : "opacity-0")} style={{ animation: mounted ? "pop .28s ease-out both" : undefined }}>
                    <div className="text-[28px] font-black text-slate-900 leading-tight">รายการทั้งหมด</div>
                    <div className="mt-1 text-sm font-bold text-slate-500">กรองช่วงเวลา + ค้นหาได้</div>
                </div>

                {/* Filters card */}
                <Card className="mt-4 p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-black text-slate-900 inline-flex items-center gap-2">
                            <SlidersHorizontal size={16} className="text-[#2F6BFF]" />
                            ตัวกรอง
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setRange("ALL");
                                setQ("");
                            }}
                            className="text-xs font-black text-slate-500 underline underline-offset-4 hover:text-slate-700"
                        >
                            ล้างตัวกรอง
                        </button>
                    </div>

                    {/* Range pills */}
                    <div className="mt-3 grid grid-cols-5 gap-2">
                        {(["ALL", 1, 3, 6, 12] as RangeMonths[]).map((r) => {
                            const active = range === r;
                            return (
                                <button
                                    key={String(r)}
                                    type="button"
                                    onClick={() => setRange(r)}
                                    className={cx(
                                        "h-10 rounded-[16px] border text-[12px] font-black transition",
                                        active
                                            ? "bg-[#2F6BFF] text-white border-blue-200/60 shadow-[0_10px_18px_rgba(47,107,255,0.18)]"
                                            : "bg-white text-slate-700 border-blue-100/70 hover:bg-[#F6FAFF]"
                                    )}
                                >
                                    {rangeLabel(r)}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search */}
                    <div className="mt-3 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="ค้นหา เช่น เมษายน, 4150, รอตรวจสอบ..."
                            className="w-full h-[52px] rounded-[18px] bg-white border border-blue-200/70 pl-11 pr-11 text-[14px] font-bold text-slate-900 shadow-[0_10px_18px_rgba(15,23,42,0.06)] outline-none focus:ring-2 focus:ring-blue-200/60"
                        />
                        {!!q && (
                            <button
                                type="button"
                                onClick={() => setQ("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[14px] bg-[#F6FAFF] border border-blue-100/70 flex items-center justify-center active:scale-95 transition"
                                aria-label="Clear search"
                            >
                                <X size={16} className="text-slate-500" />
                            </button>
                        )}
                    </div>

                    {/* mini summary */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-[16px] bg-[#F6FAFF] border border-blue-100/70 p-3">
                            <div className="text-[11px] font-black text-slate-600">รวม</div>
                            <div className="mt-1 text-[16px] font-black text-slate-900">{formatNumber(summary.total)}</div>
                        </div>
                        <div className="rounded-[16px] bg-emerald-50 border border-emerald-100 p-3">
                            <div className="text-[11px] font-black text-emerald-700">ชำระแล้ว</div>
                            <div className="mt-1 text-[16px] font-black text-slate-900">{formatNumber(summary.paid)}</div>
                        </div>
                        <div className="rounded-[16px] bg-amber-50 border border-amber-100 p-3">
                            <div className="text-[11px] font-black text-amber-800">รอตรวจสอบ</div>
                            <div className="mt-1 text-[16px] font-black text-slate-900">{formatNumber(summary.pending)}</div>
                        </div>
                    </div>

                    <div className="mt-2 text-[11px] font-bold text-slate-500">
                        แสดง {summary.count} รายการ • ช่วง: <span className="font-black">{rangeLabel(range)}</span>
                        {period && (
                            <span className="text-slate-400">
                                {" "}
                                ({period.from.toLocaleDateString("th-TH")} - {period.to.toLocaleDateString("th-TH")})
                            </span>
                        )}
                    </div>
                </Card>

                {/* List */}
                <div className="mt-4">
                    <Card>
                        {filtered.length === 0 ? (
                            <div className="p-6 text-sm font-bold text-slate-500">ไม่พบรายการตามตัวกรองที่เลือก</div>
                        ) : (
                            <div className="py-1">
                                {filtered.map((h, idx) => (
                                    <div key={h.id}>
                                        <button
                                            type="button"
                                            onClick={() => goDetail(h)}
                                            className={cx(
                                                "w-full text-left px-4 py-4 flex items-center justify-between transition",
                                                "hover:bg-[#F6F9FF]",
                                                "active:scale-[0.995]"
                                            )}
                                        >
                                            <div className="min-w-0">
                                                <div className="text-[18px] font-black text-slate-900 truncate">{h.monthText}</div>
                                                <div className="mt-1 text-xs font-bold text-slate-500">
                                                    วันที่: {new Date(h.paidAtISO).toLocaleDateString("th-TH")} • ยอด {formatNumber(h.amount)} บาท
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex items-center gap-2">
                                                <StatusPill status={h.status} />
                                            </div>
                                        </button>

                                        {idx !== filtered.length - 1 && <div className="mx-4 h-px bg-blue-100/70" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                <div className="h-10" />
            </div>
        </div>
    );
}