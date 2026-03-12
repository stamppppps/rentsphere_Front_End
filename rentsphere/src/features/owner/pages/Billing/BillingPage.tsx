import { useEffect, useState } from "react";
import OwnerShell from "@/features/owner/components/OwnerShell";
import BillingFilter from "./componentsbill/BillingFilter";
import BillingTable from "./componentsbill/BillingTable";
import InvoiceDetail from "./InvoiceDetail";
import type { BillingItem } from "./types";
import { getActiveCondoId } from "@/shared/utils/getActiveCondoId";

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
  const [error, setError] = useState("");

  /* ==================== load data from backend ==================== */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const cId = getActiveCondoId();
        if (!cId) {
          throw new Error("ไม่พบ condoId ที่กำลังใช้งาน");
        }

        if (cancelled) return;
        setCondoId(cId);

        const [roomRes, meterRes, utilRes, invRes] = await Promise.all([
          fetch(`${API}/api/v1/owner/condos/${cId}/rooms`, {
            headers: authHeaders(),
          }).catch(() => null),

          fetch(`${API}/api/v1/owner/condos/${cId}/meters`, {
            headers: authHeaders(),
          }).catch(() => null),

          fetch(`${API}/api/v1/owner/condos/${cId}/utilities`, {
            headers: authHeaders(),
          }).catch(() => null),

          fetch(`${API}/api/v1/owner/condos/${cId}/invoices`, {
            headers: authHeaders(),
          }).catch(() => null),
        ]);

        const roomsRaw = roomRes?.ok ? await roomRes.json() : [];
        const rooms: any[] = Array.isArray(roomsRaw)
          ? roomsRaw
          : roomsRaw?.rooms || roomsRaw?.items || [];

        const metersRaw = meterRes?.ok ? await meterRes.json() : {};
        const meters: any[] =
          metersRaw?.readings ||
          metersRaw?.items ||
          (Array.isArray(metersRaw) ? metersRaw : []);

        const utilsRaw = utilRes?.ok ? await utilRes.json() : {};
        const configs: any[] =
          utilsRaw?.configs ||
          utilsRaw?.items ||
          (Array.isArray(utilsRaw) ? utilsRaw : []);

        const invoicesRaw = invRes?.ok ? await invRes.json() : {};
        const invoices: any[] =
          invoicesRaw?.invoices ||
          invoicesRaw?.items ||
          (Array.isArray(invoicesRaw) ? invoicesRaw : []);

        if (cancelled) return;

        let wRate = 18;
        let eRate = 8;

        for (const c of configs) {
          const ut = String(c.utility_type || c.utilityType || c.utilitytype || "")
            .toUpperCase();

          if (ut === "WATER") {
            wRate = Number(c.rate || c.pricePerUnit || 18);
          }

          if (ut === "ELECTRIC" || ut === "ELECTRICITY") {
            eRate = Number(c.rate || c.pricePerUnit || 8);
          }
        }

        setWaterRate(wRate);
        setElectricRate(eRate);

        const tenantMap: Record<string, string> = {};
        for (const r of rooms) {
          const roomNo = String(r.roomNo || r.room_no || "");
          if (String(r.occupancyStatus || "").toUpperCase() === "OCCUPIED") {
            tenantMap[roomNo] = r.tenantName || r.tenant?.name || "มีผู้เช่า";
          }
        }

        const invoiceMap: Record<string, any> = {};
        for (const inv of invoices) {
          const rid = String(inv.room_id || inv.roomId || "");
          if (rid) invoiceMap[rid] = inv;
        }

        const meterMap: Record<string, any> = {};
        for (const m of meters) {
          const rid = String(m.roomId || m.room_id || "");
          if (!rid) continue;
          meterMap[rid] = m;
        }

        const occupiedRooms = rooms.filter(
          (r: any) => String(r.occupancyStatus || "").toUpperCase() === "OCCUPIED"
        );

        const items: BillingItem[] = occupiedRooms.map((r: any) => {
          const roomId = String(r.id);
          const roomNo = String(r.roomNo || r.room_no || "—");
          const tenant = tenantMap[roomNo] || "มีผู้เช่า";
          const rentAmount = Number(r.price || r.rentPrice || 0);

          const m = meterMap[roomId];
          const inv = invoiceMap[roomId];

          const waterMeter = m
            ? {
                current: Number(m.currWater ?? 0),
                previous: Number(m.prevWater ?? 0),
                totalUnits: Number(m.waterUnits ?? 0),
              }
            : undefined;

          const elecMeter = m
            ? {
                current: Number(m.currElectric ?? 0),
                previous: Number(m.prevElectric ?? 0),
                totalUnits: Number(m.electricUnits ?? 0),
              }
            : undefined;

          const waterCost = waterMeter ? waterMeter.totalUnits * wRate : 0;
          const elecCost = elecMeter ? elecMeter.totalUnits * eRate : 0;
          const estimatedTotal = rentAmount + waterCost + elecCost;

          const isPaid = inv
            ? String(inv.status || "").toUpperCase() === "PAID"
            : false;

          return {
            id: roomId,
            roomNumber: roomNo,
            status: "ไม่ว่าง" as const,
            waterMeter,
            elecMeter,
            rentAmount,
            estimatedTotal,
            isPaid,
            waterRate: wRate,
            electricRate: eRate,
            invoiceId: inv?.id ? String(inv.id) : undefined,
            invoiceNo: inv?.invoiceNo || inv?.invoice_no || undefined,
            invoiceStatus: inv?.status || undefined,
            tenantName: tenant || undefined,
            invoiceDate: inv?.createdAt || m?.recordedAt || undefined,
            dueDate: inv?.dueDate || undefined,
          };
        });

        items.sort((a, b) =>
          a.roomNumber.localeCompare(b.roomNumber, "th", { numeric: true })
        );

        setBillingData(items);
      } catch (e: any) {
        console.error("BillingPage load error:", e);
        if (!cancelled) {
          setError(e?.message || "โหลดข้อมูลใบแจ้งหนี้ไม่สำเร็จ");
          setBillingData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==================== handlers ==================== */
  const handleCompletePayment = async (id: string) => {
    const item = billingData.find((b) => b.id === id);
    if (!item || !condoId) {
      setSelectedItem(null);
      return;
    }

    try {
      if (item.invoiceId) {
        await fetch(
          `${API}/api/v1/owner/condos/${condoId}/invoices/${item.invoiceId}/pay`,
          {
            method: "PATCH",
            headers: authHeaders(),
          }
        );
      } else {
        const res = await fetch(`${API}/api/v1/owner/condos/${condoId}/invoices`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            roomId: item.id,
            totalAmount: item.estimatedTotal,
            status: "PAID",
            note: `ค่าเช่า ${item.rentAmount}฿ + ค่าน้ำ ${
              (item.waterMeter?.totalUnits || 0) * item.waterRate
            }฿ + ค่าไฟ ${
              (item.elecMeter?.totalUnits || 0) * item.electricRate
            }฿`,
          }),
        });

        if (res.ok) {
          const d = await res.json();

          setBillingData((prev) =>
            prev.map((b) =>
              b.id === id
                ? {
                    ...b,
                    isPaid: true,
                    invoiceId: d.invoice?.id ? String(d.invoice.id) : b.invoiceId,
                    invoiceNo: d.invoice?.invoiceNo || b.invoiceNo,
                    invoiceStatus: d.invoice?.status || "PAID",
                  }
                : b
            )
          );

          setSelectedItem(null);
          return;
        }
      }
    } catch (e) {
      console.error("Payment error:", e);
    }

    setBillingData((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isPaid: true } : b))
    );
    setSelectedItem(null);
  };

  /* ==================== search filter ==================== */
  const filteredData = search.trim()
    ? billingData.filter((b) =>
        b.roomNumber.toLowerCase().includes(search.trim().toLowerCase())
      )
    : billingData;

  /* ==================== loading ==================== */
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

  if (error) {
    return (
      <OwnerShell activeKey="billing" showSidebar>
        <div className="max-w-7xl mx-auto pt-10 px-6">
          <div className="rounded-2xl bg-white border border-rose-200 shadow-sm px-6 py-12 text-center">
            <div className="text-base font-extrabold text-rose-600">
              โหลดข้อมูลไม่สำเร็จ
            </div>
            <div className="mt-2 text-sm font-bold text-gray-500">{error}</div>
          </div>
        </div>
      </OwnerShell>
    );
  }

  /* ==================== invoice detail ==================== */
  if (selectedItem) {
    return (
      <OwnerShell activeKey="billing" showSidebar>
        <div className="max-w-7xl mx-auto pt-10 px-6">
          <InvoiceDetail
            item={selectedItem}
            onBack={() => setSelectedItem(null)}
            onComplete={() => handleCompletePayment(selectedItem.id)}
            condoId={condoId}
          />
        </div>
      </OwnerShell>
    );
  }

  /* ==================== billing list ==================== */
  return (
    <OwnerShell activeKey="billing" showSidebar>
      <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pt-10 px-6">
        <div className="flex justify-center items-center mb-12">
          <div className="flex items-center w-full max-w-xl">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-gray-500 text-sm font-medium">
                1. เลือกวันจดมิเตอร์
              </span>
            </div>

            <div className="flex-grow h-[1px] bg-gray-200 mx-4 -mt-7" />

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mb-2 text-white font-bold">
                2
              </div>
              <span className="text-purple-600 text-sm font-bold">
                2. สร้างใบแจ้งหนี้
              </span>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
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

        <BillingFilter waterRate={waterRate} electricRate={electricRate} />

        <BillingTable
          data={filteredData}
          onSelect={(item) => {
            if (item.isPaid) {
              setSelectedItem({ ...item, invoiceId: undefined, isPaid: false });
            } else {
              setSelectedItem(item);
            }
          }}
        />
      </div>
    </OwnerShell>
  );
}