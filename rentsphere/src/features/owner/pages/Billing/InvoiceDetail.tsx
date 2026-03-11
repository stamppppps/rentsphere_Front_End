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

  // Form States
  const [paymentAmount, setPaymentAmount] = useState<string>(item.estimatedTotal.toString());
  const [paymentMethod, setPaymentMethod] = useState<string>('เงินสด');
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
        const res = await fetch(`${API}/api/v1/owner/condos/${condoId}/invoices`, {
          method: "POST", headers: authHeaders(),
          body: JSON.stringify({
            roomId: item.id,
            totalAmount: parseFloat(paymentAmount),
            status: "ISSUED",
            note: `ค่าเช่า ${item.rentAmount}฿ + ค่าน้ำ ${((item.waterMeter?.totalUnits || 0) * item.waterRate).toFixed(2)}฿ + ค่าไฟ ${((item.elecMeter?.totalUnits || 0) * item.electricRate).toFixed(2)}฿ (${paymentMethod})`,
          }),
        });
        if (!res.ok) throw new Error("Create invoice failed");
        const d = await res.json();
        invoiceId = d.invoice?.id ? String(d.invoice.id) : "";
      }

      if (!invoiceId) throw new Error("Missing invoiceId");

      const payRes = await fetch(`${API}/api/v1/owner/condos/${condoId}/invoices/${invoiceId}/pay`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!payRes.ok) throw new Error("Pay invoice failed");

      setCreatedInvoiceId(invoiceId);
      setIsPaid(true);
    } catch (e) {
      console.error("Payment API error:", e);
      alert("Payment save failed");
    }
  };

  const handleReset = () => {
    setIsPaid(false);
    setCreatedInvoiceId(item.invoiceId);
    setPaymentAmount(item.estimatedTotal.toString());
    setPaymentMethod('เงินสด');
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    setTypedDate(`${d}/${m}/${y}`);
  };

  const handleNotifyLine = async () => {
    const invoiceId = createdInvoiceId;
    if (!invoiceId || !condoId) {
      alert("ไม่พบ invoiceId — กรุณากดบันทึกก่อนส่ง LINE");
      return;
    }

    const res = await fetch(`${API}/api/v1/owner/condos/${condoId}/invoices/${invoiceId}/notify`, {
      method: "POST", headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "ส่ง LINE ไม่สำเร็จ");
      return;
    }
    alert("ส่ง LINE สำเร็จ! ✅");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
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


