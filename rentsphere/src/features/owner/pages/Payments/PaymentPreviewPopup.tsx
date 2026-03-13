export interface PaymentRecord {
    id: string; // roomId
    invoiceNo: string;
    roomNo: string;
    tenantName: string;
    sentDate: string | null;
    amount: number;
    status: "paid" | "pending" | "overdue";
    rentAmount: number;
    waterCost: number;
    elecCost: number;
    waterUnits: number;
    elecUnits: number;
    waterRate: number;
    electricRate: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items?: any[];
}

interface PaymentPreviewPopupProps {
    item: PaymentRecord;
    onClose: () => void;
}

function StatusBadge({ status }: { status: string }) {
    if (status === "paid") {
        return (
            <span className="bg-[#DCFCE7] text-[#22C55E] text-xs px-3 py-1 rounded-full font-bold">
                ชำระแล้ว
            </span>
        );
    }
    if (status === "pending") {
        return (
            <span className="bg-[#FEF3C7] text-[#F59E0B] text-xs px-3 py-1 rounded-full font-bold">
                รอการชำระ
            </span>
        );
    }
    return (
        <span className="bg-[#FEE2E2] text-[#EF4444] text-xs px-3 py-1 rounded-full font-bold">
            ค้างชำระ
        </span>
    );
}

export default function PaymentPreviewPopup({ item, onClose }: PaymentPreviewPopupProps) {
    const today = new Date();
    const dateStr = today.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    const lineItems: { name: string; pricePerUnit: number; amount: number }[] = [];

    if (item.items && item.items.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item.items.forEach((x: any) => {
            const itemType = String(x.itemType || x.item_type || "").toUpperCase();
            const itemName = String(x.itemName || x.item_name || x.name || "");
            const amount = Number(x.amount ?? 0);
            const prevMeter = x.previousReading ?? x.prev_reading ?? null;
            const currMeter = x.currentReading ?? x.curr_reading ?? null;

            if (itemType === "RENT") {
                lineItems.push({
                    name: itemName || "ค่าเช่าห้อง",
                    pricePerUnit: amount,
                    amount,
                });
            } else if (itemType === "WATER") {
                const rangeLabel = prevMeter != null && currMeter != null
                    ? `(${prevMeter} - ${currMeter})`
                    : item.waterUnits > 0 ? `(${item.waterUnits} หน่วย)` : "";
                lineItems.push({
                    name: `ค่าน้ำ ${rangeLabel}`.trim(),
                    pricePerUnit: item.waterRate,
                    amount,
                });
            } else if (itemType === "ELECTRIC") {
                const rangeLabel = prevMeter != null && currMeter != null
                    ? `(${prevMeter} - ${currMeter})`
                    : item.elecUnits > 0 ? `(${item.elecUnits} หน่วย)` : "";
                lineItems.push({
                    name: `ค่าไฟ ${rangeLabel}`.trim(),
                    pricePerUnit: item.electricRate,
                    amount,
                });
            } else {
                lineItems.push({
                    name: itemName,
                    pricePerUnit: amount,
                    amount,
                });
            }
        });
    } else {
        if (item.rentAmount > 0) {
            lineItems.push({
                name: "ค่าเช่าห้อง/Rent",
                pricePerUnit: item.rentAmount,
                amount: item.rentAmount,
            });
        }
        if (item.waterCost > 0) {
            lineItems.push({
                name: `ค่าน้ำ (${item.waterUnits} หน่วย × ${item.waterRate}฿)`,
                pricePerUnit: item.waterRate,
                amount: item.waterCost,
            });
        }
        if (item.elecCost > 0) {
            lineItems.push({
                name: `ค่าไฟ (${item.elecUnits} หน่วย × ${item.electricRate}฿)`,
                pricePerUnit: item.electricRate,
                amount: item.elecCost,
            });
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 bg-black/40"
                aria-label="close"
            />

            {/* Popup */}
            <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div
                    className="px-8 py-5 flex items-center gap-3 bg-gradient-to-r from-blue-600/10 to-sky-500/10"
                >
                    <button
                        onClick={onClose}
                        aria-label="ปิด"
                        className="text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-xl font-black text-slate-900">
                        ใบแจ้งหนี้ / Invoice
                    </h2>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Info section */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                        <div>
                            <div className="text-blue-600 font-extrabold text-lg mb-1">
                                RentSphere
                            </div>
                            <div className="text-sm text-gray-500">
                                ผู้เช่า: {item.tenantName || "มีผู้เช่า"}
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-gray-500 text-sm">สถานะ:</span>
                                <StatusBadge status={item.status} />
                            </div>
                            <div className="text-sm text-gray-600">
                                เลขที่: <span className="font-bold">{item.invoiceNo}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                ห้อง: <span className="font-bold">{item.roomNo}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                วันที่: <span className="font-bold">{item.sentDate || dateStr}</span>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-gray-100 rounded-2xl overflow-hidden mb-8">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-5 py-3 text-left text-gray-500 font-bold">#</th>
                                    <th className="px-5 py-3 text-left text-gray-500 font-bold">รายการ</th>
                                    <th className="px-5 py-3 text-right text-gray-500 font-bold">ราคาต่อหน่วย</th>
                                    <th className="px-5 py-3 text-right text-gray-500 font-bold">ยอดเงิน</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.map((li, i) => (
                                    <tr key={i} className="border-b border-gray-50">
                                        <td className="px-5 py-4 text-gray-600">{i + 1}</td>
                                        <td className="px-5 py-4 text-gray-800 font-medium">{li.name}</td>
                                        <td className="px-5 py-4 text-right text-gray-600">
                                            {li.pricePerUnit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold text-gray-900">
                                            {li.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                                {lineItems.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-6 text-center text-gray-400">
                                            ไม่มีรายการ
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-end gap-4">
                        <span className="text-gray-600 font-bold text-lg">รวม</span>
                        <span className="text-blue-600 text-4xl font-black">
                            {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
