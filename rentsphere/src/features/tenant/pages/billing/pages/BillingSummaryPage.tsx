import { ChevronLeft } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

type BillStatus = "UNPAID" | "PENDING_REVIEW" | "PAID" | "OVERDUE";
type BillItemKey = "rent" | "water" | "electricity" | "commonFee" | "other";

type InvoiceItem = {
  id: string;
  key: BillItemKey;
  label: string;
  amount: number;
};

type BillDetail = {
  id: string;
  invoiceNo: string;
  roomNo: string;
  status: BillStatus;
  billingMonthText: string;
  dueDateText: string;
  createdAtText: string;
  subtotal: number;
  discountTotal: number;
  penaltyTotal: number;
  totalAmount: number;
  items: InvoiceItem[];
};

type BillDetailApiResponse = {
  id: string;
  invoiceNo: string;
  roomNo?: string;
  status: BillStatus;
  billingMonth?: string | null;
  dueDate?: string | null;
  subtotal?: number;
  discountTotal?: number;
  penaltyTotal?: number;
  totalAmount?: number;
  createdAt?: string | null;
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

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "bg-white rounded-[18px] shadow-[0_14px_40px_rgba(15,23,42,0.08)] border border-blue-100/60 overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function BillingSummaryPage() {
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<BillDetail | null>(null);

  const lineUserId = useMemo(() => resolveLineUserId(searchParams), [searchParams]);

  const billId = useMemo(() => {
    const fromState = location.state?.billId;
    if (fromState) return String(fromState);

    const fromQuery = searchParams.get("billId");
    if (fromQuery) return String(fromQuery);

    return "";
  }, [location.state, searchParams]);

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

        if (!billId) {
          throw new Error("ไม่พบ billId ของใบแจ้งหนี้");
        }

        const res = await fetch(
          `${API}/api/v1/tenant-billing/${encodeURIComponent(billId)}?lineUserId=${encodeURIComponent(lineUserId)}`
        );

        const contentType = res.headers.get("content-type") || "";
        const raw: BillDetailApiResponse | { error?: string } = contentType.includes("application/json")
          ? await res.json()
          : { error: `โหลดรายละเอียดบิลไม่สำเร็จ (${res.status})` };

        if (!res.ok) {
          throw new Error(
            (raw as { error?: string })?.error || `โหลดรายละเอียดบิลไม่สำเร็จ (${res.status})`
          );
        }

        if (cancelled) return;

        const data = raw as BillDetailApiResponse;

        const mapped: BillDetail = {
          id: String(data.id || ""),
          invoiceNo: data.invoiceNo || "-",
          roomNo: data.roomNo || "-",
          status: data.status || "UNPAID",
          billingMonthText: formatThaiMonthYear(data.billingMonth),
          dueDateText: formatThaiDate(data.dueDate),
          createdAtText: formatThaiDate(data.createdAt),
          subtotal: Number(data.subtotal || 0),
          discountTotal: Number(data.discountTotal || 0),
          penaltyTotal: Number(data.penaltyTotal || 0),
          totalAmount: Number(data.totalAmount || 0),
          items: Array.isArray(data.items)
            ? data.items.map((item) => ({
                id: item.id,
                key: mapItemTypeToKey(item.itemType, item.itemName),
                label: item.itemName || "รายการอื่น",
                amount: Number(item.amount || 0),
              }))
            : [],
        };

        setDetail(mapped);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "โหลดรายละเอียดบิลไม่สำเร็จ");
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [billId, lineUserId]);

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

              <div className="text-2xl font-black text-slate-900">สรุปค่าใช้จ่าย</div>
              <div className="absolute right-0 w-10" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 relative">
        {loading ? (
          <div className="mt-6 rounded-[18px] bg-white border border-blue-100/60 p-6 text-center text-slate-500 font-bold">
            กำลังโหลดรายละเอียดบิล...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-[18px] bg-white border border-rose-100 p-6 text-center text-rose-600 font-bold">
            {error}
          </div>
        ) : !detail ? (
          <div className="mt-6 rounded-[18px] bg-white border border-blue-100/60 p-6 text-center text-slate-500 font-bold">
            ไม่พบรายละเอียดบิล
          </div>
        ) : (
          <>
            <div
              className={cx("mt-3", mounted ? "opacity-100" : "opacity-0")}
              style={{ animation: mounted ? "pop .28s ease-out both" : undefined }}
            >
              <div className="text-[28px] font-black text-slate-900 leading-tight">รายละเอียดใบแจ้งหนี้</div>
              <div className="mt-1 text-sm font-bold text-slate-500">ตรวจสอบรายการค่าใช้จ่ายของรอบบิลนี้</div>
            </div>

            <Card className="mt-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[12px] font-black text-slate-500 tracking-widest">INVOICE</div>
                  <div className="mt-1 text-[24px] font-black text-slate-900">{detail.invoiceNo}</div>
                </div>

                <div
                  className={cx(
                    "px-4 py-2 rounded-full border text-xs font-black whitespace-nowrap",
                    statusBadgeClass(detail.status)
                  )}
                >
                  {statusText(detail.status)}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[16px] bg-[#F8FAFF] border border-blue-100/80 p-4">
                  <div className="text-[11px] font-black text-slate-500">ห้อง</div>
                  <div className="mt-1 text-[18px] font-black text-slate-900">{detail.roomNo}</div>
                </div>

                <div className="rounded-[16px] bg-[#F8FAFF] border border-blue-100/80 p-4">
                  <div className="text-[11px] font-black text-slate-500">รอบบิล</div>
                  <div className="mt-1 text-[18px] font-black text-slate-900">{detail.billingMonthText}</div>
                </div>

                <div className="rounded-[16px] bg-[#F8FAFF] border border-blue-100/80 p-4">
                  <div className="text-[11px] font-black text-slate-500">วันที่ออกบิล</div>
                  <div className="mt-1 text-[16px] font-black text-slate-900">{detail.createdAtText}</div>
                </div>

                <div className="rounded-[16px] bg-[#F8FAFF] border border-blue-100/80 p-4">
                  <div className="text-[11px] font-black text-slate-500">วันครบกำหนด</div>
                  <div className="mt-1 text-[16px] font-black text-slate-900">{detail.dueDateText}</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-[#F8FAFF] border border-blue-100/80 px-4 py-3 text-[13px] font-bold text-slate-500">
                การชำระเงินและการส่งหลักฐานดำเนินการผ่าน LINE
              </div>
            </Card>

            <Card className="mt-4 p-5">
              <div className="text-[16px] font-black text-slate-900">รายการค่าใช้จ่าย</div>

              <div className="mt-4 space-y-3">
                {detail.items.length === 0 ? (
                  <div className="rounded-[16px] bg-[#F8FAFF] border border-blue-100/70 p-4 text-center text-slate-500 font-bold">
                    ไม่พบรายการค่าใช้จ่าย
                  </div>
                ) : (
                  detail.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-[16px] bg-[#F8FAFF] border border-blue-100/70 px-4 py-4"
                    >
                      <div className="min-w-0 pr-4">
                        <div className="text-[15px] font-extrabold text-slate-800">{item.label}</div>
                      </div>
                      <div className="shrink-0 text-[18px] font-black text-slate-900">
                        {formatNumber(item.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="mt-4 p-5">
              <div className="text-[16px] font-black text-slate-900">สรุปยอด</div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-bold text-slate-600">ยอดก่อนปรับปรุง</div>
                  <div className="text-[16px] font-black text-slate-900">{formatNumber(detail.subtotal)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-bold text-slate-600">ส่วนลด</div>
                  <div className="text-[16px] font-black text-slate-900">{formatNumber(detail.discountTotal)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-bold text-slate-600">ค่าปรับ</div>
                  <div className="text-[16px] font-black text-slate-900">{formatNumber(detail.penaltyTotal)}</div>
                </div>

                <div className="h-px bg-blue-100/80" />

                <div className="flex items-center justify-between">
                  <div className="text-[18px] font-black text-slate-900">ยอดรวมทั้งหมด</div>
                  <div className="text-[28px] font-black text-[#2F6BFF]">
                    {formatNumber(detail.totalAmount)}
                  </div>
                </div>
              </div>
            </Card>

            <div className="h-10" />
          </>
        )}
      </div>
    </div>
  );
}