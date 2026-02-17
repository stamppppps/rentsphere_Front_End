import { useMemo, useState } from "react";
import OwnerShell from "@/features/owner/components/OwnerShell";

/* ================================================================
   Types
   ================================================================ */
type TabKey = "income" | "expense" | "billing";
type PeriodKey = "monthly" | "quarterly" | "yearly";

interface BillingRecord {
    id: string;
    invoiceNo: string;
    roomNo: string;
    tenantName: string;
    waterFee: number;
    electricFee: number;
    rentFee: number;
    totalFee: number;
    status: "paid" | "pending" | "overdue";
    date: string;
}

/* ================================================================
   Mock data
   ================================================================ */
const MOCK_BILLING: BillingRecord[] = [
    { id: "1", invoiceNo: "INV-2026-001", roomNo: "101", tenantName: "สุดหล่อ หน่นา", waterFee: 360, electricFee: 1200, rentFee: 5500, totalFee: 7060, status: "paid", date: "15/01/2569" },
    { id: "2", invoiceNo: "INV-2026-002", roomNo: "102", tenantName: "วิสัชร เพลิง", waterFee: 270, electricFee: 980, rentFee: 5500, totalFee: 6750, status: "paid", date: "15/01/2569" },
    { id: "3", invoiceNo: "INV-2026-003", roomNo: "103", tenantName: "นฉศิษณ์ คำดี", waterFee: 410, electricFee: 1450, rentFee: 6000, totalFee: 7860, status: "pending", date: "15/01/2569" },
    { id: "4", invoiceNo: "INV-2026-004", roomNo: "201", tenantName: "สมชาย ใจดี", waterFee: 320, electricFee: 1100, rentFee: 5500, totalFee: 6920, status: "paid", date: "15/01/2569" },
    { id: "5", invoiceNo: "INV-2026-005", roomNo: "202", tenantName: "ปรียา วรรณดี", waterFee: 540, electricFee: 1800, rentFee: 7000, totalFee: 9340, status: "overdue", date: "15/01/2569" },
    { id: "6", invoiceNo: "INV-2026-006", roomNo: "301", tenantName: "วรรณา สุข", waterFee: 290, electricFee: 870, rentFee: 5500, totalFee: 6660, status: "paid", date: "15/01/2569" },
    { id: "7", invoiceNo: "INV-2026-007", roomNo: "302", tenantName: "ธนพล เก่ง", waterFee: 380, electricFee: 1350, rentFee: 6000, totalFee: 7730, status: "pending", date: "15/01/2569" },
    { id: "8", invoiceNo: "INV-2026-008", roomNo: "401", tenantName: "มานี รักดี", waterFee: 310, electricFee: 1050, rentFee: 5500, totalFee: 6860, status: "paid", date: "15/01/2569" },
    { id: "9", invoiceNo: "INV-2026-009", roomNo: "402", tenantName: "กมล ศรีสุข", waterFee: 450, electricFee: 1600, rentFee: 7000, totalFee: 9050, status: "overdue", date: "15/01/2569" },
    { id: "10", invoiceNo: "INV-2026-010", roomNo: "501", tenantName: "พิมพ์ใจ ดีงาม", waterFee: 260, electricFee: 920, rentFee: 5500, totalFee: 6680, status: "paid", date: "15/01/2569" },
    { id: "11", invoiceNo: "INV-2026-011", roomNo: "502", tenantName: "อรรถพล วงศ์", waterFee: 330, electricFee: 1150, rentFee: 6000, totalFee: 7480, status: "paid", date: "15/01/2569" },
    { id: "12", invoiceNo: "INV-2026-012", roomNo: "601", tenantName: "สุภาพร เลิศ", waterFee: 400, electricFee: 1380, rentFee: 6500, totalFee: 8280, status: "pending", date: "15/01/2569" },
];

const SUMMARY = {
    totalIncome: 124500,
    totalExpense: 32450,
    netProfit: 92050,
    occupancy: 85,
};

/* ================================================================
   Status helpers
   ================================================================ */
function statusLabel(s: BillingRecord["status"]) {
    switch (s) {
        case "paid": return "ชำระแล้ว";
        case "pending": return "รอชำระ";
        case "overdue": return "ค้างชำระ";
    }
}

function statusClass(s: BillingRecord["status"]) {
    switch (s) {
        case "paid": return "bg-green-50 border-green-200 text-green-600";
        case "pending": return "bg-amber-50 border-amber-200 text-amber-600";
        case "overdue": return "bg-red-50 border-red-200 text-red-500";
    }
}

