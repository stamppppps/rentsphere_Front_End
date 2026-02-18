import { useMemo, useState } from "react";
import OwnerShell from "@/features/owner/components/OwnerShell";
import ContainerIcon from "@/assets/Container.png";

/* ================================================================
   Types
   ================================================================ */
interface BillingRecord {
    id: string;
    invoiceNo: string;
    roomNo: string;
    waterFee: number;
    electricFee: number;
    rentFee: number;
    otherFee: number;
    totalFee: number;
    unpaidAmount: number; // 0 if paid
    status: "paid" | "pending" | "overdue";
    date: string;
}

/* ================================================================
   Mock data
   ================================================================ */
const MOCK_BILLING: BillingRecord[] = [
    { id: "1", invoiceNo: "I2026010001", roomNo: "101", waterFee: 0, electricFee: 0, rentFee: 8000, otherFee: 0, totalFee: 8240, unpaidAmount: 8240, status: "overdue", date: "15/01/2569" },
    { id: "2", invoiceNo: "-", roomNo: "102", waterFee: 0, electricFee: 0, rentFee: 0, otherFee: 0, totalFee: 0, unpaidAmount: 0, status: "paid", date: "15/01/2569" },
    { id: "3", invoiceNo: "-", roomNo: "202", waterFee: 0, electricFee: 0, rentFee: 0, otherFee: 0, totalFee: 0, unpaidAmount: 0, status: "paid", date: "15/01/2569" },
    { id: "4", invoiceNo: "I2026010022", roomNo: "203", waterFee: 120, electricFee: 840, rentFee: 7500, otherFee: 0, totalFee: 8460, unpaidAmount: 0, status: "paid", date: "15/01/2569" },
    { id: "5", invoiceNo: "-", roomNo: "301", waterFee: 0, electricFee: 0, rentFee: 0, otherFee: 0, totalFee: 0, unpaidAmount: 0, status: "paid", date: "15/01/2569" },
    { id: "6", invoiceNo: "-", roomNo: "302", waterFee: 0, electricFee: 0, rentFee: 0, otherFee: 0, totalFee: 0, unpaidAmount: 0, status: "paid", date: "15/01/2569" },
    { id: "7", invoiceNo: "I2026010033", roomNo: "401", waterFee: 150, electricFee: 900, rentFee: 6500, otherFee: 0, totalFee: 7550, unpaidAmount: 7550, status: "pending", date: "15/01/2569" },
    { id: "8", invoiceNo: "I2026010044", roomNo: "402", waterFee: 180, electricFee: 1100, rentFee: 7000, otherFee: 100, totalFee: 8380, unpaidAmount: 0, status: "paid", date: "15/01/2569" },
    { id: "9", invoiceNo: "I2026010055", roomNo: "501", waterFee: 100, electricFee: 500, rentFee: 5500, otherFee: 0, totalFee: 6100, unpaidAmount: 0, status: "paid", date: "15/01/2569" },
    { id: "10", invoiceNo: "-", roomNo: "502", waterFee: 0, electricFee: 0, rentFee: 0, otherFee: 0, totalFee: 0, unpaidAmount: 0, status: "paid", date: "15/01/2569" },
];

const SUMMARY = {
    totalAmount: 142500,
    paidAmount: 125750,
    unpaidAmount: 16750,
    roomCount: 45,
};

/* ================================================================
   Main Page
   ================================================================ */
