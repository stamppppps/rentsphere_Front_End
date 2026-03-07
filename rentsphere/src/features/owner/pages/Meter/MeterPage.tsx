import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OwnerShell from "@/features/owner/components/OwnerShell";
import { getSelectedCondoId } from "@/features/owner/stores/condoStore";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getAuthToken(): string {
    try { const raw = localStorage.getItem("rentsphere_auth"); if (!raw) return ""; return JSON.parse(raw)?.state?.token || ""; } catch { return ""; }
}
function authHeaders() {
    const t = getAuthToken();
    return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

const DAYS_TH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const MONTHS_TH = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function getCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows: (number | null)[][] = [];
    let week: (number | null)[] = new Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
        week.push(d);
        if (week.length === 7) {
            rows.push(week);
            week = [];
        }
    }
    if (week.length) {
        while (week.length < 7) week.push(null);
        rows.push(week);
    }
    return rows;
}

/* ================================================================
   Calendar Widget
   ================================================================ */
function MiniCalendar({
    selectedDate,
    onSelect,
    recordedDates,
}: {
    selectedDate: Date;
    onSelect: (d: Date) => void;
    recordedDates: Set<string>;
}) {
    const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
    const weeks = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);
    const today = new Date();

    const prev = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
        else setViewMonth((m) => m - 1);
    };
    const next = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
        else setViewMonth((m) => m + 1);
    };

    return (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 w-full max-w-[340px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={prev} aria-label="เดือนก่อนหน้า" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="font-extrabold text-gray-900 text-base tracking-tight">
                    {MONTHS_TH[viewMonth]} {viewYear + 543}
                </div>
                <button type="button" onClick={next} aria-label="เดือนถัดไป" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-2">
                {DAYS_TH.map((d) => <div key={d}>{d}</div>)}
            </div>

            {/* Day cells */}
            {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 text-center">
                    {week.map((day, di) => {
                        if (!day) return <div key={di} />;
                        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const hasRecord = recordedDates.has(dateStr);
                        const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                        const isSelected = day === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();
                        return (
                            <button
                                key={di}
                                type="button"
                                onClick={() => onSelect(new Date(viewYear, viewMonth, day))}
                                className={[
                                    "w-9 h-9 rounded-full text-sm font-bold transition mx-auto",
                                    isSelected
                                        ? "bg-[#93C5FD] text-white"
                                        : hasRecord
                                            ? "bg-blue-100 text-blue-700"
                                            : isToday
                                                ? "bg-gray-100 text-gray-700"
                                                : "text-gray-700 hover:bg-gray-100",
                                ].join(" ")}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            ))}

            {/* Legend */}
            <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500 font-bold">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#93C5FD]" />
                    วันที่เลือก
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-100" />
                    วันที่มีการบันทึก
                </div>
            </div>
        </div>
    );
}

/* ================================================================
   History View
   ================================================================ */
function HistoryView() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [meterInfo, setMeterInfo] = useState<{ roomCount: number; lastWater: string | null; lastElectric: string | null }>({ roomCount: 0, lastWater: null, lastElectric: null });
    const [recordedDates, setRecordedDates] = useState<Set<string>>(new Set());

    useEffect(() => {
        (async () => {
            try {
                const condoId = getSelectedCondoId();
                if (!condoId) return;

                const res = await fetch(`${API}/api/v1/owner/condos/${condoId}/meters`, { headers: authHeaders() });
                if (!res.ok) return;
                const data = await res.json();
                const meters = data?.meters || [];

                // Collect recorded dates
                const dates = new Set<string>();
                let latestWater: string | null = null;
                let latestElectric: string | null = null;

                for (const m of meters) {
                    if (m.recordedAt) {
                        const d = new Date(m.recordedAt).toISOString().slice(0, 10);
                        dates.add(d);
                        if (m.waterUnits > 0) latestWater = d;
                        if (m.electricUnits > 0) latestElectric = d;
                    }
                }

                setRecordedDates(dates);
                setMeterInfo({
                    roomCount: meters.length,
                    lastWater: latestWater ? new Date(latestWater).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }) : null,
                    lastElectric: latestElectric ? new Date(latestElectric).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }) : null,
                });
            } catch (e) {
                console.error("HistoryView meter fetch:", e);
            }
        })();
    }, []);

    return (
        <div className="flex gap-8 items-start flex-wrap">
            {/* Left */}
            <div className="flex-1 min-w-0">

                {/* Empty state card */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 text-sm font-bold text-gray-500">
                        ข้อมูลการจดมิเตอร์เดือนนี้
                    </div>
                    <div className="h-px bg-gray-100 mx-4" />
                    {meterInfo.roomCount === 0 ? (
                        <div className="px-8 py-12 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 text-[#93C5FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="text-lg font-extrabold text-gray-900 mb-1">ไม่มีข้อมูล</div>
                            <div className="text-sm font-bold text-gray-400">
                                ยังไม่มีการบันทึกรายการในขณะนี้ กรุณากดปุ่มด้านบน<br />
                                เพื่อสร้างรายการใหม่
                            </div>
                        </div>
                    ) : (
                        <div className="px-6 py-6">
                            <p className="text-sm font-bold text-gray-600">
                                บันทึกแล้ว <span className="text-[#93C5FD] font-extrabold">{meterInfo.roomCount}</span> ห้อง ในเดือนนี้
                            </p>
                        </div>
                    )}
                </div>

                {/* Status cards */}
                <div className="flex items-stretch gap-4 mt-5">
                    {/* ไฟฟ้า */}
                    <div className="flex-1 rounded-2xl bg-white border border-blue-100/60 px-5 py-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-[#93C5FD]/20 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-[#93C5FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400">บันทึกไฟฟ้าล่าสุด</div>
                            <div className="text-sm font-extrabold text-gray-700">{meterInfo.lastElectric || "ยังไม่มีข้อมูล"}</div>
                        </div>
                    </div>
                    {/* ประปา */}
                    <div className="flex-1 rounded-2xl bg-white border border-green-100/60 px-5 py-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-400/20 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c-4 4.5-7 8-7 11a7 7 0 1014 0c0-3-3-6.5-7-11z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400">บันทึกประปาล่าสุด</div>
                            <div className="text-sm font-extrabold text-gray-700">{meterInfo.lastWater || "ยังไม่มีข้อมูล"}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: calendar */}
            <div className="shrink-0">
                <MiniCalendar selectedDate={selectedDate} onSelect={setSelectedDate} recordedDates={recordedDates} />
            </div>
        </div>
    );
}


/* ================================================================
   Main Page
   ================================================================ */
export default function MeterPage() {
    const navigate = useNavigate();


    return (
        <OwnerShell activeKey="meter">
            <div className="w-full mx-auto animate-in fade-in duration-300 pt-6 px-8 pb-10">
                {/* Page title + view toggle */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">ประวัติการจดมิเตอร์</h1>
                        <p className="text-sm font-bold text-gray-500 mt-1 pt-3">
                            จัดการและบันทึกข้อมูลมิเตอร์สาธารณูปโภคทั้งหมด
                        </p>
                    </div>

                    {/* จดมิเตอร์ button */}
                    <button
                        type="button"
                        onClick={() => navigate("/owner/meter/record")}
                        className="h-[40px] px-5 rounded-lg bg-[#93C5FD] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-[#7fb4fb] active:scale-[0.98] transition flex items-center gap-2"
                    >
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white">
                            <span className="text-[16px] font-black leading-none text-[#93C5FD]">+</span>
                        </span>
                        จดมิเตอร์
                    </button>
                </div>

                {/* Content */}
                <HistoryView />
            </div>
        </OwnerShell>
    );
}
