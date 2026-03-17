import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OwnerShell from "@/features/owner/components/OwnerShell";
import { getSelectedCondoId, useCondoStore } from "@/features/owner/stores/condoStore";

type MeterType = "water" | "electric";

type RoomMeterRow = {
    id: string;
    roomNo: string;
    floor: number;
    status: "active" | "inactive";
    waterMeterNo: string | null;
    electricMeterNo: string | null;
    cycleId: string | null;
    prevWater: number;
    prevElectric: number;
    currWater: number | null;
    currElectric: number | null;
    waterUnits: number;
    electricUnits: number;
    waterCharge: number;
    electricCharge: number;
    note: string;
};

type UtilityConfig = {
    utility_type?: string;
    utilityType?: string;
    rate?: number | string;
    pricePerUnit?: number | string;
};

type RoomItem = {
    id: string;
    roomNo?: string;
    floor?: number;
    occupancyStatus?: string;
    meter?: {
        waterMeterNo?: string | null;
        electricMeterNo?: string | null;
    } | null;
};

type MeterReadingResponse = {
    prevWater?: number;
    prevElectric?: number;
    cycleId?: string;
    cycleStatus?: string;
    meter?: {
        waterMeterNo?: string | null;
        electricMeterNo?: string | null;
    } | null;
    reading?: {
        currWater?: number;
        currElectric?: number;
        waterUnits?: number;
        electricUnits?: number;
        waterCharge?: number;
        electricCharge?: number;
        note?: string | null;
    } | null;
};

type CondoOverviewReading = {
    roomId: string;
    prevWater?: number;
    prevElectric?: number;
    currWater?: number;
    currElectric?: number;
    waterUnits?: number;
    electricUnits?: number;
    waterCharge?: number;
    electricCharge?: number;
    note?: string | null;
};

type CondoMeterOverviewResponse = {
    cycleId?: string;
    cycleMonth?: string;
    status?: string;
    rooms?: RoomItem[];
    readings?: CondoOverviewReading[];
};

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

