import OwnerShell from "@/features/owner/components/OwnerShell";
import { api } from "@/shared/api/http";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* =========================
   Types (ตาม owner.routes.ts)
   ========================= */
type MeterNumbers = {
  waterMeterNo: string | null;
  electricMeterNo: string | null;
};

type MeterReadingResponse = {
  roomId: string;
  condoId: string;
  cycle: { id: string; cycleMonth: string; status: string } | null;

  prevWater: number | null;
  currWater: number | null;
  prevElectric: number | null;
  currElectric: number | null;

  waterUnits: number | null;
  electricUnits: number | null;

  status: string | null;
  recordedAt: string | null;
  note: string | null;
};

type SaveMetersBody = {
  currWater: number;
  currElectric: number;
  note?: string;
};

/* =========================
   API
   ========================= */
async function fetchRoomDetailMini(roomId: string) {
  // เพื่อเอาชื่อห้อง/คอนโด (คุยกับ endpoint room detail)
  const data = await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}`);
  const room = data?.room ?? data;
  const condo = data?.condo ?? room?.condo ?? null;

  return {
    condoName: String(condo?.nameTh ?? condo?.nameEn ?? room?.condoName ?? "คอนโดมิเนียม"),
    roomNo: String(room?.roomNo ?? "—"),
  };
}

async function getMeterNumbers(roomId: string): Promise<MeterNumbers> {
  const data = await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}/meter-numbers`);
  return {
    waterMeterNo: typeof data?.waterMeterNo === "string" ? data.waterMeterNo : data?.waterMeterNo ?? null,
    electricMeterNo: typeof data?.electricMeterNo === "string" ? data.electricMeterNo : data?.electricMeterNo ?? null,
  };
}

async function saveMeterNumbers(roomId: string, body: MeterNumbers) {
  await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}/meter-numbers`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

async function getCurrentMeters(roomId: string): Promise<MeterReadingResponse> {
  return await api<MeterReadingResponse>(`/owner/rooms/${encodeURIComponent(roomId)}/meters`);
}

async function submitCurrentMeters(roomId: string, body: SaveMetersBody) {
  return await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}/meters`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function moneyOrDash(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("th-TH").format(n);
}

