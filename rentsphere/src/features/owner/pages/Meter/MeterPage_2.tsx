import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OwnerShell from "@/features/owner/components/OwnerShell";
import { getSelectedCondoId } from "@/features/owner/stores/condoStore";

/* ================================================================
   Types
   ================================================================ */
type MeterType = "water" | "electric";

interface RoomMeter {
    id: string;
    roomNo: string;
    floor: number;
    status: "active" | "inactive";
    oldReading: number;
    newReading: number | null;
    usage: number;
    cost: number;
}

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getAuthToken(): string {
    try { const raw = localStorage.getItem("rentsphere_auth"); if (!raw) return ""; return JSON.parse(raw)?.state?.token || ""; } catch { return ""; }
}
function authHeaders() {
    const t = getAuthToken();
    return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

/* ================================================================
   MeterPage_2  –  Record View (จดมิเตอร์)
   ================================================================ */
export default function MeterPage2() {
    const navigate = useNavigate();
    const [meterType, setMeterType] = useState<MeterType>("water");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");
    const PER_PAGE = 4;

    const [waterRate, setWaterRate] = useState(18);
    const [electricRate, setElectricRate] = useState(8);
    const rate = meterType === "water" ? waterRate : electricRate;

    const [waterData, setWaterData] = useState<RoomMeter[]>([]);
    const [electricData, setElectricData] = useState<RoomMeter[]>([]);
    const [loading, setLoading] = useState(true);

    const data = meterType === "water" ? waterData : electricData;
    const setData = meterType === "water" ? setWaterData : setElectricData;

    // ========== Fetch rooms + meter readings on mount ==========
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const condoId = getSelectedCondoId();
                if (!condoId) { setLoading(false); return; }

                // Fetch rooms + utility rates in parallel
                const [roomRes, utilRes] = await Promise.all([
                    fetch(`${API}/api/v1/owner/condos/${condoId}/rooms`, { headers: authHeaders() }),
                    fetch(`${API}/api/v1/owner/condos/${condoId}/utilities`, { headers: authHeaders() }).catch(() => null),
                ]);

                if (cancelled) return;

                const roomsRaw = await roomRes.json();
                const rooms: any[] = Array.isArray(roomsRaw) ? roomsRaw : (roomsRaw?.rooms || []);

                // Utility rates
                if (utilRes?.ok) {
                    const utilsRaw = await utilRes.json();
                    const configs: any[] = utilsRaw?.configs || utilsRaw?.items || (Array.isArray(utilsRaw) ? utilsRaw : []);
                    for (const c of configs) {
                        if (c.utility_type === "water" || c.utilityType === "water") setWaterRate(Number(c.rate || c.pricePerUnit || 18));
                        if (c.utility_type === "electricity" || c.utilityType === "electricity") setElectricRate(Number(c.rate || c.pricePerUnit || 8));
                    }
                }

                // Fetch meter readings for each room
                const meterPromises = rooms.map((r: any) =>
                    fetch(`${API}/api/v1/owner/rooms/${r.id}/meters`, { headers: authHeaders() })
                        .then(res => res.ok ? res.json() : null)
                        .catch(() => null)
                );
                const meterResults = await Promise.all(meterPromises);
                if (cancelled) return;

                const waterItems: RoomMeter[] = [];
                const electricItems: RoomMeter[] = [];

                rooms.forEach((r: any, i: number) => {
                    const meter = meterResults[i];
                    const isOccupied = r.occupancyStatus === "OCCUPIED";

                    waterItems.push({
                        id: r.id,
                        roomNo: r.roomNo || "—",
                        floor: r.floor || 0,
                        status: isOccupied ? "active" : "inactive",
                        oldReading: meter?.prevWater ?? 0,
                        newReading: meter?.currWater ?? null,
                        usage: meter?.waterUnits ?? 0,
                        cost: (meter?.waterUnits ?? 0) * waterRate,
                    });

                    electricItems.push({
                        id: r.id,
                        roomNo: r.roomNo || "—",
                        floor: r.floor || 0,
                        status: isOccupied ? "active" : "inactive",
                        oldReading: meter?.prevElectric ?? 0,
                        newReading: meter?.currElectric ?? null,
                        usage: meter?.electricUnits ?? 0,
                        cost: (meter?.electricUnits ?? 0) * electricRate,
                    });
                });

                setWaterData(waterItems);
                setElectricData(electricItems);
            } catch (e) {
                console.error("MeterPage2 load error:", e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const filtered = useMemo(() => {
        if (!search.trim()) return data;
        return data.filter((r) => r.roomNo.includes(search.trim()));
    }, [data, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const handleNewReading = (id: string, val: string) => {
        const num = val === "" ? null : Number(val);
        setData((prev) =>
            prev.map((r) => {
                if (r.id !== id) return r;
                const newReading = num;
                const usage = newReading !== null && newReading >= r.oldReading ? newReading - r.oldReading : 0;
                return { ...r, newReading, usage, cost: usage * rate };
            })
        );
    };

    // ========== Save all meter readings ==========
    const handleSave = async () => {
        setSaving(true);
        setMsg("");
        try {
            // Collect all rooms that have newReading entered
            const waterToSave = waterData.filter(r => r.newReading !== null);
            const electricToSave = electricData.filter(r => r.newReading !== null);

            // For each room, we need both water and electric readings
            const roomIds = new Set([
                ...waterToSave.map(r => r.id),
                ...electricToSave.map(r => r.id),
            ]);

            const waterMap = Object.fromEntries(waterData.map(r => [r.id, r]));
            const electricMap = Object.fromEntries(electricData.map(r => [r.id, r]));

            let saved = 0;
            for (const roomId of roomIds) {
                const w = waterMap[roomId];
                const e = electricMap[roomId];
                const currWater = w?.newReading ?? w?.oldReading ?? 0;
                const currElectric = e?.newReading ?? e?.oldReading ?? 0;

                const res = await fetch(`${API}/api/v1/owner/rooms/${roomId}/meters`, {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify({ currWater, currElectric }),
                });

                if (res.ok) saved++;
            }

            setMsg(`บันทึกสำเร็จ ${saved} ห้อง`);
        } catch (e: any) {
            setMsg(`เกิดข้อผิดพลาด: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleClear = () => {
        setWaterData(prev => prev.map(r => ({ ...r, newReading: null, usage: 0, cost: 0 })));
        setElectricData(prev => prev.map(r => ({ ...r, newReading: null, usage: 0, cost: 0 })));
        setMsg("");
    };

    const totalRecords = filtered.length;

    return (
        <OwnerShell activeKey="meter">
            <div className="w-full mx-auto animate-in fade-in duration-300 pt-6 px-8 pb-10">
                {/* Page title + back button */}
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
                            {msg && <p className={`text-sm font-bold mt-1 ${msg.includes("สำเร็จ") ? "text-emerald-600" : "text-rose-600"}`}>{msg}</p>}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-2xl bg-white border border-blue-100 shadow-sm px-6 py-16 text-center">
                        <div className="text-sm font-extrabold text-gray-500">กำลังโหลดข้อมูลห้อง...</div>
                    </div>
                ) : (
                    /* Card container */
                    <div className="rounded-3xl bg-white border border-blue-100 shadow-[0_4px_24px_rgba(147,197,253,0.15)] overflow-hidden">
                        {/* Tabs + Search row */}
                        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                {/* Water tab */}
                                <button
                                    type="button"
                                    onClick={() => { setMeterType("water"); setPage(1); }}
                                    className={[
                                        "h-[42px] px-5 rounded-full font-extrabold text-sm transition flex items-center gap-2",
                                        meterType === "water"
                                            ? "bg-white border-2 border-[#93C5FD] text-[#93C5FD] shadow-sm"
                                            : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50",
                                    ].join(" ")}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c-4 4.5-7 8-7 11a7 7 0 1014 0c0-3-3-6.5-7-11z" />
                                    </svg>
                                    ค่าน้ำ ({waterRate} บ./หน่วย)
                                </button>
                                {/* Electric tab */}
                                <button
                                    type="button"
                                    onClick={() => { setMeterType("electric"); setPage(1); }}
                                    className={[
                                        "h-[42px] px-5 rounded-full font-extrabold text-sm transition flex items-center gap-2",
                                        meterType === "electric"
                                            ? "bg-white border-2 border-[#93C5FD] text-[#93C5FD] shadow-sm"
                                            : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50",
                                    ].join(" ")}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    ค่าไฟ ({electricRate} บ./หน่วย)
                                </button>
                            </div>

                            {/* Search */}
                            <div className="flex items-center gap-2">
                                <div className="relative w-56">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="ค้นหาห้อง..."
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-t border-b border-gray-100">
                                    <th className="py-4 px-6 text-left font-extrabold text-gray-500 text-xs uppercase tracking-wider">ห้อง</th>
                                    <th className="py-4 px-4 text-left font-extrabold text-gray-500 text-xs uppercase tracking-wider">สถานะห้อง</th>
                                    <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">ยอดครั้งก่อน</th>
                                    <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">ยอดปัจจุบัน</th>
                                    <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">หน่วยที่ใช้</th>
                                    <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">ค่าใช้จ่าย</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageData.map((r) => (
                                    <tr key={r.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition">
                                        <td className="py-5 px-6 font-extrabold text-gray-900 text-base">{r.roomNo}</td>
                                        <td className="py-5 px-4">
                                            <span className={[
                                                "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold border",
                                                r.status === "active"
                                                    ? "bg-red-50 border-red-200 text-red-500"
                                                    : "bg-green-50 border-green-200 text-green-500",
                                            ].join(" ")}>
                                                {r.status === "active" ? "ไม่ว่าง" : "ว่าง"}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4 text-center font-bold text-gray-700">
                                            {r.oldReading.toLocaleString()}
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <input
                                                type="number"
                                                value={r.newReading ?? ""}
                                                onChange={(e) => handleNewReading(r.id, e.target.value)}
                                                placeholder="0"
                                                className="w-24 text-center rounded-lg border border-gray-200 bg-gray-50 py-2 px-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white"
                                            />
                                        </td>
                                        <td className="py-5 px-4 text-center font-bold text-[#93C5FD]">
                                            {r.usage > 0 ? r.usage.toLocaleString() : "0"}
                                        </td>
                                        <td className="py-5 px-4 text-center font-bold text-gray-700">
                                            {r.cost > 0 ? `฿${r.cost.toLocaleString()}` : "฿0"}
                                        </td>
                                    </tr>
                                ))}

                                {pageData.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-gray-400 font-bold">
                                            ไม่พบข้อมูลห้อง
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Footer: info + buttons */}
                        <div className="flex items-center justify-between px-6 py-5 border-t border-gray-100 flex-wrap gap-3">
                            <div className="text-sm font-bold text-gray-400">
                                แสดงทั้งหมด {pageData.length} รายการ จาก {totalRecords} รายการ
                            </div>

                            <div className="flex items-center gap-3">
                                <button onClick={handleClear} className="h-[44px] px-6 rounded-xl bg-white border border-gray-200 text-gray-600 font-extrabold text-sm hover:bg-gray-50 active:scale-[0.98] transition flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    ล้างข้อมูล
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="h-[44px] px-6 rounded-xl bg-[#93C5FD] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(147,197,253,0.4)] hover:bg-[#7fb4fb] active:scale-[0.98] transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                    {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                                </button>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 py-5 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-blue-50/50 border-t border-blue-100/50">
                                <button
                                    type="button"
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    aria-label="หน้าก่อนหน้า"
                                    className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPage(p)}
                                        className={[
                                            "w-9 h-9 rounded-lg font-extrabold text-sm transition",
                                            page === p
                                                ? "bg-[#93C5FD] text-white shadow-md"
                                                : "bg-white border border-gray-200 text-gray-600 hover:bg-blue-50",
                                        ].join(" ")}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    aria-label="หน้าถัดไป"
                                    className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </OwnerShell>
    );
}
