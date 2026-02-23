import { ChevronLeft } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type BillStatus = "UNPAID" | "PENDING_REVIEW" | "PAID" | "OVERDUE";
type BillItemKey = "rent" | "water" | "electricity" | "commonFee";

type BillItem = { key: BillItemKey; label: string; amount: number };
type CurrentBill = {
  billId: string;
  status: BillStatus;
  total: number;
  dueDateText: string;
  items: BillItem[];
};
type PaymentHistory = { id: string; monthText: string; amount: number; status: "PAID" | "PENDING_REVIEW" };

function formatNumber(n: number) {
  return n.toLocaleString("th-TH");
}

function statusText(s: BillStatus) {
  switch (s) {
    case "UNPAID":
      return "ยังไม่ได้ชำระ";
    case "PENDING_REVIEW":
      return "รอตรวจสอบ";
    case "PAID":
      return "ชำระแล้ว";
    case "OVERDUE":
      return "เกินกำหนด";
    default:
      return "—";
  }
}

function statusBadgeClass(s: BillStatus) {
  switch (s) {
    case "PAID":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "PENDING_REVIEW":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "OVERDUE":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "UNPAID":
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

/* ================= UI Shells ================= */
function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "bg-white",
        "rounded-[18px]",
        "shadow-[0_14px_40px_rgba(15,23,42,0.08)]",
        "border border-blue-100/60",
        "overflow-hidden",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function SoftPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-[16px]",
        "bg-[#F4F8FF]",
        "border border-blue-100/60",
        "shadow-inner",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="w-1.5 h-6 bg-[#2F6BFF] rounded-full" />
      <span className="text-sm font-black text-slate-800 tracking-widest">{children}</span>
    </div>
  );
}

/* ================= SVG Icons ================= */
function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-10 h-10 rounded-[14px] bg-[#EEF3FF] border border-blue-100/60 shadow-inner flex items-center justify-center text-[#2F6BFF]">
      {children}
    </div>
  );
}

function RentSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10.5L12 3l9 7.5V21a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 21V10.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9.5 22.5V14a2.5 2.5 0 0 1 5 0v8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function WaterSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2s7 7.5 7 13a7 7 0 0 1-14 0c0-5.5 7-13 7-13Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9.5 16.5c.6 1.3 1.8 2 3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ElectricSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
function CommonFeeSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 8h8M8 12h8M8 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BillItemIcon({ type }: { type: BillItemKey }) {
  if (type === "rent") return <IconBox><RentSvg /></IconBox>;
  if (type === "water") return <IconBox><WaterSvg /></IconBox>;
  if (type === "electricity") return <IconBox><ElectricSvg /></IconBox>;
  return <IconBox><CommonFeeSvg /></IconBox>;
}

/* ================= Buttons (Action) ================= */
function ActionButton({
  label,
  variant,
  onClick,
  leftIcon,
  delayMs = 0,
}: {
  label: string;
  variant: "primary" | "ghost";
  onClick?: () => void;
  leftIcon: React.ReactNode;
  delayMs?: number;
}) {
  const base =
    "relative h-[60px] w-full rounded-[18px] flex items-center justify-center gap-3 font-black text-[17px] transition active:scale-[0.98] overflow-hidden";
  const cls =
    variant === "primary"
      ? "bg-[#2F6BFF] text-white shadow-[0_16px_28px_rgba(47,107,255,0.28)]"
      : "bg-white border border-blue-100/70 text-slate-900 shadow-[0_12px_22px_rgba(15,23,42,0.06)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        base,
        cls,
        "animate-in fade-in slide-in-from-bottom-2",
        "hover:-translate-y-[1px]",
      ].join(" ")}
      style={{ animationDelay: `${delayMs}ms`, animationFillMode: "both" }}
    >
      {variant === "primary" && (
        <span className="pointer-events-none absolute inset-0 opacity-40">
          <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.6s_infinite]" />
        </span>
      )}

      <span
        className={[
          "shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-[16px]",
          variant === "primary" ? "bg-white/18 text-white" : "bg-[#EEF3FF] border border-blue-100/60 text-[#2F6BFF]",
        ].join(" ")}
      >
        {leftIcon}
      </span>

      <span className="tracking-[0.2px]">{label}</span>
    </button>
  );
}