/* ================================================================
   Tabs config
   ================================================================ */
const TABS: { key: TabKey; label: string; icon: JSX.Element }[] = [
    {
        key: "income",
        label: "รายรับ",
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
        key: "expense",
        label: "รายจ่าย",
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    },
    {
        key: "billing",
        label: "บิลทั้งหมด",
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
];

const PERIODS: { key: PeriodKey; label: string }[] = [
    { key: "monthly", label: "รายเดือน" },
    { key: "quarterly", label: "รายไตรมาส" },
    { key: "yearly", label: "รายปี" },
];

/* ================================================================
   Main Page
   ================================================================ */
export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("billing");
    const [period, setPeriod] = useState<PeriodKey>("monthly");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const PER_PAGE = 5;

    /* Filtered data */
    const filtered = useMemo(() => {
        if (!search.trim()) return MOCK_BILLING;
        const q = search.trim().toLowerCase();
        return MOCK_BILLING.filter(
            (r) =>
                r.roomNo.includes(q) ||
                r.tenantName.toLowerCase().includes(q) ||
                r.invoiceNo.toLowerCase().includes(q)
        );
    }, [search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const startIdx = (page - 1) * PER_PAGE + 1;
    const endIdx = Math.min(page * PER_PAGE, filtered.length);

    /* Totals for footer */
    const pageTotals = useMemo(() => {
        return pageData.reduce(
            (acc, r) => ({
                water: acc.water + r.waterFee,
                electric: acc.electric + r.electricFee,
                rent: acc.rent + r.rentFee,
                total: acc.total + r.totalFee,
            }),
            { water: 0, electric: 0, rent: 0, total: 0 }
        );
    }, [pageData]);

    return (
        <OwnerShell activeKey="reports">
            <div className="w-full mx-auto animate-in fade-in duration-300 pt-6 px-8 pb-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">รายงาน</h1>
                        <p className="text-sm font-bold text-gray-500 mt-1 pt-1">
                            สรุปภาพรวมรายรับ-รายจ่าย และบิลทั้งหมดของอาคาร A
                        </p>
                    </div>

                    {/* Export buttons */}
                    <div className="flex items-center gap-2">
                        <button className="h-[40px] px-4 rounded-lg bg-white border border-gray-200 text-gray-600 font-extrabold text-sm hover:bg-gray-50 active:scale-[0.98] transition flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export CSV
                        </button>
                        <button className="h-[40px] px-4 rounded-lg bg-[#93C5FD] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(147,197,253,0.4)] hover:bg-[#7fb4fb] active:scale-[0.98] transition flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            พิมพ์รายงาน
                        </button>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* รายรับรวม */}
                    <div className="rounded-2xl bg-white border border-blue-100 px-5 py-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#93C5FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">รายรับรวม</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{SUMMARY.totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs font-bold text-green-500 mt-1">▲ 12% จากเดือนก่อน</p>
                    </div>

                    {/* รายจ่ายรวม */}
                    <div className="rounded-2xl bg-white border border-red-100 px-5 py-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">รายจ่ายรวม</span>
                        </div>
                        <p className="text-2xl font-black text-red-500">{SUMMARY.totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs font-bold text-red-400 mt-1">▲ 5% จากเดือนก่อน</p>
                    </div>

                    {/* กำไรสุทธิ */}
                    <div className="rounded-2xl bg-white border border-green-100 px-5 py-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">กำไรสุทธิ</span>
                        </div>
                        <p className="text-2xl font-black text-green-600">{SUMMARY.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs font-bold text-green-500 mt-1">▲ 8% จากเดือนก่อน</p>
                    </div>

                    {/* อัตราเข้าพัก */}
                    <div className="rounded-2xl bg-white border border-amber-100 px-5 py-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">อัตราเข้าพัก</span>
                        </div>
                        <p className="text-2xl font-black text-amber-600">{SUMMARY.occupancy}%</p>
                        <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${SUMMARY.occupancy}%` }} />
                        </div>
                    </div>
                </div>

                {/* Tabs + Period + Search */}
                <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                    {/* Tabs */}
                    <div className="flex items-center gap-2">
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => { setActiveTab(t.key); setPage(1); }}
                                className={[
                                    "h-[40px] px-5 rounded-full font-extrabold text-sm transition flex items-center gap-2",
                                    activeTab === t.key
                                        ? "bg-white border-2 border-[#93C5FD] text-[#93C5FD] shadow-sm"
                                        : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50",
                                ].join(" ")}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Period selector */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                            {PERIODS.map((p) => (
                                <button
                                    key={p.key}
                                    type="button"
                                    onClick={() => setPeriod(p.key)}
                                    className={[
                                        "px-4 py-2 text-xs font-extrabold transition",
                                        period === p.key
                                            ? "bg-[#93C5FD] text-white"
                                            : "text-gray-500 hover:bg-gray-50",
                                    ].join(" ")}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-52">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="ค้นหา..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Table card */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="py-4 px-4 text-left font-extrabold text-gray-500 text-xs uppercase tracking-wider w-10">#</th>
                                <th className="py-4 px-4 text-left font-extrabold text-gray-500 text-xs uppercase tracking-wider">เลขที่บิล</th>
                                <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">ห้อง</th>
                                <th className="py-4 px-4 text-left font-extrabold text-gray-500 text-xs uppercase tracking-wider">ผู้เช่า</th>
                                <th className="py-4 px-4 text-right font-extrabold text-gray-500 text-xs uppercase tracking-wider">ค่าน้ำ</th>
                                <th className="py-4 px-4 text-right font-extrabold text-gray-500 text-xs uppercase tracking-wider">ค่าไฟ</th>
                                <th className="py-4 px-4 text-right font-extrabold text-gray-500 text-xs uppercase tracking-wider">ค่าเช่า</th>
                                <th className="py-4 px-4 text-right font-extrabold text-gray-500 text-xs uppercase tracking-wider">รวม</th>
                                <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">สถานะ</th>
                                <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">วันที่</th>
                                <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.map((r, idx) => (
                                <tr key={r.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition">
                                    <td className="py-4 px-4 font-bold text-gray-400">{startIdx + idx}</td>
                                    <td className="py-4 px-4 font-bold text-gray-700">{r.invoiceNo}</td>
                                    <td className="py-4 px-4 text-center font-extrabold text-gray-900">{r.roomNo}</td>
                                    <td className="py-4 px-4 font-bold text-gray-700">{r.tenantName}</td>
                                    <td className="py-4 px-4 text-right font-bold text-gray-600">{r.waterFee.toLocaleString()}</td>
                                    <td className="py-4 px-4 text-right font-bold text-gray-600">{r.electricFee.toLocaleString()}</td>
                                    <td className="py-4 px-4 text-right font-bold text-gray-600">{r.rentFee.toLocaleString()}</td>
                                    <td className="py-4 px-4 text-right font-extrabold text-[#93C5FD]">{r.totalFee.toLocaleString()}</td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${statusClass(r.status)}`}>
                                            {statusLabel(r.status)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-center font-bold text-gray-500 text-xs">{r.date}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="text-gray-400 hover:text-[#93C5FD] transition" title="ดูรายละเอียด">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button className="text-gray-400 hover:text-[#93C5FD] transition" title="ดาวน์โหลด">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {pageData.length === 0 && (
                                <tr>
                                    <td colSpan={11} className="py-16 text-center text-gray-400 font-bold">
                                        ไม่พบข้อมูลรายงาน
                                    </td>
                                </tr>
                            )}
                        </tbody>

                        {/* Table footer totals */}
                        {pageData.length > 0 && (
                            <tfoot>
                                <tr className="bg-blue-50/30 border-t border-gray-100">
                                    <td colSpan={4} className="py-4 px-4 font-extrabold text-gray-600 text-sm">รวมหน้านี้</td>
                                    <td className="py-4 px-4 text-right font-extrabold text-gray-700">{pageTotals.water.toLocaleString()}</td>
                                    <td className="py-4 px-4 text-right font-extrabold text-gray-700">{pageTotals.electric.toLocaleString()}</td>
                                    <td className="py-4 px-4 text-right font-extrabold text-gray-700">{pageTotals.rent.toLocaleString()}</td>
                                    <td className="py-4 px-4 text-right font-extrabold text-[#93C5FD]">{pageTotals.total.toLocaleString()}</td>
                                    <td colSpan={3}></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm font-bold text-gray-400">
                            แสดง {startIdx} ถึง {endIdx} จาก {filtered.length} รายการ
                        </p>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPage(p)}
                                        className={[
                                            "w-8 h-8 rounded-lg font-extrabold text-sm transition",
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
                                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </OwnerShell>
    );
}
