import OwnerShell from "@/features/owner/components/OwnerShell";
import { api } from "@/shared/api/http";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type AccessCodeItem = {
  id: string;
  code: string;
  status: "ACTIVE" | "DISABLED" | "USED" | string;
  expiresAt: string | null;
  usedAt?: string | null;
  createdAt?: string | null;
};

async function fetchRoomMini(roomId: string) {
  const data = await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}`);
  const room = data?.room ?? data;
  const condo = data?.condo ?? room?.condo ?? null;

  return {
    condoName: String(condo?.nameTh ?? condo?.nameEn ?? room?.condoName ?? "คอนโดมิเนียม"),
    roomNo: String(room?.roomNo ?? "—"),
  };
}

async function listCodes(roomId: string): Promise<AccessCodeItem[]> {
  const data = await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}/access-codes`);
  const arr = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  return arr.map((x: any) => ({
    id: String(x?.id),
    code: String(x?.code ?? ""),
    status: String(x?.status ?? "ACTIVE"),
    expiresAt: x?.expiresAt ? String(x.expiresAt) : null,
    usedAt: x?.usedAt ? String(x.usedAt) : null,
    createdAt: x?.createdAt ? String(x.createdAt) : null,
  }));
}

async function createCode(roomId: string, expiresInDays?: number | null): Promise<AccessCodeItem> {
  const body: any = {};
  if (expiresInDays != null && Number.isFinite(expiresInDays)) body.expiresInDays = expiresInDays;

  const data = await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}/access-codes`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const item = data?.item ?? data;
  return {
    id: String(item?.id),
    code: String(item?.code ?? ""),
    status: String(item?.status ?? "ACTIVE"),
    expiresAt: item?.expiresAt ? String(item.expiresAt) : null,
    createdAt: item?.createdAt ? String(item.createdAt) : null,
  };
}

async function disableCode(roomId: string, codeId: string) {
  await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}/access-codes/${encodeURIComponent(codeId)}/disable`, {
    method: "PATCH",
  });
}

async function deleteCode(roomId: string, codeId: string) {
  await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}/access-codes/${encodeURIComponent(codeId)}`, {
    method: "DELETE",
  });
}

function formatDateTime(s?: string | null) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return s;
  }
}

function StatusBadge({ status }: { status: string }) {
  const s = String(status).toUpperCase();
  const cls =
    s === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : s === "DISABLED"
      ? "bg-gray-50 text-gray-700 border-gray-200"
      : s === "USED"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  const label = s === "ACTIVE" ? "ใช้งาน" : s === "DISABLED" ? "ปิด" : s === "USED" ? "ถูกใช้แล้ว" : s;

  return <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${cls}`}>{label}</span>;
}

