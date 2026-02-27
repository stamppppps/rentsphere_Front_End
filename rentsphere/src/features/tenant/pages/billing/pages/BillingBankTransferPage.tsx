import { Camera, Check, ChevronLeft, Copy, Image as ImageIcon, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type BankAccount = {
    id: string;
    bankName: string;
    bankShort: string;
    accountName: string;
    accountNo: string;
    promptPayOrQrUrl: string; // (ยังเก็บไว้ได้ เผื่ออนาคต) แต่หน้านี้ไม่ใช้แล้ว
};

function formatNumber(n: number) {
    return n.toLocaleString("th-TH");
}

function maskAccountNo(raw: string) {
    const acc = (raw || "").replace(/\s|-/g, "");
    if (acc.length <= 4) return acc;

    // อ่านง่าย: XXX-X-XXXXX-XXXX
    const a = acc.slice(0, 3);
    const b = acc.slice(3, 4);
    const c = acc.slice(4, 9);
    const d = acc.slice(9, 13);
    return [a, b, c, d].filter(Boolean).join("-");
}

function cx(...cls: Array<string | false | undefined | null>) {
    return cls.filter(Boolean).join(" ");
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cx(
                "bg-white border border-blue-100/60 shadow-[0_14px_40px_rgba(15,23,42,0.08)]",
                "rounded-[18px] overflow-hidden",
                className
            )}
        >
            {children}
        </div>
    );
}

function Chip({ children }: { children: React.ReactNode }) {
    return (
        <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black">
            {children}
        </span>
    );
}

