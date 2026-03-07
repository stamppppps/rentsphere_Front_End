import OwnerShell from "@/features/owner/components/OwnerShell";
import { api } from "@/shared/api/http";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
      alert(e?.message ?? "สร้างรหัสไม่สำเร็จ");
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

  return (
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

          {/* share buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={sendViaLine}
              className="inline-flex items-center gap-2 rounded-xl bg-[#06C755] px-6 py-3 font-extrabold text-white hover:bg-[#05b34d] shadow-[0_8px_20px_rgba(6,199,85,0.2)]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              ส่งทาง LINE
            </button>

            <button
              type="button"
              onClick={() => {
                if (!code) return;
                const smsBody = `รหัสเข้าสู่ระบบ RentSphere: ${code} (ห้อง ${roomNo})`;
                window.open(`sms:?body=${encodeURIComponent(smsBody)}`, "_self");
              }}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-600 px-6 py-3 font-extrabold text-blue-600 hover:bg-blue-50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              ส่งทาง SMS
            </button>
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
  );
}