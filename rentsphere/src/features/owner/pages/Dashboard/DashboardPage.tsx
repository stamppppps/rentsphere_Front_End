<<<<<<< HEAD
const stats = [
  { label: 'ห้องทั้งหมด', value: '128', tone: 'bg-blue-50 text-blue-700 border-blue-100' },
  { label: 'ห้องใช้งาน', value: '114', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { label: 'แจ้งซ่อมค้าง', value: '7', tone: 'bg-amber-50 text-amber-700 border-amber-100' },
  { label: 'บิลค้างชำระ', value: '12', tone: 'bg-rose-50 text-rose-700 border-rose-100' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold text-purple-600">RentSphere Owner</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">แดชบอร์ดเจ้าของ</h1>
          <p className="mt-2 text-sm text-slate-500">ภาพรวมการจัดการคอนโด ห้องพัก และการจองส่วนกลาง</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className={`inline-flex rounded-xl border px-3 py-1 text-xs font-black ${item.tone}`}>{item.label}</div>
              <div className="mt-4 text-3xl font-black text-slate-900">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-black text-slate-900">กิจกรรมล่าสุด</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                มีคำขอจองส่วนกลางใหม่ 3 รายการ
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                ผู้เช่าแจ้งซ่อมใหม่ 1 รายการ
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                บิลค้างชำระเกินกำหนด 12 รายการ
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">ทางลัด</h2>
            <div className="mt-4 space-y-3">
              <button className="w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white hover:bg-purple-700">
                เพิ่มคอนโด
              </button>
              <button className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">
                จัดการห้อง
              </button>
              <button className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700">
                ดูการจองส่วนกลาง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
=======
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
>>>>>>> main
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