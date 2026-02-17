import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OwnerShell from "@/features/owner/components/OwnerShell";

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

/* ================================================================
   Mock helpers
   ================================================================ */
const MOCK_ROOMS: RoomMeter[] = [
    { id: "1", roomNo: "101", floor: 1, status: "active", oldReading: 1240, newReading: null, usage: 0, cost: 0 },
    { id: "2", roomNo: "102", floor: 1, status: "inactive", oldReading: 850, newReading: null, usage: 0, cost: 0 },
    { id: "3", roomNo: "201", floor: 2, status: "active", oldReading: 450, newReading: null, usage: 0, cost: 0 },
    { id: "4", roomNo: "202", floor: 2, status: "active", oldReading: 2100, newReading: null, usage: 0, cost: 0 },
    { id: "5", roomNo: "301", floor: 3, status: "active", oldReading: 1560, newReading: null, usage: 0, cost: 0 },
    { id: "6", roomNo: "302", floor: 3, status: "inactive", oldReading: 720, newReading: null, usage: 0, cost: 0 },
    { id: "7", roomNo: "401", floor: 4, status: "active", oldReading: 980, newReading: null, usage: 0, cost: 0 },
    { id: "8", roomNo: "402", floor: 4, status: "active", oldReading: 1340, newReading: null, usage: 0, cost: 0 },
    { id: "9", roomNo: "501", floor: 5, status: "inactive", oldReading: 620, newReading: null, usage: 0, cost: 0 },
    { id: "10", roomNo: "502", floor: 5, status: "active", oldReading: 1890, newReading: null, usage: 0, cost: 0 },
    { id: "11", roomNo: "601", floor: 6, status: "active", oldReading: 430, newReading: null, usage: 0, cost: 0 },
    { id: "12", roomNo: "602", floor: 6, status: "active", oldReading: 1750, newReading: null, usage: 0, cost: 0 },
    { id: "13", roomNo: "701", floor: 7, status: "inactive", oldReading: 310, newReading: null, usage: 0, cost: 0 },
    { id: "14", roomNo: "702", floor: 7, status: "active", oldReading: 2450, newReading: null, usage: 0, cost: 0 },
    { id: "15", roomNo: "801", floor: 8, status: "active", oldReading: 1100, newReading: null, usage: 0, cost: 0 },
    { id: "16", roomNo: "802", floor: 8, status: "active", oldReading: 560, newReading: null, usage: 0, cost: 0 },
    { id: "17", roomNo: "901", floor: 9, status: "inactive", oldReading: 890, newReading: null, usage: 0, cost: 0 },
    { id: "18", roomNo: "902", floor: 9, status: "active", oldReading: 1670, newReading: null, usage: 0, cost: 0 },
    { id: "19", roomNo: "1001", floor: 10, status: "active", oldReading: 2080, newReading: null, usage: 0, cost: 0 },
    { id: "20", roomNo: "1002", floor: 10, status: "active", oldReading: 940, newReading: null, usage: 0, cost: 0 },
];

const WATER_RATE = 18;
const ELECTRIC_RATE = 8;

/* ================================================================
   MeterPage_2  –  Record View (จดมิเตอร์)
   ================================================================ */
export default function MeterPage2() {
    const navigate = useNavigate();
    const [meterType, setMeterType] = useState<MeterType>("water");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const PER_PAGE = 4;

    const rate = meterType === "water" ? WATER_RATE : ELECTRIC_RATE;

    const [waterData, setWaterData] = useState<RoomMeter[]>(JSON.parse(JSON.stringify(MOCK_ROOMS)));
    const [electricData, setElectricData] = useState<RoomMeter[]>(JSON.parse(JSON.stringify(MOCK_ROOMS)));

    const data = meterType === "water" ? waterData : electricData;
    const setData = meterType === "water" ? setWaterData : setElectricData;

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
                            className="h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-[0.98] transition shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Card container */}
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
                                ค่าน้ำ
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
                                ค่าไฟ
                            </button>
                        </div>

                        {/* Search + filter */}
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
                            <button className="h-[42px] w-[42px] rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:bg-gray-50 transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </button>
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
                                <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">จัดการ</th>
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
                                    <td className="py-5 px-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button className="text-gray-400 hover:text-[#93C5FD] transition" title="ดูรายละเอียด">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button className="text-gray-400 hover:text-red-400 transition" title="ลบ">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
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
                            <button className="h-[44px] px-6 rounded-xl bg-white border border-gray-200 text-gray-600 font-extrabold text-sm hover:bg-gray-50 active:scale-[0.98] transition flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                ล้างข้อมูล
                            </button>
                            <button className="h-[44px] px-6 rounded-xl bg-[#93C5FD] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(147,197,253,0.4)] hover:bg-[#7fb4fb] active:scale-[0.98] transition flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                บันทึกข้อมูล
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
                                className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </OwnerShell>
    );
}