/* ================= Page ================= */
export default function BillingPage() {
  const nav = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  // ===== MOCK DATA =====
  const currentBill: CurrentBill = {
    billId: "1025",
    status: "UNPAID",
    total: 4200,
    dueDateText: "31 พฤษภาคม 2024",
    items: [
      { key: "rent", label: "ค่าเช่า", amount: 3500 },
      { key: "water", label: "ค่าน้ำ", amount: 300 },
      { key: "electricity", label: "ค่าไฟฟ้า", amount: 350 },
      { key: "commonFee", label: "ค่าส่วนกลาง", amount: 50 },
    ],
  };

  const history: PaymentHistory[] = [
    { id: "h-1", monthText: "เมษายน 2024", amount: 4150, status: "PAID" },
    { id: "h-2", monthText: "มีนาคม 2024", amount: 4100, status: "PAID" },
  ];

  const isPayable = useMemo(
    () => currentBill.status === "UNPAID" || currentBill.status === "OVERDUE",
    [currentBill.status]
  );

  // ===== ROUTES =====
  const goPay = () => nav(`/tenant/billing/${currentBill.billId}/pay`, { state: { billId: currentBill.billId } });
  const goUploadSlip = () => nav(`/tenant/billing/${currentBill.billId}/upload`, { state: { billId: currentBill.billId } });
  const goBillDetail = () => nav(`/tenant/billing/${currentBill.billId}/detail`, { state: { billId: currentBill.billId } });
  const goHistory = () => nav(`/tenant/billing/history`);
  const goSummary = () => nav(`/tenant/billing/summary`);

  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-24">
      {/* local keyframes (no plugin needed) */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(260%); }
        }
      `}</style>

      {/* ===== Top Bar ===== */}
      <div className="sticky top-0 z-40">
        <div className="bg-[#F8FAFF]/85 backdrop-blur supports-[backdrop-filter]:backdrop-blur-lg">
          <div className="px-6 pt-7 pb-3">
            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={() => nav(-1)}
                className="absolute left-0 p-2.5 rounded-[16px] bg-white/70 backdrop-blur border border-white/60 text-slate-800 shadow-sm active:scale-95 transition"
                aria-label="Back"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="text-2xl font-black text-slate-900">บิล / การชำระเงิน</div>
              <div className="absolute right-0 w-10" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* ===== Header Card ===== */}
        <CardShell
          className={[
            "mt-2",
            mounted ? "animate-in fade-in slide-in-from-bottom-2" : "opacity-0",
          ].join(" ")}
        >
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[22px] font-black text-slate-900 leading-tight">
                  ยอดที่ต้องชำระ : <span className="ml-1">{formatNumber(currentBill.total)}</span>
                </div>
                <div className="mt-1 text-sm font-bold text-slate-600">
                  วันครบกำหนดชำระ: {currentBill.dueDateText}
                </div>
              </div>

              <div
                className={[
                  "px-4 py-2 rounded-full border text-xs font-black whitespace-nowrap",
                  statusBadgeClass(currentBill.status),
                ].join(" ")}
              >
                {statusText(currentBill.status)}
              </div>
            </div>

            {!isPayable && (
              <div className="mt-3 text-[12px] font-bold text-slate-500">
                สถานะปัจจุบันไม่สามารถ “ชำระเงินทันที” ได้
              </div>
            )}
          </div>
        </CardShell>

        {/* ===== Action Buttons ===== */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <ActionButton
            label="ชำระเงินทันที"
            variant="primary"
            onClick={goPay}
            delayMs={60}
            leftIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path
                  d="M14 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />

          <ActionButton
            label="อัปโหลดสลิป"
            variant="ghost"
            onClick={goUploadSlip}
            delayMs={120}
            leftIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path
                  d="M8 7l4-4 4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M4 21h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
          />
        </div>

        {/* ===== Current Bill Card ===== */}
        <div className="mt-6">
          <CardShell className={mounted ? "animate-in fade-in slide-in-from-bottom-2" : "opacity-0"} >
            <button
              type="button"
              onClick={goBillDetail}
              className="w-full text-left px-5 py-4 flex items-center justify-between"
            >
              <div className="text-xl font-black text-slate-900">บิลปัจจุบัน</div>
              <div className="text-slate-400 text-2xl font-black">{">"}</div>
            </button>

            <div className="px-5 pb-5">
              <SoftPanel className="p-5">
                <div className="space-y-4">
                  {currentBill.items.map((it, idx) => (
                    <div
                      key={it.key}
                      className={[
                        "flex items-center justify-between",
                        "animate-in fade-in slide-in-from-bottom-2",
                      ].join(" ")}
                      style={{ animationDelay: `${120 + idx * 60}ms`, animationFillMode: "both" }}
                    >
                      <div className="flex items-center gap-3">
                        <BillItemIcon type={it.key} />
                        <div className="text-[17px] font-extrabold text-slate-800">{it.label}</div>
                      </div>
                      <div className="text-[20px] font-black text-slate-900">{formatNumber(it.amount)}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-blue-100/80">
                  <div className="flex items-center justify-between">
                    <div className="text-[17px] font-black text-slate-900">รวมทั้งหมด</div>
                    <div className="text-[24px] font-black text-slate-900">{formatNumber(currentBill.total)}</div>
                  </div>
                </div>
              </SoftPanel>

              <button
                type="button"
                onClick={goSummary}
                className={[
                  "mt-5 w-full h-[56px] rounded-[18px] font-black text-lg tracking-[0.2px]",
                  "bg-[#2F6BFF] text-white",
                  "shadow-[0_16px_28px_rgba(47,107,255,0.26)]",
                  "active:scale-[0.98] transition",
                  "hover:-translate-y-[1px]",
                ].join(" ")}
              >
                สรุปค่าใช้จ่าย
              </button>
            </div>
          </CardShell>
        </div>

        {/* ===== History ===== */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-1">
            <SectionTitle>ประวัติการชำระเงิน</SectionTitle>
            <button
              type="button"
              onClick={goHistory}
              className="text-slate-500 font-bold underline underline-offset-4 hover:text-slate-700"
            >
              ดูทั้งหมด
            </button>
          </div>

          <div className="mt-3">
            <CardShell className={mounted ? "animate-in fade-in slide-in-from-bottom-2" : "opacity-0"}>
              <div className="px-2 py-1">
                {history.map((h, idx) => (
                  <div key={h.id}>
                    <button
                      type="button"
                      onClick={() => nav(`/tenant/billing/history/${h.id}`, { state: { historyId: h.id } })}
                      className={[
                        "w-full text-left px-4 py-4 flex items-center justify-between transition",
                        "hover:bg-[#F6F9FF]",
                        "active:scale-[0.995]",
                      ].join(" ")}
                    >
                      <div className="text-[18px] font-black text-slate-900">{h.monthText}</div>

                      <div className="flex items-center gap-3">
                        <div className="text-[18px] font-black text-slate-900">{formatNumber(h.amount)}</div>
                        <span className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-black">
                          ชำระแล้ว
                        </span>
                      </div>
                    </button>

                    {idx !== history.length - 1 && <div className="mx-4 h-px bg-blue-100/70" />}
                  </div>
                ))}
              </div>
            </CardShell>
          </div>
        </div>
      </div>

    </div>
  );
}