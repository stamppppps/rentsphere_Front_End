import OwnerShell from "@/features/owner/components/OwnerShell";
import { useAddCondoStore } from "@/features/owner/pages/AddCondo/store/addCondo.store";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

type Stat = { label: string; value: number | string };
type LegendItem = { label: string; dotClass: string };

function StatTile({ stat }: { stat: Stat }) {
    return (
        <div className="rounded-2xl bg-white border border-blue-100/70 shadow-sm px-6 py-5 text-center">
            <div className="text-4xl font-black text-indigo-700">{stat.value}</div>
            <div className="mt-1 text-sm font-bold text-gray-600">{stat.label}</div>
        </div>
    );
}

function PanelHeader({
    title,
    subtitle,
    right,
}: {
    title: string;
    subtitle?: string;
    right?: React.ReactNode;
}) {
    return (
        <div className="px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/70 flex items-center justify-between gap-4">
            <div>
                <div className="text-lg font-extrabold text-gray-900">{title}</div>
                {subtitle && <div className="mt-1 text-sm font-bold text-gray-600">{subtitle}</div>}
            </div>
            {right}
        </div>
    );
}

function ChartShell({
    title,
    subtitle,
    legend,
    children,
}: {
    title: string;
    subtitle?: string;
    legend?: LegendItem[];
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden">
            <PanelHeader
                title={title}
                subtitle={subtitle}
                right={
                    legend && legend.length > 0 ? (
                        <div className="flex items-center gap-4 text-xs font-extrabold text-gray-700">
                            {legend.map((l) => (
                                <div key={l.label} className="flex items-center gap-2">
                                    <span className={`h-2.5 w-2.5 rounded-full ${l.dotClass}`} />
                                    <span>{l.label}</span>
                                </div>
                            ))}
                        </div>
                    ) : null
                }
            />
            <div className="p-6">{children}</div>
        </div>
    );
}

/** ====== Deterministic pseudo-random ====== */
function makeSeededRng(seed: number) {
    let s = seed >>> 0;
    return () => {
        // LCG
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

function clamp(n: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, n));
}

