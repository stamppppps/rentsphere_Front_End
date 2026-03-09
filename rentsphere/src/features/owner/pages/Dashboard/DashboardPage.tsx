import OwnerShell from "@/features/owner/components/OwnerShell";
import { useCondoStore } from "@/features/owner/stores/condoStore";
import { api } from "@/shared/api/http";
import {
  BadgeDollarSign,
  Building2,
  CircleDollarSign,
  Droplets,
  Home,
  Users,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

type Stat = {
  label: string;
  value: number | string;
  sub?: string;
  icon?: React.ReactNode;
};

type LegendItem = {
  label: string;
  dotClass: string;
};

/* ================= UI ================= */
function KpiCard({ stat }: { stat: Stat }) {
  return (
    <div className="rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[12px] font-black uppercase tracking-[0.14em] text-slate-400">
            {stat.label}
          </div>
          <div className="mt-2 text-[30px] leading-none font-black text-slate-900">
            {stat.value}
          </div>
          {stat.sub && (
            <div className="mt-2 text-[13px] font-bold text-slate-500">
              {stat.sub}
            </div>
          )}
        </div>

        {stat.icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#2F6BFF] shadow-inner">
            {stat.icon}
          </div>
        )}
      </div>
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
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
      <div>
        <div className="text-[18px] font-black text-slate-900">{title}</div>
        {subtitle && (
          <div className="mt-1 text-[13px] font-bold text-slate-500">
            {subtitle}
          </div>
        )}
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
    <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <PanelHeader
        title={title}
        subtitle={subtitle}
        right={
          legend && legend.length > 0 ? (
            <div className="flex flex-wrap items-center justify-end gap-3 text-[12px] font-extrabold text-slate-600">
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

function EmptyChartState({ text }: { text: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-500">
      {text}
    </div>
  );
}

function OccupancyCard({
  occupied,
  vacant,
  total,
}: {
  occupied: number;
  vacant: number;
  total: number;
}) {
  const occupiedPct = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const vacantPct = total > 0 ? Math.round((vacant / total) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <PanelHeader
        title="สถานะห้องพัก"
        subtitle="ภาพรวม occupancy ของคอนโด"
      />

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="text-[12px] font-black uppercase tracking-[0.14em] text-emerald-700">
              ห้องมีผู้เช่า
            </div>
            <div className="mt-2 text-[28px] font-black text-slate-900">
              {occupied}
            </div>
            <div className="mt-2 text-[13px] font-bold text-emerald-700">
              {occupiedPct}% ของทั้งหมด
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="text-[12px] font-black uppercase tracking-[0.14em] text-amber-700">
              ห้องว่าง
            </div>
            <div className="mt-2 text-[28px] font-black text-slate-900">
              {vacant}
            </div>
            <div className="mt-2 text-[13px] font-bold text-amber-700">
              {vacantPct}% ของทั้งหมด
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-[13px] font-bold text-slate-500">
            <span>Occupancy Rate</span>
            <span>{occupiedPct}%</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2F6BFF] to-emerald-500"
              style={{ width: `${occupiedPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DonutChart({
  items,
  size = 240,
  strokeWidth = 28,
}: {
  items: Array<{ label: string; value: number; color: string }>;
  size?: number;
  strokeWidth?: number;
}) {
  const safeItems = items.map((item) => ({
    ...item,
    value: Number(item.value || 0),
  }));

  const total = safeItems.reduce((sum, item) => sum + item.value, 0);
  const safeTotal = Math.max(total, 1);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative mx-auto shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E9EEF7"
            strokeWidth={strokeWidth}
          />

          {safeItems
            .filter((item) => item.value > 0)
            .map((item) => {
              const fraction = item.value / safeTotal;
              const dashLength = fraction * circumference;
              const dashOffset = circumference - cumulative * circumference;
              cumulative += fraction;

              return (
                <circle
                  key={item.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                />
              );
            })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[12px] font-black uppercase tracking-[0.16em] text-slate-400">
            Total
          </div>
          <div className="mt-1 text-[30px] leading-none font-black text-slate-900">
            {total.toLocaleString()}
          </div>
          <div className="mt-1 text-[13px] font-bold text-slate-500">บาท</div>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {safeItems.map((item) => {
          const rawPercent = total > 0 ? (item.value / total) * 100 : 0;

          const percentText =
            rawPercent === 0
              ? "0%"
              : rawPercent < 1
                ? "<1%"
                : `${rawPercent.toFixed(2)}%`;

          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[14px] font-extrabold text-slate-700">
                  {item.label}
                </span>
              </div>

              <div className="text-right">
                <div className="text-[15px] font-black text-slate-900">
                  {percentText}
                </div>
                <div className="text-[12px] font-bold text-slate-500">
                  {item.value.toLocaleString()} บาท
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Bars1Series({
  labels,
  v,
  unit = "฿",
  colorClass = "bg-[#2F6BFF]",
}: {
  labels: string[];
  v: number[];
  unit?: string;
  colorClass?: string;
}) {
  const safeV = v.map((n) => Number(n || 0));
  const maxV = Math.max(1, ...safeV);

  const steps = 5;
  const yTicks = Array.from({ length: steps + 1 }, (_, i) =>
    Math.round(maxV - (i * maxV) / steps)
  );

  return (
    <div className="w-full overflow-x-auto">
      <div
        className="rounded-[24px] border border-slate-200 bg-[#FCFDFF] p-5"
        style={{ minWidth: Math.max(860, labels.length * 90) }}
      >
        <div className="relative pl-14 pr-2">
          {yTicks.map((tick, idx) => {
            const top = (idx / steps) * 100;
            return (
              <div
                key={`y-label-${idx}`}
                className="absolute left-0 -translate-y-1/2 text-[11px] font-bold text-slate-400"
                style={{ top: `${top}%` }}
              >
                {tick.toLocaleString()}
              </div>
            );
          })}

          {yTicks.map((_, idx) => {
            const top = (idx / steps) * 100;
            return (
              <div
                key={`grid-${idx}`}
                className="absolute left-14 right-0 border-t border-dashed border-slate-200"
                style={{ top: `${top}%` }}
              />
            );
          })}

          <div
            className="grid items-end gap-4"
            style={{
              gridTemplateColumns: `repeat(${labels.length}, minmax(58px, 1fr))`,
              height: 300,
            }}
          >
            {labels.map((lb, i) => {
              const value = safeV[i] ?? 0;
              const h = (value / maxV) * 100;
              const finalHeight = value > 0 ? Math.max(12, h) : 0;

              return (
                <div
                  key={`${lb}-${i}`}
                  className="flex h-full flex-col items-center justify-end"
                >
                  <div className="relative w-full flex-1">
                    <div className="absolute inset-x-0 bottom-0 flex h-full items-end justify-center">
                      <div className="relative flex w-8 h-full items-end justify-center">
                        {value > 0 && (
                          <>
                            <div className="absolute -top-6 text-[11px] font-black text-slate-700">
                              {value.toLocaleString()}
                            </div>
                            <div
                              className={`w-8 rounded-t-xl shadow-sm ${colorClass}`}
                              style={{ height: `${finalHeight}%` }}
                              title={`${value.toLocaleString()} ${unit}`}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 h-14 w-full flex items-start justify-center">
                    <span className="origin-top whitespace-nowrap rotate-[-38deg] text-[11px] font-black text-slate-500">
                      {lb}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Backend types ================= */
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
  labels: string[];
  invoices: number[];
  receipts: number[];
  rent: number[];
  elec: number[];
  water: number[];
  other?: number[];
};

type DashboardResponse = {
  summary: DashboardSummary;
  series12?: DashboardSeries12;
};

type CondoLite = {
  id: string;
  name: string;
};

type AuthMeResponse = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    phone: string | null;
  };
};

/* ================= Backend calls ================= */
async function fetchMyCondos(): Promise<CondoLite[]> {
  const condos = await api<any[]>("/owner/condos");
  return (condos ?? []).map((c: any) => ({
    id: String(c.id),
    name: String(c.nameTh ?? c.nameEn ?? c.name ?? "—"),
  }));
}

async function fetchDashboard(condoId: string): Promise<DashboardResponse> {
  return await api<DashboardResponse>(
    `/owner/condos/${encodeURIComponent(condoId)}/dashboard`
  );
}

async function fetchMe(): Promise<AuthMeResponse> {
  return await api<AuthMeResponse>("/auth/me");
}

/* ================= helpers ================= */
function sumArray(arr?: number[]) {
  return (arr ?? []).reduce((s, n) => s + Number(n || 0), 0);
}

function normalizeSeries(series?: DashboardSeries12) {
  return {
    labels: series?.labels ?? [],
    invoices: series?.invoices ?? [],
    receipts: series?.receipts ?? [],
    rent: series?.rent ?? [],
    elec: series?.elec ?? [],
    water: series?.water ?? [],
    other: series?.other ?? [],
  };
}

/* ================= Page ================= */
type LocationState = {
  condoId?: string;
} | null;

export default function DashboardPage() {
  const location = useLocation();
  const state = (location.state ?? null) as LocationState;
  const condoIdFromState = state?.condoId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [condoId, setCondoId] = useState<string | null>(
    condoIdFromState ?? null
  );
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [ownerName, setOwnerName] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const loadMe = async () => {
      try {
        const me = await fetchMe();
        if (cancelled) return;

        const display =
          (me?.user?.name && me.user.name.trim()) ||
          (me?.user?.email && me.user.email.trim()) ||
          "—";

        setOwnerName(display);
      } catch {
        if (cancelled) return;
        setOwnerName("—");
      }
    };

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

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
        useCondoStore.getState().selectCondo(condos[0].id, condos[0].name);
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

        if (res?.summary?.condoName) {
          useCondoStore.getState().selectCondo(condoId, res.summary.condoName);
        }

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

  const summary = useMemo(() => data?.summary ?? null, [data]);
  const charts = useMemo(() => normalizeSeries(data?.series12), [data]);

  const hasRentChartData = useMemo(() => {
    return charts.labels.length > 0 && charts.rent.length === charts.labels.length;
  }, [charts]);

  const hasElecChartData = useMemo(() => {
    return charts.labels.length > 0 && charts.elec.length === charts.labels.length;
  }, [charts]);

  const hasWaterChartData = useMemo(() => {
    return charts.labels.length > 0 && charts.water.length === charts.labels.length;
  }, [charts]);

  const hasOtherChartData = useMemo(() => {
    return charts.labels.length > 0 && charts.other.length === charts.labels.length;
  }, [charts]);

  const condoName = summary?.condoName ?? "—";

  const totalRent = useMemo(() => sumArray(charts.rent), [charts]);
  const totalElec = useMemo(() => sumArray(charts.elec), [charts]);
  const totalWater = useMemo(() => sumArray(charts.water), [charts]);
  const totalOther = useMemo(() => sumArray(charts.other), [charts]);

  const executiveStats = useMemo<Stat[]>(() => {
    if (!summary) return [];

    return [
      {
        label: "ห้องทั้งหมด",
        value: summary.roomsTotal,
        sub: "จำนวนห้องในระบบ",
        icon: <Building2 size={22} />,
      },
      {
        label: "ห้องมีผู้เช่า",
        value: summary.occupiedRooms,
        sub: "ห้องที่มีผู้เช่าอยู่",
        icon: <Users size={22} />,
      },
      {
        label: "ห้องว่าง",
        value: summary.vacantRooms,
        sub: "พร้อมปล่อยเช่า",
        icon: <Home size={22} />,
      },
      {
        label: "ค่าเช่าเฉลี่ย",
        value: `${Math.round(summary.avgRentPrice).toLocaleString()}`,
        sub: "บาท / ห้อง",
        icon: <BadgeDollarSign size={22} />,
      },
    ];
  }, [summary]);

  const donutItems = useMemo(() => {
    return [
      { label: "ค่าเช่า", value: totalRent, color: "#2F6BFF" },
      { label: "ค่าไฟ", value: totalElec, color: "#F59E0B" },
      { label: "ค่าน้ำ", value: totalWater, color: "#06B6D4" },
      { label: "อื่น ๆ", value: totalOther, color: "#94A3B8" },
    ];
  }, [totalRent, totalElec, totalWater, totalOther]);

  return (
    <OwnerShell
      title="ข้อมูลภาพรวม"
      activeKey="dashboard"
      showSidebar={true}
      ownerName={ownerName}
      condoName={condoName}
    >
      <div className="rounded-[32px] border border-slate-200/60 bg-gradient-to-b from-[#EEF4FF] via-[#F8FBFF] to-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <div className="mb-6">
          <div>
            <div className="text-[12px] font-black uppercase tracking-[0.18em] text-slate-400">
              Owner Dashboard
            </div>
            <h1 className="mt-2 text-[34px] font-black leading-tight text-slate-900">
              ภาพรวมธุรกิจของ {condoName}
            </h1>
            <div className="mt-2 text-[14px] font-bold text-slate-500">
              ดูสถานะห้องพัก รายรับ และแนวโน้มการเรียกเก็บย้อนหลังในหน้าเดียว
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <div className="text-sm font-extrabold text-slate-600">
              กำลังโหลดข้อมูล Dashboard...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-6 shadow-sm">
            <div className="font-extrabold text-rose-700">โหลดข้อมูลไม่สำเร็จ</div>
            <div className="mt-1 text-sm font-bold text-rose-600">{error}</div>

            <button
              type="button"
              onClick={() => setCondoId((x) => (x ? `${x}` : x))}
              className="mt-4 h-[46px] rounded-2xl border border-rose-200 bg-white px-6 text-sm font-extrabold text-rose-700 shadow-sm transition hover:bg-rose-50 active:scale-[0.98]"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {!loading && !error && !summary && (
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <div className="text-xl font-extrabold text-slate-900">
              ยังไม่มีคอนโดในระบบ
            </div>
            <div className="mt-2 text-sm font-bold text-slate-600">
              กรุณาเพิ่มคอนโดก่อน แล้วค่อยกลับมาดู Dashboard
            </div>
          </div>
        )}

        {!loading && !error && summary && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {executiveStats.map((s) => (
                <KpiCard key={s.label} stat={s} />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <ChartShell
                  title="ค่าเช่ารวมทั้งหมด"
                  subtitle={`เปรียบเทียบรายเดือนย้อนหลัง 12 เดือน • อ้างอิงจากห้องมีผู้เช่า ${summary.occupiedRooms} ห้อง`}
                  legend={[{ label: "ค่าเช่ารวม", dotClass: "bg-[#2F6BFF]" }]}
                >
                  {hasRentChartData ? (
                    <Bars1Series
                      labels={charts.labels}
                      v={charts.rent}
                      unit="บาท"
                      colorClass="bg-[#2F6BFF]"
                    />
                  ) : (
                    <EmptyChartState text="ยังไม่มีข้อมูลกราฟค่าเช่ารวม" />
                  )}
                </ChartShell>
              </div>

              <OccupancyCard
                occupied={summary.occupiedRooms}
                vacant={summary.vacantRooms}
                total={summary.roomsTotal}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <ChartShell
                  title="สัดส่วนรายได้ / ค่าใช้จ่ายหลัก"
                  subtitle="มองเห็นโครงสร้างค่าเช่า ค่าน้ำ ค่าไฟ และรายการอื่นในภาพรวม"
                >
                  {totalRent + totalElec + totalWater + totalOther > 0 ? (
                    <DonutChart items={donutItems} />
                  ) : (
                    <EmptyChartState text="ยังไม่มีข้อมูลสำหรับ Donut Chart" />
                  )}
                </ChartShell>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <PanelHeader
                  title="ภาพรวมสำคัญ"
                  subtitle="ตัวเลขที่เจ้าของควรดูทุกวัน"
                />
                <div className="space-y-4 p-6">
                  <div className="rounded-2xl border border-slate-200/70 bg-[#F8FBFF] p-4">
                    <div className="text-[12px] font-black text-slate-500">
                      ค่าเช่ารวม
                    </div>
                    <div className="mt-1 text-[24px] font-black text-slate-900">
                      {totalRent.toLocaleString()} ฿
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-[#F8FBFF] p-4">
                    <div className="text-[12px] font-black text-slate-500">
                      ค่าน้ำ + ค่าไฟ
                    </div>
                    <div className="mt-1 text-[24px] font-black text-slate-900">
                      {(totalWater + totalElec).toLocaleString()} ฿
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-[#F8FBFF] p-4">
                    <div className="text-[12px] font-black text-slate-500">
                      ค่าบริการเพิ่มเติม
                    </div>
                    <div className="mt-1 text-[24px] font-black text-slate-900">
                      {totalOther.toLocaleString()} ฿
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-[#F8FBFF] p-4">
                    <div className="text-[12px] font-black text-slate-500">
                      ห้องมีผู้เช่า
                    </div>
                    <div className="mt-1 text-[24px] font-black text-slate-900">
                      {summary.occupiedRooms} / {summary.roomsTotal}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartShell
                title="รายได้ค่าเช่า"
                subtitle={`รวมย้อนหลัง 12 เดือน ~ ${totalRent.toLocaleString()} บาท`}
              >
                {hasRentChartData ? (
                  <Bars1Series
                    labels={charts.labels}
                    v={charts.rent}
                    unit="บาท"
                    colorClass="bg-[#2F6BFF]"
                  />
                ) : (
                  <EmptyChartState text="ยังไม่มีข้อมูลรายได้ค่าเช่า" />
                )}
              </ChartShell>

              <ChartShell
                title="ค่าไฟ"
                subtitle={`รวมย้อนหลัง 12 เดือน ~ ${totalElec.toLocaleString()} บาท`}
              >
                {hasElecChartData ? (
                  <Bars1Series
                    labels={charts.labels}
                    v={charts.elec}
                    unit="บาท"
                    colorClass="bg-amber-500"
                  />
                ) : (
                  <EmptyChartState text="ยังไม่มีข้อมูลค่าไฟ" />
                )}
              </ChartShell>

              <ChartShell
                title="ค่าน้ำ"
                subtitle={`รวมย้อนหลัง 12 เดือน ~ ${totalWater.toLocaleString()} บาท`}
              >
                {hasWaterChartData ? (
                  <Bars1Series
                    labels={charts.labels}
                    v={charts.water}
                    unit="บาท"
                    colorClass="bg-cyan-500"
                  />
                ) : (
                  <EmptyChartState text="ยังไม่มีข้อมูลค่าน้ำ" />
                )}
              </ChartShell>

              <ChartShell
                title="ค่าบริการเพิ่มเติม / อื่น ๆ"
                subtitle={`รวมย้อนหลัง 12 เดือน ~ ${totalOther.toLocaleString()} บาท`}
              >
                {hasOtherChartData ? (
                  <Bars1Series
                    labels={charts.labels}
                    v={charts.other}
                    unit="บาท"
                    colorClass="bg-slate-500"
                  />
                ) : (
                  <EmptyChartState text="ยังไม่มีข้อมูลค่าบริการเพิ่มเติม" />
                )}
              </ChartShell>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CircleDollarSign size={20} />
                  </div>
                  <div>
                    <div className="text-[13px] font-black text-slate-500">
                      ภาพรวมรายได้
                    </div>
                    <div className="text-[22px] font-black text-slate-900">
                      {totalRent.toLocaleString()} ฿
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="text-[13px] font-black text-slate-500">
                      ค่าไฟสะสม
                    </div>
                    <div className="text-[22px] font-black text-slate-900">
                      {totalElec.toLocaleString()} ฿
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                    <Droplets size={20} />
                  </div>
                  <div>
                    <div className="text-[13px] font-black text-slate-500">
                      ค่าน้ำสะสม
                    </div>
                    <div className="text-[22px] font-black text-slate-900">
                      {totalWater.toLocaleString()} ฿
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <BadgeDollarSign size={20} />
                  </div>
                  <div>
                    <div className="text-[13px] font-black text-slate-500">
                      ค่าบริการเพิ่มเติม
                    </div>
                    <div className="text-[22px] font-black text-slate-900">
                      {totalOther.toLocaleString()} ฿
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </OwnerShell>
  );
}