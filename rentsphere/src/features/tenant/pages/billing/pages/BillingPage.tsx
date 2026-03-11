import { ChevronLeft, ChevronRight, FileText, History } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

type BillStatus = "UNPAID" | "PENDING_REVIEW" | "PAID" | "OVERDUE";
type BillItemKey = "rent" | "water" | "electricity" | "commonFee" | "other";

type BillItem = {
  key: BillItemKey;
  label: string;
  amount: number;
};

type CurrentBill = {
  billId: string;
  invoiceNo?: string;
  status: BillStatus;
  total: number;
  dueDateText: string;
  items: BillItem[];
};

type PaymentHistory = {
  id: string;
  invoiceNo?: string;
  monthText: string;
  amount: number;
  status: "PAID" | "PENDING_REVIEW";
  paidAtISO: string;
};

type CurrentBillApiResponse = {
  billId: string;
  invoiceNo?: string;
  status: BillStatus;
  total: number;
  dueDate?: string | null;
  items?: Array<{
    id?: string;
    key?: string;
    label?: string;
    itemType?: string;
    itemName?: string;
    amount: number;
  }>;
};

type HistoryApiResponse = {
  history?: Array<{
    id: string;
    invoiceNo?: string;
    monthText?: string;
    amount: number;
    status: "PAID" | "PENDING_REVIEW";
    paidAtISO: string;
  }>;
};

function cx(...cls: Array<string | false | undefined | null>) {
  return cls.filter(Boolean).join(" ");
}

function formatNumber(n: number) {
  return Number(n || 0).toLocaleString("th-TH");
}

function formatThaiDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

function mapItemTypeToKey(itemType?: string, label?: string): BillItemKey {
  const t = String(itemType || "").toUpperCase();
  const l = String(label || "").toLowerCase();

  if (t === "RENT" || l.includes("เช่า")) return "rent";
  if (t === "WATER" || l.includes("น้ำ")) return "water";
  if (t === "ELECTRIC" || l.includes("ไฟ")) return "electricity";
  if (t === "CHARGE" || t === "EXTRA" || l.includes("ส่วนกลาง")) return "commonFee";
  return "other";
}

function resolveLineUserId(searchParams: URLSearchParams): string {
  const fromQuery = String(searchParams.get("lineUserId") || "").trim();
  if (fromQuery) return fromQuery;

  const candidates = [
    localStorage.getItem("lineUserId"),
    localStorage.getItem("rentsphere_line_user_id"),
    localStorage.getItem("rentsphere_tenant_line_user_id"),
  ];

  for (const value of candidates) {
    const s = String(value || "").trim();
    if (s) return s;
  }

  try {
    const raw = localStorage.getItem("rentsphere_auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      const nestedCandidates = [
        parsed?.state?.lineUserId,
        parsed?.state?.user?.lineUserId,
        parsed?.state?.profile?.lineUserId,
        parsed?.lineUserId,
      ];

      for (const v of nestedCandidates) {
        const s = String(v || "").trim();
        if (s) return s;
      }
    }
  } catch {
    //
  }

  return "";
}

