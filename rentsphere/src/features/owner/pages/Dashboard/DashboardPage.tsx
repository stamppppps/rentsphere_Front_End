import OwnerShell from "@/features/owner/components/OwnerShell";
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

function ChartPlaceholder({ height = 220 }: { height?: number }) {
    return (
        <div
            className="relative w-full rounded-2xl border border-slate-200 bg-white"
            style={{ height }}
        >
            <div className="absolute inset-0">
                <div className="absolute left-10 right-6 top-6 border-t border-dashed border-slate-300" />
                <div className="absolute left-10 right-6 top-1/2 border-t border-dashed border-slate-300" />
                <div className="absolute left-10 right-6 bottom-6 border-t border-dashed border-slate-300" />

                <div className="absolute left-3 top-4 text-xs font-bold text-slate-500">2</div>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    1
                </div>
                <div className="absolute left-3 bottom-4 text-xs font-bold text-slate-500">0</div>
            </div>

            <div className="absolute left-10 right-6 bottom-6">
                <div className="h-px w-full bg-emerald-500/70" />
                <div className="mt-2 grid grid-cols-12 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-600" />
                            <span className="text-[10px] font-bold text-slate-500">
                                {String(i + 1).padStart(2, "0")}/2025
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const nav = useNavigate();

    const condoName = "สวัสดีคอนโด";

    const stats = useMemo<Stat[]>(
        () => [
            { label: "ห้องว่าง", value: 5 },
            { label: "ใบแจ้งหนี้ค้างชำระ", value: 0 },
            { label: "รอการซ่อม", value: 0 },
        ],
        []
    );

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
                        legend={[
                            { label: "ใบเสร็จรับเงิน", dotClass: "bg-emerald-600" },
                            { label: "ใบแจ้งหนี้", dotClass: "bg-indigo-600" },
                        ]}
                    >
                        <ChartPlaceholder height={240} />
                    </ChartShell>

                    <ChartShell title="ค่าเช่า">
                        <ChartPlaceholder height={240} />
                    </ChartShell>

                    <ChartShell title="ค่าไฟ">
                        <ChartPlaceholder height={240} />
                    </ChartShell>

                    <ChartShell title="ค่าน้ำ">
                        <ChartPlaceholder height={240} />
                    </ChartShell>
                </div>
            </div>
        </OwnerShell>
    );
}