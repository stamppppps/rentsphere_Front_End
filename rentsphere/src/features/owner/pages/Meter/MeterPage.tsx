import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OwnerShell from "@/features/owner/components/OwnerShell";
import { getSelectedCondoId } from "@/features/owner/stores/condoStore";

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
    condoId: string;
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
    recordedBy?: string | null;
    recordedAt?: string | null;
};

type RoomInfo = {
    id: string;
    roomNo?: string;
};

type CondoMeterOverviewResponse = {
    rooms?: RoomInfo[];
    readings?: MeterReading[];
};

type HistoryRoomRow = {
    roomId: string;
    roomNo: string;
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

function StatCard({
    title,
    value,
    subtext,
    icon,
}: {
    title: string;
    value: string;
    subtext?: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm font-bold text-gray-400">{title}</div>
                    <div className="text-2xl font-extrabold text-gray-900 mt-2">{value}</div>
                    {subtext ? <div className="text-xs font-bold text-gray-400 mt-2">{subtext}</div> : null}
                </div>
                <div className="h-11 w-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function MonthPickerCard({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5 w-full max-w-[360px]">
            <div className="flex items-center justify-between gap-3 mb-4">
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

            <label className="block text-xs font-bold text-gray-400 mb-2">เดือนที่ต้องการดู</label>
            <input
                type="month"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-[44px] rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            <div className="mt-4 rounded-2xl bg-blue-50/60 px-4 py-3">
                <div className="text-xs font-bold text-gray-400">รอบบิลที่เลือก</div>
                <div className="text-base font-extrabold text-gray-900 mt-1">
                    {monthLabelFromInput(value)}
                </div>
            </div>
        </div>
    );
}

/* ================================================================
   History View
=============================================================== */
function HistoryView() {
    const [selectedMonth, setSelectedMonth] = useState(formatMonthParam(new Date()));
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<HistoryRoomRow[]>([]);
    const [summary, setSummary] = useState({
        roomCount: 0,
        lastWater: null as string | null,
        lastElectric: null as string | null,
        totalWaterCharge: 0,
        totalElectricCharge: 0,
        totalWaterUnits: 0,
        totalElectricUnits: 0,
    });

    const selectedMonthLabel = useMemo(
        () => monthLabelFromInput(selectedMonth),
        [selectedMonth]
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
                            lastWater: null,
                            lastElectric: null,
                            totalWaterCharge: 0,
                            totalElectricCharge: 0,
                            totalWaterUnits: 0,
                            totalElectricUnits: 0,
                        });
                        setLoading(false);
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
                            lastWater: null,
                            lastElectric: null,
                            totalWaterCharge: 0,
                            totalElectricCharge: 0,
                            totalWaterUnits: 0,
                            totalElectricUnits: 0,
                        });
                    }
                    return;
                }

                const data: CondoMeterOverviewResponse = await res.json();
                const rooms = Array.isArray(data?.rooms) ? data.rooms : [];
                const readings = Array.isArray(data?.readings) ? data.readings : [];

                const roomMap = new Map<string, RoomInfo>();
                for (const room of rooms) {
                    roomMap.set(room.id, room);
                }

                let latestWater: string | null = null;
                let latestElectric: string | null = null;
                let totalWaterCharge = 0;
                let totalElectricCharge = 0;
                let totalWaterUnits = 0;
                let totalElectricUnits = 0;

                const mergedRows: HistoryRoomRow[] = readings.map((m) => {
                    const room = roomMap.get(m.roomId);

                    if (m.recordedAt) {
                        const recordedDate = new Date(m.recordedAt);

                        if (Number(m.waterUnits ?? 0) > 0) {
                            if (!latestWater || recordedDate > new Date(latestWater)) {
                                latestWater = m.recordedAt;
                            }
                        }

                        if (Number(m.electricUnits ?? 0) > 0) {
                            if (!latestElectric || recordedDate > new Date(latestElectric)) {
                                latestElectric = m.recordedAt;
                            }
                        }
                    }

                    totalWaterCharge += Number(m.waterCharge ?? 0);
                    totalElectricCharge += Number(m.electricCharge ?? 0);
                    totalWaterUnits += Number(m.waterUnits ?? 0);
                    totalElectricUnits += Number(m.electricUnits ?? 0);

                    return {
                        roomId: m.roomId,
                        roomNo: room?.roomNo || "—",
                        prevWater: Number(m.prevWater ?? 0),
                        currWater: Number(m.currWater ?? 0),
                        waterUnits: Number(m.waterUnits ?? 0),
                        waterCharge: Number(m.waterCharge ?? 0),
                        prevElectric: Number(m.prevElectric ?? 0),
                        currElectric: Number(m.currElectric ?? 0),
                        electricUnits: Number(m.electricUnits ?? 0),
                        electricCharge: Number(m.electricCharge ?? 0),
                        recordedAt: m.recordedAt ?? null,
                    };
                });

                mergedRows.sort((a, b) => a.roomNo.localeCompare(b.roomNo, "th"));

                if (!cancelled) {
                    setRows(mergedRows);
                    setSummary({
                        roomCount: mergedRows.length,
                        lastWater: latestWater,
                        lastElectric: latestElectric,
                        totalWaterCharge,
                        totalElectricCharge,
                        totalWaterUnits,
                        totalElectricUnits,
                    });
                }
            } catch (e) {
                console.error("HistoryView meter fetch:", e);
                if (!cancelled) {
                    setRows([]);
                    setSummary({
                        roomCount: 0,
                        lastWater: null,
                        lastElectric: null,
                        totalWaterCharge: 0,
                        totalElectricCharge: 0,
                        totalWaterUnits: 0,
                        totalElectricUnits: 0,
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
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <StatCard
                            title="ห้องที่บันทึกแล้ว"
                            value={String(summary.roomCount)}
                            subtext={`รอบบิล ${selectedMonthLabel}`}
                            icon={
                                <svg className="w-5 h-5 text-[#93C5FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="หน่วยน้ำรวม"
                            value={summary.totalWaterUnits.toLocaleString()}
                            subtext={formatMoney(summary.totalWaterCharge)}
                            icon={
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c-4 4.5-7 8-7 11a7 7 0 1014 0c0-3-3-6.5-7-11z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="หน่วยไฟรวม"
                            value={summary.totalElectricUnits.toLocaleString()}
                            subtext={formatMoney(summary.totalElectricCharge)}
                            icon={
                                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="บันทึกล่าสุดเมื่อ"
                            value={formatThaiShortDate(summary.lastElectric || summary.lastWater)}
                            subtext="วันที่บันทึกจริง"
                            icon={
                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
                                </svg>
                            }
                        />
                    </div>

                    <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900">
                                    รายการจดมิเตอร์รอบบิล {selectedMonthLabel}
                                </h2>
                                <p className="text-sm font-bold text-gray-400 mt-1">
                                    ข้อมูลทั้งหมดอ้างอิงตามเดือนของรอบบิล
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="px-6 py-16 text-center text-sm font-bold text-gray-400">
                                กำลังโหลดข้อมูล...
                            </div>
                        ) : rows.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="text-lg font-extrabold text-gray-900">ไม่มีข้อมูล</div>
                                <div className="text-sm font-bold text-gray-400 mt-2">
                                    ยังไม่มีการบันทึกข้อมูลมิเตอร์ในรอบบิลนี้
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px] text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/70">
                                            <th className="px-6 py-4 text-left font-extrabold text-gray-500">ห้อง</th>
                                            <th className="px-4 py-4 text-center font-extrabold text-gray-500">น้ำครั้งก่อน</th>
                                            <th className="px-4 py-4 text-center font-extrabold text-gray-500">น้ำปัจจุบัน</th>
                                            <th className="px-4 py-4 text-center font-extrabold text-gray-500">หน่วยน้ำ</th>
                                            <th className="px-4 py-4 text-center font-extrabold text-gray-500">ค่าน้ำ</th>
                                            <th className="px-4 py-4 text-center font-extrabold text-gray-500">ไฟครั้งก่อน</th>
                                            <th className="px-4 py-4 text-center font-extrabold text-gray-500">ไฟปัจจุบัน</th>
                                            <th className="px-4 py-4 text-center font-extrabold text-gray-500">หน่วยไฟ</th>
                                            <th className="px-4 py-4 text-center font-extrabold text-gray-500">ค่าไฟ</th>
                                            <th className="px-6 py-4 text-center font-extrabold text-gray-500">บันทึกล่าสุดเมื่อ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row) => (
                                            <tr key={row.roomId} className="border-b border-gray-50 hover:bg-blue-50/20 transition">
                                                <td className="px-6 py-4 font-extrabold text-gray-900">{row.roomNo}</td>
                                                <td className="px-4 py-4 text-center font-bold text-gray-700">{row.prevWater.toLocaleString()}</td>
                                                <td className="px-4 py-4 text-center font-bold text-gray-700">{row.currWater.toLocaleString()}</td>
                                                <td className="px-4 py-4 text-center font-bold text-blue-600">{row.waterUnits.toLocaleString()}</td>
                                                <td className="px-4 py-4 text-center font-bold text-gray-900">{formatMoney(row.waterCharge)}</td>
                                                <td className="px-4 py-4 text-center font-bold text-gray-700">{row.prevElectric.toLocaleString()}</td>
                                                <td className="px-4 py-4 text-center font-bold text-gray-700">{row.currElectric.toLocaleString()}</td>
                                                <td className="px-4 py-4 text-center font-bold text-amber-600">{row.electricUnits.toLocaleString()}</td>
                                                <td className="px-4 py-4 text-center font-bold text-gray-900">{formatMoney(row.electricCharge)}</td>
                                                <td className="px-6 py-4 text-center font-bold text-gray-500">
                                                    {formatThaiShortDate(row.recordedAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="shrink-0">
                    <MonthPickerCard
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                    />
                </div>
            </div>
        </div>
    );
}

/* ================================================================
   Main Page
=============================================================== */
export default function MeterPage() {
    const navigate = useNavigate();

    return (
        <OwnerShell activeKey="meter">
            <div className="w-full mx-auto animate-in fade-in duration-300 pt-6 px-8 pb-10">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            ประวัติการจดมิเตอร์
                        </h1>
                        <p className="text-sm font-bold text-gray-500 mt-2">
                            ตรวจสอบย้อนหลัง ดูหน่วยใช้งาน และติดตามยอดค่าน้ำค่าไฟตามรอบบิลรายเดือน
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