function CardShell({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
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

function SoftPanel({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cx(
        "rounded-[18px]",
        "bg-[#F4F8FF]",
        "border border-blue-100/70",
        "shadow-inner",
        className
      )}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="w-1.5 h-6 bg-[#2F6BFF] rounded-full" />
      <span className="text-sm font-black text-slate-800 tracking-widest">
        {children}
      </span>
    </div>
  );
}

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-10 h-10 rounded-[14px] bg-white/70 border border-blue-100/70 shadow-[0_10px_18px_rgba(15,23,42,0.06)] flex items-center justify-center text-[#2F6BFF]">
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
      <path
        d="M9.5 22.5V14a2.5 2.5 0 0 1 5 0v8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
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
      <path
        d="M9.5 16.5c.6 1.3 1.8 2 3.5 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ElectricSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
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
      <path
        d="M8 8h8M8 12h8M8 16h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BillItemIcon({ type }: { type: BillItemKey }) {
  if (type === "rent") {
    return (
      <IconBox>
        <RentSvg />
      </IconBox>
    );
  }
  if (type === "water") {
    return (
      <IconBox>
        <WaterSvg />
      </IconBox>
    );
  }
  if (type === "electricity") {
    return (
      <IconBox>
        <ElectricSvg />
      </IconBox>
    );
  }
  return (
    <IconBox>
      <CommonFeeSvg />
    </IconBox>
  );
}

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
    "relative h-[60px] w-full rounded-[20px] flex items-center justify-center gap-3 font-black text-[17px] transition overflow-hidden";
  const cls =
    variant === "primary"
      ? "bg-[#2F6BFF] text-white shadow-[0_18px_34px_rgba(47,107,255,0.30)]"
      : "bg-white border border-blue-100/70 text-slate-900 shadow-[0_14px_26px_rgba(15,23,42,0.07)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        base,
        cls,
        "animate-in fade-in slide-in-from-bottom-2",
        "active:scale-[0.98] hover:-translate-y-[1px]"
      )}
      style={{ animationDelay: `${delayMs}ms`, animationFillMode: "both" }}
    >
      {variant === "primary" && (
        <span className="pointer-events-none absolute inset-0 opacity-35">
          <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.6s_infinite]" />
        </span>
      )}

      <span
        className={cx(
          "relative shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-[16px]",
          variant === "primary"
            ? "bg-white/18 text-white"
            : "bg-[#EEF3FF] border border-blue-100/60 text-[#2F6BFF]"
        )}
      >
        {leftIcon}
      </span>

      <span className="relative tracking-[0.2px]">{label}</span>
    </button>
  );
}

function HistoryStatusPill({ status }: { status: PaymentHistory["status"] }) {
  const cls =
    status === "PAID"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-amber-100 text-amber-800 border-amber-200";
  const text = status === "PAID" ? "ชำระแล้ว" : "รอตรวจสอบ";

  return (
    <span
      className={cx(
        "px-4 py-2 rounded-full border text-xs font-black whitespace-nowrap",
        cls
      )}
    >
      {text}
    </span>
  );
}