export default function ReportsPage() {
    const [page, setPage] = useState(1);
    const PER_PAGE = 6;

    const totalPages = Math.max(1, Math.ceil(MOCK_BILLING.length / PER_PAGE));
    const pageData = MOCK_BILLING.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const startIdx = (page - 1) * PER_PAGE + 1;
    const endIdx = Math.min(page * PER_PAGE, MOCK_BILLING.length);

    /* Totals for footer */
    const pageTotals = useMemo(() => {
        return pageData.reduce(
            (acc, r) => ({
                rent: acc.rent + r.rentFee,
                water: acc.water + r.waterFee,
                electric: acc.electric + r.electricFee,
                other: acc.other + r.otherFee,
                unpaid: acc.unpaid + r.unpaidAmount,
                total: acc.total + r.totalFee,
            }),
            { rent: 0, water: 0, electric: 0, other: 0, unpaid: 0, total: 0 }
        );
    }, [pageData]);

    return (
        <OwnerShell activeKey="reports">
            {/* Background wrapper with gradient to match style but keep blue theme */}
            <div className="min-h-screen w-full bg-gradient-to-b from-[#EAF2FF] to-[#f8faff] p-8 pb-12">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">รายงานบิลรายเดือน</h1>
                        <p className="text-sm font-bold text-gray-500 mt-1">
                            สรุปรายละเอียดค่าเช่าและค่าใช้จ่ายประจำเดือน มกราคม 2026
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="h-[40px] px-4 rounded-lg bg-white border border-gray-200 text-gray-600 font-extrabold text-sm hover:bg-gray-50 active:scale-[0.98] transition flex items-center gap-2 shadow-sm">
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            Export PDF
                        </button>
                        <button className="h-[40px] px-4 rounded-lg bg-white border border-gray-200 text-gray-600 font-extrabold text-sm hover:bg-gray-50 active:scale-[0.98] transition flex items-center gap-2 shadow-sm">
                            <img src={ContainerIcon} alt="Excel" className="w-5 h-5 object-contain" />
                            Export Excel
                        </button>
                        <button className="h-[40px] w-[40px] rounded-lg bg-[#93C5FD] text-white flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-[#7fb4fb] active:scale-[0.98] transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        </button>
                    </div>
                </div>

                {/* 2. Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* ยอดรวมทั้งหมด */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-blue-50">
                        <p className="text-xs font-bold text-gray-500 mb-2">ยอดรวมทั้งหมด</p>
                        <p className="text-2xl font-black text-gray-900">฿ {SUMMARY.totalAmount.toLocaleString()}</p>
                    </div>

                    {/* ชำระแล้ว */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-blue-50">
                        <p className="text-xs font-bold text-gray-500 mb-2">ชำระแล้ว</p>
                        <p className="text-2xl font-black text-green-600">฿ {SUMMARY.paidAmount.toLocaleString()}</p>
                    </div>

                    {/* ค้างชำระ */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-blue-50">
                        <p className="text-xs font-bold text-gray-500 mb-2">ค้างชำระ</p>
                        <p className="text-2xl font-black text-red-500">฿ {SUMMARY.unpaidAmount.toLocaleString()}</p>
                    </div>

                    {/* จำนวนห้อง */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-blue-50">
                        <p className="text-xs font-bold text-gray-500 mb-2">จำนวนห้อง</p>
                        <p className="text-2xl font-black text-gray-900">{SUMMARY.roomCount} <span className="text-lg font-bold text-gray-500 text-sm">ห้อง</span></p>
                    </div>
                </div>

                {/* 3. Table Card */}
                <div className="rounded-3xl bg-white shadow-sm overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-[#f9fafb]">
                                    <th className="py-5 px-6 text-left font-bold text-gray-500 w-[80px]">ห้อง</th>
                                    <th className="py-5 px-6 text-left font-bold text-gray-500">ใบแจ้งหนี้</th>
                                    <th className="py-5 px-6 text-right font-bold text-gray-500">ค่าห้อง</th>
                                    <th className="py-5 px-6 text-right font-bold text-gray-500">ค่าน้ำ</th>
                                    <th className="py-5 px-6 text-right font-bold text-gray-500">ค่าไฟ</th>
                                    <th className="py-5 px-6 text-right font-bold text-gray-500">อื่นๆ</th>
                                    <th className="py-5 px-6 text-right font-bold text-gray-500">ค้างชำระ</th>
                                    <th className="py-5 px-6 text-right font-bold text-gray-500">รวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageData.map((r, idx) => (
                                    <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition ${idx % 2 === 0 ? "bg-white" : "bg-[#fcfdff]"}`}>
                                        <td className="py-5 px-6 font-black text-gray-900">{r.roomNo}</td>
                                        <td className="py-5 px-6 font-bold text-gray-400">{r.invoiceNo}</td>
                                        <td className="py-5 px-6 text-right font-medium text-gray-500">
                                            {r.rentFee > 0 ? r.rentFee.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                                        </td>
                                        <td className="py-5 px-6 text-right font-medium text-gray-500">
                                            {r.waterFee > 0 ? r.waterFee.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                                        </td>
                                        <td className="py-5 px-6 text-right font-medium text-gray-500">
                                            {r.electricFee > 0 ? r.electricFee.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                                        </td>
                                        <td className="py-5 px-6 text-right font-medium text-gray-500">
                                            {r.otherFee > 0 ? r.otherFee.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                                        </td>
                                        <td className={`py-5 px-6 text-right font-bold ${r.unpaidAmount > 0 ? "text-red-500" : "text-gray-400"}`}>
                                            {r.unpaidAmount > 0 ? r.unpaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                                        </td>
                                        <td className="py-5 px-6 text-right font-extrabold text-gray-900">
                                            {r.totalFee > 0 ? r.totalFee.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-[#f9fafb]">
                                <tr>
                                    <td colSpan={2} className="py-5 px-6 text-right font-extrabold text-gray-900">ยอดรวมประจำหน้า:</td>
                                    <td className="py-5 px-6 text-right font-bold text-gray-900">{pageTotals.rent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-5 px-6 text-right font-bold text-gray-900">{pageTotals.water.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-5 px-6 text-right font-bold text-gray-900">{pageTotals.electric.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-5 px-6 text-right font-bold text-gray-900">{pageTotals.other.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-5 px-6 text-right font-bold text-red-500">{pageTotals.unpaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-5 px-6 text-right font-extrabold text-[#93C5FD]">{pageTotals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* 4. Footer Pagination */}
                    <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4">
                        <p className="text-sm font-bold text-gray-500 mb-4 md:mb-0">
                            กำลังแสดง {startIdx} ถึง {endIdx} จาก {MOCK_BILLING.length} รายการ
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#EAF2FF] text-gray-600 hover:bg-blue-100 disabled:opacity-50 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-8 h-8 rounded-lg font-bold text-sm transition ${page === p
                                        ? "bg-[#93C5FD] text-white shadow-lg shadow-blue-200"
                                        : "bg-[#EAF2FF] text-gray-600 hover:bg-blue-100"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#EAF2FF] text-gray-600 hover:bg-blue-100 disabled:opacity-50 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </OwnerShell>
    );
}
