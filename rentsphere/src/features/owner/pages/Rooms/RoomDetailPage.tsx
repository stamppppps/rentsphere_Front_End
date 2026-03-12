import OwnerShell from "@/features/owner/components/OwnerShell";
import { api } from "@/shared/api/http";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PopupModal, { type PopupState, defaultPopup } from "@/shared/components/PopupModal";

type OccupancyStatus = "VACANT" | "OCCUPIED";

type RoomDetail = {
  id: string;
  condoId: string;
  condoName: string | null;
  roomNo: string;
  floor: number | null;
  price: number | null;
  isActive: boolean;
  occupancyStatus: OccupancyStatus;
};

type ContractDetail = {
  hasContract: boolean;
  contract?: {
    id: string;
    moveInDate: string;
    moveOutDate: string | null;
    monthlyRent: number;
    securityDeposit: number;
    depositPaidBy: string;
    bookingFeeApplied: number;
  };
  tenant?: {
    name: string;
    phone: string;
    idNumber: string;
    address: string;
  };
  emergencyContacts?: {
    name: string;
    relationship: string;
    phone: string;
  }[];
};

function moneyTHB(n?: number | null) {
  if (n == null || !Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("th-TH").format(n) + " บาท";
}

function formatDate(d?: string | null) {
  if (!d) return "-";
  try {
    const date = new Date(d);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function depositPaidByLabel(v?: string) {
  if (!v) return "-";
  const map: Record<string, string> = {
    CASH: "เงินสด",
    TRANSFER: "โอนเงิน",
    TENANT: "ผู้เช่า",
    OWNER: "เจ้าของ",
  };
  return map[v.toUpperCase()] ?? v;
}

function StatusPill({ status }: { status?: string }) {
  const vacant = String(status ?? "VACANT").toUpperCase() === "VACANT";
  return (
    <span
      className={[
        "inline-flex items-center justify-center",
        "min-w-[72px] px-3 py-1 rounded-full text-xs font-extrabold",
        vacant
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-rose-50 text-rose-700 border border-rose-200",
      ].join(" ")}
    >
      {vacant ? "ว่าง" : "ไม่ว่าง"}
    </span>
  );
}

/* ====== API ====== */
function normalizeRoom(roomId: string, data: any): RoomDetail {
  const room = data?.room ?? data;
  const condo = data?.condo ?? room?.condo ?? null;

  const occ =
    String(room?.occupancyStatus ?? room?.status ?? "VACANT").toUpperCase() === "OCCUPIED"
      ? "OCCUPIED"
      : "VACANT";

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
    isActive: Boolean(room?.isActive ?? true),
    occupancyStatus: occ,
  };
}

async function fetchRoomDetail(roomId: string): Promise<RoomDetail> {
  const data = await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}`);
  return normalizeRoom(roomId, data);
}

async function fetchContractDetail(roomId: string): Promise<ContractDetail> {
  const data = await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}/contract-detail`);
  return data as ContractDetail;
}

