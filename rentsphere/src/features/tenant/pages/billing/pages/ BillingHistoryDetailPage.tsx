import { ChevronLeft } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

type BillStatus = "UNPAID" | "PENDING_REVIEW" | "PAID" | "OVERDUE";
type BillItemKey = "rent" | "water" | "electricity" | "commonFee" | "other";

type BillItem = {
  id: string;
  key: BillItemKey;
  label: string;
  amount: number;
};

type HistoryDetail = {
  id: string;
  invoiceNo: string;
  roomNo: string;
  status: BillStatus;
  billingMonthText: string;
  total: number;
  paidAtText?: string;
  dueDateText?: string;
  createdAtText?: string;
  items: BillItem[];
};

type BillDetailApiResponse = {
  id: string;
  invoiceNo: string;
  roomNo?: string;
  status: BillStatus;
  billingMonth?: string | null;
  dueDate?: string | null;
  createdAt?: string | null;
  totalAmount?: number;
  payments?: Array<{
    id: string;
    amount: number;
    method?: string;
    status?: string;
    paidAt?: string | null;
    createdAt?: string | null;
  }>;
  items?: Array<{
    id: string;
    key?: string;
    itemType?: string;
    itemName?: string;
    amount: number;
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

function formatThaiMonthYear(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", {
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

function mapItemTypeToKey(itemType?: string, label?: string): BillItemKey {
  const t = String(itemType || "").toUpperCase();
  const l = String(label || "").toLowerCase();

  if (t === "RENT" || l.includes("เช่า")) return "rent";
  if (t === "WATER" || l.includes("น้ำ")) return "water";
  if (t === "ELECTRIC" || l.includes("ไฟ")) return "electricity";
  if (t === "CHARGE" || t === "EXTRA" || l.includes("ส่วนกลาง")) return "commonFee";
  return "other";
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
      className={cx("rounded-[18px]", "bg-[#F4F8FF]", "border border-blue-100/70", "shadow-inner", className)}
    >
      {children}
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
      <path d="M3 10.5L12 3l9 7.5V21a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 21V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.5 22.5V14a2.5 2.5 0 0 1 5 0v8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WaterSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2s7 7.5 7 13a7 7 0 0 1-14 0c0-5.5 7-13 7-13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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
      <path d="M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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

export default function BillingHistoryDetailPage() {
  const nav = useNavigate();
  const { historyId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<HistoryDetail | null>(null);

  const lineUserId = useMemo(() => resolveLineUserId(searchParams), [searchParams]);

  const invoiceId = useMemo(() => {
    if (historyId) return String(historyId);
    if (location.state?.historyId) return String(location.state.historyId);
    return "";
  }, [historyId, location.state]);

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

        if (!invoiceId) {
          throw new Error("ไม่พบ invoiceId");
        }

        const res = await fetch(
          `${API}/api/v1/tenant-billing/${encodeURIComponent(invoiceId)}?lineUserId=${encodeURIComponent(lineUserId)}`
        );

        const contentType = res.headers.get("content-type") || "";
        const raw: BillDetailApiResponse | { error?: string } = contentType.includes("application/json")
          ? await res.json()
          : { error: `โหลดรายละเอียดไม่สำเร็จ (${res.status})` };

        if (!res.ok) {
          throw new Error(
            (raw as { error?: string })?.error || `โหลดรายละเอียดไม่สำเร็จ (${res.status})`
          );
        }

        if (cancelled) return;

        const data = raw as BillDetailApiResponse;
        const latestPayment = Array.isArray(data.payments) && data.payments.length > 0 ? data.payments[0] : null;

        const mapped: HistoryDetail = {
          id: String(data.id || ""),
          invoiceNo: data.invoiceNo || "-",
          roomNo: data.roomNo || "-",
          status: data.status || "UNPAID",
          billingMonthText: formatThaiMonthYear(data.billingMonth),
          total: Number(data.totalAmount || 0),
          paidAtText: formatThaiDate(latestPayment?.paidAt || latestPayment?.createdAt),
          dueDateText: formatThaiDate(data.dueDate),
          createdAtText: formatThaiDate(data.createdAt),
          items: Array.isArray(data.items)
            ? data.items.map((it) => ({
                id: it.id,
                key: mapItemTypeToKey(it.itemType, it.itemName),
                label: it.itemName || "รายการอื่น",
                amount: Number(it.amount || 0),
              }))
            : [],
        };

        setDetail(mapped);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "โหลดรายละเอียดการชำระไม่สำเร็จ");
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [invoiceId, lineUserId]);

  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-24">
      <style>{`
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
              <div className="text-2xl font-black text-slate-900">รายละเอียดการชำระ</div>
              <div className="absolute right-0 w-10" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 relative">
        {loading ? (
          <CardShell className="mt-4 p-5">
            <div className="text-[16px] font-black text-slate-900">กำลังโหลดข้อมูล...</div>
          </CardShell>
        ) : error ? (
          <CardShell className="mt-4 p-5 border-rose-100">
            <div className="text-[16px] font-black text-rose-600">{error}</div>
          </CardShell>
        ) : !detail ? (
          <CardShell className="mt-4 p-5">
            <div className="text-[16px] font-black text-slate-900">ไม่พบข้อมูลเดือนนี้</div>
            <div className="mt-1 text-sm font-bold text-slate-500">ลองกลับไปหน้าเดิมแล้วกดเข้ามาใหม่</div>
          </CardShell>
        ) : (
          <>
            <CardShell
              className={cx("mt-4", mounted ? "opacity-100" : "opacity-0")}
              style={{ animation: mounted ? "pop .32s ease-out both" : undefined }}
            >
              <div className="relative p-5">
                <div className="absolute inset-0 pointer-events-none opacity-[0.13]">
                  <div className="h-full w-full bg-gradient-to-br from-blue-300 via-indigo-200 to-transparent" />
                </div>

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[18px] font-black text-slate-900 leading-tight">
                      {detail.billingMonthText}
                    </div>
                    <div className="mt-1 text-[12px] font-bold text-slate-500">{detail.invoiceNo}</div>
                    <div className="mt-1 text-[12px] font-bold text-slate-500">ห้อง {detail.roomNo}</div>

                    <div className="mt-3 text-[12px] font-black text-slate-600 tracking-widest">ยอดรวม</div>
                    <div className="mt-1 text-[32px] font-black text-slate-900 leading-none">
                      {formatNumber(detail.total)} <span className="text-[14px] font-black text-slate-600">บาท</span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm font-bold text-slate-600">
                      {detail.createdAtText && <div>วันที่ออกบิล: {detail.createdAtText}</div>}
                      {detail.dueDateText && <div>วันครบกำหนด: {detail.dueDateText}</div>}
                      {detail.paidAtText && <div>วันที่ชำระ/บันทึก: {detail.paidAtText}</div>}
                    </div>
                  </div>

                  <div className={cx("px-4 py-2 rounded-full border text-xs font-black whitespace-nowrap", statusBadgeClass(detail.status))}>
                    {statusText(detail.status)}
                  </div>
                </div>
              </div>
            </CardShell>

            <div className="mt-4">
              <CardShell
                className={cx(mounted ? "opacity-100" : "opacity-0")}
                style={{ animation: mounted ? "pop .32s ease-out .06s both" : undefined }}
              >
                <div className="px-5 py-4">
                  <div className="text-[18px] font-black text-slate-900">รายละเอียดค่าใช้จ่าย</div>
                  <div className="mt-1 text-[12px] font-bold text-slate-500">รายการของรอบบิลนี้</div>
                </div>

                <div className="h-px bg-blue-100/70" />

                <div className="px-5 pb-5 pt-4">
                  <SoftPanel className="p-5">
                    {detail.items.length === 0 ? (
                      <div className="text-sm font-bold text-slate-500">ไม่พบรายละเอียดรายการ</div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {detail.items.map((it, idx) => (
                            <div
                              key={it.id}
                              className="flex items-center justify-between"
                              style={{
                                animation: mounted ? "pop .32s ease-out both" : undefined,
                                animationDelay: `${120 + idx * 60}ms`,
                                animationFillMode: "both",
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <BillItemIcon type={it.key} />
                                <div className="text-[16px] font-extrabold text-slate-800">{it.label}</div>
                              </div>
                              <div className="text-[20px] font-black text-slate-900">{formatNumber(it.amount)}</div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 pt-4 border-t border-blue-100/80">
                          <div className="flex items-center justify-between">
                            <div className="text-[17px] font-black text-slate-900">รวมทั้งหมด</div>
                            <div className="text-[24px] font-black text-slate-900">{formatNumber(detail.total)}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </SoftPanel>

                  <div className="mt-4 text-[12px] font-bold text-slate-500">
                    {detail.status === "PENDING_REVIEW" && "ระบบกำลังตรวจสอบรายการชำระเงิน"}
                    {detail.status === "OVERDUE" && "บิลนี้เกินกำหนดชำระ"}
                    {detail.status === "UNPAID" && "บิลนี้ยังไม่ได้ชำระ"}
                    {detail.status === "PAID" && "บิลนี้ชำระเรียบร้อยแล้ว"}
                  </div>
                </div>
              </CardShell>
            </div>
          </>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}