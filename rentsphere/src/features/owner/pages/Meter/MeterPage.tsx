import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OwnerShell from "@/features/owner/components/OwnerShell";
import { getSelectedCondoId, useCondoStore } from "@/features/owner/stores/condoStore";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getAuthToken(): string {
    try {
        const raw = localStorage.getItem("rentsphere_auth");
        if (!raw) return "";
        return JSON.parse(raw)?.state?.token || "";
    } catch {
        return "";
    }
}

function authHeaders() {
    const t = getAuthToken();
    return {
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
    };
}

function formatMonthParam(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

const MONTHS_TH = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
];

type MeterReading = {
    id: string;
    roomId: string;
    cycleId: string;
    prevWater: number;
    prevElectric: number;
    currWater: number;
    currElectric: number;
    waterUnits: number;
    electricUnits: number;
    waterCharge: number;
    electricCharge: number;
    recordedAt?: string | null;
};

type RoomInfo = {
    id: string;
    roomNo?: string;
    meter?: {
        waterMeterNo?: string | null;
        electricMeterNo?: string | null;
    } | null;
};

type CondoMeterOverviewResponse = {
    cycleId?: string;
    cycleMonth?: string;
    status?: string;
    rooms?: RoomInfo[];
    readings?: MeterReading[];
};

type HistoryRoomRow = {
    roomId: string;
    roomNo: string;
    waterMeterNo: string | null;
    electricMeterNo: string | null;
    prevWater: number;
    currWater: number;
    waterUnits: number;
    waterCharge: number;
    prevElectric: number;
    currElectric: number;
    electricUnits: number;
    electricCharge: number;
    recordedAt: string | null;
};

function formatThaiShortDate(value: string | null) {
    if (!value) return "ยังไม่มีข้อมูล";
    return new Date(value).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "2-digit",
    });
}

function formatMoney(value: number) {
    return `฿${Number(value || 0).toLocaleString()}`;
}

function monthLabelFromInput(value: string) {
    const [year, month] = value.split("-").map(Number);
    if (!year || !month) return value;
    return `${MONTHS_TH[month - 1]} ${year + 543}`;
}