export default function RoomDetailPage() {
  const nav = useNavigate();
  const { roomId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [contractDetail, setContractDetail] = useState<ContractDetail | null>(null);
  const [terminating, setTerminating] = useState(false);

  const btnPrimary =
    "inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)] hover:bg-blue-700 active:scale-[0.99] transition";

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

        // If occupied, fetch contract detail
        if (data.occupancyStatus === "OCCUPIED") {
          try {
            const cd = await fetchContractDetail(roomId);
            if (!cancelled) setContractDetail(cd);
          } catch {
            // Contract detail fetch failed — show action cards instead
          }
        }

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

  const [popup, setPopup] = useState<PopupState>(defaultPopup);

  const handleTerminate = () => {
    if (!roomId) return;
    setPopup({
      open: true,
      type: "confirm",
      title: "ยุติสัญญา",
      message: "ยืนยันยุติสัญญาห้องนี้?",
      confirmText: "ยืนยัน",
      cancelText: "ยกเลิก",
      onConfirm: async () => {
        setPopup(defaultPopup);
        try {
          setTerminating(true);
          await api(`/owner/rooms/${encodeURIComponent(roomId)}/terminate-contract`, {
            method: "POST",
          });
          setPopup({
            open: true,
            type: "success",
            title: "สำเร็จ",
            message: "ยุติสัญญาสำเร็จ",
            onConfirm: () => window.location.reload(),
          });
        } catch (e: any) {
          setPopup({
            open: true,
            type: "error",
            title: "ผิดพลาด",
            message: e?.message ?? "ไม่สามารถยุติสัญญาได้",
          });
        } finally {
          setTerminating(false);
        }
      },
      onCancel: () => {},
    });
  };

  const condoName = room?.condoName ?? "คอนโดมิเนียม";
  const roomNo = room?.roomNo ?? "-";
  const roomPrice = room?.price ?? null;
  const roomStatus = room?.occupancyStatus ?? "VACANT";

  if (loading) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
          <div className="text-sm font-extrabold text-gray-600">กำลังโหลดข้อมูลห้อง...</div>
        </div>
      </OwnerShell>
    );
  }

  if (!roomId || error || !room) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
          <div className="text-xl font-extrabold text-gray-900 mb-2">ไม่พบข้อมูลห้องนี้</div>
          <div className="text-gray-600 font-bold mb-2">roomId: {roomId}</div>
          {error && <div className="text-rose-600 font-extrabold mb-6">{error}</div>}

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => nav("/owner/rooms")} className={btnPrimary}>
              กลับไปหน้าห้อง
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-xl bg-white border border-gray-200 px-5 py-2.5 text-sm font-extrabold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </OwnerShell>
    );
  }

  const isOccupied = roomStatus === "OCCUPIED";
  const cd = contractDetail;
  const hasContract = isOccupied && cd?.hasContract;

  return (
    <>
    <OwnerShell activeKey="rooms" showSidebar>
      {/* breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
          <button
            onClick={() => nav("/owner/dashboard")}
            className="hover:text-gray-900 underline underline-offset-4"
            type="button"
          >
            หน้าหลัก
          </button>
          <span className="text-gray-400">{">"}</span>

          <button
            onClick={() => nav("/owner/rooms")}
            className="hover:text-gray-900 underline underline-offset-4"
            type="button"
          >
            {condoName}
          </button>

          <span className="text-gray-400">{">"}</span>
          <span className="text-gray-900 font-extrabold">ห้อง {roomNo}</span>

          <span className="ml-3">
            <StatusPill status={roomStatus} />
          </span>
        </div>

        <div className="text-sm font-bold text-gray-600">
          ค่าเช่า: <span className="text-gray-900 font-extrabold">{moneyTHB(roomPrice)}</span>
        </div>
      </div>

      {/* ========== OCCUPIED = Contract Details ========== */}
      {hasContract ? (
        <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-blue-100/70">
            <div className="text-xl font-extrabold text-gray-900">รายละเอียดสัญญา</div>
            <StatusPill status="OCCUPIED" />
          </div>

          <div className="p-6 space-y-6">
            {/* ข้อมูลสัญญา */}
            <div className="rounded-xl border border-gray-100 p-5">
              <div className="text-lg font-extrabold text-gray-900 mb-4">ข้อมูลสัญญา</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">วันที่เข้าพัก</div>
                  <div className="text-base font-extrabold text-gray-900">{formatDate(cd!.contract?.moveInDate)}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">วันที่ออก</div>
                  <div className="text-base font-extrabold text-gray-900">{formatDate(cd!.contract?.moveOutDate)}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">ค่าเช่าต่อเดือน</div>
                  <div className="text-base font-extrabold text-blue-700">{moneyTHB(cd!.contract?.monthlyRent)}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">เงินประกัน</div>
                  <div className="text-base font-extrabold text-gray-900">{moneyTHB(cd!.contract?.securityDeposit)}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">ชำระประกันโดย</div>
                  <div className="text-base font-extrabold text-gray-900">{depositPaidByLabel(cd!.contract?.depositPaidBy)}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">เงินจอง</div>
                  <div className="text-base font-extrabold text-gray-900">{moneyTHB(cd!.contract?.bookingFeeApplied)}</div>
                </div>
              </div>
            </div>

            {/* ข้อมูลผู้เช่า */}
            <div className="rounded-xl border border-gray-100 p-5">
              <div className="text-lg font-extrabold text-gray-900 mb-4">ข้อมูลผู้เช่า</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">ชื่อ-สกุล</div>
                  <div className="text-base font-extrabold text-gray-900">{cd!.tenant?.name || "-"}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">เบอร์ติดต่อ</div>
                  <div className="text-base font-extrabold text-gray-900">{cd!.tenant?.phone || "-"}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">เลขบัตรประชาชน</div>
                  <div className="text-base font-extrabold text-gray-900">{cd!.tenant?.idNumber || "-"}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs font-bold text-gray-500 mb-1">ที่อยู่</div>
                <div className="text-base font-extrabold text-gray-900">{cd!.tenant?.address || "-"}</div>
              </div>
            </div>

            {/* บุคคลติดต่อฉุกเฉิน */}
            {(cd!.emergencyContacts?.length ?? 0) > 0 && (
              <div className="rounded-xl border border-gray-100 p-5">
                <div className="text-lg font-extrabold text-gray-900 mb-4">บุคคลติดต่อฉุกเฉิน</div>
                {cd!.emergencyContacts!.map((ec, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-xs font-bold text-gray-500 mb-1">ชื่อ</div>
                      <div className="text-base font-extrabold text-gray-900">{ec.name}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-500 mb-1">ความสัมพันธ์</div>
                      <div className="text-base font-extrabold text-gray-900">{ec.relationship}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-500 mb-1">เบอร์ติดต่อ</div>
                      <div className="text-base font-extrabold text-rose-700">{ec.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ยุติสัญญา button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleTerminate}
                disabled={terminating}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-6 py-3 text-sm font-extrabold text-rose-700 hover:bg-rose-100 active:scale-[0.98] transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {terminating ? "กำลังยุติ..." : "ยุติสัญญา"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========== VACANT = Action Cards ========== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contract flow */}
          <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-[#F3F7FF] border-b border-blue-100/70">
              <div className="text-lg font-extrabold text-gray-900 text-center">ทำสัญญา (รายเดือน)</div>
            </div>

            <div className="p-6">
              <div className="text-sm font-bold text-gray-500 mb-5">
                ไปตั้งค่าสัญญา + ค่าเช่าล่วงหน้า + มิเตอร์น้ำไฟ
              </div>

              <button
                type="button"
                className={btnPrimary + " w-full"}
                onClick={() => nav(`/owner/rooms/${roomId}/monthly`)}
              >
                เปิดขั้นตอนทำสัญญา
              </button>

              <button
                type="button"
                className={btnPrimary + " w-full mt-3 !bg-blue-100 !text-blue-700 hover:!bg-blue-200 shadow-none"}
                onClick={() => nav(`/owner/rooms/${roomId}/advance-payment`)}
              >
                ไปขั้นตอนค่าเช่าล่วงหน้า
              </button>
            </div>
          </div>

          {/* Meter */}
          <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-[#F3F7FF] border-b border-blue-100/70">
              <div className="text-lg font-extrabold text-gray-900 text-center">มิเตอร์น้ำ-ไฟ</div>
            </div>

            <div className="p-6">
              <div className="text-sm font-bold text-gray-500 mb-5">
                ตั้งเลขมิเตอร์ + บันทึกหน่วยเดือนปัจจุบัน (เชื่อม backend จริง)
              </div>

              <button
                type="button"
                className={btnPrimary + " w-full"}
                onClick={() => nav(`/owner/rooms/${roomId}/meter`)}
              >
                ไปหน้ามิเตอร์
              </button>
            </div>
          </div>

          {/* Access code */}
          <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-[#F3F7FF] border-b border-blue-100/70">
              <div className="text-lg font-extrabold text-gray-900 text-center">รหัสเข้าสู่ระบบ</div>
            </div>

            <div className="p-6">
              <div className="text-sm font-bold text-gray-500 mb-5">
                สร้าง/ปิด/ลบรหัสให้ผู้เช่าเข้าระบบ (เชื่อม backend จริง)
              </div>

              <button
                type="button"
                className={btnPrimary + " w-full"}
                onClick={() => nav(`/owner/rooms/${roomId}/access-code`)}
              >
                ไปหน้ารหัส
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerShell>

    <PopupModal {...popup} onClose={() => setPopup(defaultPopup)} />
  </>);
}