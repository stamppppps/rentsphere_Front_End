import React, { useState, useEffect } from 'react';
import type { BillingItem } from './types';
import InvoiceHeader from './componentsinvoice/InvoiceHeader';
import InvoiceInfo from './componentsinvoice/InvoiceInfo';
import InvoiceTable from './componentsinvoice/InvoiceTable';
import InvoiceTotal from './componentsinvoice/InvoiceTotal';
import PaymentPanel from './componentsinvoice/PaymentPanel';

interface InvoiceDetailProps {
  item: BillingItem;
  onBack: () => void;
  onComplete: () => void;
  condoId: string;
}

/* ---------- Popup Modal ---------- */
interface PopupProps {
  type: "success" | "error" | "warning";
  message: string;
  onClose: () => void;
}
const Popup: React.FC<PopupProps> = ({ type, message, onClose }) => {
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "⚠️";
  const borderColor = type === "success" ? "border-emerald-200" : type === "error" ? "border-rose-200" : "border-amber-200";
  const bgColor = type === "success" ? "bg-emerald-50" : type === "error" ? "bg-rose-50" : "bg-amber-50";
  const textColor = type === "success" ? "text-emerald-800" : type === "error" ? "text-rose-800" : "text-amber-800";
  const btnBg = type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : type === "error" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-[90%] max-w-sm rounded-3xl border ${borderColor} ${bgColor} p-6 shadow-2xl text-center animate-in zoom-in-95 duration-300`}>
        <div className="text-4xl mb-3">{icon}</div>
        <div className={`text-[15px] font-black ${textColor} leading-relaxed whitespace-pre-line`}>{message}</div>
        <button
          onClick={onClose}
          className={`mt-5 px-8 py-2.5 rounded-2xl ${btnBg} text-white font-black text-sm transition active:scale-95`}
        >
          ตกลง
        </button>
      </div>
    </div>
  );
};

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getAuthToken(): string {
  try { const raw = localStorage.getItem("rentsphere_auth"); if (!raw) return ""; return JSON.parse(raw)?.state?.token || ""; } catch { return ""; }
}
function authHeaders() {
  const t = getAuthToken();
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ item, onBack, onComplete, condoId }) => {
  const [isPaid, setIsPaid] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | undefined>(item.invoiceId);

  // Popup state
  const [popup, setPopup] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);

  // Form States
  const [paymentAmount, setPaymentAmount] = useState<string>(item.estimatedTotal.toString());
  const [paymentMethod, setPaymentMethod] = useState<string>('เงินโอน');
  const [typedDate, setTypedDate] = useState<string>('');

  // Initialize date to today on mount
  useEffect(() => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    setTypedDate(`${d}/${m}/${y}`);
  }, []);

  const isFormValid =
    paymentAmount !== '' &&
    parseFloat(paymentAmount) > 0 &&
    paymentMethod !== '' &&
    typedDate.length >= 10;

  const handlePayment = async () => {
    if (!isFormValid) return;

    try {
      let invoiceId = item.invoiceId ? String(item.invoiceId) : "";

      if (!invoiceId) {
        // สร้างใบแจ้งหนี้เป็น ISSUED (รอการชำระ) — ยังไม่ mark เป็น PAID
        const noteItems = Array.isArray(item.items) && item.items.length > 0
          ? item.items.map(x => `${x.itemName} ${x.amount}฿`).join(" + ")
          : `รวม ${parseFloat(paymentAmount)}฿`;

        const res = await fetch(`${API}/api/v1/owner/condos/${condoId}/invoices`, {
          method: "POST", headers: authHeaders(),
          body: JSON.stringify({
            roomId: item.id,
            totalAmount: parseFloat(paymentAmount),
            status: "ISSUED",
            note: `${noteItems} (${paymentMethod})`,
            items: Array.isArray(item.items) ? item.items.map(i => ({
               itemType: i.itemType,
               itemName: i.itemName,
               amount: i.amount,
               condoChargeId: i.condoChargeId,
               extraChargeTemplateId: i.extraChargeTemplateId,
               meterReadingId: i.meterReadingId,
               facilityBookingId: i.facilityBookingId,
            })) : [],
          }),
        });
        if (!res.ok) throw new Error("Create invoice failed");
        const d = await res.json();
        invoiceId = d.invoice?.id ? String(d.invoice.id) : "";
      }

      if (!invoiceId) throw new Error("Missing invoiceId");

      // บันทึก invoiceId แล้วแสดงว่าสร้างบิลสำเร็จ (ยังไม่ชำระ → รอการชำระ ส้ม)
      setCreatedInvoiceId(invoiceId);
      setIsPaid(true); // ใช้ flag นี้เพื่อแสดง success panel (ส่ง LINE / เสร็จสิ้น)
    } catch (e) {
      console.error("Invoice API error:", e);
      setPopup({ type: "error", message: "สร้างใบแจ้งหนี้ไม่สำเร็จ" });
    }
  };

  const handleReset = () => {
    setIsPaid(false);
    setCreatedInvoiceId(item.invoiceId);
    setPaymentAmount(item.estimatedTotal.toString());
    setPaymentMethod('เงินโอน');
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    setTypedDate(`${d}/${m}/${y}`);
  };

  const handleNotifyLine = async () => {
    const invoiceId = createdInvoiceId;
    if (!invoiceId || !condoId) {
      setPopup({ type: "warning", message: "ไม่พบ invoiceId — กรุณากดบันทึกก่อนส่ง LINE" });
      return;
    }

    const res = await fetch(`${API}/api/v1/owner/condos/${condoId}/invoices/${invoiceId}/notify`, {
      method: "POST", headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setPopup({ type: "error", message: err?.error || "ส่ง LINE ไม่สำเร็จ" });
      return;
    }
    setPopup({ type: "success", message: "ส่ง LINE สำเร็จ!" });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Popup Modal */}
      {popup && <Popup type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}

      {/* Left Panel: Invoice Details Container */}
      <div className="w-full xl:flex-grow bg-white rounded-[40px] shadow-sm border border-gray-100 p-6 sm:p-12 relative overflow-hidden">
        <InvoiceHeader onBack={onBack} />
        <InvoiceInfo item={item} isPaid={isPaid} />
        <InvoiceTable item={item} />
        <InvoiceTotal total={item.estimatedTotal} />
      </div>

      {/* Right Panel: Payment Panel Container */}
      <div className="w-full xl:w-[420px] flex-shrink-0">
        <PaymentPanel
          isPaid={isPaid}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          typedDate={typedDate}
          setTypedDate={setTypedDate}
          handlePayment={handlePayment}
          isFormValid={isFormValid}
          estimatedTotal={item.estimatedTotal}
          onComplete={onComplete}
          onReset={handleReset}
          onNotifyLine={handleNotifyLine}
        />
      </div>
    </div>
  );
};

export default InvoiceDetail;
