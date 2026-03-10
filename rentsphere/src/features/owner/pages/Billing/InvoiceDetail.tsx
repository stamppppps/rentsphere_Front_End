import React, { useEffect, useState } from 'react';
import InvoiceHeader from './componentsinvoice/InvoiceHeader';
import InvoiceInfo from './componentsinvoice/InvoiceInfo';
import InvoiceTable from './componentsinvoice/InvoiceTable';
import InvoiceTotal from './componentsinvoice/InvoiceTotal';
import PaymentPanel from './componentsinvoice/PaymentPanel';
import type { BillingItem } from './types';

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
    const waterUnits = Number(item.waterMeter?.totalUnits || 0);
    const elecUnits = Number(item.elecMeter?.totalUnits || 0);

    const rentAmount = Number(item.rentAmount || 0);
    const waterAmount = Number((waterUnits * item.waterRate).toFixed(2));
    const elecAmount = Number((elecUnits * item.electricRate).toFixed(2));

    const total = Number(paymentAmount);

    const now = new Date();
    const billingMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString();

    const items = [
      {
        itemType: "RENT",
        itemName: "ค่าเช่าห้องพัก",
        amount: rentAmount,
      },
      {
        itemType: "WATER",
        itemName: `ค่าน้ำ (${waterUnits} หน่วย x ${item.waterRate} บาท)`,
        amount: waterAmount,
      },
      {
        itemType: "ELECTRIC",
        itemName: `ค่าไฟ (${elecUnits} หน่วย x ${item.electricRate} บาท)`,
        amount: elecAmount,
      },
    ].filter((x) => x.amount > 0);

    if (item.invoiceId && !item.isPaid) {
      setCreatedInvoiceId(item.invoiceId);
    } else {
      const res = await fetch(`${API}/api/v1/owner/condos/${condoId}/invoices`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          roomId: item.id,
          billingMonth,
          totalAmount: total,
          status: "ISSUED",
          note: `ชำระผ่าน ${paymentMethod}`,
          items,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || "สร้างใบแจ้งหนี้ไม่สำเร็จ");
        return;
      }

      const d = await res.json();
      const newId = d.invoice?.id ? String(d.invoice.id) : undefined;

      if (newId) {
        setCreatedInvoiceId(newId);
      }
    }
  } catch (e) {
    console.error("Payment API error:", e);
    alert("เกิดข้อผิดพลาดในการบันทึกใบแจ้งหนี้");
    return;
  }

  setIsPaid(true);
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