import OwnerShell from "@/features/owner/components/OwnerShell";
import { api } from "@/shared/api/http";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PopupModal, { type PopupState, defaultPopup } from "@/shared/components/PopupModal";

type RoomDetail = {
  id: string;
  condoId: string;
  condoName: string | null;
  roomNo: string;
  floor: number | null;
  price: number | null;
};

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = [
    { n: 1, label: "สัญญา" },
    { n: 2, label: "ค่าเช่าล่วงหน้า" },
    { n: 3, label: "มิเตอร์น้ำ-ไฟ" },
  ] as const;

  return (
    <div className="w-full flex items-center justify-center gap-8 py-2">
      {items.map((it, idx) => {
        const active = it.n === step;
        const done = it.n < step;

        return (
          <div key={it.n} className="flex items-center gap-3">
            <div
              className={[
                "w-9 h-9 rounded-full flex items-center justify-center font-extrabold",
                active
                  ? "bg-blue-600 text-white shadow-[0_12px_22px_rgba(37,99,235,0.25)]"
                  : done
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-white text-gray-500 border border-gray-200",
              ].join(" ")}
            >
              {it.n}
            </div>

            <div className={active ? "font-extrabold text-blue-700" : "font-bold text-gray-600"}>{it.label}</div>

            {idx !== items.length - 1 ? <div className="w-20 h-[3px] rounded-full bg-blue-100" /> : null}
          </div>
        );
      })}
    </div>
  );
}