function KpiCard({
    title,
    value,
    subtext,
    accent = "blue",
    icon,
}: {
    title: string;
    value: string;
    subtext?: string;
    accent?: "blue" | "amber" | "emerald" | "slate";
    icon: React.ReactNode;
}) {
    const tone =
        accent === "blue"
            ? "bg-blue-50 text-[#93C5FD]"
            : accent === "amber"
                ? "bg-amber-50 text-amber-500"
                : accent === "emerald"
                    ? "bg-emerald-50 text-emerald-500"
                    : "bg-slate-100 text-slate-500";

    return (
        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm px-5 py-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="text-xs font-extrabold uppercase tracking-wide text-gray-400">
                        {title}
                    </div>
                    <div className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
                        {value}
                    </div>
                    {subtext ? (
                        <div className="mt-2 text-xs font-bold text-gray-400">
                            {subtext}
                        </div>
                    ) : null}
                </div>
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${tone}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function FilterPanel({
    value,
    onChange,
    roomCount,
    totalCost,
    totalWaterUnits,
    totalElectricUnits,
}: {
    value: string;
    onChange: (value: string) => void;
    roomCount: number;
    totalCost: number;
    totalWaterUnits: number;
    totalElectricUnits: number;
}) {
    return (
        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="text-sm font-extrabold text-gray-900">เลือกรอบบิล</div>
                    <div className="text-xs font-bold text-gray-400 mt-1">
                        ดูข้อมูลตามเดือนของมิเตอร์
                    </div>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#93C5FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 items-start">
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2">เดือนที่ต้องการดู</label>
                    <input
                        type="month"
                        aria-label="เลือกเดือนและปี"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-[46px] rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />

                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4">
                        <div className="text-xs font-bold text-gray-400">รอบบิลที่เลือก</div>
                        <div className="text-lg font-extrabold text-gray-900 mt-1">
                            {monthLabelFromInput(value)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-2xl bg-blue-50/60 px-4 py-3">
                        <div className="text-[11px] font-extrabold uppercase tracking-wide text-gray-400">Rooms</div>
                        <div className="mt-1 text-lg font-extrabold text-gray-900">{roomCount}</div>
                    </div>
                    <div className="rounded-2xl bg-blue-50/60 px-4 py-3">
                        <div className="text-[11px] font-extrabold uppercase tracking-wide text-gray-400">Total</div>
                        <div className="mt-1 text-lg font-extrabold text-gray-900">{formatMoney(totalCost)}</div>
                    </div>
                    <div className="rounded-2xl bg-blue-50/60 px-4 py-3">
                        <div className="text-[11px] font-extrabold uppercase tracking-wide text-gray-400">Water</div>
                        <div className="mt-1 text-lg font-extrabold text-gray-900">{totalWaterUnits.toLocaleString()}</div>
                    </div>
                    <div className="rounded-2xl bg-blue-50/60 px-4 py-3">
                        <div className="text-[11px] font-extrabold uppercase tracking-wide text-gray-400">Electric</div>
                        <div className="mt-1 text-lg font-extrabold text-gray-900">{totalElectricUnits.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ monthLabel, onCreate }: { monthLabel: string; onCreate: () => void }) {
    return (
        <div className="px-6 py-16 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#93C5FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div className="text-lg font-extrabold text-gray-900">ไม่มีข้อมูลในรอบบิลนี้</div>
            <div className="text-sm font-bold text-gray-400 mt-2">
                ยังไม่มีการบันทึกข้อมูลมิเตอร์ในรอบบิล {monthLabel}
            </div>
            <button
                type="button"
                onClick={onCreate}
                className="mt-5 h-[42px] px-5 rounded-xl bg-[#93C5FD] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(147,197,253,0.35)] hover:bg-[#7fb4fb] active:scale-[0.98] transition inline-flex items-center gap-2"
            >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white">
                    <span className="text-[16px] font-black leading-none text-[#93C5FD]">+</span>
                </span>
                จดมิเตอร์
            </button>
        </div>
    );
}

function HistoryView() {
    const navigate = useNavigate();
    const [selectedMonth, setSelectedMonth] = useState(formatMonthParam(new Date()));
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<HistoryRoomRow[]>([]);
    const [summary, setSummary] = useState({
        roomCount: 0,
        lastRecordedAt: null as string | null,
        totalWaterUnits: 0,
        totalElectricUnits: 0,
        totalWaterCharge: 0,
        totalElectricCharge: 0,
    });

    const selectedMonthLabel = useMemo(() => monthLabelFromInput(selectedMonth), [selectedMonth]);

    const totalCost = useMemo(
        () => summary.totalWaterCharge + summary.totalElectricCharge,
        [summary.totalWaterCharge, summary.totalElectricCharge]
    );

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);

                const condoId = getSelectedCondoId();
                if (!condoId) {
                    if (!cancelled) {
                        setRows([]);
                        setSummary({
                            roomCount: 0,
                            lastRecordedAt: null,
                            totalWaterUnits: 0,
                            totalElectricUnits: 0,
                            totalWaterCharge: 0,
                            totalElectricCharge: 0,
                        });
                    }
                    return;
                }

                const res = await fetch(
                    `${API}/api/v1/owner/condos/${condoId}/meters?month=${selectedMonth}`,
                    { headers: authHeaders() }
                );

                if (!res.ok) {
                    if (!cancelled) {
                        setRows([]);
                        setSummary({
                            roomCount: 0,
                            lastRecordedAt: null,
                            totalWaterUnits: 0,
                            totalElectricUnits: 0,
                            totalWaterCharge: 0,
                            totalElectricCharge: 0,
                        });
                    }
                    return;
                }

                const data: CondoMeterOverviewResponse = await res.json();
                const rooms = Array.isArray(data.rooms) ? data.rooms : [];
                const readings = Array.isArray(data.readings) ? data.readings : [];

                const roomMap = new Map<string, RoomInfo>();
                for (const room of rooms) {
                    roomMap.set(room.id, room);
                }

                let lastRecordedAt: string | null = null;
                let totalWaterUnits = 0;
                let totalElectricUnits = 0;
                let totalWaterCharge = 0;
                let totalElectricCharge = 0;

                const mappedRows: HistoryRoomRow[] = readings.map((reading) => {
                    if (reading.recordedAt) {
                        if (!lastRecordedAt || new Date(reading.recordedAt) > new Date(lastRecordedAt)) {
                            lastRecordedAt = reading.recordedAt;
                        }
                    }

                    totalWaterUnits += Number(reading.waterUnits ?? 0);
                    totalElectricUnits += Number(reading.electricUnits ?? 0);
                    totalWaterCharge += Number(reading.waterCharge ?? 0);
                    totalElectricCharge += Number(reading.electricCharge ?? 0);

                    const room = roomMap.get(reading.roomId);

                    return {
                        roomId: reading.roomId,
                        roomNo: room?.roomNo || "—",
                        waterMeterNo: room?.meter?.waterMeterNo ?? null,
                        electricMeterNo: room?.meter?.electricMeterNo ?? null,
                        prevWater: Number(reading.prevWater ?? 0),
                        currWater: Number(reading.currWater ?? 0),
                        waterUnits: Number(reading.waterUnits ?? 0),
                        waterCharge: Number(reading.waterCharge ?? 0),
                        prevElectric: Number(reading.prevElectric ?? 0),
                        currElectric: Number(reading.currElectric ?? 0),
                        electricUnits: Number(reading.electricUnits ?? 0),
                        electricCharge: Number(reading.electricCharge ?? 0),
                        recordedAt: reading.recordedAt ?? null,
                    };
                });

                mappedRows.sort((a, b) => a.roomNo.localeCompare(b.roomNo, "th"));

                if (!cancelled) {
                    setRows(mappedRows);
                    setSummary({
                        roomCount: mappedRows.length,
                        lastRecordedAt,
                        totalWaterUnits,
                        totalElectricUnits,
                        totalWaterCharge,
                        totalElectricCharge,
                    });
                }
            } catch (e) {
                console.error("HistoryView meter fetch:", e);
                if (!cancelled) {
                    setRows([]);
                    setSummary({
                        roomCount: 0,
                        lastRecordedAt: null,
                        totalWaterUnits: 0,
                        totalElectricUnits: 0,
                        totalWaterCharge: 0,
                        totalElectricCharge: 0,
                    });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedMonth]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <KpiCard
                    title="ห้องที่บันทึกแล้ว"
                    value={String(summary.roomCount)}
                    subtext={`รอบบิล ${selectedMonthLabel}`}
                    accent="slate"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                />
                <KpiCard
                    title="หน่วยน้ำรวม"
                    value={summary.totalWaterUnits.toLocaleString()}
                    subtext={formatMoney(summary.totalWaterCharge)}
                    accent="blue"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c-4 4.5-7 8-7 11a7 7 0 1014 0c0-3-3-6.5-7-11z" />
                        </svg>
                    }
                />
                <KpiCard
                    title="หน่วยไฟรวม"
                    value={summary.totalElectricUnits.toLocaleString()}
                    subtext={formatMoney(summary.totalElectricCharge)}
                    accent="amber"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    }
                />
                <KpiCard
                    title="ค่าใช้จ่ายรวม"
                    value={formatMoney(totalCost)}
                    subtext="ค่าน้ำ + ค่าไฟ"
                    accent="blue"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.12-4 2.5s1.79 2.5 4 2.5 4 1.12 4 2.5S14.21 18 12 18m0-10V6m0 12v-2" />
                        </svg>
                    }
                />
                <KpiCard
                    title="อัปเดตล่าสุด"
                    value={formatThaiShortDate(summary.lastRecordedAt)}
                    subtext="วันที่บันทึกจริงของข้อมูลล่าสุด"
                    accent="emerald"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
                        </svg>
                    }
                />
            </div>

            <div className="space-y-6">
                <FilterPanel
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    roomCount={summary.roomCount}
                    totalCost={totalCost}
                    totalWaterUnits={summary.totalWaterUnits}
                    totalElectricUnits={summary.totalElectricUnits}
                />

                <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden w-full">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <div className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
                                Meter History
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-900 mt-1">
                                รายการจดมิเตอร์รอบบิล {selectedMonthLabel}
                            </h2>
                            <p className="text-sm font-bold text-gray-400 mt-1">
                                ประวัติการใช้น้ำและไฟฟ้าของแต่ละห้องในรอบบิลรายเดือน
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="px-6 py-16 text-center text-sm font-bold text-gray-400">
                            กำลังโหลดข้อมูล...
                        </div>
                    ) : rows.length === 0 ? (
                        <EmptyState
                            monthLabel={selectedMonthLabel}
                            onCreate={() => navigate("/owner/meter/record")}
                        />
                    ) : (<div className="w-full overflow-hidden pr-10">
                        
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/70">
                                        <th className="px-4 py-4 text-left font-extrabold text-gray-500 whitespace-nowrap">ห้อง</th>
                                        <th className="px-3 py-4 text-left font-extrabold text-gray-500 whitespace-nowrap">มิเตอร์น้ำ</th>
                                        <th className="px-3 py-4 text-left font-extrabold text-gray-500 whitespace-nowrap">มิเตอร์ไฟฟ้า</th>
                                        <th className="px-3 py-4 text-center font-extrabold text-gray-500 whitespace-nowrap">น้ำครั้งก่อน</th>
                                        <th className="px-3 py-4 text-center font-extrabold text-gray-500 whitespace-nowrap">น้ำปัจจุบัน</th>
                                        <th className="px-3 py-4 text-center font-extrabold text-gray-500 whitespace-nowrap">หน่วยน้ำ</th>
                                        <th className="px-3 py-4 text-center font-extrabold text-gray-500 whitespace-nowrap">ค่าน้ำ</th>
                                        <th className="px-3 py-4 text-center font-extrabold text-gray-500 whitespace-nowrap">ไฟครั้งก่อน</th>
                                        <th className="px-3 py-4 text-center font-extrabold text-gray-500 whitespace-nowrap">ไฟปัจจุบัน</th>
                                        <th className="px-3 py-4 text-center font-extrabold text-gray-500 whitespace-nowrap">หน่วยไฟ</th>
                                        <th className="px-3 py-4 text-center font-extrabold text-gray-500 whitespace-nowrap">ค่าไฟ</th>
                                        <th className="px-1 py-4 text-center font-extrabold text-gray-500 whitespace-nowrap">วันที่บันทึก</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr key={row.roomId} className="border-b border-gray-50 hover:bg-blue-50/20 transition">
                                            <td className="px-4 py-4 font-extrabold text-gray-900 whitespace-nowrap">{row.roomNo}</td>
                                            <td className="px-3 py-4 font-bold text-gray-700 whitespace-nowrap">{row.waterMeterNo || "-"}</td>
                                            <td className="px-3 py-4 font-bold text-gray-700 whitespace-nowrap">{row.electricMeterNo || "-"}</td>
                                            <td className="px-3 py-4 text-center font-bold text-gray-700 whitespace-nowrap">{row.prevWater.toLocaleString()}</td>
                                            <td className="px-3 py-4 text-center font-bold text-gray-900 whitespace-nowrap">{row.currWater.toLocaleString()}</td>
                                            <td className="px-3 py-4 text-center font-extrabold text-blue-600 whitespace-nowrap">{row.waterUnits.toLocaleString()}</td>
                                            <td className="px-3 py-4 text-center font-extrabold text-gray-900 whitespace-nowrap">{formatMoney(row.waterCharge)}</td>
                                            <td className="px-3 py-4 text-center font-bold text-gray-700 whitespace-nowrap">{row.prevElectric.toLocaleString()}</td>
                                            <td className="px-3 py-4 text-center font-bold text-gray-900 whitespace-nowrap">{row.currElectric.toLocaleString()}</td>
                                            <td className="px-3 py-4 text-center font-extrabold text-amber-500 whitespace-nowrap">{row.electricUnits.toLocaleString()}</td>
                                            <td className="px-3 py-4 text-center font-extrabold text-gray-900 whitespace-nowrap">{formatMoney(row.electricCharge)}</td>
                                            <td className="px-6 py-4 text-center font-bold text-gray-500 whitespace-nowrap">{formatThaiShortDate(row.recordedAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MeterPage() {
    const navigate = useNavigate();

    const condoName = useCondoStore(s => s.condoName);

    return (
        <OwnerShell activeKey="meter" condoName={condoName || "คอนโดมิเนียม"}>
           <div className="w-full max-w-[1680px] mx-auto animate-in fade-in duration-300 pt-6 px-6 pb-10">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <div className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-gray-400">
                            Utility Analytics
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
                            ประวัติการจดมิเตอร์
                        </h1>
                        <p className="text-sm font-bold text-gray-500 mt-2">
                            ตรวจสอบย้อนหลัง ดูหน่วยใช้งาน และติดตามยอดค่าน้ำค่าไฟในรูปแบบแดชบอร์ดรายเดือน
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/owner/meter/record")}
                        className="h-[44px] px-5 rounded-xl bg-[#93C5FD] text-white font-extrabold text-sm shadow-[0_10px_24px_rgba(147,197,253,0.35)] hover:bg-[#7fb4fb] active:scale-[0.98] transition flex items-center gap-2"
                    >
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white">
                            <span className="text-[16px] font-black leading-none text-[#93C5FD]">+</span>
                        </span>
                        จดมิเตอร์
                    </button>
                </div>

                <HistoryView />
            </div>
        </OwnerShell>
    );
}