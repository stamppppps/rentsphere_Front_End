import { useEffect, useMemo, useState } from "react";
import OwnerShell from "@/features/owner/components/OwnerShell";
import { getSelectedCondoId, useCondoStore } from "@/features/owner/stores/condoStore";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getAuthToken(): string {
    try { const raw = localStorage.getItem("rentsphere_auth"); if (!raw) return ""; return JSON.parse(raw)?.state?.token || ""; } catch { return ""; }
}
function authHeaders() {
    const t = getAuthToken();
    return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

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
    unpaidAmount: number;
    status: "paid" | "pending" | "overdue";
    date: string;
}

/* ================================================================
   Main Page
   ================================================================ */
export default function ReportsPage() {
    const [billingData, setBillingData] = useState<BillingRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const PER_PAGE = 6;

    const now = new Date();
    const monthName = now.toLocaleDateString("th-TH", { month: "long", year: "numeric" });

    // ========== Fetch billing data ==========
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const condoId = getSelectedCondoId();
                if (!condoId) { setLoading(false); return; }

                const [roomRes, meterRes, utilRes, invRes] = await Promise.all([
                    fetch(`${API}/api/v1/owner/condos/${condoId}/rooms`, { headers: authHeaders() }),
                    fetch(`${API}/api/v1/owner/condos/${condoId}/meters`, { headers: authHeaders() }).catch(() => null),
                    fetch(`${API}/api/v1/owner/condos/${condoId}/utilities`, { headers: authHeaders() }).catch(() => null),
                    fetch(`${API}/api/v1/owner/condos/${condoId}/invoices`, { headers: authHeaders() }).catch(() => null),
                ]);

                if (cancelled) return;

                const roomsRaw = await roomRes.json();
                const rooms: any[] = Array.isArray(roomsRaw) ? roomsRaw : (roomsRaw?.rooms || []);
                const metersRaw = meterRes?.ok ? await meterRes.json() : {};
                const meters: any[] = metersRaw?.meters || [];
                const utilsRaw = utilRes?.ok ? await utilRes.json() : {};
                const configs: any[] = utilsRaw?.configs || utilsRaw?.items || (Array.isArray(utilsRaw) ? utilsRaw : []);
                const invoicesRaw = invRes?.ok ? await invRes.json() : {};
                const invoices: any[] = invoicesRaw?.invoices || [];

                let wRate = 18, eRate = 8;
                for (const c of configs) {
                    if (c.utility_type === "water" || c.utilityType === "water") wRate = Number(c.rate || c.pricePerUnit || 18);
                    if (c.utility_type === "electricity" || c.utilityType === "electricity") eRate = Number(c.rate || c.pricePerUnit || 8);
                }

                const meterMap: Record<string, any> = {};
                for (const m of meters) {
                    if (m.roomId) meterMap[m.roomId] = m;
                }

                // Invoice map: roomId → latest invoice
                const invoiceMap: Record<string, any> = {};
                for (const inv of invoices) {
                    const rid = String(inv.room_id || inv.roomId || "");
                    if (rid) invoiceMap[rid] = inv;
                }

                const records: BillingRecord[] = rooms
                    .filter((r: any) => r.occupancyStatus === "OCCUPIED")
                    .map((r: any) => {
                        const m = meterMap[r.id];
                        const inv = invoiceMap[r.id];

                        // Use actual invoice amount if available
                        let rentFee = Number(r.price || 0);
                        let waterFee = m ? Number(m.waterUnits || 0) * wRate : 0;
                        let electricFee = m ? Number(m.electricUnits || 0) * eRate : 0;
                        let totalFee = rentFee + waterFee + electricFee;

                        if (inv?.totalAmount != null) {
                            totalFee = Number(inv.totalAmount);
                        }

                        const isPaid = inv ? String(inv.status || "").toUpperCase() === "PAID" : false;

                        return {
                            id: r.id,
                            invoiceNo: inv?.invoiceNo || `INV-${r.roomNo}-${now.toISOString().slice(0, 7)}`,
                            roomNo: r.roomNo || "—",
                            waterFee,
                            electricFee,
                            rentFee,
                            otherFee: 0,
                            totalFee,
                            unpaidAmount: isPaid ? 0 : totalFee,
                            status: isPaid ? "paid" as const : "pending" as const,
                            date: now.toISOString().slice(0, 10),
                        };
                    });

                records.sort((a, b) => a.roomNo.localeCompare(b.roomNo, "th", { numeric: true }));
                if (!cancelled) setBillingData(records);
            } catch (e) {
                console.error("ReportsPage load error:", e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const SUMMARY = useMemo(() => ({
        totalAmount: billingData.reduce((s, r) => s + r.totalFee, 0),
        paidAmount: billingData.filter(r => r.status === "paid").reduce((s, r) => s + r.totalFee, 0),
        unpaidAmount: billingData.filter(r => r.status !== "paid").reduce((s, r) => s + r.unpaidAmount, 0),
        roomCount: billingData.length,
    }), [billingData]);

    const totalPages = Math.max(1, Math.ceil(billingData.length / PER_PAGE));
    const pageData = billingData.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const startIdx = (page - 1) * PER_PAGE + 1;
    const endIdx = Math.min(page * PER_PAGE, billingData.length);

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

    const condoName = useCondoStore(s => s.condoName);

    return (
        <OwnerShell activeKey="reports" condoName={condoName || "คอนโดมิเนียม"}>
            <div className="min-h-screen w-full bg-gradient-to-b from-[#EAF2FF] to-[#f8faff] p-8 pb-12">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">รายงานบิลรายเดือน</h1>
                        <p className="text-sm font-bold text-gray-500 mt-1">
                            สรุปรายละเอียดค่าเช่าและค่าใช้จ่ายประจำเดือน {monthName}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                      
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-2xl bg-white border border-blue-100 shadow-sm px-6 py-16 text-center">
                        <div className="text-sm font-extrabold text-gray-500">กำลังโหลดข้อมูล...</div>
                    </div>
                ) : (
                    <>
                        {/* 2. Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-blue-50">
                                <p className="text-xs font-bold text-gray-500 mb-2">ยอดรวมทั้งหมด</p>
                                <p className="text-2xl font-black text-gray-900">฿ {SUMMARY.totalAmount.toLocaleString()}</p>
                            </div>
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-blue-50">
                                <p className="text-xs font-bold text-gray-500 mb-2">ชำระแล้ว</p>
                                <p className="text-2xl font-black text-green-600">฿ {SUMMARY.paidAmount.toLocaleString()}</p>
                            </div>
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-blue-50">
                                <p className="text-xs font-bold text-gray-500 mb-2">ค้างชำระ</p>
                                <p className="text-2xl font-black text-red-500">฿ {SUMMARY.unpaidAmount.toLocaleString()}</p>
                            </div>
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

                                        {pageData.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="py-16 text-center text-gray-400 font-bold">
                                                    ไม่พบข้อมูล
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-[#f9fafb]">
                                        <tr>
                                            <td colSpan={2} className="py-5 px-6 text-right font-extrabold text-gray-900">ยอดรวมประจำหน้า:</td>
                                            <td className="py-5 px-6 text-right font-bold text-gray-900">{pageTotals.rent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="py-5 px-6 text-right font-bold text-gray-900">{pageTotals.water.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="py-5 px-6 text-right font-bold text-gray-900">{pageTotals.electric.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="py-5 px-6 text-right font-bold text-gray-900">{pageTotals.other.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="py-5 px-6 text-right font-bold text-red-500">{pageTotals.unpaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="py-5 px-6 text-right font-extrabold" style={{ color: '#3478F6' }}>{pageTotals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* 4. Footer Pagination */}
                            <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4">
                                <p className="text-sm font-bold text-gray-500 mb-4 md:mb-0">
                                    กำลังแสดง {billingData.length > 0 ? startIdx : 0} ถึง {endIdx} จาก {billingData.length} รายการ
                                </p>

                                {totalPages > 1 && (
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
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </OwnerShell>
    );
}