function formatMonth(d: Date) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${mm}/${yy}`;
}

function getLast12MonthsLabels() {
    const now = new Date();
    const arr: string[] = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        arr.push(formatMonth(d));
    }
    return arr;
}

/** ====== Simple Bars Chart (2 series) ====== */
function Bars2Series({
    labels,
    a,
    b,
    aLabel,
    bLabel,
}: {
    labels: string[];
    a: number[];
    b: number[];
    aLabel: string;
    bLabel: string;
}) {
    const maxV = Math.max(1, ...a, ...b);

    return (
        <div className="w-full">
            <div className="relative w-full rounded-2xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-12 gap-2 items-end" style={{ height: 240 }}>
                    {labels.map((lb, i) => {
                        const ah = (a[i] / maxV) * 100;
                        const bh = (b[i] / maxV) * 100;

                        return (
                            <div key={lb} className="flex flex-col items-center justify-end h-full gap-2">
                                <div className="w-full flex items-end justify-center gap-1">
                                    <div
                                        className="w-3 rounded-t-md bg-emerald-600/90"
                                        style={{ height: `${ah}%` }}
                                        title={`${aLabel}: ${a[i].toLocaleString()}`}
                                    />
                                    <div
                                        className="w-3 rounded-t-md bg-indigo-600/90"
                                        style={{ height: `${bh}%` }}
                                        title={`${bLabel}: ${b[i].toLocaleString()}`}
                                    />
                                </div>
                                <div className="text-[10px] font-bold text-slate-500">{lb}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/** ====== Simple 1-series Bars (money) ====== */
function Bars1Series({
    labels,
    v,
    unit = "฿",
}: {
    labels: string[];
    v: number[];
    unit?: string;
}) {
    const maxV = Math.max(1, ...v);

    return (
        <div className="w-full">
            <div className="relative w-full rounded-2xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-12 gap-2 items-end" style={{ height: 240 }}>
                    {labels.map((lb, i) => {
                        const h = (v[i] / maxV) * 100;
                        return (
                            <div key={lb} className="flex flex-col items-center justify-end h-full gap-2">
                                <div
                                    className="w-6 rounded-t-lg bg-blue-600/85"
                                    style={{ height: `${h}%` }}
                                    title={`${v[i].toLocaleString()} ${unit}`}
                                />
                                <div className="text-[10px] font-bold text-slate-500">{lb}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const nav = useNavigate();
    const { rooms } = useAddCondoStore();

    const condoName = "สวัสดีคอนโด";

    const summary = useMemo(() => {
        const activeRooms = rooms.filter((r) => r.isActive);
        const total = rooms.length;
        const active = activeRooms.length;

        const occupied = activeRooms.filter((r) => r.status === "OCCUPIED").length;
        const vacant = activeRooms.filter((r) => r.status === "VACANT").length;

        const defaultPrice = 3500;
        const prices = activeRooms.map((r) => (typeof r.price === "number" ? r.price : defaultPrice));
        const avgPrice = prices.length ? prices.reduce((s, x) => s + x, 0) / prices.length : defaultPrice;

        return { total, active, occupied, vacant, avgPrice };
    }, [rooms]);

    const stats = useMemo<Stat[]>(
        () => [
            { label: "ห้องว่าง", value: summary.vacant },
            { label: "ห้องมีผู้เช่า", value: summary.occupied },
            { label: "ห้องใช้งาน / ทั้งหมด", value: `${summary.active}/${summary.total}` },
        ],
        [summary]
    );

    const charts = useMemo(() => {
        const labels = getLast12MonthsLabels();
        const seed = Math.floor(summary.active * 1000 + summary.occupied * 777 + summary.avgPrice);
        const rnd = makeSeededRng(seed);


        const invoices: number[] = [];
        const receipts: number[] = [];

        const rent: number[] = [];
        const elec: number[] = [];
        const water: number[] = [];

        for (let i = 0; i < 12; i++) {
            const season = 0.9 + 0.25 * Math.sin((i / 12) * Math.PI * 2);
            const noise = 0.85 + rnd() * 0.35;

            const inv = clamp(Math.round(summary.occupied * (0.8 + rnd() * 0.6)), 0, summary.active || 1);
            const paidRate = 0.85 + rnd() * 0.15;
            const rec = Math.round(inv * paidRate);

            invoices.push(inv);
            receipts.push(rec);

            const baseRent = summary.occupied * summary.avgPrice;
            rent.push(Math.round(baseRent * season * noise));

            const elecPerRoom = 280 + rnd() * 220;
            const waterPerRoom = 90 + rnd() * 70;
            elec.push(Math.round(summary.occupied * elecPerRoom * season));
            water.push(Math.round(summary.occupied * waterPerRoom * season));
        }

        return { labels, invoices, receipts, rent, elec, water };
    }, [summary]);

    return (
        <OwnerShell title="ข้อมูลภาพรวม" activeKey="dashboard" showSidebar={true}>
            <div className="rounded-3xl border border-blue-100/60 bg-gradient-to-b from-[#EAF2FF] to-white/60 p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-bold text-gray-500">
                        คอนโดมิเนียม : <span className="text-gray-800">{condoName}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => nav("/owner/settings")}
                        className="text-sm font-extrabold text-gray-600 underline underline-offset-4 hover:text-gray-900"
                    >
                        ไปที่การตั้งค่าระบบ
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map((s) => (
                        <StatTile key={s.label} stat={s} />
                    ))}
                </div>

                <div className="mt-6 space-y-6">
                    <ChartShell
                        title="รายการใบแจ้งหนี้ / รับเงิน ย้อนหลัง 12 เดือน"
                        subtitle={`อ้างอิงจากห้องมีผู้เช่า ${summary.occupied} ห้อง`}
                        legend={[
                            { label: "ใบเสร็จรับเงิน", dotClass: "bg-emerald-600" },
                            { label: "ใบแจ้งหนี้", dotClass: "bg-indigo-600" },
                        ]}
                    >
                        <Bars2Series
                            labels={charts.labels}
                            a={charts.receipts}
                            b={charts.invoices}
                            aLabel="ใบเสร็จรับเงิน"
                            bLabel="ใบแจ้งหนี้"
                        />
                    </ChartShell>

                    <ChartShell title="ค่าเช่า (สมมติ)" subtitle={`ราคาเฉลี่ย ~ ${Math.round(summary.avgPrice).toLocaleString()} บาท/ห้อง`}>
                        <Bars1Series labels={charts.labels} v={charts.rent} unit="บาท" />
                    </ChartShell>

                    <ChartShell title="ค่าไฟ (สมมติ)" subtitle="อิงตามจำนวนห้องที่มีผู้เช่า + ความผันผวนรายเดือน">
                        <Bars1Series labels={charts.labels} v={charts.elec} unit="บาท" />
                    </ChartShell>

                    <ChartShell title="ค่าน้ำ (สมมติ)" subtitle="อิงตามจำนวนห้องที่มีผู้เช่า + ความผันผวนรายเดือน">
                        <Bars1Series labels={charts.labels} v={charts.water} unit="บาท" />
                    </ChartShell>
                </div>
            </div>
        </OwnerShell>
    );
}