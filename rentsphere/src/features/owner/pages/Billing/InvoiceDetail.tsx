import React, { useEffect, useState } from "react";
import InvoiceHeader from "./componentsinvoice/InvoiceHeader";
import InvoiceInfo from "./componentsinvoice/InvoiceInfo";
import InvoiceTable from "./componentsinvoice/InvoiceTable";
import InvoiceTotal from "./componentsinvoice/InvoiceTotal";
import PaymentPanel from "./componentsinvoice/PaymentPanel";
import type { BillingItem } from "./types";

interface InvoiceDetailProps {
  item: BillingItem;
  onBack: () => void;
  onComplete: () => void;
  condoId: string;
}

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

function normalizeMonthForGenerate(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 7);
  if (/^\d{4}-\d{2}$/.test(value)) return value;

  const dt = new Date(value);
  if (!Number.isNaN(dt.getTime())) {
    return dt.toISOString().slice(0, 7);
  }

  return new Date().toISOString().slice(0, 7);
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({
  item,
  onBack,
  onComplete,
  condoId,
}) => {
  const [isPaid, setIsPaid] = useState(Boolean(item.isPaid));
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | undefined>(
    item.invoiceId
  );

  const [paymentAmount, setPaymentAmount] = useState<string>(
    String(item.estimatedTotal || 0)
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("เงินสด");
  const [typedDate, setTypedDate] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, "0");
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = today.getFullYear();
    setTypedDate(`${d}/${m}/${y}`);
  }, []);

  const isFormValid =
    paymentAmount !== "" &&
    Number(paymentAmount) > 0 &&
    paymentMethod !== "" &&
    typedDate.length >= 10;

  const ensureInvoiceExists = async () => {
    if (createdInvoiceId) return createdInvoiceId;

    const month = normalizeMonthForGenerate(item.billingMonth);

    const res = await fetch(
      `${API}/api/v1/owner/condos/${condoId}/invoices/generate`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          month,
          roomIds: [item.id],
          requireMeter: false,
          overwriteDraft: true,
          status: "ISSUED",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "สร้างใบแจ้งหนี้ไม่สำเร็จ");
    }

    const d = await res.json();
    const created = Array.isArray(d?.invoices) ? d.invoices[0] : null;
    const invoiceId = created?.invoiceId ? String(created.invoiceId) : undefined;

    if (!invoiceId) {
      throw new Error("ไม่พบ invoiceId หลังสร้างใบแจ้งหนี้");
    }

    setCreatedInvoiceId(invoiceId);
    return invoiceId;
  };

  const handlePayment = async () => {
    if (!isFormValid) return;

    try {
      const invoiceId = await ensureInvoiceExists();

      const res = await fetch(
        `${API}/api/v1/owner/invoices/${invoiceId}/payments`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            amount: Number(paymentAmount),
            method: paymentMethod,
            paidAt: typedDate,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || "บันทึกการชำระเงินไม่สำเร็จ");
        return;
      }

      const data = await res.json();
      const paid = String(data?.invoice?.status || "").toUpperCase() === "PAID";
      setIsPaid(paid);
    } catch (e: any) {
      console.error("Record payment error:", e);
      alert(e?.message || "เกิดข้อผิดพลาดในการบันทึกการชำระเงิน");
    }
  };

  const handleReset = () => {
    setIsPaid(Boolean(item.isPaid));
    setCreatedInvoiceId(item.invoiceId);
    setPaymentAmount(String(item.estimatedTotal || 0));
    setPaymentMethod("เงินสด");

    const today = new Date();
    const d = String(today.getDate()).padStart(2, "0");
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = today.getFullYear();
    setTypedDate(`${d}/${m}/${y}`);
  };

  const handleNotifyLine = async () => {
    const invoiceId = createdInvoiceId;
    if (!invoiceId || !condoId) {
      alert("ไม่พบ invoiceId — กรุณาบันทึกก่อนส่ง LINE");
      return;
    }

    const res = await fetch(
      `${API}/api/v1/owner/condos/${condoId}/invoices/${invoiceId}/notify`,
      {
        method: "POST",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "ส่ง LINE ไม่สำเร็จ");
      return;
    }

    alert("ส่ง LINE สำเร็จ! ✅");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="w-full xl:flex-grow bg-white rounded-[40px] shadow-sm border border-gray-100 p-6 sm:p-12 relative overflow-hidden">
        <InvoiceHeader onBack={onBack} />
        <InvoiceInfo item={item} isPaid={isPaid} />
        <InvoiceTable item={item} />
        <InvoiceTotal total={Number(paymentAmount || item.estimatedTotal || 0)} />
      </div>

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