export default function BillingPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentBill, setCurrentBill] = useState<CurrentBill | null>(null);
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [error, setError] = useState("");

  const lineUserId = useMemo(() => resolveLineUserId(searchParams), [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        if (!lineUserId) {
          throw new Error("ไม่พบ lineUserId ของผู้เช่า");
        }

        const [currentRes, historyRes] = await Promise.all([
          fetch(
            `${API}/api/v1/tenant-billing/current?lineUserId=${encodeURIComponent(lineUserId)}`
          ),
          fetch(
            `${API}/api/v1/tenant-billing/history?lineUserId=${encodeURIComponent(lineUserId)}`
          ),
        ]);

        const currentContentType = currentRes.headers.get("content-type") || "";
        const historyContentType = historyRes.headers.get("content-type") || "";

        const currentRaw: CurrentBillApiResponse | { error?: string } =
          currentContentType.includes("application/json")
            ? await currentRes.json()
            : { error: `โหลดบิลปัจจุบันไม่สำเร็จ (${currentRes.status})` };

        const historyRaw: HistoryApiResponse | { error?: string } =
          historyContentType.includes("application/json")
            ? await historyRes.json()
            : { error: `โหลดประวัติไม่สำเร็จ (${historyRes.status})` };

        if (!currentRes.ok) {
          throw new Error(
            (currentRaw as { error?: string })?.error ||
              `โหลดบิลปัจจุบันไม่สำเร็จ (${currentRes.status})`
          );
        }

        if (cancelled) return;

        const mappedCurrent: CurrentBill = {
          billId: String((currentRaw as CurrentBillApiResponse).billId || ""),
          invoiceNo: (currentRaw as CurrentBillApiResponse).invoiceNo,
          status: (currentRaw as CurrentBillApiResponse).status || "UNPAID",
          total: Number((currentRaw as CurrentBillApiResponse).total || 0),
          dueDateText: formatThaiDate((currentRaw as CurrentBillApiResponse).dueDate),
          items: Array.isArray((currentRaw as CurrentBillApiResponse).items)
            ? (currentRaw as CurrentBillApiResponse).items!.map((item) => ({
                key: mapItemTypeToKey(item.itemType, item.label || item.itemName),
                label: item.label || item.itemName || "รายการอื่น",
                amount: Number(item.amount || 0),
              }))
            : [],
        };

        const mappedHistory: PaymentHistory[] = Array.isArray(
          (historyRaw as HistoryApiResponse)?.history
        )
          ? (historyRaw as HistoryApiResponse).history!.map((h) => ({
              id: h.id,
              invoiceNo: h.invoiceNo,
              monthText:
                h.monthText ||
                new Date(h.paidAtISO).toLocaleDateString("th-TH", {
                  month: "long",
                  year: "numeric",
                }),
              amount: Number(h.amount || 0),
              status: h.status,
              paidAtISO: h.paidAtISO,
            }))
          : [];

        setCurrentBill(mappedCurrent);
        setHistory(mappedHistory);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "โหลดข้อมูลบิลไม่สำเร็จ");
          setCurrentBill(null);
          setHistory([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lineUserId]);

  const withLineUserId = (path: string) => {
    const suffix = `lineUserId=${encodeURIComponent(lineUserId)}`;
    return path.includes("?") ? `${path}&${suffix}` : `${path}?${suffix}`;
  };

  const goBillDetail = () => {
    if (!currentBill) return;
    nav(withLineUserId(`/tenant/billing/summary`), {
      state: { billId: currentBill.billId, lineUserId },
    });
  };

  const goHistory = () => nav(withLineUserId(`/tenant/billing/history`));

  const goHistoryDetail = (h: PaymentHistory) => {
    nav(withLineUserId(`/tenant/billing/history/${h.id}`), {
      state: {
        historyId: h.id,
        invoiceNo: h.invoiceNo,
        monthText: h.monthText,
        amount: h.amount,
        status: h.status,
        paidAtISO: h.paidAtISO,
        lineUserId,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-24">
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-120%);} 100% { transform: translateX(260%);} }
        @keyframes pop { 0% { transform: translateY(10px); opacity: 0;} 100% { transform: translateY(0); opacity: 1;} }
      `}</style>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-[#2F6BFF]/10 blur-3xl" />
        <div className="absolute -bottom-24 right-0 w-[360px] h-[360px] rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="sticky top-0 z-40">
        <div className="bg-[#F8FAFF]/85 backdrop-blur supports-[backdrop-filter]:backdrop-blur-lg border-b border-blue-100/40">
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

              <div className="text-2xl font-black text-slate-900">
                บิล / การชำระเงิน
              </div>
              <div className="absolute right-0 w-10" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 relative">
        {loading ? (
          <div className="mt-6 rounded-[18px] bg-white border border-blue-100/60 p-6 text-center text-slate-500 font-bold">
            กำลังโหลดข้อมูลบิล...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-[18px] bg-white border border-rose-100 p-6 text-center text-rose-600 font-bold">
            {error}
          </div>
        ) : !currentBill ? (
          <div className="mt-6 rounded-[18px] bg-white border border-blue-100/60 p-6 text-center text-slate-500 font-bold">
            ไม่พบบิลปัจจุบัน
          </div>
        ) : (
          <>
            <CardShell
              className={cx("mt-3", mounted ? "opacity-100" : "opacity-0")}
              style={{ animation: mounted ? "pop .32s ease-out both" : undefined }}
            >
              <div className="relative p-5">
                <div className="absolute inset-0 pointer-events-none opacity-[0.13]">
                  <div className="h-full w-full bg-gradient-to-br from-blue-300 via-indigo-200 to-transparent" />
                </div>

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[12px] font-black text-slate-600 tracking-widest">
                      ยอดที่ต้องชำระ
                    </div>
                    <div className="mt-1 text-[32px] font-black text-slate-900 leading-none">
                      {formatNumber(currentBill.total)}{" "}
                      <span className="text-[14px] font-black text-slate-600">บาท</span>
                    </div>

                    <div className="mt-3 text-sm font-bold text-slate-600">
                      วันครบกำหนดชำระ: {currentBill.dueDateText}
                    </div>

                    <div className="mt-2 inline-flex items-center gap-2 text-xs font-black text-slate-500">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                        {currentBill.invoiceNo || `ใบแจ้งหนี้ #${currentBill.billId}`}
                      </span>
                    </div>
                  </div>

                  <div
                    className={cx(
                      "px-4 py-2 rounded-full border text-xs font-black whitespace-nowrap",
                      statusBadgeClass(currentBill.status)
                    )}
                  >
                    {statusText(currentBill.status)}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#F8FAFF] border border-blue-100/80 px-4 py-3 text-[13px] font-bold text-slate-500">
                  การชำระเงินและการส่งหลักฐานดำเนินการผ่าน LINE
                </div>
              </div>
            </CardShell>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <ActionButton
                label="ดูรายละเอียดบิล"
                variant="primary"
                onClick={goBillDetail}
                delayMs={60}
                leftIcon={<FileText size={20} />}
              />

              <ActionButton
                label="ดูประวัติ"
                variant="ghost"
                onClick={goHistory}
                delayMs={120}
                leftIcon={<History size={20} />}
              />
            </div>

            <div className="mt-6">
              <CardShell
                className={cx(mounted ? "opacity-100" : "opacity-0")}
                style={{ animation: mounted ? "pop .32s ease-out .06s both" : undefined }}
              >
                <button
                  type="button"
                  onClick={goBillDetail}
                  className="w-full text-left"
                >
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-[18px] font-black text-slate-900 leading-tight">
                        บิลปัจจุบัน
                      </div>
                      <div className="mt-1 text-[12px] font-bold text-slate-500">
                        ดูรายละเอียดค่าใช้จ่ายของรอบบิลนี้
                      </div>
                    </div>

                    <div
                      className={cx(
                        "w-11 h-11 rounded-full",
                        "bg-[#F4F7FF] text-slate-500",
                        "border border-blue-100/70 shadow-[0_10px_18px_rgba(15,23,42,0.06)]",
                        "flex items-center justify-center"
                      )}
                    >
                      <ChevronRight size={22} />
                    </div>
                  </div>
                </button>

                <div className="h-px bg-blue-100/70" />

                <div className="px-5 pb-5 pt-4">
                  <SoftPanel className="p-5">
                    <div className="space-y-4">
                      {currentBill.items.map((it, idx) => (
                        <div
                          key={`${it.key}-${idx}`}
                          className="flex items-center justify-between"
                          style={{
                            animation: mounted ? "pop .32s ease-out both" : undefined,
                            animationDelay: `${120 + idx * 60}ms`,
                            animationFillMode: "both",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <BillItemIcon type={it.key} />
                            <div className="text-[16px] font-extrabold text-slate-800">
                              {it.label}
                            </div>
                          </div>
                          <div className="text-[20px] font-black text-slate-900">
                            {formatNumber(it.amount)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-blue-100/80">
                      <div className="flex items-center justify-between">
                        <div className="text-[17px] font-black text-slate-900">
                          รวมทั้งหมด
                        </div>
                        <div className="text-[24px] font-black text-slate-900">
                          {formatNumber(currentBill.total)}
                        </div>
                      </div>
                    </div>
                  </SoftPanel>

                  <button
                    type="button"
                    onClick={goBillDetail}
                    className={cx(
                      "mt-5 w-full h-[56px] rounded-[20px] font-black text-[16px] tracking-[0.2px]",
                      "bg-[#2F6BFF] text-white",
                      "shadow-[0_16px_28px_rgba(47,107,255,0.26)]",
                      "active:scale-[0.98] transition",
                      "relative overflow-hidden"
                    )}
                  >
                    <span className="absolute inset-0 opacity-30 pointer-events-none">
                      <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.6s_infinite]" />
                    </span>
                    <span className="relative">สรุปค่าใช้จ่าย</span>
                  </button>
                </div>
              </CardShell>
            </div>

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
                <CardShell
                  className={cx(mounted ? "opacity-100" : "opacity-0")}
                  style={{ animation: mounted ? "pop .32s ease-out .10s both" : undefined }}
                >
                  <div className="px-2 py-1">
                    {history.length === 0 ? (
                      <div className="px-4 py-6 text-center text-slate-500 font-bold">
                        ยังไม่มีประวัติการชำระเงิน
                      </div>
                    ) : (
                      history.map((h, idx) => (
                        <div key={h.id}>
                          <button
                            type="button"
                            onClick={() => goHistoryDetail(h)}
                            className={cx(
                              "w-full text-left px-4 py-4 flex items-center justify-between transition",
                              "hover:bg-[#F6F9FF]",
                              "active:scale-[0.995]"
                            )}
                          >
                            <div className="min-w-0">
                              <div className="text-[18px] font-black text-slate-900 truncate">
                                {h.monthText}
                              </div>
                              <div className="mt-1 text-xs font-bold text-slate-500">
                                ยอด {formatNumber(h.amount)} บาท
                              </div>
                            </div>

                            <HistoryStatusPill status={h.status} />
                          </button>

                          {idx !== history.length - 1 && (
                            <div className="mx-4 h-px bg-blue-100/70" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardShell>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}