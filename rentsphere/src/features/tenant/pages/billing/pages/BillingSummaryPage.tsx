import { ChevronLeft } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type PayStatus = "PAID" | "PENDING_REVIEW" | "OVERDUE" | "UNPAID";
type BillItemKey = "rent" | "water" | "electricity" | "commonFee";
type RangeMonths = 1 | 3 | 6 | 12 | "ALL";

type PaymentRecord = {
    id: string;
    paidAtISO: string;
    monthText: string;
    amount: number;
    status: PayStatus;
    items: Array<{ key: BillItemKey; label: string; amount: number }>;
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
function monthKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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

function thMonthShort(m: number) {
    const arr = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return arr[m - 1] ?? "-";
}
function rangeLabel(r: RangeMonths) {
    if (r === "ALL") return "ทั้งหมด";
    return `${r} เดือน`;
}

export default function BillingSummaryPage() {
    const nav = useNavigate();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 10);
        return () => clearTimeout(t);
    }, []);

    // ===== MOCK DATA =====
    const records: PaymentRecord[] = useMemo(
        () => [
            {
                id: "p-2024-05",
                paidAtISO: "2024-05-10",
                monthText: "พฤษภาคม 2024",
                amount: 4200,
                status: "PENDING_REVIEW",
                items: [
                    { key: "rent", label: "ค่าเช่า", amount: 3500 },
                    { key: "water", label: "ค่าน้ำ", amount: 300 },
                    { key: "electricity", label: "ค่าไฟฟ้า", amount: 350 },
                    { key: "commonFee", label: "ค่าส่วนกลาง", amount: 50 },
                ],
            },
            {
                id: "p-2024-04",
                paidAtISO: "2024-04-07",
                monthText: "เมษายน 2024",
                amount: 4150,
                status: "PAID",
                items: [
                    { key: "rent", label: "ค่าเช่า", amount: 3500 },
                    { key: "water", label: "ค่าน้ำ", amount: 280 },
                    { key: "electricity", label: "ค่าไฟฟ้า", amount: 320 },
                    { key: "commonFee", label: "ค่าส่วนกลาง", amount: 50 },
                ],
            },
            {
                id: "p-2024-03",
                paidAtISO: "2024-03-06",
                monthText: "มีนาคม 2024",
                amount: 4100,
                status: "PAID",
                items: [
                    { key: "rent", label: "ค่าเช่า", amount: 3500 },
                    { key: "water", label: "ค่าน้ำ", amount: 250 },
                    { key: "electricity", label: "ค่าไฟฟ้า", amount: 300 },
                    { key: "commonFee", label: "ค่าส่วนกลาง", amount: 50 },
                ],
            },
            {
                id: "p-2024-02",
                paidAtISO: "2024-02-01",
                monthText: "กุมภาพันธ์ 2024",
                amount: 4080,
                status: "OVERDUE",
                items: [
                    { key: "rent", label: "ค่าเช่า", amount: 3500 },
                    { key: "water", label: "ค่าน้ำ", amount: 240 },
                    { key: "electricity", label: "ค่าไฟฟ้า", amount: 290 },
                    { key: "commonFee", label: "ค่าส่วนกลาง", amount: 50 },
                ],
            },
            {
                id: "p-2024-01",
                paidAtISO: "2024-01-10",
                monthText: "มกราคม 2024",
                amount: 4050,
                status: "PAID",
                items: [
                    { key: "rent", label: "ค่าเช่า", amount: 3500 },
                    { key: "water", label: "ค่าน้ำ", amount: 230 },
                    { key: "electricity", label: "ค่าไฟฟ้า", amount: 270 },
                    { key: "commonFee", label: "ค่าส่วนกลาง", amount: 50 },
                ],
            },
        ],
        []
    );

    const availableYears = useMemo(() => {
        const ys = Array.from(new Set(records.map((r) => new Date(r.paidAtISO).getFullYear()))).sort((a, b) => b - a);
        return ys.length ? ys : [new Date().getFullYear()];
    }, [records]);

    const [year, setYear] = useState<number>(availableYears[0]);
    const [rangeMonths, setRangeMonths] = useState<RangeMonths>(3);

    // period
    const period = useMemo(() => {
        const now = new Date();

        if (rangeMonths === "ALL") {
            const from = new Date(year, 0, 1);
            const to = new Date(year, 11, 31);
            return {
                from,
                to,
                fromText: from.toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" }),
                toText: to.toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" }),
            };
        }

        const endBase = new Date(year, now.getMonth(), 1);
        const to = endOfMonth(endBase);
        const from = startOfMonth(addMonths(to, -(rangeMonths - 1)));
        return {
            from,
            to,
            fromText: from.toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" }),
            toText: to.toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" }),
        };
    }, [year, rangeMonths]);

    const filtered = useMemo(() => {
        return records.filter((r) => inRange(new Date(r.paidAtISO), period.from, period.to));
    }, [records, period]);

    const monthAxis = useMemo(() => {
        const months: Array<{ key: string; year: number; month: number; label: string }> = [];
        let d = startOfMonth(period.from);
        const end = startOfMonth(period.to);

        while (d.getTime() <= end.getTime()) {
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            months.push({
                key: monthKey(d),
                year: y,
                month: m,
                label: `${thMonthShort(m)} ${String(y).slice(-2)}`,
            });
            d = addMonths(d, 1);
        }
        return months;
    }, [period]);

    const monthlySeries = useMemo(() => {
        const map = new Map<string, number>();
        monthAxis.forEach((m) => map.set(m.key, 0));

        filtered.forEach((r) => {
            const d = new Date(r.paidAtISO);
            const k = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
            map.set(k, (map.get(k) ?? 0) + r.amount);
        });

        return monthAxis.map((m) => ({ ...m, value: map.get(m.key) ?? 0 }));
    }, [filtered, monthAxis]);

    const maxValue = useMemo(() => Math.max(1, ...monthlySeries.map((x) => x.value)), [monthlySeries]);

    const summary = useMemo(() => {
        const totalAll = filtered.reduce((s, r) => s + r.amount, 0);
        const totalPaid = filtered.filter((r) => r.status === "PAID").reduce((s, r) => s + r.amount, 0);
        const totalPending = filtered.filter((r) => r.status === "PENDING_REVIEW").reduce((s, r) => s + r.amount, 0);
        const totalOverdue = filtered.filter((r) => r.status === "OVERDUE" || r.status === "UNPAID").reduce((s, r) => s + r.amount, 0);

        const byItem: Record<BillItemKey, number> = { rent: 0, water: 0, electricity: 0, commonFee: 0 };
        filtered.forEach((r) => r.items.forEach((it) => (byItem[it.key] += it.amount)));

        return { totalAll, totalPaid, totalPending, totalOverdue, byItem, count: filtered.length };
    }, [filtered]);

    const lastNonZeroKey = useMemo(() => {
        for (let i = monthlySeries.length - 1; i >= 0; i--) {
            if (monthlySeries[i].value > 0) return monthlySeries[i].key;
        }
        return "";
    }, [monthlySeries]);

    const yTicks = useMemo(() => {
        const t = [0.25, 0.5, 0.75, 1].map((p) => Math.round(maxValue * p));
        return [0, ...t];
    }, [maxValue]);

    const Y_AXIS_W = 56;
    const BAR_W = 52;
    const GAP = 14;
    const TOP_LABEL_H = 72;
    const BAR_AREA_H = 190;
    const X_AXIS_H = 52;
    const GRID_H = TOP_LABEL_H + BAR_AREA_H + X_AXIS_H;

    const scrollContentMinWidth = useMemo(() => {
        const n = monthlySeries.length;
        return n * BAR_W + (n - 1) * GAP;
    }, [monthlySeries.length]);

    return (
        <div className="min-h-screen bg-[#F8FAFF] pb-24">
            <style>{`
        @keyframes pop { 0% { transform: translateY(10px); opacity: 0;} 100% { transform: translateY(0); opacity: 1;} }

        /* optional: ซ่อน scrollbar (ยังเลื่อนได้) */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
                            <div className="text-2xl font-black text-slate-900">สรุปค่าใช้จ่าย</div>
                            <div className="absolute right-0 w-10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 relative">
                {/* Title */}
                <div className={cx("mt-3", mounted ? "opacity-100" : "opacity-0")} style={{ animation: mounted ? "pop .28s ease-out both" : undefined }}>
                    <div className="text-[28px] font-black text-slate-900 leading-tight">ภาพรวมค่าใช้จ่าย</div>
                    <div className="mt-1 text-sm font-bold text-slate-500">เลือกปีและช่วงเวลาเพื่อดูกราฟรายเดือน + สรุปตัวเลข</div>
                </div>

                {/* Filters */}
                <Card className="mt-4 p-4">
                    <div className="text-sm font-black text-slate-800">ช่วงเวลา</div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-[11px] font-bold text-slate-500">ปี</div>
                            <select
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="mt-1 w-full h-[52px] rounded-[18px] bg-white border border-blue-200/70 px-4 text-[16px] font-black text-slate-900 shadow-[0_10px_18px_rgba(15,23,42,0.06)] focus:outline-none focus:ring-2 focus:ring-blue-200/60"
                            >
                                {availableYears.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="text-[11px] font-bold text-slate-500">ช่วงเดือน</div>
                            <div className="mt-1 grid grid-cols-5 gap-1 rounded-[18px] bg-[#F6FAFF] border border-blue-200/70 p-1">
                                {(["ALL", 1, 3, 6, 12] as RangeMonths[]).map((m) => {
                                    const active = rangeMonths === m;
                                    return (
                                        <button
                                            key={String(m)}
                                            type="button"
                                            onClick={() => setRangeMonths(m)}
                                            className={cx(
                                                "h-10 rounded-[14px] text-[12px] font-black transition",
                                                active ? "bg-[#2F6BFF] text-white shadow-sm" : "text-slate-700 hover:bg-white"
                                            )}
                                        >
                                            {m === "ALL" ? "All" : `${m}ด`}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 text-[12px] font-bold text-slate-600">
                        ช่วงที่เลือก: <span className="font-black text-slate-900">{rangeLabel(rangeMonths)}</span>{" "}
                        <span className="text-slate-500">
                            ({period.fromText} - {period.toText})
                        </span>
                    </div>
                </Card>

                <Card className="mt-4 p-5">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <div className="text-[14px] font-black text-slate-900">กราฟรายเดือน</div>
                            <div className="text-[12px] font-bold text-slate-500 mt-1">แสดงยอดรวมต่อเดือน • {summary.count} รายการในช่วงนี้</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[11px] font-bold text-slate-500">ค่าสูงสุด</div>
                            <div className="text-[14px] font-black text-slate-900">{formatNumber(maxValue)} บาท</div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-[18px] border border-blue-100/70 bg-[#F6FAFF] p-4">
                        {/* layout: y-axis (fixed) + scroll area */}
                        <div className="flex gap-3">
                            {/* ===== Y AXIS (fixed) ===== */}
                            <div className="shrink-0" style={{ width: Y_AXIS_W }}>
                                <div className="flex flex-col justify-between" style={{ height: TOP_LABEL_H + BAR_AREA_H }}>
                                    {yTicks
                                        .slice()
                                        .reverse()
                                        .map((t) => (
                                            <div key={t} className="text-[10px] font-black text-slate-500 text-right">
                                                {formatNumber(t)}
                                            </div>
                                        ))}
                                </div>

                                <div style={{ height: X_AXIS_H }} />
                            </div>

                            {/* ===== SCROLL AREA ===== */}
                            <div className="flex-1 min-w-0">
                                <div className="no-scrollbar overflow-x-auto">
                                    <div
                                        className="relative"
                                        style={{
                                            minWidth: scrollContentMinWidth,
                                            height: GRID_H,
                                        }}
                                    >
                                        <div
                                            className="absolute left-0 right-0"
                                            style={{
                                                top: TOP_LABEL_H,
                                                height: BAR_AREA_H,
                                            }}
                                        >
                                            {[0, 25, 50, 75, 100].map((p) => (
                                                <div
                                                    key={p}
                                                    className="absolute left-0 right-0 border-t border-blue-100/70"
                                                    style={{ top: `${100 - p}%` }}
                                                />
                                            ))}
                                        </div>

                                        {/* bars + labels */}
                                        <div
                                            className="absolute inset-0 grid items-end"
                                            style={{
                                                gridTemplateColumns: `repeat(${monthlySeries.length}, ${BAR_W}px)`,
                                                columnGap: GAP,
                                            }}
                                        >
                                            {monthlySeries.map((m) => {
                                                const h = Math.round((m.value / maxValue) * 100);
                                                const isHot = m.key === lastNonZeroKey;

                                                return (
                                                    <div key={m.key} className="flex flex-col items-center">
                                                        {/* ===== TOP VALUE (rotate) ===== */}
                                                        <div className="w-full flex items-end justify-center" style={{ height: TOP_LABEL_H }}>
                                                            <span
                                                                className={cx("text-[11px] font-black text-slate-700 whitespace-nowrap origin-bottom rotate-[-90deg]")}
                                                                title={`${formatNumber(m.value)} บาท`}
                                                            >
                                                                {m.value === 0 ? "0" : formatNumber(m.value)}
                                                            </span>
                                                        </div>

                                                        {/* ===== BAR ===== */}
                                                        <div className="w-full flex items-end" style={{ height: BAR_AREA_H }}>
                                                            <div
                                                                title={`${m.label}: ${formatNumber(m.value)} บาท`}
                                                                className={cx(
                                                                    "w-full rounded-[14px] border transition",
                                                                    "shadow-[0_10px_18px_rgba(15,23,42,0.06)]",
                                                                    m.value > 0 ? "bg-[#2F6BFF] border-blue-200/70" : "bg-white border-blue-100/70",
                                                                    isHot && "ring-2 ring-blue-200"
                                                                )}
                                                                style={{ height: `${Math.max(6, h)}%` }}
                                                            />
                                                        </div>

                                                        {/* ===== X AXIS (2 lines, no overlap) ===== */}
                                                        <div className="w-full flex items-center justify-center" style={{ height: X_AXIS_H }}>
                                                            <div className="text-center leading-[1.05]">
                                                                <div className="text-[12px] font-black text-slate-700">{thMonthShort(m.month)}</div>
                                                                <div className="text-[12px] font-bold text-slate-500">{String(m.year).slice(-2)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 text-[11px] font-bold text-slate-500">
                                    * ถ้าพื้นที่จำกัด สามารถเลื่อนซ้าย-ขวาบนกราฟได้ • เดือนที่ไม่มีรายการจะแสดง 0
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="mt-4 grid grid-cols-1 gap-3">
                    <Card className="p-5">
                        <div className="text-[12px] font-black text-slate-600 tracking-widest">ยอดรวมช่วงนี้</div>
                        <div className="mt-1 text-[34px] font-black text-slate-900 leading-none">
                            {formatNumber(summary.totalAll)} <span className="text-[14px] font-black text-slate-600">บาท</span>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                            <div className="rounded-[16px] bg-emerald-50 border border-emerald-100 p-4">
                                <div className="text-[11px] font-black text-emerald-700">ชำระแล้ว</div>
                                <div className="mt-1 text-[16px] font-black text-slate-900">{formatNumber(summary.totalPaid)}</div>
                            </div>

                            <div className="rounded-[16px] bg-amber-50 border border-amber-100 p-4">
                                <div className="text-[11px] font-black text-amber-800">รอตรวจสอบ</div>
                                <div className="mt-1 text-[16px] font-black text-slate-900">{formatNumber(summary.totalPending)}</div>
                            </div>

                            <div className="rounded-[16px] bg-rose-50 border border-rose-100 p-4">
                                <div className="text-[11px] font-black text-rose-700">ค้างชำระ</div>
                                <div className="mt-1 text-[16px] font-black text-slate-900">{formatNumber(summary.totalOverdue)}</div>
                            </div>
                        </div>

                        <div className="mt-3 text-[11px] font-bold text-slate-500">* ค้างชำระ = OVERDUE/UNPAID ภายในช่วงที่เลือก</div>
                    </Card>

                    <Card className="p-5">
                        <div className="text-[14px] font-black text-slate-900">แยกตามประเภท (ช่วงที่เลือก)</div>
                        <div className="mt-4 space-y-3">
                            {(
                                [
                                    ["rent", "ค่าเช่า"],
                                    ["water", "ค่าน้ำ"],
                                    ["electricity", "ค่าไฟฟ้า"],
                                    ["commonFee", "ค่าส่วนกลาง"],
                                ] as Array<[BillItemKey, string]>
                            ).map(([k, label]) => (
                                <div key={k} className="flex items-center justify-between">
                                    <div className="text-[14px] font-extrabold text-slate-700">{label}</div>
                                    <div className="text-[16px] font-black text-slate-900">{formatNumber(summary.byItem[k])}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="h-10" />
            </div>
        </div>
    );
}