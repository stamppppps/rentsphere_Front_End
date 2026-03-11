import { useEffect, useMemo, useState } from "react";
import OwnerShell from "@/features/owner/components/OwnerShell";
import BillingFilter from "./componentsbill/BillingFilter";
import BillingTable from "./componentsbill/BillingTable";
import InvoiceDetail from "./InvoiceDetail";
import type { BillingItem, PreviewInvoiceItem } from "./types";
import { getSelectedCondoId } from "@/features/owner/stores/condoStore";

/* ================================================================
   API helpers
================================================================ */
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

function formatMonthParam(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

async function resolveCondoId(): Promise<string> {
  const storeId = getSelectedCondoId();
  if (storeId) return storeId;

  const ls = localStorage.getItem("rentsphere_selected_condo");
  if (ls) return ls;

  try {
    const raw = localStorage.getItem("rentsphere_condo_wizard");
    if (raw) {
      const id = JSON.parse(raw)?.state?.condoId;
      if (id) return id;
    }
  } catch {}

  try {
    const r = await fetch(`${API}/api/v1/condos/mine`, {
      method: "GET",
      headers: authHeaders(),
    });
    if (r.ok) {
      const d = await r.json();
      const c = d.condo || (d.condos && d.condos[0]);
      if (c?.id) return String(c.id);
    }
  } catch {}

  throw new Error("ไม่พบ condoId");
}

function normalizePreviewItems(items: any[]): PreviewInvoiceItem[] {
  return (Array.isArray(items) ? items : []).map((item) => ({
    itemType: String(item.itemType || ""),
    itemName: String(item.itemName || "-"),
    amount: Number(item.amount || 0),
    condoChargeId: item.condoChargeId ?? null,
    extraChargeTemplateId: item.extraChargeTemplateId ?? null,
    meterReadingId: item.meterReadingId ?? null,
    facilityBookingId: item.facilityBookingId ?? null,
  }));
}

function extractMeter(items: PreviewInvoiceItem[], kind: "WATER" | "ELECTRIC") {
  const row = items.find((it) => it.itemType === kind);
  if (!row) return undefined;

  return {
    current: 0,
    previous: 0,
    totalUnits: 0,
  };
}

/* ================================================================
   Main Page
================================================================ */
export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<BillingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [waterRate, setWaterRate] = useState(18);
  const [electricRate, setElectricRate] = useState(8);
  const [condoId, setCondoId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(formatMonthParam(new Date()));
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const cId = await resolveCondoId();
        if (cancelled) return;
        setCondoId(cId);

        const [previewRes, utilRes, invoiceRes] = await Promise.all([
          fetch(
            `${API}/api/v1/owner/condos/${cId}/invoices/generate-preview?month=${selectedMonth}`,
            { headers: authHeaders() }
          ).catch(() => null),
          fetch(`${API}/api/v1/owner/condos/${cId}/utilities`, {
            headers: authHeaders(),
          }).catch(() => null),
          fetch(`${API}/api/v1/owner/condos/${cId}/invoices?month=${selectedMonth}`, {
            headers: authHeaders(),
          }).catch(() => null),
        ]);

        const previewRaw = previewRes?.ok ? await previewRes.json() : {};
        const previewRooms: any[] = Array.isArray(previewRaw?.rooms) ? previewRaw.rooms : [];

        const utilsRaw = utilRes?.ok ? await utilRes.json() : {};
        const configs: any[] =
          utilsRaw?.configs || utilsRaw?.items || (Array.isArray(utilsRaw) ? utilsRaw : []);

        const invoiceRaw = invoiceRes?.ok ? await invoiceRes.json() : {};
        const invoices: any[] = Array.isArray(invoiceRaw?.invoices) ? invoiceRaw.invoices : [];

        if (cancelled) return;

        let wRate = 18;
        let eRate = 8;

        for (const c of configs) {
          const ut = String(c.utility_type || c.utilityType || "").toUpperCase();
          if (ut === "WATER") wRate = Number(c.rate || c.pricePerUnit || 18);
          if (ut === "ELECTRIC" || ut === "ELECTRICITY") {
            eRate = Number(c.rate || c.pricePerUnit || 8);
          }
        }

        setWaterRate(wRate);
        setElectricRate(eRate);

        const invoiceMap: Record<string, any> = {};
        for (const inv of invoices) {
          const roomId = String(inv.roomId || "");
          if (roomId) invoiceMap[roomId] = inv;
        }

        const rows: BillingItem[] = previewRooms.map((room) => {
          const items = normalizePreviewItems(room.items || []);
          const invoice = invoiceMap[String(room.roomId)] || null;

          const rentItem = items.find((it) => it.itemType === "RENT");
          const waterItem = items.find((it) => it.itemType === "WATER");
          const electricItem = items.find((it) => it.itemType === "ELECTRIC");

          return {
            id: String(room.roomId),
            roomNumber: String(room.roomNo || "—"),
            status: "ไม่ว่าง",
            rentAmount: Number(rentItem?.amount || 0),
            estimatedTotal: Number(room.totalAmount || 0),

            waterRate: wRate,
            electricRate: eRate,

            waterMeter: waterItem
              ? {
                  current: 0,
                  previous: 0,
                  totalUnits: 0,
                }
              : undefined,

            elecMeter: electricItem
              ? {
                  current: 0,
                  previous: 0,
                  totalUnits: 0,
                }
              : undefined,

            invoiceId: invoice?.id ? String(invoice.id) : undefined,
            invoiceNo: invoice?.invoiceNo || undefined,
            invoiceStatus: invoice?.status || undefined,
            isPaid: String(invoice?.status || "").toUpperCase() === "PAID",

            tenantName: "มีผู้เช่า",
            condoName: undefined,
            condoAddress: undefined,

            invoiceDate: invoice?.createdAt || undefined,
            billingMonth: selectedMonth,
            dueDate: invoice?.dueDate || undefined,

            items,
          };
        });

        rows.sort((a, b) =>
          a.roomNumber.localeCompare(b.roomNumber, "th", { numeric: true })
        );

        setBillingData(rows);
      } catch (e) {
        console.error("BillingPage load error:", e);
        setBillingData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedMonth, reloadKey]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return billingData;
    return billingData.filter((b) =>
      b.roomNumber.toLowerCase().includes(q)
    );
  }, [billingData, search]);

  const handleCompletePayment = () => {
    setSelectedItem(null);
    setReloadKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <OwnerShell activeKey="billing" showSidebar>
        <div className="max-w-7xl mx-auto pt-10 px-6">
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm px-6 py-12 text-center">
            <div className="text-sm font-extrabold text-gray-600">
              กำลังโหลดข้อมูลใบแจ้งหนี้...
            </div>
          </div>
        </div>
      </OwnerShell>
    );
  }

  if (selectedItem) {
    return (
      <OwnerShell activeKey="billing" showSidebar>
        <div className="max-w-7xl mx-auto pt-10 px-6">
          <InvoiceDetail
            item={selectedItem}
            onBack={() => setSelectedItem(null)}
            onComplete={handleCompletePayment}
            condoId={condoId}
          />
        </div>
      </OwnerShell>
    );
  }

  return (
    <OwnerShell activeKey="billing" showSidebar>
      <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pt-10 px-6">
        <div className="flex justify-center items-center mb-12">
          <div className="flex items-center w-full max-w-xl">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-500 text-sm font-medium">1. เลือกวันจดมิเตอร์</span>
            </div>

            <div className="flex-grow h-[1px] bg-gray-200 mx-4 -mt-7" />

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mb-2 text-white font-bold">
                2
              </div>
              <span className="text-purple-600 text-sm font-bold">2. สร้างใบแจ้งหนี้</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-6">
          <div className="relative w-full lg:max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="ค้นหาเลขห้อง"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white rounded-2xl border-0 py-4 pl-12 pr-4 shadow-sm focus:ring-1 focus:ring-purple-400 focus:outline-none text-gray-600"
            />
          </div>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-[48px] rounded-2xl bg-white px-4 shadow-sm text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>

        <BillingFilter
          waterRate={waterRate}
          electricRate={electricRate}
          selectedMonth={selectedMonth}
        />

        <BillingTable
          data={filteredData}
          onSelect={(item) => setSelectedItem(item)}
        />
      </div>
    </OwnerShell>
  );
}