function formatMonthParam(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

function normalizeUtilityType(value: unknown) {
    return String(value ?? "").trim().toUpperCase();
}

function formatMoney(value: number) {
    return `฿${Number(value || 0).toLocaleString()}`;
}

function monthInputToThaiLabel(value: string) {
    const [y, m] = value.split("-").map(Number);
    const monthNames = [
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

    if (!y || !m) return value;
    return `${monthNames[m - 1]} ${y + 543}`;
}

export default function MeterPage2() {
    const navigate = useNavigate();

    const [meterType, setMeterType] = useState<MeterType>("water");
    const [selectedMonth, setSelectedMonth] = useState(formatMonthParam(new Date()));
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);
    const [msg, setMsg] = useState("");

    const [waterRate, setWaterRate] = useState(18);
    const [electricRate, setElectricRate] = useState(8);

    const [rows, setRows] = useState<RoomMeterRow[]>([]);

    const PER_PAGE = 6;

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setMsg("");

                const condoId = getSelectedCondoId();
                if (!condoId) {
                    if (!cancelled) {
                        setRows([]);
                        setLoading(false);
                    }
                    return;
                }

                const [overviewRes, utilRes] = await Promise.all([
                    fetch(`${API}/api/v1/owner/condos/${condoId}/meters?month=${selectedMonth}`, {
                        headers: authHeaders(),
                    }),
                    fetch(`${API}/api/v1/owner/condos/${condoId}/utilities`, {
                        headers: authHeaders(),
                    }).catch(() => null),
                ]);

                if (cancelled) return;

                if (!overviewRes.ok) {
                    throw new Error("โหลดข้อมูลมิเตอร์ไม่สำเร็จ");
                }

                const overviewRaw: CondoMeterOverviewResponse = await overviewRes.json();
                const rooms: RoomItem[] = Array.isArray(overviewRaw?.rooms) ? overviewRaw.rooms : [];
                const readings: CondoOverviewReading[] = Array.isArray(overviewRaw?.readings)
                    ? overviewRaw.readings
                    : [];

                const readingMap = new Map<string, CondoOverviewReading>();
                for (const reading of readings) {
                    readingMap.set(reading.roomId, reading);
                }

                let nextWaterRate = 18;
                let nextElectricRate = 8;

                if (utilRes?.ok) {
                    const utilsRaw = await utilRes.json();
                    const configs: UtilityConfig[] = Array.isArray(utilsRaw)
                        ? utilsRaw
                        : Array.isArray(utilsRaw?.configs)
                            ? utilsRaw.configs
                            : Array.isArray(utilsRaw?.items)
                                ? utilsRaw.items
                                : [];

                    for (const c of configs) {
                        const utilityType = normalizeUtilityType(c.utility_type ?? c.utilityType);
                        const parsedRate = Number(c.rate ?? c.pricePerUnit ?? 0);

                        if (utilityType === "WATER" && parsedRate > 0) {
                            nextWaterRate = parsedRate;
                        }

                        if (utilityType === "ELECTRIC" || utilityType === "ELECTRICITY") {
                            if (parsedRate > 0) nextElectricRate = parsedRate;
                        }
                    }
                }

                if (!cancelled) {
                    setWaterRate(nextWaterRate);
                    setElectricRate(nextElectricRate);
                }

                const meterPromises = rooms.map((room) =>
                    fetch(
                        `${API}/api/v1/owner/rooms/${room.id}/meters?month=${selectedMonth}`,
                        { headers: authHeaders() }
                    )
                        .then(async (res) => (res.ok ? ((await res.json()) as MeterReadingResponse) : null))
                        .catch(() => null)
                );

                const meterResults = await Promise.all(meterPromises);

                if (cancelled) return;

                const mapped: RoomMeterRow[] = rooms.map((room, index) => {
                    const meterState = meterResults[index];
                    const monthReading = readingMap.get(room.id);
                    const reading = meterState?.reading ?? monthReading ?? null;

                    const prevWater = Number(meterState?.prevWater ?? monthReading?.prevWater ?? 0);
                    const prevElectric = Number(meterState?.prevElectric ?? monthReading?.prevElectric ?? 0);

                    const currWater =
                        reading?.currWater !== undefined && reading?.currWater !== null
                            ? Number(reading.currWater)
                            : null;

                    const currElectric =
                        reading?.currElectric !== undefined && reading?.currElectric !== null
                            ? Number(reading.currElectric)
                            : null;

                    const waterUnits =
                        reading?.waterUnits !== undefined && reading?.waterUnits !== null
                            ? Number(reading.waterUnits)
                            : currWater !== null
                                ? Math.max(0, currWater - prevWater)
                                : 0;

                    const electricUnits =
                        reading?.electricUnits !== undefined && reading?.electricUnits !== null
                            ? Number(reading.electricUnits)
                            : currElectric !== null
                                ? Math.max(0, currElectric - prevElectric)
                                : 0;

                    const waterCharge =
                        reading?.waterCharge !== undefined && reading?.waterCharge !== null
                            ? Number(reading.waterCharge)
                            : waterUnits * nextWaterRate;

                    const electricCharge =
                        reading?.electricCharge !== undefined && reading?.electricCharge !== null
                            ? Number(reading.electricCharge)
                            : electricUnits * nextElectricRate;

                    return {
                        id: room.id,
                        roomNo: room.roomNo || "—",
                        floor: Number(room.floor ?? 0),
                        status: room.occupancyStatus === "OCCUPIED" ? "active" : "inactive",
                        waterMeterNo: meterState?.meter?.waterMeterNo ?? room.meter?.waterMeterNo ?? null,
                        electricMeterNo: meterState?.meter?.electricMeterNo ?? room.meter?.electricMeterNo ?? null,
                        cycleId: meterState?.cycleId ?? overviewRaw?.cycleId ?? null,
                        prevWater,
                        prevElectric,
                        currWater,
                        currElectric,
                        waterUnits,
                        electricUnits,
                        waterCharge,
                        electricCharge,
                        note: typeof reading?.note === "string" ? reading.note : "",
                    };
                });

                mapped.sort((a, b) => a.roomNo.localeCompare(b.roomNo, "th"));
                setRows(mapped);
            } catch (e) {
                console.error("MeterPage2 load error:", e);
                setMsg("เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedMonth, reloadKey]);

    const filtered = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return rows;

        return rows.filter((r) => {
            return (
                r.roomNo.toLowerCase().includes(keyword) ||
                (r.waterMeterNo || "").toLowerCase().includes(keyword) ||
                (r.electricMeterNo || "").toLowerCase().includes(keyword)
            );
        });
    }, [rows, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const pageData = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    const summary = useMemo(() => {
        const waterEntered = rows.filter((r) => r.currWater !== null).length;
        const electricEntered = rows.filter((r) => r.currElectric !== null).length;
        const totalWaterUnits = rows.reduce((sum, r) => sum + Number(r.waterUnits || 0), 0);
        const totalElectricUnits = rows.reduce((sum, r) => sum + Number(r.electricUnits || 0), 0);
        const totalWaterCharge = rows.reduce((sum, r) => sum + Number(r.waterCharge || 0), 0);
        const totalElectricCharge = rows.reduce((sum, r) => sum + Number(r.electricCharge || 0), 0);

        return {
            waterEntered,
            electricEntered,
            totalWaterUnits,
            totalElectricUnits,
            totalWaterCharge,
            totalElectricCharge,
        };
    }, [rows]);

    const handleFieldChange = (
        id: string,
        field: "currWater" | "currElectric" | "note",
        value: string
    ) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id !== id) return row;

                const next = { ...row };

                if (field === "note") {
                    next.note = value;
                    return next;
                }

                const num = value === "" ? null : Number(value);

                if (field === "currWater") {
                    next.currWater = num;
                    next.waterUnits = num !== null && num >= next.prevWater ? num - next.prevWater : 0;
                    next.waterCharge = next.waterUnits * waterRate;
                }

                if (field === "currElectric") {
                    next.currElectric = num;
                    next.electricUnits = num !== null && num >= next.prevElectric ? num - next.prevElectric : 0;
                    next.electricCharge = next.electricUnits * electricRate;
                }

                return next;
            })
        );
    };

    const handleClear = () => {
        setRows((prev) =>
            prev.map((row) => ({
                ...row,
                currWater: null,
                currElectric: null,
                waterUnits: 0,
                electricUnits: 0,
                waterCharge: 0,
                electricCharge: 0,
                note: "",
            }))
        );
        setMsg("");
    };

    const handleSave = async () => {
        setSaving(true);
        setMsg("");

        try {
            let saved = 0;
            let failed = 0;

            for (const row of rows) {
                if (row.currWater === null && row.currElectric === null && !row.note.trim()) {
                    continue;
                }

                const payload: Record<string, unknown> = {
                    month: selectedMonth,
                    currWater: Number(row.currWater ?? row.prevWater ?? 0),
                    currElectric: Number(row.currElectric ?? row.prevElectric ?? 0),
                    note: row.note.trim() || null,
                };

                if (row.cycleId) {
                    payload.cycleId = row.cycleId;
                }

                const res = await fetch(`${API}/api/v1/owner/rooms/${row.id}/meters`, {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    saved++;
                } else {
                    failed++;
                    const errText = await res.text().catch(() => "");
                    console.error(`Save meter failed for room ${row.roomNo}:`, errText);
                }
            }

            if (failed > 0) {
                setMsg(`บันทึกสำเร็จ ${saved} ห้อง, ไม่สำเร็จ ${failed} ห้อง`);
            } else {
                setMsg(`บันทึกสำเร็จ ${saved} ห้อง`);
            }

            setReloadKey((prev) => prev + 1);
        } catch (e: unknown) {
            setMsg(`เกิดข้อผิดพลาด: ${e instanceof Error ? e.message : "Unknown error"}`);
        } finally {
            setSaving(false);
        }
    };

    const condoName = useCondoStore(s => s.condoName);

    return (
        <OwnerShell activeKey="meter" condoName={condoName || "คอนโดมิเนียม"}>
            <div className="w-full mx-auto animate-in fade-in duration-300 pt-6 px-8 pb-10">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/owner/meter")}
                            aria-label="ย้อนกลับ"
                            className="h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-[0.98] transition shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-extrabold text-gray-900">จดมิเตอร์</h1>
                            <p className="text-sm font-bold text-gray-400 mt-1">
                                เดือน {monthInputToThaiLabel(selectedMonth)}
                            </p>
                            {msg && (
                                <p
                                    className={`text-sm font-bold mt-2 ${
                                        msg.includes("สำเร็จ") && !msg.includes("ไม่สำเร็จ")
                                            ? "text-emerald-600"
                                            : msg.includes("สำเร็จ")
                                                ? "text-amber-600"
                                                : "text-rose-600"
                                    }`}
                                >
                                    {msg}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <select
                            aria-label="เลือกเดือน"
                            value={selectedMonth.split("-")[1] || "01"}
                            onChange={(e) => {
                                const year = selectedMonth.split("-")[0] || String(new Date().getFullYear());
                                setSelectedMonth(`${year}-${e.target.value}`);
                                setPage(1);
                            }}
                            className="h-[42px] rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none cursor-pointer"
                        >
                            {[
                                { value: "01", label: "มกราคม" },
                                { value: "02", label: "กุมภาพันธ์" },
                                { value: "03", label: "มีนาคม" },
                                { value: "04", label: "เมษายน" },
                                { value: "05", label: "พฤษภาคม" },
                                { value: "06", label: "มิถุนายน" },
                                { value: "07", label: "กรกฎาคม" },
                                { value: "08", label: "สิงหาคม" },
                                { value: "09", label: "กันยายน" },
                                { value: "10", label: "ตุลาคม" },
                                { value: "11", label: "พฤศจิกายน" },
                                { value: "12", label: "ธันวาคม" },
                            ].map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                        <select
                            aria-label="เลือกปี"
                            value={selectedMonth.split("-")[0] || String(new Date().getFullYear())}
                            onChange={(e) => {
                                const month = selectedMonth.split("-")[1] || "01";
                                setSelectedMonth(`${e.target.value}-${month}`);
                                setPage(1);
                            }}
                            className="h-[42px] rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none cursor-pointer"
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                                <option key={y} value={String(y)}>{y + 543}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    <div className="rounded-2xl bg-white border border-blue-100 shadow-sm px-5 py-4">
                        <div className="text-xs font-bold text-gray-400">กรอกค่าน้ำแล้ว</div>
                        <div className="text-2xl font-extrabold text-gray-900 mt-2">{summary.waterEntered}</div>
                        <div className="text-xs font-bold text-gray-400 mt-2">เรท {waterRate} บ./หน่วย</div>
                    </div>

                    <div className="rounded-2xl bg-white border border-blue-100 shadow-sm px-5 py-4">
                        <div className="text-xs font-bold text-gray-400">กรอกค่าไฟแล้ว</div>
                        <div className="text-2xl font-extrabold text-gray-900 mt-2">{summary.electricEntered}</div>
                        <div className="text-xs font-bold text-gray-400 mt-2">เรท {electricRate} บ./หน่วย</div>
                    </div>

                    <div className="rounded-2xl bg-white border border-blue-100 shadow-sm px-5 py-4">
                        <div className="text-xs font-bold text-gray-400">หน่วยน้ำรวม</div>
                        <div className="text-2xl font-extrabold text-gray-900 mt-2">{summary.totalWaterUnits.toLocaleString()}</div>
                        <div className="text-xs font-bold text-gray-400 mt-2">{formatMoney(summary.totalWaterCharge)}</div>
                    </div>

                    <div className="rounded-2xl bg-white border border-blue-100 shadow-sm px-5 py-4">
                        <div className="text-xs font-bold text-gray-400">หน่วยไฟรวม</div>
                        <div className="text-2xl font-extrabold text-gray-900 mt-2">{summary.totalElectricUnits.toLocaleString()}</div>
                        <div className="text-xs font-bold text-gray-400 mt-2">{formatMoney(summary.totalElectricCharge)}</div>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-2xl bg-white border border-blue-100 shadow-sm px-6 py-16 text-center">
                        <div className="text-sm font-extrabold text-gray-500">กำลังโหลดข้อมูลห้อง...</div>
                    </div>
                ) : (
                    <div className="rounded-3xl bg-white border border-blue-100 shadow-[0_4px_24px_rgba(147,197,253,0.15)] overflow-hidden">
                        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMeterType("water")}
                                    className={[
                                        "h-[42px] px-5 rounded-full font-extrabold text-sm transition flex items-center gap-2",
                                        meterType === "water"
                                            ? "bg-white border-2 border-[#93C5FD] text-[#93C5FD] shadow-sm"
                                            : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50",
                                    ].join(" ")}
                                >
                                    ค่าน้ำ ({waterRate} บ./หน่วย)
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setMeterType("electric")}
                                    className={[
                                        "h-[42px] px-5 rounded-full font-extrabold text-sm transition flex items-center gap-2",
                                        meterType === "electric"
                                            ? "bg-white border-2 border-[#93C5FD] text-[#93C5FD] shadow-sm"
                                            : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50",
                                    ].join(" ")}
                                >
                                    ค่าไฟ ({electricRate} บ./หน่วย)
                                </button>
                            </div>

                            <div className="relative w-64">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="ค้นหาห้อง / เลขมิเตอร์"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1250px] text-sm">
                                <thead>
                                    <tr className="border-t border-b border-gray-100">
                                        <th className="py-4 px-6 text-left font-extrabold text-gray-500 text-xs uppercase tracking-wider">ห้อง</th>
                                        <th className="py-4 px-4 text-left font-extrabold text-gray-500 text-xs uppercase tracking-wider">เลขมิเตอร์</th>
                                        <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">ยอดก่อนหน้า</th>
                                        <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">ยอดปัจจุบัน</th>
                                        <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">หน่วยที่ใช้</th>
                                        <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">ค่าใช้จ่าย</th>
                                        <th className="py-4 px-4 text-left font-extrabold text-gray-500 text-xs uppercase tracking-wider">หมายเหตุ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageData.map((r) => {
                                        const prevReading = meterType === "water" ? r.prevWater : r.prevElectric;
                                        const currReading = meterType === "water" ? r.currWater : r.currElectric;
                                        const units = meterType === "water" ? r.waterUnits : r.electricUnits;
                                        const cost = meterType === "water" ? r.waterCharge : r.electricCharge;
                                        const meterNo = meterType === "water" ? r.waterMeterNo : r.electricMeterNo;

                                        return (
                                            <tr key={r.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition align-top">
                                                <td className="py-5 px-6">
                                                    <div className="font-extrabold text-gray-900 text-base">{r.roomNo}</div>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span
                                                            className={[
                                                                "inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border",
                                                                r.status === "active"
                                                                    ? "bg-red-50 border-red-200 text-red-500"
                                                                    : "bg-green-50 border-green-200 text-green-500",
                                                            ].join(" ")}
                                                        >
                                                            {r.status === "active" ? "ไม่ว่าง" : "ว่าง"}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-400">ชั้น {r.floor || "-"}</span>
                                                    </div>
                                                </td>

                                                <td className="py-5 px-4 font-bold text-gray-700">
                                                    {meterNo || "ยังไม่ตั้งเลขมิเตอร์"}
                                                </td>

                                                <td className="py-5 px-4 text-center font-bold text-gray-700">
                                                    {prevReading.toLocaleString()}
                                                </td>

                                                <td className="py-5 px-4 text-center">
                                                    {meterType === "water" ? (
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={r.currWater ?? ""}
                                                            onChange={(e) => handleFieldChange(r.id, "currWater", e.target.value)}
                                                            placeholder="0"
                                                            className="w-28 text-center rounded-lg border border-gray-200 bg-gray-50 py-2 px-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white"
                                                        />
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={r.currElectric ?? ""}
                                                            onChange={(e) => handleFieldChange(r.id, "currElectric", e.target.value)}
                                                            placeholder="0"
                                                            className="w-28 text-center rounded-lg border border-gray-200 bg-gray-50 py-2 px-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white"
                                                        />
                                                    )}

                                                    <div className="text-xs text-gray-400 font-bold mt-2">
                                                        ปัจจุบัน: {currReading !== null ? currReading.toLocaleString() : "-"}
                                                    </div>
                                                </td>

                                                <td className="py-5 px-4 text-center font-bold text-[#93C5FD]">
                                                    {units.toLocaleString()}
                                                </td>

                                                <td className="py-5 px-4 text-center font-bold text-gray-700">
                                                    {formatMoney(cost)}
                                                </td>

                                                <td className="py-5 px-4">
                                                    <input
                                                        type="text"
                                                        value={r.note}
                                                        onChange={(e) => handleFieldChange(r.id, "note", e.target.value)}
                                                        placeholder="หมายเหตุเพิ่มเติม"
                                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 px-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {pageData.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-16 text-center text-gray-400 font-bold">
                                                ไม่พบข้อมูลห้อง
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between px-6 py-5 border-t border-gray-100 flex-wrap gap-3">
                            <div className="text-sm font-bold text-gray-400">
                                แสดงทั้งหมด {pageData.length} รายการ จาก {filtered.length} รายการ
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleClear}
                                    className="h-[44px] px-6 rounded-xl bg-white border border-gray-200 text-gray-600 font-extrabold text-sm hover:bg-gray-50 active:scale-[0.98] transition flex items-center gap-2"
                                >
                                    ล้างข้อมูล
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="h-[44px] px-6 rounded-xl bg-[#93C5FD] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(147,197,253,0.4)] hover:bg-[#7fb4fb] active:scale-[0.98] transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                                </button>
                            </div>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 py-5 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-blue-50/50 border-t border-blue-100/50">
                                <button
                                    type="button"
                                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    aria-label="หน้าก่อนหน้า"
                                    className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPage(p)}
                                        className={[
                                            "w-9 h-9 rounded-lg font-extrabold text-sm transition",
                                            currentPage === p
                                                ? "bg-[#93C5FD] text-white shadow-md"
                                                : "bg-white border border-gray-200 text-gray-600 hover:bg-blue-50",
                                        ].join(" ")}
                                    >
                                        {p}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    aria-label="หน้าถัดไป"
                                    className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </OwnerShell>
    );
}