import OwnerShell from "@/features/owner/components/OwnerShell";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Stat = { label: string; value: number | string };
type LegendItem = { label: string; dotClass: string };

/* ================= UI  ================= */
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

/* ================= chart utils  ================= */
function makeSeededRng(seed: number) {
    let s = seed >>> 0;
    return () => {
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

function Bars1Series({ labels, v, unit = "฿" }: { labels: string[]; v: number[]; unit?: string }) {
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

/* ================= Backend types =================
    ปรับ field ให้ตรงbackend
*/
type DashboardSummary = {
    condoId: string;
    condoName: string;

    roomsTotal: number;
    roomsActive: number;

    occupiedRooms: number;
    vacantRooms: number;

    avgRentPrice: number;
};

type DashboardSeries12 = {
    labels: string[]; // MM/YYYY จำนวน12ตัว
    invoices: number[]; // ใบแจ้งหนี้
    receipts: number[]; // ใบเสร็จรับเงิน
    rent: number[];     // ยอดค่าเช่า
    elec: number[];     // ค่าไฟ
    water: number[];    // ค่าน้ำ
};

type DashboardResponse = {
    summary: DashboardSummary;
    series12?: DashboardSeries12;
};

type CondoLite = { id: string; name: string };

/* ================= Backend calls (แก้ URLให้ตรง) ================= */
async function fetchMyCondos(): Promise<CondoLite[]> {
    const res = await fetch("/api/owner/condos", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data.map((x: any) => ({ id: String(x.id), name: String(x.name) }));
    if (Array.isArray(data?.items)) return data.items.map((x: any) => ({ id: String(x.id), name: String(x.name) }));
    return [];
}

async function fetchDashboard(condoId: string): Promise<DashboardResponse> {
    // แก้ endpoint ตรงนี้ให้ตรง backend
    // ex: GET /api/owner/condos/:id/dashboard
    const res = await fetch(`/api/owner/condos/${encodeURIComponent(condoId)}/dashboard`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("โหลดข้อมูล Dashboard ไม่สำเร็จ");
    return (await res.json()) as DashboardResponse;
}

/* ================= Page ================= */
type LocationState = { condoId?: string } | null;

export default function DashboardPage() {
    const nav = useNavigate();
    const location = useLocation();

    const state = (location.state ?? null) as LocationState;
    const condoIdFromState = state?.condoId;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [condoId, setCondoId] = useState<string | null>(condoIdFromState ?? null);
    const [data, setData] = useState<DashboardResponse | null>(null);

    // 1)ถ้าไม่มี condoId ที่ส่งมา ไปเอาคอนโดแรกของ user เป็นdefault
    useEffect(() => {
        let cancelled = false;

        const ensureCondoId = async () => {
            if (condoId) return;
            try {
                setLoading(true);
                setError(null);

                const condos = await fetchMyCondos();
                if (cancelled) return;

                if (condos.length === 0) {
                    setLoading(false);
                    setData(null);
                    setError(null);
                    return;
                }

                setCondoId(condos[0].id);
            } catch (e: any) {
                if (cancelled) return;
                setError(e?.message ?? "เกิดข้อผิดพลาด");
                setLoading(false);
            }
        };

        ensureCondoId();
        return () => {
            cancelled = true;
        };
    }, [condoId]);

    // 2)โหลด dashboard ตาม condoId
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!condoId) return;

            try {
                setLoading(true);
                setError(null);

                const res = await fetchDashboard(condoId);
                if (cancelled) return;

                setData(res);
                setLoading(false);
            } catch (e: any) {
                if (cancelled) return;
                setData(null);
                setError(e?.message ?? "เกิดข้อผิดพลาด");
                setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [condoId]);

    const summary = useMemo(() => {
        if (!data?.summary) return null;
        return data.summary;
    }, [data]);

    const stats = useMemo<Stat[]>(() => {
        if (!summary) return [];
        return [
            { label: "ห้องว่าง", value: summary.vacantRooms },
            { label: "ห้องมีผู้เช่า", value: summary.occupiedRooms },
            { label: "ห้องใช้งาน / ทั้งหมด", value: `${summary.roomsActive}/${summary.roomsTotal}` },
        ];
    }, [summary]);

    // 3)series: ถ้า backend ส่ง series12 มาแล้วใช้เลย
    //    ถ้ายังไม่ส่ง → fallback เป็น “สมมติ” แบบเดิมจาก summary เพื่อไม่ให้หน้าโล่ง
    const charts = useMemo(() => {
        const labels = getLast12MonthsLabels();

        if (data?.series12 && data.series12.labels?.length === 12) {
            return data.series12;
        }

        const occupied = summary?.occupiedRooms ?? 0;
        const active = summary?.roomsActive ?? 0;
        const avgPrice = summary?.avgRentPrice ?? 3500;

        const seed = Math.floor(active * 1000 + occupied * 777 + avgPrice);
        const rnd = makeSeededRng(seed);

        const invoices: number[] = [];
        const receipts: number[] = [];
        const rent: number[] = [];
        const elec: number[] = [];
        const water: number[] = [];

        for (let i = 0; i < 12; i++) {
            const season = 0.9 + 0.25 * Math.sin((i / 12) * Math.PI * 2);
            const noise = 0.85 + rnd() * 0.35;

            const inv = clamp(Math.round(occupied * (0.8 + rnd() * 0.6)), 0, active || 1);
            const paidRate = 0.85 + rnd() * 0.15;
            const rec = Math.round(inv * paidRate);

            invoices.push(inv);
            receipts.push(rec);

            const baseRent = occupied * avgPrice;
            rent.push(Math.round(baseRent * season * noise));

            const elecPerRoom = 280 + rnd() * 220;
            const waterPerRoom = 90 + rnd() * 70;
            elec.push(Math.round(occupied * elecPerRoom * season));
            water.push(Math.round(occupied * waterPerRoom * season));
        }

        return { labels, invoices, receipts, rent, elec, water };
    }, [data, summary]);

    const condoName = summary?.condoName ?? "—";

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

                {/* ===== states ===== */}
                {loading && (
                    <div className="rounded-2xl bg-white border border-blue-100/70 shadow-sm px-6 py-8 text-center">
                        <div className="text-sm font-extrabold text-gray-600">กำลังโหลดข้อมูล Dashboard...</div>
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-2xl bg-rose-50 border border-rose-200 shadow-sm px-6 py-6">
                        <div className="font-extrabold text-rose-700">โหลดข้อมูลไม่สำเร็จ</div>
                        <div className="mt-1 text-sm font-bold text-rose-600">{error}</div>

                        <button
                            type="button"
                            onClick={() => {
                                // reloadแบบง่าย
                                setCondoId((x) => (x ? `${x}` : x));
                            }}
                            className="mt-4 h-[44px] px-6 rounded-xl bg-white border border-rose-200 text-rose-700 font-extrabold text-sm shadow-sm hover:bg-rose-100/40 active:scale-[0.98]"
                        >
                            ลองใหม่
                        </button>
                    </div>
                )}

                {!loading && !error && !summary && (
                    <div className="rounded-2xl bg-white border border-blue-100/70 shadow-sm px-6 py-8 text-center">
                        <div className="text-lg font-extrabold text-gray-900">ยังไม่มีคอนโดในระบบ</div>
                        <div className="mt-2 text-sm font-bold text-gray-600">
                            กรุณาเพิ่มคอนโดก่อน แล้วค่อยกลับมาดู Dashboard
                        </div>

                        <button
                            type="button"
                            onClick={() => nav("/owner/add-condo/step-0")}
                            className="mt-5 h-[46px] px-10 rounded-xl border-0 text-white font-extrabold text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
                         !bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98]"
                        >
                            เพิ่มคอนโดมิเนียม
                        </button>
                    </div>
                )}

                {/* ===== content ===== */}
                {!loading && !error && summary && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {stats.map((s) => (
                                <StatTile key={s.label} stat={s} />
                            ))}
                        </div>

                        <div className="mt-6 space-y-6">
                            <ChartShell
                                title="รายการใบแจ้งหนี้ / รับเงิน ย้อนหลัง 12 เดือน"
                                subtitle={`อ้างอิงจากห้องมีผู้เช่า ${summary.occupiedRooms} ห้อง`}
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

                            <ChartShell
                                title="ค่าเช่า"
                                subtitle={`ราคาเฉลี่ย ~ ${Math.round(summary.avgRentPrice).toLocaleString()} บาท/ห้อง`}
                            >
                                <Bars1Series labels={charts.labels} v={charts.rent} unit="บาท" />
                            </ChartShell>

                            <ChartShell title="ค่าไฟ" subtitle="อิงตามจำนวนห้องที่มีผู้เช่า + ความผันผวนรายเดือน">
                                <Bars1Series labels={charts.labels} v={charts.elec} unit="บาท" />
                            </ChartShell>

                            <ChartShell title="ค่าน้ำ" subtitle="อิงตามจำนวนห้องที่มีผู้เช่า + ความผันผวนรายเดือน">
                                <Bars1Series labels={charts.labels} v={charts.water} unit="บาท" />
                            </ChartShell>
                        </div>
                    </>
                )}
            </div>
        </OwnerShell>
    );
}