export default function TenantAccessCodePage() {
  const nav = useNavigate();
  const { roomId } = useParams();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [condoName, setCondoName] = useState("คอนโดมิเนียม");
  const [roomNo, setRoomNo] = useState("—");

  const [items, setItems] = useState<AccessCodeItem[]>([]);
  const activeCount = useMemo(() => items.filter((x) => String(x.status).toUpperCase() === "ACTIVE").length, [items]);

  const [expiresDays, setExpiresDays] = useState<number>(30);

  const loadAll = async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      setError(null);

      const mini = await fetchRoomMini(roomId);
      setCondoName(mini.condoName);
      setRoomNo(mini.roomNo);

      const list = await listCodes(roomId);
      setItems(list);

      setLoading(false);
    } catch (e: any) {
      setError(e?.message ?? "โหลดรหัสไม่สำเร็จ");
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!roomId) {
        setError("ไม่พบ roomId");
        setLoading(false);
        return;
      }
      if (cancelled) return;
      await loadAll();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const onCreate = async () => {
    if (!roomId) return;
    if (activeCount >= 5) return alert("ห้องนี้มีรหัส ACTIVE ครบ 5 แล้ว");

    const days = Number(expiresDays);
    const safeDays = Number.isFinite(days) && days > 0 && days <= 365 ? Math.trunc(days) : null;

    try {
      setBusy(true);
      const created = await createCode(roomId, safeDays);
      await navigator.clipboard.writeText(created.code).catch(() => {});
      alert(`สร้างรหัสแล้ว: ${created.code}\n(คัดลอกให้แล้ว ถ้าบราวเซอร์อนุญาต)`);
      await loadAll();
    } catch (e: any) {
      alert(e?.message ?? "สร้างรหัสไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const onDisable = async (codeId: string) => {
    if (!roomId) return;
    if (!confirm("ปิดการใช้งานรหัสนี้?")) return;

    try {
      setBusy(true);
      await disableCode(roomId, codeId);
      await loadAll();
    } catch (e: any) {
      alert(e?.message ?? "ปิดรหัสไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (codeId: string) => {
    if (!roomId) return;
    if (!confirm("ลบรหัสนี้ถาวร?")) return;

    try {
      setBusy(true);
      await deleteCode(roomId, codeId);
      await loadAll();
    } catch (e: any) {
      alert(e?.message ?? "ลบรหัสไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async (code: string) => {
    await navigator.clipboard.writeText(code).catch(() => {});
    alert("คัดลอกรหัสแล้ว");
  };

  if (loading) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
          <div className="text-sm font-extrabold text-gray-600">กำลังโหลดรหัสเข้าสู่ระบบ...</div>
        </div>
      </OwnerShell>
    );
  }

  if (!roomId || error) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
          <div className="text-xl font-extrabold text-gray-900 mb-2">ไม่พบข้อมูล</div>
          <div className="text-gray-600 font-bold mb-2">roomId: {roomId}</div>
          {error && <div className="text-rose-600 font-extrabold mb-6">{error}</div>}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nav("/owner/rooms")}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-blue-700"
            >
              กลับไปหน้าห้อง
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-xl bg-white border border-gray-200 px-5 py-2.5 text-sm font-extrabold text-gray-700 hover:bg-gray-50"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </OwnerShell>
    );
  }

  return (
    <OwnerShell activeKey="rooms" showSidebar>
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-gray-600">
          คอนโดมิเนียม : <span className="text-gray-900">{condoName}</span>
        </div>
        <div className="text-sm font-extrabold text-gray-700">ห้อง {roomNo}</div>
      </div>

      <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-[#F3F7FF] border-b border-blue-100/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-extrabold text-gray-900">รหัสเข้าสู่ระบบ (Tenant Access Codes)</div>
              <div className="text-sm font-bold text-gray-500 mt-1">
                จำกัดรหัส ACTIVE สูงสุด 5 ต่อห้อง • ตอนนี้ ACTIVE {activeCount}/5
              </div>
            </div>

            <button
              type="button"
              onClick={() => nav(`/owner/rooms/${roomId}`)}
              className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
            >
              กลับหน้าห้อง
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* create */}
          <div className="rounded-2xl border border-blue-100/70 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <div className="text-sm font-extrabold text-gray-800 mb-2">อายุรหัส (วัน)</div>
                <input
                  value={expiresDays}
                  onChange={(e) => setExpiresDays(Number(e.target.value || 0))}
                  inputMode="numeric"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                />
                <div className="text-xs font-bold text-gray-500 mt-2">กำหนด 1–365 วัน (ปล่อย 0/ว่าง = ไม่ตั้งหมดอายุ)</div>
              </div>

              <button
                type="button"
                onClick={onCreate}
                disabled={busy}
                className={[
                  "h-[52px] rounded-xl font-extrabold",
                  busy
                    ? "bg-blue-200 text-white/70 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-[0_10px_20px_rgba(37,99,235,0.18)]",
                ].join(" ")}
              >
                {busy ? "กำลังสร้าง..." : "สร้างรหัสใหม่"}
              </button>
            </div>
          </div>

          {/* table */}
          <div className="w-full overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead>
                <tr className="bg-[#F3F7FF] text-gray-800 border-b border-blue-100/70">
                  <th className="px-6 py-4 font-extrabold text-left">รหัส</th>
                  <th className="px-6 py-4 font-extrabold text-left">สถานะ</th>
                  <th className="px-6 py-4 font-extrabold text-left">หมดอายุ</th>
                  <th className="px-6 py-4 font-extrabold text-left">ใช้แล้วเมื่อ</th>
                  <th className="px-6 py-4 font-extrabold text-right">จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-gray-500 font-bold">
                      ยังไม่มีรหัส
                    </td>
                  </tr>
                ) : (
                  items.map((x) => (
                    <tr key={x.id} className="border-b border-blue-50">
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-gray-900">{x.code}</div>
                        <button
                          type="button"
                          onClick={() => onCopy(x.code)}
                          className="mt-1 text-xs font-extrabold text-blue-600 hover:text-blue-800 underline underline-offset-4"
                        >
                          คัดลอก
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={x.status} />
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-700">{formatDateTime(x.expiresAt)}</td>
                      <td className="px-6 py-4 font-bold text-gray-700">{formatDateTime(x.usedAt ?? null)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            disabled={busy || String(x.status).toUpperCase() !== "ACTIVE"}
                            onClick={() => onDisable(x.id)}
                            className={[
                              "px-4 py-2 rounded-xl font-extrabold border",
                              String(x.status).toUpperCase() !== "ACTIVE"
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50",
                            ].join(" ")}
                          >
                            ปิด
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onDelete(x.id)}
                            className="px-4 py-2 rounded-xl font-extrabold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100/60"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={loadAll}
              className="h-[48px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
            >
              รีเฟรช
            </button>
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}