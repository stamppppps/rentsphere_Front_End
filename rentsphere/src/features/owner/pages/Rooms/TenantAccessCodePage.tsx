import OwnerShell from "@/features/owner/components/OwnerShell";
import { api } from "@/shared/api/http";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PopupModal, { type PopupState, defaultPopup } from "@/shared/components/PopupModal";

/* ===== API helpers ===== */
async function fetchRoomMini(roomId: string) {
  const data = await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}`);
  const room = data?.room ?? data;
  const condo = data?.condo ?? room?.condo ?? null;

  return {
    condoName: String(condo?.nameTh ?? condo?.nameEn ?? room?.condoName ?? "คอนโดมิเนียม"),
    roomNo: String(room?.roomNo ?? "—"),
  };
}

async function createCode(roomId: string, expiresInDays?: number | null) {
  const body: any = {};
  if (expiresInDays != null && Number.isFinite(expiresInDays)) body.expiresInDays = expiresInDays;

  const data = await api<any>(`/owner/rooms/${encodeURIComponent(roomId)}/access-codes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const item = data?.item ?? data;
  return {
    id: String(item?.id ?? ""),
    code: String(item?.code ?? ""),
    status: String(item?.status ?? "ACTIVE"),
    expiresAt: item?.expiresAt ? String(item.expiresAt) : null,
  };
}

/* ===== Stepper ===== */
function Stepper({ step }: { step: 1 | 2 }) {
  const items = [
    { n: 1, label: "สรุปรายละเอียด" },
    { n: 2, label: "สร้างรหัสเข้าพัก" },
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
                "w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm",
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
            {idx !== items.length - 1 ? <div className="w-24 h-[3px] rounded-full bg-blue-100" /> : null}
          </div>
        );
      })}
    </div>
  );
}

export default function TenantAccessCodePage() {
  const nav = useNavigate();
  const { roomId } = useParams();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [condoName, setCondoName] = useState("คอนโดมิเนียม");
  const [roomNo, setRoomNo] = useState("—");

  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [popup, setPopup] = useState<PopupState>(defaultPopup);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!roomId) {
        setError("ไม่พบ roomId");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const mini = await fetchRoomMini(roomId);
        if (cancelled) return;
        setCondoName(mini.condoName);
        setRoomNo(mini.roomNo);

        // auto-generate code on load
        setGenerating(true);
        const created = await createCode(roomId, 30);
        if (cancelled) return;
        setCode(created.code);
        setGenerating(false);
        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "เกิดข้อผิดพลาด");
        setLoading(false);
        setGenerating(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const regenerate = async () => {
    if (!roomId || generating) return;
    try {
      setGenerating(true);
      setCopied(false);
      const created = await createCode(roomId, 30);
      setCode(created.code);
    } catch (e: any) {
      setPopup({ open: true, type: "error", message: e?.message ?? "สร้างรหัสไม่สำเร็จ", title: "ผิดพลาด" });
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sendViaLine = () => {
    if (!code) return;
    const text = `รหัสเข้าสู่ระบบ RentSphere\nรหัส: ${code}\nห้อง: ${roomNo}\n\nใช้รหัสนี้เพื่อเข้าสู่ระบบหลังจาก Login ด้วย LINE`;
    const url = `https://line.me/R/share?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
          <div className="text-sm font-extrabold text-gray-600">
            {generating ? "กำลังสร้างรหัสเข้าพัก..." : "กำลังโหลดข้อมูล..."}
          </div>
        </div>
      </OwnerShell>
    );
  }

  if (!roomId || (error && !code)) {
    return (
      <OwnerShell activeKey="rooms" showSidebar>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-8">
          <div className="text-xl font-extrabold text-gray-900 mb-2">ไม่พบข้อมูล</div>
          {error && <div className="text-rose-600 font-extrabold mb-6">{error}</div>}
          <button type="button" onClick={() => nav("/owner/rooms")} className="px-5 py-3 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700">
            กลับไปหน้าห้อง
          </button>
        </div>
      </OwnerShell>
    );
  }

  const codeChars = (code ?? "").split("");

  return (<>
    <OwnerShell activeKey="rooms" showSidebar>
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-gray-600">
          คอนโดมิเนียม : <span className="text-gray-900">{condoName}</span>
        </div>
        <div className="text-sm font-extrabold text-gray-700">ห้อง {roomNo}</div>
      </div>

      <div className="rounded-2xl border border-blue-100/70 bg-white overflow-hidden shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        {/* stepper */}
        <div className="bg-[#EAF2FF] border-b border-blue-100/70 px-6 py-4">
          <Stepper step={2} />
        </div>

        <div className="p-8">
          {/* title */}
          <div className="text-center mb-6">
            <div className="text-2xl font-extrabold text-gray-900">สร้างรหัสเข้าพักสำเร็จ</div>
            <div className="text-sm font-bold text-gray-500 mt-1">Tenant Access Code Generated</div>
          </div>

          {/* tenant + room badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 border border-gray-200 px-5 py-2.5">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-extrabold text-gray-800">ห้อง {roomNo}</span>
            </div>
          </div>

          {/* code display */}
          <div className="max-w-lg mx-auto rounded-2xl border-2 border-blue-100 bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="text-center text-xs font-extrabold text-gray-500 tracking-[0.2em] uppercase mb-4">
              LOGIN CODE
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center justify-center gap-3">
                {codeChars.map((ch, i) => (
                  <span
                    key={i}
                    className="text-5xl font-extrabold text-blue-600 tracking-widest"
                    style={{ fontFamily: "'Inter', 'Roboto Mono', monospace" }}
                  >
                    {ch}
                  </span>
                ))}
              </div>

              {/* refresh btn */}
              <button
                type="button"
                onClick={regenerate}
                disabled={generating}
                className="ml-3 w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                title="สร้างรหัสใหม่"
              >
                <svg className={`w-5 h-5 text-gray-600 ${generating ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* copy button */}
            <div className="flex justify-center mt-5">
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-extrabold text-gray-800 hover:bg-gray-50 transition-all"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    คัดลอกแล้ว!
                  </>
                ) : (
                  "คัดลอกโค้ด"
                )}
              </button>
            </div>

            <div className="text-center text-xs font-bold text-gray-500 mt-4 leading-5">
              ใช้รหัสนี้สำหรับให้ผู้เช่าเข้าสู่ระบบครั้งแรก และระบุว่าผู้เช่าอยู่ห้องไหน (ลูกบ้านห้อง {roomNo})
            </div>
          </div>

          {/* bottom buttons */}
          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => nav(`/owner/rooms/${roomId}`)}
              className="text-gray-600 font-extrabold hover:text-gray-900"
            >
              ← ย้อนกลับ
            </button>

            <button
              type="button"
              onClick={() => nav(`/owner/rooms/${roomId}`)}
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 shadow-[0_12px_22px_rgba(37,99,235,0.22)]"
            >
              เสร็จสิ้นและบันทึก
            </button>
          </div>
        </div>
      </div>
    </OwnerShell>

    <PopupModal {...popup} onClose={() => setPopup(defaultPopup)} />
  </>);
}