function moneyTHB(n?: number | null) {
  if (n == null || !Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("th-TH").format(n) + " บาท";
}

/* ===== backend room detail ===== */
function normalizeRoom(roomId: string, data: any): RoomDetail {
  const room = data?.room ?? data;
  const condo = data?.condo ?? room?.condo ?? null;

  const priceRaw = room?.price ?? room?.rentPrice ?? null;
  const priceNum =
    priceRaw == null || String(priceRaw).trim() === "" ? null : Number(String(priceRaw).replace(/,/g, ""));

  return {
    id: String(room?.id ?? roomId),
    condoId: String(room?.condoId ?? condo?.id ?? ""),
    condoName: (condo?.nameTh ?? condo?.nameEn ?? room?.condoName ?? null) as string | null,
    roomNo: String(room?.roomNo ?? "—"),
    floor: room?.floor == null ? null : Number(room.floor),
    price: Number.isFinite(priceNum as number) ? (priceNum as number) : null,
  };
}

async function fetchRoomDetail(roomId: string): Promise<RoomDetail> {
  const data = await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}`);
  return normalizeRoom(roomId, data);
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200/60";

const labelCls = "text-sm font-extrabold text-gray-800 mb-2";
const requiredStar = <span className="text-rose-600"> *</span>;

export default function MonthlyContractPage() {
  const nav = useNavigate();
  const { roomId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomDetail | null>(null);

  // Contract fields
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rentPerMonth, setRentPerMonth] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(0);
  const [depositPaidBy, setDepositPaidBy] = useState("CASH");
  const [bookingFee, setBookingFee] = useState<number>(0);
  const [bookingRef, setBookingRef] = useState("");

  // Tenant profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");

  // Emergency contact
  const [ecName, setEcName] = useState("");
  const [ecRelationship, setEcRelationship] = useState("");
  const [ecPhone, setEcPhone] = useState("");

  // Note
  const [note, setNote] = useState("");
  const [popup, setPopup] = useState<PopupState>(defaultPopup);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!roomId) {
        setLoading(false);
        setRoom(null);
        setError("ไม่พบ roomId");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await fetchRoomDetail(roomId);
        if (cancelled) return;

        setRoom(data);
        setRentPerMonth(Number(data.price ?? 0) || 0);

        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setRoom(null);
        setError(e?.message ?? "เกิดข้อผิดพลาด");
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const condoName = room?.condoName ?? "คอนโดมิเนียม";
  const roomNo = room?.roomNo ?? "-";

  const canNext = useMemo(() => {
    if (!firstName.trim()) return false;
    if (!lastName.trim()) return false;
    if (!tenantPhone.trim()) return false;
    if (!idNumber.trim()) return false;
    if (!startDate) return false;
    if (!Number.isFinite(rentPerMonth) || rentPerMonth < 0) return false;
    return true;
  }, [firstName, lastName, tenantPhone, idNumber, startDate, rentPerMonth]);

  const [saving, setSaving] = useState(false);

  const goNext = async () => {
    if (!roomId) return nav("/owner/rooms", { replace: true });

    try {
      setSaving(true);
      await api(`/owner/rooms/${encodeURIComponent(roomId)}/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: `${firstName.trim()} ${lastName.trim()}`,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          tenantPhone: tenantPhone.trim(),
          idNumber: idNumber.trim(),
          address: address.trim(),
          startDate,
          endDate: endDate || undefined,
          rentPerMonth,
          deposit,
          depositPaidBy,
          bookingFee: bookingFee || undefined,
          emergencyName: ecName.trim() || undefined,
          emergencyRelationship: ecRelationship.trim() || undefined,
          emergencyPhone: ecPhone.trim() || undefined,
        }),
      });
      nav(`/owner/rooms/${roomId}/advance-payment`, { replace: true });
    } catch (e: any) {
      setPopup({ open: true, type: "error", message: e?.message ?? "บันทึกสัญญาไม่สำเร็จ", title: "ผิดพลาด" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
          <div className="text-sm font-extrabold text-gray-600">กำลังโหลดข้อมูล...</div>
        </div>
      </OwnerShell>
    );
  }

  if (!room || error) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
          <div className="text-xl font-extrabold text-gray-900 mb-2">ไม่พบข้อมูลห้อง</div>
          <div className="text-gray-600 font-bold mb-2">roomId: {roomId}</div>
          {error && <div className="text-rose-600 font-extrabold mb-6">{error}</div>}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nav("/owner/rooms", { replace: true })}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700"
            >
              กลับไปหน้าห้อง
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </OwnerShell>
    );
  }

  return (
    <>
    <OwnerShell activeKey="rooms" showSidebar>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-gray-600">
          คอนโดมิเนียม : <span className="text-gray-900">{condoName}</span>
        </div>
        <div className="text-sm font-extrabold text-gray-700">
          ห้อง {roomNo} • ค่าห้องต่อเดือน <span className="text-gray-900">{moneyTHB(room.price ?? null)}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div className="bg-[#EAF2FF] border-b border-blue-100/70 px-6 py-4">
          <Stepper step={1} />
        </div>

        <div className="p-6">
          {/* ========== Section: รายชื่อคนจองรอเข้าพัก ========== */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xl font-extrabold text-gray-900">รายชื่อคนจองรอเข้าพัก</div>
            <div className="text-sm font-bold text-gray-600">
              ค่าห้องต่อเดือน <span className="text-blue-700 font-extrabold">{moneyTHB(room.price ?? null)}</span>
            </div>
          </div>

          {/* Contract dates & pricing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <div>
              <div className={labelCls}>วันที่เข้าพัก{requiredStar}</div>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <div className={labelCls}>วันที่ออก</div>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <div className={labelCls}>ค่าเช่าต่อเดือน{requiredStar}</div>
              <div className="flex items-stretch">
                <input
                  value={rentPerMonth}
                  onChange={(e) => { const v = parseFloat(e.target.value); setRentPerMonth(Number.isFinite(v) ? v : 0); }}
                  inputMode="numeric"
                  className={inputCls + " rounded-r-none"}
                />
                <div className="rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4 py-3 font-extrabold text-gray-700 whitespace-nowrap">
                  บาท / เดือน
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <div>
              <div className={labelCls}>เงินประกัน{requiredStar}</div>
              <div className="flex items-stretch">
                <input
                  value={deposit}
                  onChange={(e) => { const v = parseFloat(e.target.value); setDeposit(Number.isFinite(v) ? v : 0); }}
                  inputMode="numeric"
                  className={inputCls + " rounded-r-none"}
                />
                <div className="rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4 py-3 font-extrabold text-gray-700">
                  บาท
                </div>
              </div>
            </div>
            <div>
              <div className={labelCls}>ชำระประกันโดย{requiredStar}</div>
              <select
                value={depositPaidBy}
                onChange={(e) => setDepositPaidBy(e.target.value)}
                className={inputCls}
              >
                
                <option value="TRANSFER">โอนเงิน</option>
              </select>
            </div>
            <div>
              <div className={labelCls}>เงินจอง</div>
              <div className="flex items-stretch">
                <input
                  value={bookingFee}
                  onChange={(e) => { const v = parseFloat(e.target.value); setBookingFee(Number.isFinite(v) ? v : 0); }}
                  inputMode="numeric"
                  className={inputCls + " rounded-r-none"}
                />
                <div className="rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4 py-3 font-extrabold text-gray-700">
                  บาท
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <div>
              <div className={labelCls}>เลขที่ใบจอง</div>
              <input value={bookingRef} onChange={(e) => setBookingRef(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Summary box */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 mb-8">
            <div className="text-lg font-extrabold text-gray-900 mb-3">สรุป</div>
            <div className="flex items-center justify-between py-1">
              <span className="font-bold text-gray-600">เงินประกัน</span>
              <span className="font-extrabold text-gray-900">{moneyTHB(deposit)}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="font-bold text-gray-600">เงินจอง</span>
              <span className="font-extrabold text-gray-900">-{moneyTHB(bookingFee)}</span>
            </div>
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex items-center justify-between py-1">
              <span className="font-extrabold text-gray-900">รวม (เก็บเพิ่มเติม)</span>
              <span className="font-extrabold text-gray-900">{moneyTHB(Math.max(0, deposit - bookingFee))}</span>
            </div>
          </div>

          {/* ========== Section: ข้อมูลผู้เช่า ========== */}
          <div className="h-px bg-gray-200 mb-6" />
          <div className="text-xl font-extrabold text-gray-900 mb-4">ข้อมูลผู้เช่า</div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <div>
              <div className={labelCls}>ชื่อจริง{requiredStar}</div>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <div className={labelCls}>นามสกุล{requiredStar}</div>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <div>
              <div className={labelCls}>เบอร์ติดต่อ{requiredStar}</div>
              <input value={tenantPhone} onChange={(e) => setTenantPhone(e.target.value)} inputMode="tel" className={inputCls} />
            </div>
            <div>
              <div className={labelCls}>เลขบัตรประชาชน / พาสปอร์ต{requiredStar}</div>
              <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="mb-6">
            <div className={labelCls}>ที่อยู่ (สำหรับแสดงในใบแจ้งหนี้/ใบเสร็จ)</div>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
          </div>

          {/* ========== Section: บุคคลติดต่อฉุกเฉิน ========== */}
          <div className="h-px bg-gray-200 mb-6" />
          <div className="text-xl font-extrabold text-gray-900 mb-4">บุคคลติดต่อฉุกเฉิน</div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <div>
              <div className={labelCls}>ชื่อบุคคลติดต่อฉุกเฉิน</div>
              <input value={ecName} onChange={(e) => setEcName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <div className={labelCls}>ความสัมพันธ์</div>
              <input value={ecRelationship} onChange={(e) => setEcRelationship(e.target.value)} className={inputCls} />
            </div>
            <div>
              <div className={labelCls}>เบอร์ติดต่อ</div>
              <input value={ecPhone} onChange={(e) => setEcPhone(e.target.value)} inputMode="tel" className={inputCls} />
            </div>
          </div>

          {/* ========== Section: อื่นๆ ========== */}
          <div className="h-px bg-gray-200 mb-6" />
          <div className="text-xl font-extrabold text-gray-900 mb-4">อื่นๆ</div>

          <div className="mb-6">
            <div className={labelCls}>Note</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className={inputCls}
            />
          </div>

          {/* ========== Buttons ========== */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => nav(`/owner/rooms/${roomId}`)}
              className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50"
            >
              ย้อนกลับ
            </button>

            <button
              type="button"
              onClick={() => {
                if (!canNext) return setPopup({ open: true, type: "warning", message: "กรุณากรอกข้อมูลให้ครบ (ชื่อจริง, นามสกุล, เบอร์ติดต่อ, เลขบัตร, วันเริ่ม)", title: "ข้อมูลไม่ครบ" });
                goNext();
              }}
              className={[
                "px-7 py-3 rounded-xl font-extrabold",
                canNext
                  ? "!bg-blue-600 text-white shadow-[0_12px_22px_rgba(37,99,235,0.22)] hover:!bg-blue-700"
                  : "bg-blue-200 text-white/70 cursor-not-allowed",
              ].join(" ")}
              disabled={!canNext || saving}
            >
              {saving ? "กำลังบันทึก..." : "ต่อไป"}
            </button>
          </div>
        </div>
      </div>
    </OwnerShell>

    <PopupModal {...popup} onClose={() => setPopup(defaultPopup)} />
    </>
  );
}
