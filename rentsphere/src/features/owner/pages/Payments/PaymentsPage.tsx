import { useEffect, useState } from "react";
import OwnerShell from "@/features/owner/components/OwnerShell";
import { getSelectedCondoId } from "@/features/owner/stores/condoStore";
import PaymentPreviewPopup from "./PaymentPreviewPopup";
import type { PaymentRecord } from "./PaymentPreviewPopup";

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

/* ================================================================
   Status helpers
   ================================================================ */
function statusLabel(s: PaymentRecord["status"]) {
    switch (s) {
        case "overdue":
            return "ค้างชำระ";
        case "pending":
            return "ยังไม่ส่ง";
        case "paid":
            return "ชำระแล้ว";
    }
}

function statusClass(s: PaymentRecord["status"]) {
    switch (s) {
        case "overdue":
            return "bg-red-100 text-red-600 border-red-200";
        case "pending":
            return "bg-amber-100 text-amber-600 border-amber-200";
        case "paid":
            return "bg-green-100 text-green-600 border-green-200";
    }
}

/* ================================================================
   Main Page
   ================================================================ */
export default function PaymentsPage() {
    const [page, setPage] = useState(1);
    const [data, setData] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [previewItem, setPreviewItem] = useState<PaymentRecord | null>(null);
    const PER_PAGE = 4;

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const condoId = getSelectedCondoId();
                if (!condoId) {
                    setLoading(false);
                    return;
                }

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
                const configs: any[] =
                    utilsRaw?.configs || utilsRaw?.items || (Array.isArray(utilsRaw) ? utilsRaw : []);

                const invoicesRaw = invRes?.ok ? await invRes.json() : {};
                const invoices: any[] = invoicesRaw?.invoices || [];

                let wRate = 18;
                let eRate = 8;

                for (const c of configs) {
                    if (c.utility_type === "water" || c.utilityType === "water") {
                        wRate = Number(c.rate || c.pricePerUnit || 18);
                    }
                    if (c.utility_type === "electricity" || c.utilityType === "electricity") {
                        eRate = Number(c.rate || c.pricePerUnit || 8);
                    }
                }

                const meterMap: Record<string, any> = {};
                for (const m of meters) {
                    if (m.roomId) meterMap[m.roomId] = m;
                }

                const invoiceMap: Record<string, any> = {};
                for (const inv of invoices) {
                    const rid = String(inv.room_id || inv.roomId || "");
                    if (rid) invoiceMap[rid] = inv;
                }

                const records: PaymentRecord[] = rooms
                    .filter((r: any) => r.occupancyStatus === "OCCUPIED")
                    .map((r: any) => {
                        const m = meterMap[r.id];
                        const inv = invoiceMap[r.id];

                        let total: number;
                        const rent = Number(r.price || 0);
                        const waterCost = m ? Number(m.waterUnits || 0) * wRate : 0;
                        const elecCost = m ? Number(m.electricUnits || 0) * eRate : 0;
                        const wUnits = m ? Number(m.waterUnits || 0) : 0;
                        const eUnits = m ? Number(m.electricUnits || 0) : 0;

                        if (inv?.totalAmount != null) {
                            total = Number(inv.totalAmount);
                        } else {
                            total = rent + waterCost + elecCost;
                        }

                        const isPaid = inv ? String(inv.status || "").toUpperCase() === "PAID" : false;

                        // 3-state: paid / pending (มี invoice ยังไม่ชำระ) / overdue (ไม่มี invoice)
                        let status: PaymentRecord["status"];
                        if (isPaid) status = "paid";
                        else if (inv) status = "pending";
                        else status = "overdue";

                        return {
                            id: r.id,
                            invoiceNo: inv?.invoiceNo || `INV-${r.roomNo}-${new Date().toISOString().slice(0, 7)}`,
                            roomNo: r.roomNo || "—",
                            tenantName: "มีผู้เช่า",
                            sentDate: m?.recordedAt ? new Date(m.recordedAt).toLocaleDateString("th-TH") : null,
                            amount: total,
                            status,
                            rentAmount: rent,
                            waterCost: waterCost,
                            elecCost: elecCost,
                            waterUnits: wUnits,
                            elecUnits: eUnits,
                            waterRate: wRate,
                            electricRate: eRate,
                        };
                    });

                if (!cancelled) setData(records);
            } catch (e) {
                console.error("PaymentsPage load error:", e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const TOTAL_AMOUNT = data.reduce((s, r) => s + r.amount, 0);
    const PAID_AMOUNT = data.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
    const UNPAID_AMOUNT = data.filter((r) => r.status !== "paid").reduce((s, r) => s + r.amount, 0);
    const TOTAL_ROOMS = data.length;
    const UNPAID_ROOMS = data.filter((r) => r.status !== "paid").length;

    const totalPages = Math.max(1, Math.ceil(data.length / PER_PAGE));
    const pageData = data.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const startIdx = (page - 1) * PER_PAGE + 1;
    const endIdx = Math.min(page * PER_PAGE, data.length);

    const paidPct = TOTAL_AMOUNT > 0 ? Math.round((PAID_AMOUNT / TOTAL_AMOUNT) * 100) : 0;
    const now = new Date();
    const monthName = now.toLocaleDateString("th-TH", { month: "long", year: "numeric" });

    return (
        <OwnerShell activeKey="payments">
            <div className="w-full mx-auto animate-in fade-in duration-300 pt-6 px-8 pb-10">
                <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">ติดตามการชำระเงิน</h1>
                        <p className="text-sm font-bold text-gray-500 mt-1 pt-1">
                            ภาพรวมสถานะการค้างชำระประจำเดือน {monthName}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-2xl bg-white border border-blue-100 shadow-sm px-6 py-16 text-center">
                        <div className="text-sm font-extrabold text-gray-500">กำลังโหลดข้อมูล...</div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                            <div className="rounded-2xl bg-white border border-blue-100 px-6 py-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[#93C5FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">ยอดรวมทั้งหมด</span>
                                </div>
                                <p className="text-3xl font-black text-gray-900 tracking-tight">
                                    {TOTAL_AMOUNT.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs font-bold text-gray-400 mt-1">จากทั้งหมด {TOTAL_ROOMS} ห้อง</p>
                            </div>

                            <div className="rounded-2xl bg-white border border-green-100 px-6 py-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">ชำระแล้ว</span>
                                </div>
                                <p className="text-3xl font-black text-green-600 tracking-tight">
                                    {PAID_AMOUNT.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </p>
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-green-500 transition-all"
                                            style={{ width: `${paidPct}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-extrabold text-green-600">{paidPct}%</span>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white border border-red-100 px-6 py-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">ยังไม่ชำระ</span>
                                </div>
                                <p className="text-3xl font-black text-red-500 tracking-tight">
                                    {UNPAID_AMOUNT.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs font-bold text-gray-400 mt-1">
                                    จำนวน {UNPAID_ROOMS} ห้องที่ยังค้างจ่าย
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="py-4 px-4 text-left font-extrabold text-gray-500 text-xs uppercase tracking-wider w-10">
                                            #
                                        </th>
                                        <th className="py-4 px-4 text-left font-extrabold text-gray-500 text-xs uppercase tracking-wider">
                                            เลขใบแจ้งหนี้
                                        </th>
                                        <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">
                                            ห้อง
                                        </th>
                                        <th className="py-4 px-4 text-left font-extrabold text-gray-500 text-xs uppercase tracking-wider">
                                            ผู้เช่า
                                        </th>
                                        <th className="py-4 px-4 text-right font-extrabold text-gray-500 text-xs uppercase tracking-wider">
                                            ยอดค้าง
                                        </th>
                                        <th className="py-4 px-4 text-center font-extrabold text-gray-500 text-xs uppercase tracking-wider">
                                            สถานะ
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {pageData.map((r, idx) => (
                                        <tr key={r.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition">
                                            <td className="py-5 px-4 font-bold text-gray-400">{startIdx + idx}</td>
                                            <td className="py-5 px-4 font-bold text-gray-700">{r.invoiceNo}</td>
                                            <td className="py-5 px-4 text-center font-extrabold text-gray-900">{r.roomNo}</td>

                                            <td className="py-5 px-4">
                                                <div>
                                                    <p className="font-extrabold text-gray-900 text-sm">{r.tenantName}</p>
                                                    {r.sentDate && (
                                                        <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                                                            {r.sentDate}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            <td
                                                className={`py-5 px-4 text-right ${
                                                    r.amount > 0 ? "text-red-500" : "text-gray-400"
                                                }`}
                                            >
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="font-extrabold text-lg">
                                                        {r.amount > 0
                                                            ? r.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })
                                                            : "0.00"}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setPreviewItem(r); }}
                                                        className="p-1.5 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="ดูใบแจ้งหนี้"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="py-5 px-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${statusClass(
                                                        r.status
                                                    )}`}
                                                >
                                                    {statusLabel(r.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}

                                    {pageData.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center text-gray-400 font-bold">
                                                ไม่พบข้อมูลการชำระเงิน
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                                <p className="text-sm font-bold text-gray-400">
                                    แสดง {data.length > 0 ? startIdx : 0} ถึง {endIdx} จาก {data.length} รายการ
                                </p>

                                {totalPages > 1 && (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page === 1}
                                            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition"
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
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
                {/* ===== Invoice Preview Popup ===== */}
                {previewItem && (
                    <PaymentPreviewPopup
                        item={previewItem}
                        onClose={() => setPreviewItem(null)}
                    />
                )}
            </div>
        </OwnerShell>
    );
}