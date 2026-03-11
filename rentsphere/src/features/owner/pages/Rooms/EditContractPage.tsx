import OwnerShell from "@/features/owner/components/OwnerShell";
import { api } from "@/shared/api/http";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function toDateInput(val: string | null | undefined): string {
  if (!val) return "";
  try {
    return new Date(val).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60";
const labelCls = "text-sm font-extrabold text-gray-800 mb-2";

export default function EditContractPage() {
  const nav = useNavigate();
  const { roomId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Room info
  const [roomNo, setRoomNo] = useState("");
  const [condoName, setCondoName] = useState("");

  // Contract fields
  const [contractId, setContractId] = useState<string | null>(null);
  const [moveInDate, setMoveInDate] = useState("");
  const [moveOutDate, setMoveOutDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState(0);
  const [securityDeposit, setSecurityDeposit] = useState(0);
  const [status, setStatus] = useState("ACTIVE");
  const [tenantName, setTenantName] = useState("-");
  const [tenantPhone, setTenantPhone] = useState("-");

  // Meter fields
  const [waterMeter, setWaterMeter] = useState("");
  const [electricMeter, setElectricMeter] = useState("");

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        // Fetch room detail + contracts in parallel
        const [roomData, contractsData] = await Promise.all([
          api<any>(`/owner/rooms/${encodeURIComponent(roomId)}`),
          api<any>(`/owner/rooms/${encodeURIComponent(roomId)}/contracts`),
        ]);

        if (cancelled) return;

        // Room info
        const room = roomData?.room ?? roomData;
        const condo = roomData?.condo ?? room?.condo;
        setRoomNo(room?.roomNo ?? "-");
        setCondoName(condo?.nameTh ?? condo?.nameEn ?? "-");

        // Meter
        const meter = room?.meter ?? {};
        setWaterMeter(meter.waterMeterNo ?? "");
        setElectricMeter(meter.electricMeterNo ?? "");

        // Contract (find active, or first)
        const contracts = contractsData?.items ?? [];
        const contract =
          contracts.find((c: any) => c.status === "ACTIVE") ?? contracts[0];

        if (contract) {
          setContractId(contract.id);
          setMoveInDate(toDateInput(contract.moveInDate));
          setMoveOutDate(toDateInput(contract.moveOutDate));
          setMonthlyRent(Number(contract.monthlyRent ?? 0));
          setSecurityDeposit(Number(contract.securityDeposit ?? 0));
          setStatus(contract.status ?? "ACTIVE");

          const t = contract.tenant;
          setTenantName(t?.name ?? "-");
          setTenantPhone(t?.phone ?? "-");
        }

        setLoading(false);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const handleSave = async () => {
    if (!roomId) return;
    setSaving(true);

    try {
      // 1) Update contract
      if (contractId) {
        await api(`/owner/contracts/${encodeURIComponent(contractId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moveOutDate: moveOutDate || undefined,
            monthlyRent,
            securityDeposit,
            status,
          }),
        });
      }

      // 2) Update meter numbers
      await api(`/owner/rooms/${encodeURIComponent(roomId)}/meter-numbers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waterMeterNo: waterMeter.trim() || null,
          electricMeterNo: electricMeter.trim() || null,
        }),
      });

      alert("บันทึกเรียบร้อย ✅");
      nav(`/owner/rooms/${roomId}`, { replace: true });
    } catch (e: any) {
      alert(e?.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8 text-center">
          <div className="text-sm font-extrabold text-gray-600">กำลังโหลดข้อมูล...</div>
        </div>
      </OwnerShell>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
          <div className="font-extrabold text-rose-700 mb-2">โหลดข้อมูลไม่สำเร็จ</div>
          <div className="text-sm text-rose-600 font-bold mb-4">{error}</div>
          <button
            onClick={() => nav("/owner/rooms", { replace: true })}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700"
          >
            กลับไปหน้าห้อง
          </button>
        </div>
      </OwnerShell>
    );
  }

  /* ---------- No contract ---------- */
  if (!contractId) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8 text-center">
          <div className="text-xl mb-2">📋</div>
          <div className="font-extrabold text-gray-900 mb-1">ยังไม่มีสัญญาในห้องนี้</div>
          <div className="text-sm text-gray-500 font-bold mb-4">กรุณาสร้างสัญญาก่อน</div>
          <button
            onClick={() => nav(`/owner/rooms/${roomId}/monthly`, { replace: true })}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700"
          >
            สร้างสัญญาใหม่
          </button>
        </div>
      </OwnerShell>
    );
  }

  /* ---------- Main ---------- */
  return (
    <OwnerShell activeKey="rooms" showSidebar condoName={condoName}>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-gray-600">
          คอนโด : <span className="text-gray-900">{condoName}</span> &bull;
          ห้อง : <span className="text-gray-900">{roomNo}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-[#EAF2FF] border-b border-blue-100/70 px-6 py-5">
          <div className="text-xl font-extrabold text-gray-900 text-center">
            ✏️ แก้ไขสัญญา &amp; มิเตอร์
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* ========== ข้อมูลผู้เช่า (readonly) ========== */}
          <div>
            <div className="text-lg font-extrabold text-gray-900 mb-4">👤 ข้อมูลผู้เช่า</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className={labelCls}>ชื่อ</div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-gray-700">
                  {tenantName}
                </div>
              </div>
              <div>
                <div className={labelCls}>เบอร์โทร</div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-gray-700">
                  {tenantPhone}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200" />

          {/* ========== สัญญา (editable) ========== */}
          <div>
            <div className="text-lg font-extrabold text-gray-900 mb-4">📋 ข้อมูลสัญญา</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <div>
                <div className={labelCls}>วันเข้าพัก</div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-gray-700">
                  {moveInDate || "-"}
                </div>
              </div>
              <div>
                <div className={labelCls}>วันออก</div>
                <input
                  type="date"
                  value={moveOutDate}
                  onChange={(e) => setMoveOutDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <div className={labelCls}>สถานะสัญญา</div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputCls}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ENDED">ENDED</option>
                  <option value="TERMINATED">TERMINATED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className={labelCls}>ค่าเช่าต่อเดือน (บาท)</div>
                <input
                  value={monthlyRent}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setMonthlyRent(Number.isFinite(v) ? v : 0);
                  }}
                  inputMode="numeric"
                  className={inputCls}
                />
              </div>
              <div>
                <div className={labelCls}>เงินประกัน (บาท)</div>
                <input
                  value={securityDeposit}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setSecurityDeposit(Number.isFinite(v) ? v : 0);
                  }}
                  inputMode="numeric"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200" />

          {/* ========== มิเตอร์ (editable) ========== */}
          <div>
            <div className="text-lg font-extrabold text-gray-900 mb-4">⚡ มิเตอร์เริ่มต้น</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className={labelCls}>เลขมิเตอร์น้ำ</div>
                <input
                  value={waterMeter}
                  onChange={(e) => setWaterMeter(e.target.value)}
                  placeholder="เช่น 00001234"
                  className={inputCls}
                />
              </div>
              <div>
                <div className={labelCls}>เลขมิเตอร์ไฟ</div>
                <input
                  value={electricMeter}
                  onChange={(e) => setElectricMeter(e.target.value)}
                  placeholder="เช่น 00005678"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200" />

          {/* ========== Buttons ========== */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => nav(`/owner/rooms/${roomId}`)}
              className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-7 py-3 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 shadow-[0_12px_22px_rgba(37,99,235,0.22)] disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : "💾 บันทึก"}
            </button>
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}