export default function BillingBankTransferPage() {
    const nav = useNavigate();
    const { billId } = useParams();
    const location = useLocation() as any;

    // ===== mock total =====
    const total = location?.state?.total ?? 4200;

    // ===== mock accounts =====
    const accounts: BankAccount[] = useMemo(
        () => [
            {
                id: "kbank-1",
                bankName: "ธนาคารกสิกรไทย",
                bankShort: "KBANK",
                accountName: "บริษัท เอบีซี ดอร์มทอรี่ จำกัด",
                accountNo: "1234567890",
                promptPayOrQrUrl: "https://dummyimage.com/420x420/ffffff/111111.png&text=QR",
            },
            {
                id: "scb-1",
                bankName: "ธนาคารไทยพาณิชย์",
                bankShort: "SCB",
                accountName: "บริษัท เอบีซี ดอร์มทอรี่ จำกัด",
                accountNo: "9876543210",
                promptPayOrQrUrl: "https://dummyimage.com/420x420/ffffff/111111.png&text=QR",
            },
        ],
        []
    );

    const [mounted, setMounted] = useState(false);

    const [selectedId, setSelectedId] = useState<string>("");
    const selected = useMemo(() => accounts.find((a) => a.id === selectedId) ?? accounts[0] ?? null, [accounts, selectedId]);

    useEffect(() => {
        if (!selectedId && accounts.length > 0) setSelectedId(accounts[0].id);
    }, [accounts, selectedId]);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 10);
        return () => clearTimeout(t);
    }, []);

    // ===== copy =====
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState<string | null>(null);

    useEffect(() => {
        setCopied(false);
        setCopyError(null);
    }, [selectedId]);

    const copyAccount = async () => {
        if (!selected?.accountNo) return;

        setCopyError(null);
        try {
            await navigator.clipboard.writeText(selected.accountNo);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            setCopyError("คัดลอกไม่สำเร็จ (ลองกดค้างเพื่อคัดลอกแทน)");
            setTimeout(() => setCopyError(null), 1600);
        }
    };

    // ===== slip upload (camera/gallery) =====
    const cameraInputRef = useRef<HTMLInputElement | null>(null);
    const galleryInputRef = useRef<HTMLInputElement | null>(null);

    const [slipFile, setSlipFile] = useState<File | null>(null);
    const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    useEffect(() => {
        if (!slipFile) {
            setSlipPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(slipFile);
        setSlipPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [slipFile]);

    const onPickFile = (file?: File | null) => {
        setFileError(null);
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setFileError("รองรับเฉพาะไฟล์รูปภาพเท่านั้น");
            return;
        }

        const max = 8 * 1024 * 1024;
        if (file.size > max) {
            setFileError("ไฟล์ใหญ่เกินไป (สูงสุด 8MB) กรุณาเลือกรูปใหม่");
            return;
        }

        setSlipFile(file);
    };

    const clearSlip = () => {
        setSlipFile(null);
        setFileError(null);
        if (cameraInputRef.current) cameraInputRef.current.value = "";
        if (galleryInputRef.current) galleryInputRef.current.value = "";
    };

    const onSubmitSlip = async () => {
        if (!slipFile || !selected) return;

        // TODO: upload จริงค่อยใส่
        // await uploadSlip(...)

        nav(`/tenant/billing/${billId}/pay/success`, {
            replace: true,
            state: {
                total,
                methodText: "โอนผ่านธนาคาร",
                paymentAtText: new Date().toLocaleString("th-TH", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }).replace(",", " |"),
                statusText: "รอตรวจสอบ",
            },
        });
    };

    if (!selected) {
        return (
            <div className="min-h-screen bg-[#F8FAFF]">
                <div className="px-6 pt-10 text-slate-500 font-bold">กำลังโหลดข้อมูลบัญชี…</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFF] pb-28">
            <style>{`
        @keyframes shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(260%); } }
        @keyframes pop { 0% { transform: translateY(6px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      `}</style>

            {/* ===== Top Bar ===== */}
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

                            <div className="text-2xl font-black text-slate-900">บิล / การชำระเงิน</div>
                            <div className="absolute right-0 w-10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6">
                {/* ===== Page Title ===== */}
                <div className={cx("mt-3", mounted ? "opacity-100" : "opacity-0")} style={{ animation: mounted ? "pop .26s ease-out both" : undefined }}>
                    <div className="text-[28px] font-black text-slate-900 leading-tight">โอนผ่านธนาคาร</div>
                    <div className="mt-1 text-sm font-bold text-slate-500">
                        เลือกบัญชีปลายทาง แล้วโอนเงินตามยอด จากนั้นแนบสลิปเพื่อให้เจ้าหน้าที่ตรวจสอบ
                    </div>
                </div>

                {/* ===== Select Bank (dropdown native) ===== */}
                <div className="mt-5" style={{ animation: mounted ? "pop .26s ease-out .06s both" : undefined }}>
                    <div className="text-sm font-black text-slate-800 mb-2">เลือกธนาคาร / บัญชีปลายทาง</div>

                    <Card className="p-4">
                        {/* ✅ relative เฉพาะกล่อง select */}
                        <div className="relative">
                            <select
                                value={selectedId}
                                onChange={(e) => setSelectedId(e.target.value)}
                                className={cx(
                                    "w-full h-[52px]",
                                    "px-4 pr-12",
                                    "rounded-[18px]",
                                    "bg-white",
                                    "border border-blue-200/70",
                                    "shadow-[0_10px_18px_rgba(15,23,42,0.06)]",
                                    "text-[18px] font-black text-slate-900",
                                    "leading-none",
                                    "appearance-none",
                                    "focus:outline-none focus:ring-2 focus:ring-blue-200/60"
                                )}
                            >
                                {accounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.bankName} •••• {a.accountNo.slice(-4)}
                                    </option>
                                ))}
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path
                                        d="M7 10l5 5 5-5"
                                        stroke="currentColor"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                            <Chip>{selected.bankShort}</Chip>
                            <div className="text-xs font-bold text-slate-500 line-clamp-1">
                                {selected.accountName} • {maskAccountNo(selected.accountNo)}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ===== Account Details Card (NO QR) ===== */}
                <div className="mt-4" style={{ animation: mounted ? "pop .26s ease-out .10s both" : undefined }}>
                    <Card>
                        <div className="p-5 relative">
                            {/* subtle bg */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.10]">
                                <div className="h-full w-full bg-gradient-to-br from-blue-300 via-indigo-200 to-transparent" />
                            </div>

                            <div className="relative flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="text-[18px] font-black text-slate-900 truncate">{selected.bankName}</div>
                                        <Chip>{selected.bankShort}</Chip>
                                    </div>

                                    <div className="mt-2 text-sm font-bold text-slate-600">
                                        ชื่อบัญชี: <span className="font-black text-slate-800">{selected.accountName}</span>
                                    </div>

                                    <div className="mt-1 text-sm font-bold text-slate-600">
                                        เลขบัญชี: <span className="font-black text-slate-900">{maskAccountNo(selected.accountNo)}</span>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <div className="text-xs font-bold text-slate-500">ยอดที่ต้องชำระ</div>
                                    <div className="text-[18px] font-black text-slate-900">{formatNumber(total)} THB</div>
                                </div>
                            </div>

                            {/* Copy button */}
                            <button
                                type="button"
                                onClick={copyAccount}
                                className={cx(
                                    "relative mt-4 w-full h-[56px] rounded-[16px]",
                                    "bg-[#EEF3FF] border border-blue-100/70",
                                    "shadow-[0_12px_22px_rgba(15,23,42,0.06)]",
                                    "flex items-center justify-between px-4",
                                    "active:scale-[0.99] transition"
                                )}
                            >
                                <div className="text-[20px] font-black text-slate-900">{maskAccountNo(selected.accountNo)}</div>
                                <div className="inline-flex items-center gap-2 text-[#2F6BFF] font-black">
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? "คัดลอกแล้ว" : "คัดลอก"}
                                </div>
                            </button>

                            {copyError && <div className="mt-2 text-xs font-black text-rose-600">{copyError}</div>}

                            <div className="mt-3 text-xs font-bold text-slate-500">
                                * หลังโอนเสร็จ กรุณาแนบสลิปเพื่อให้ระบบส่งตรวจสอบ
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ===== Upload Slip ===== */}
                <div className="mt-5" style={{ animation: mounted ? "pop .26s ease-out .14s both" : undefined }}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[18px] font-black text-slate-900">แนบสลิปการชำระเงิน</div>
                        {slipFile && (
                            <button type="button" onClick={clearSlip} className="inline-flex items-center gap-2 text-rose-600 font-black text-sm active:scale-95 transition">
                                <Trash2 size={16} /> ลบรูป
                            </button>
                        )}
                    </div>

                    <Card>
                        <div className="p-4">
                            <div className="text-sm font-bold text-slate-500 mb-4">แนะนำให้เห็น “ชื่อบัญชี/เลขบัญชี/ยอดเงิน/วันเวลา” ชัดเจน</div>

                            {/* hidden inputs */}
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={(e) => onPickFile(e.target.files?.[0])}
                            />
                            <input
                                ref={galleryInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onPickFile(e.target.files?.[0])}
                            />

                            {/* buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => cameraInputRef.current?.click()}
                                    className={cx(
                                        "h-[56px] rounded-[16px]",
                                        "bg-white border border-blue-100/70",
                                        "text-slate-900 font-black",
                                        "shadow-[0_12px_22px_rgba(15,23,42,0.06)]",
                                        "active:scale-[0.98] transition flex items-center justify-center gap-2"
                                    )}
                                >
                                    <Camera size={18} className="text-[#2F6BFF]" />
                                    ถ่ายรูป
                                </button>

                                <button
                                    type="button"
                                    onClick={() => galleryInputRef.current?.click()}
                                    className={cx(
                                        "h-[56px] rounded-[16px]",
                                        "bg-[#2F6BFF] text-white font-black",
                                        "shadow-[0_16px_28px_rgba(47,107,255,0.26)]",
                                        "active:scale-[0.98] transition relative overflow-hidden",
                                        "flex items-center justify-center gap-2"
                                    )}
                                >
                                    <span className="absolute inset-0 opacity-30 pointer-events-none">
                                        <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.6s_infinite]" />
                                    </span>
                                    <ImageIcon size={18} />
                                    อัปโหลดสลิป
                                </button>
                            </div>

                            {fileError && <div className="mt-3 text-xs font-black text-rose-600">{fileError}</div>}

                            {/* preview */}
                            <div className="mt-4">
                                {!slipPreviewUrl ? (
                                    <div className="rounded-[16px] border border-dashed border-blue-200 bg-[#F6FAFF] p-5 text-center">
                                        <div className="text-sm font-black text-slate-800">ยังไม่ได้เลือกรูป</div>
                                        <div className="mt-1 text-xs font-bold text-slate-500">กด “ถ่ายรูป” หรือ “อัปโหลดสลิป” เพื่อแนบหลักฐานการโอน</div>
                                    </div>
                                ) : (
                                    <div className="rounded-[16px] border border-blue-100/70 bg-white overflow-hidden shadow-[0_12px_22px_rgba(15,23,42,0.06)]">
                                        <div className="p-3 flex items-center justify-between">
                                            <div className="min-w-0">
                                                <div className="text-sm font-black text-slate-900 truncate">{slipFile?.name}</div>
                                                <div className="text-xs font-bold text-slate-500">
                                                    {(slipFile?.size ?? 0) > 0 ? `${Math.round((slipFile!.size / 1024) * 10) / 10} KB` : ""}
                                                </div>
                                            </div>
                                            <span
                                                className="
                                                inline-flex items-center gap-1.5
                                                px-3 py-1.5
                                                rounded-full
                                                text-[12px] font-black
                                                text-emerald-700
                                                bg-gradient-to-r from-emerald-50 to-emerald-100
                                                border border-emerald-200/70
                                                shadow-[0_6px_14px_rgba(16,185,129,0.18)]
                                                whitespace-nowrap
                                                "
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                    <path
                                                        d="M20 6L9 17l-5-5"
                                                        stroke="currentColor"
                                                        strokeWidth="2.4"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                พร้อมส่ง
                                            </span>
                                        </div>

                                        <div className="bg-[#F6FAFF]">
                                            <img src={slipPreviewUrl} alt="Slip preview" className="w-full h-[260px] object-contain" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* submit */}
                            <button
                                type="button"
                                disabled={!slipFile}
                                onClick={onSubmitSlip}
                                className={cx(
                                    "mt-4 w-full h-[58px] rounded-[16px] font-black text-lg transition",
                                    slipFile
                                        ? "bg-[#2F6BFF] text-white shadow-[0_18px_32px_rgba(47,107,255,0.28)] active:scale-[0.98]"
                                        : "bg-[#E5E7EB] text-gray-400 cursor-not-allowed shadow-none"
                                )}
                            >
                                ส่งสลิปเพื่อให้ตรวจสอบ
                            </button>

                            <div className="mt-3 text-[11px] font-bold text-slate-500 leading-relaxed">
                                เมื่อส่งแล้ว สถานะบิลจะเป็น “รอตรวจสอบ” (ในระบบจริง) และจะแจ้งเตือนเมื่ออนุมัติ
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}