export default function RoomMeterPage() {
  const nav = useNavigate();
  const { roomId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [condoName, setCondoName] = useState("คอนโดมิเนียม");
  const [roomNo, setRoomNo] = useState("—");

  // meter numbers
  const [waterMeterNo, setWaterMeterNo] = useState("");
  const [electricMeterNo, setElectricMeterNo] = useState("");
  const [numbersSaving, setNumbersSaving] = useState(false);

  // reading
  const [prevWater, setPrevWater] = useState<number | null>(null);
  const [prevElectric, setPrevElectric] = useState<number | null>(null);

  const [currWater, setCurrWater] = useState<string>("");
  const [currElectric, setCurrElectric] = useState<string>("");

  const [note, setNote] = useState("");

  const waterUnits = useMemo(() => {
    const c = Number(currWater);
    if (!Number.isFinite(c) || c < 0) return null;
    const p = prevWater ?? 0;
    return Math.max(0, c - p);
  }, [currWater, prevWater]);

  const electricUnits = useMemo(() => {
    const c = Number(currElectric);
    if (!Number.isFinite(c) || c < 0) return null;
    const p = prevElectric ?? 0;
    return Math.max(0, c - p);
  }, [currElectric, prevElectric]);

  const loadAll = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      setError(null);

      const mini = await fetchRoomDetailMini(roomId);
      setCondoName(mini.condoName);
      setRoomNo(mini.roomNo);

      const nums = await getMeterNumbers(roomId);
      setWaterMeterNo(nums.waterMeterNo ?? "");
      setElectricMeterNo(nums.electricMeterNo ?? "");

      const meters = await getCurrentMeters(roomId);
      setPrevWater(meters.prevWater ?? 0);
      setPrevElectric(meters.prevElectric ?? 0);

      // ถ้ามีค่าเดิมเดือนนี้ ให้เติม curr ให้เลย
      setCurrWater(meters.currWater != null ? String(meters.currWater) : "");
      setCurrElectric(meters.currElectric != null ? String(meters.currElectric) : "");
      setNote(meters.note ?? "");

      setLoading(false);
    } catch (e: any) {
      setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
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

  const onSaveNumbers = async () => {
    if (!roomId) return;
    try {
      setNumbersSaving(true);
      await saveMeterNumbers(roomId, {
        waterMeterNo: waterMeterNo.trim() ? waterMeterNo.trim() : null,
        electricMeterNo: electricMeterNo.trim() ? electricMeterNo.trim() : null,
      });
      alert("บันทึกเลขมิเตอร์แล้ว");
    } catch (e: any) {
      alert(e?.message ?? "บันทึกเลขมิเตอร์ไม่สำเร็จ");
    } finally {
      setNumbersSaving(false);
    }
  };

  const onSubmit = async () => {
    if (!roomId) return;

    const cw = Number(currWater);
    const ce = Number(currElectric);

    if (!Number.isFinite(cw) || cw < 0) return alert("กรอกเลขมิเตอร์น้ำ (ตัวเลข >= 0)");
    if (!Number.isFinite(ce) || ce < 0) return alert("กรอกเลขมิเตอร์ไฟ (ตัวเลข >= 0)");

    try {
      setSaving(true);
      await submitCurrentMeters(roomId, { currWater: cw, currElectric: ce, note: note.trim() ? note.trim() : undefined });
      alert("บันทึกหน่วยเดือนนี้แล้ว");
      await loadAll();
    } catch (e: any) {
      alert(e?.message ?? "บันทึกหน่วยไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
          <div className="text-sm font-extrabold text-gray-600">กำลังโหลดข้อมูลมิเตอร์...</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* meter numbers */}
        <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#F3F7FF] border-b border-blue-100/70">
            <div className="text-lg font-extrabold text-gray-900 text-center">เลขมิเตอร์ (ตั้งค่า)</div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <div className="text-sm font-extrabold text-gray-800 mb-2">เลขมิเตอร์น้ำ</div>
              <input
                value={waterMeterNo}
                onChange={(e) => setWaterMeterNo(e.target.value)}
                placeholder="เช่น W-001234"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
              />
            </div>

            <div>
              <div className="text-sm font-extrabold text-gray-800 mb-2">เลขมิเตอร์ไฟ</div>
              <input
                value={electricMeterNo}
                onChange={(e) => setElectricMeterNo(e.target.value)}
                placeholder="เช่น E-009876"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
              />
            </div>

            <button
              type="button"
              onClick={onSaveNumbers}
              disabled={numbersSaving}
              className={[
                "h-[48px] w-full rounded-xl font-extrabold",
                numbersSaving
                  ? "bg-blue-200 text-white/70 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-[0_10px_20px_rgba(37,99,235,0.18)]",
              ].join(" ")}
            >
              {numbersSaving ? "กำลังบันทึก..." : "บันทึกเลขมิเตอร์"}
            </button>
          </div>
        </div>

        {/* meter reading */}
        <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#F3F7FF] border-b border-blue-100/70">
            <div className="text-lg font-extrabold text-gray-900 text-center">บันทึกหน่วยเดือนปัจจุบัน</div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs font-extrabold text-gray-500">น้ำ (ก่อนหน้า)</div>
                <div className="mt-1 text-xl font-extrabold text-gray-900">{moneyOrDash(prevWater)}</div>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs font-extrabold text-gray-500">ไฟ (ก่อนหน้า)</div>
                <div className="mt-1 text-xl font-extrabold text-gray-900">{moneyOrDash(prevElectric)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-extrabold text-gray-800 mb-2">น้ำ (ปัจจุบัน)</div>
                <input
                  value={currWater}
                  onChange={(e) => setCurrWater(e.target.value)}
                  inputMode="numeric"
                  placeholder="เช่น 120"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                />
                <div className="mt-2 text-xs font-bold text-gray-500">
                  หน่วยที่ใช้: <span className="font-extrabold text-gray-900">{moneyOrDash(waterUnits)}</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-extrabold text-gray-800 mb-2">ไฟ (ปัจจุบัน)</div>
                <input
                  value={currElectric}
                  onChange={(e) => setCurrElectric(e.target.value)}
                  inputMode="numeric"
                  placeholder="เช่น 340"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
                />
                <div className="mt-2 text-xs font-bold text-gray-500">
                  หน่วยที่ใช้: <span className="font-extrabold text-gray-900">{moneyOrDash(electricUnits)}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-gray-700 mb-2">Note</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
              />
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className={[
                "h-[52px] w-full rounded-xl font-extrabold",
                saving
                  ? "bg-blue-200 text-white/70 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-[0_10px_20px_rgba(37,99,235,0.18)]",
              ].join(" ")}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกหน่วยเดือนนี้"}
            </button>

            <button
              type="button"
              onClick={() => nav(`/owner/rooms/${roomId}`)}
              className="w-full h-[48px] rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
            >
              กลับไปหน้าห้อง
            </button>
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}