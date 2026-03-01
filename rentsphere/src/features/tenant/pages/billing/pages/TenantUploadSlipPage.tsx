import {
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    CloudUpload,
    FileText,
    Image as ImageIcon,
    RefreshCw,
    X,
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type LocationState = {
    billTitle?: string;
    amountDue?: number;
    detailPath?: string;
};

type FileKind = "image" | "pdf" | "unknown";

function cx(...cls: Array<string | false | undefined | null>) {
    return cls.filter(Boolean).join(" ");
}

function getFileKind(file: File): FileKind {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    return "unknown";
}

function formatBytes(bytes: number) {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
    }
    return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatNumber(n: number) {
    return n.toLocaleString("th-TH");
}

function parseAmountToNumber(amount: string) {
    const v = Number(amount);
    return Number.isFinite(v) ? v : 0;
}

export default function TenantUploadSlipPage() {
    const nav = useNavigate();
    const { billId = "" } = useParams<{ billId: string }>();
    const location = useLocation();
    const locState = (location.state || {}) as LocationState;

    const TAB_BAR_H = 96;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const previewUrlRef = useRef<string>("");

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    const [transferDate, setTransferDate] = useState<string>("");
    const [transferTime, setTransferTime] = useState<string>("");
    const [amount, setAmount] = useState<string>(locState.amountDue ? String(locState.amountDue) : "");
    const [note, setNote] = useState<string>("");

    const [dragOver, setDragOver] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fileKind = useMemo(() => (file ? getFileKind(file) : "unknown"), [file]);

    const cleanupPreview = () => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = "";
        }
        setPreviewUrl("");
    };

    React.useEffect(() => {
        return () => {
            if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = "";
        };
    }, []);

    const setNewFile = (f: File | null) => {
        cleanupPreview();
        setFile(f);

        if (f && getFileKind(f) === "image") {
            const url = URL.createObjectURL(f);
            previewUrlRef.current = url;
            setPreviewUrl(url);
        }

        if (!f && inputRef.current) inputRef.current.value = "";
    };

    const onPickClick = () => inputRef.current?.click();

    const onFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const f = files[0];

        const ok = f.type.startsWith("image/") || f.type === "application/pdf";
        if (!ok) {
            alert("รองรับเฉพาะไฟล์รูปภาพ (JPG/PNG) หรือ PDF เท่านั้น");
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            alert("ไฟล์ใหญ่เกินไป (จำกัด 10MB)");
            return;
        }

        setNewFile(f);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        onFiles(e.dataTransfer.files);
    };

    const amountNumber = useMemo(() => parseAmountToNumber(amount), [amount]);
    const amountOk = amountNumber > 0;

    const canSubmit = !!file && amountOk && !submitting;

    const onSubmit = async () => {
        if (!file || !canSubmit) return;

        try {
            setSubmitting(true);

            const form = new FormData();
            form.append("billId", billId);
            form.append("slip", file);
            form.append("transferDate", transferDate);
            form.append("transferTime", transferTime);
            form.append("amount", String(amountNumber));
            form.append("note", note);

            // TODO: ต่อ backend จริง
            // const res = await fetch(`/api/bills/${billId}/slip`, {
            //   method: "POST",
            //   body: form,
            //   credentials: "include",
            // });
            // if (!res.ok) throw new Error("upload failed");

            await new Promise((r) => setTimeout(r, 700));

            const paymentAtText = new Date()
                .toLocaleString("th-TH", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })
                .replace(",", " |");

            nav(`/tenant/billing/${billId}/pay/success`, {
                replace: true,
                state: {
                    total: amountNumber,
                    methodText: "โอนผ่านธนาคาร",
                    paymentAtText,
                    statusText: "รอตรวจสอบ",
                },
            });
        } catch (e) {
            console.error(e);
            alert("อัปโหลดไม่สำเร็จ ลองใหม่อีกครั้ง");
            setSubmitting(false);
        }
    };

    const billTitle = locState.billTitle ?? (billId ? `ใบแจ้งหนี้ #${billId}` : "ใบแจ้งหนี้");

    return (
        <div className="min-h-screen bg-[#F6F8FF]">
            <style>{`
        @keyframes shimmer { 0% { transform: translateX(-120%);} 100% { transform: translateX(260%);} }
        @keyframes pop { 0% { transform: translateY(10px); opacity: 0;} 100% { transform: translateY(0); opacity: 1;} }
      `}</style>

            {/* glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-[#2F6BFF]/10 blur-3xl" />
                <div className="absolute -bottom-24 right-0 w-[360px] h-[360px] rounded-full bg-indigo-400/10 blur-3xl" />
            </div>

            {/* Top bar */}
            <div className="sticky top-0 z-40">
                <div className="bg-[#F6F8FF]/85 backdrop-blur supports-[backdrop-filter]:backdrop-blur-lg border-b border-blue-100/50">
                    <div className="px-5 pt-6 pb-3">
                        <div className="relative flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => nav(-1)}
                                className="absolute left-0 p-3 rounded-2xl bg-white/80 border border-blue-100/70 shadow-sm active:scale-95 transition"
                                aria-label="Back"
                            >
                                <ChevronLeft size={22} />
                            </button>

                            <div className="text-[22px] font-black text-slate-900">อัปโหลดสลิป</div>
                            <div className="absolute right-0 w-10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 relative">
                {/* Header */}
                <div
                    className="mt-4 rounded-[24px] overflow-hidden border border-blue-100/70 bg-gradient-to-b from-[#EAF0FF] to-[#F6F8FF] shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                    style={{ animation: "pop .32s ease-out both" }}
                >
                    <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-[16px] font-black text-slate-900 truncate">{billTitle}</div>
                                <div className="mt-1 text-[12px] font-bold text-slate-600">
                                    แนบหลักฐานการชำระเงินเพื่อให้เจ้าของตรวจสอบ
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="px-3 py-1.5 rounded-full text-[11px] font-black bg-white/80 border border-blue-100/70 text-slate-700">
                                        Bill ID: {billId || "—"}
                                    </span>
                                    {typeof locState.amountDue === "number" && (
                                        <span className="px-3 py-1.5 rounded-full text-[11px] font-black bg-white/80 border border-blue-100/70 text-slate-700">
                                            ยอดที่ต้องชำระ: {formatNumber(locState.amountDue)} บาท
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="shrink-0">
                                <div className="w-12 h-12 rounded-2xl bg-white/80 border border-blue-100/70 shadow-inner flex items-center justify-center text-[#2F6BFF]">
                                    <CloudUpload size={22} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-[18px] border border-blue-100/70 bg-white/70 p-3">
                            <div className="flex items-start gap-2 text-[12px] font-bold text-slate-600">
                                <AlertTriangle className="mt-0.5" size={16} />
                                <div className="leading-relaxed">
                                    แนะนำใช้รูปที่เห็น “ยอดเงิน + วันเวลา + เลขอ้างอิง” ชัดเจน และหลีกเลี่ยงภาพเบลอ/ตัดขอบ
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Card */}
                <div
                    className="mt-4 rounded-[26px] overflow-hidden border border-blue-100/70 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.10)]"
                    style={{ animation: "pop .32s ease-out .06s both" }}
                >
                    <div className="p-4 border-b border-blue-100/60">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-[14px] font-black text-slate-900">ไฟล์สลิป</div>
                                <div className="text-[12px] font-bold text-slate-500 mt-1">รองรับ JPG/PNG/PDF • ไม่เกิน 10MB</div>
                            </div>

                            {file && (
                                <button
                                    type="button"
                                    onClick={() => inputRef.current?.click()}
                                    className="h-10 px-4 rounded-2xl bg-[#F6F8FF] border border-blue-100/70 shadow-inner text-[12px] font-black text-slate-700 active:scale-[0.98] transition"
                                >
                                    เปลี่ยนไฟล์
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-4">
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => onFiles(e.target.files)}
                        />

                        <div
                            onClick={onPickClick}
                            onDragEnter={() => setDragOver(true)}
                            onDragLeave={() => setDragOver(false)}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver(true);
                            }}
                            onDrop={onDrop}
                            className={cx(
                                "relative rounded-[22px] border-2 border-dashed p-5 cursor-pointer transition",
                                dragOver ? "border-[#2F6BFF] bg-[#EEF3FF]" : "border-blue-100/80 bg-[#F8FAFF]"
                            )}
                        >
                            {dragOver && <div className="absolute inset-0 rounded-[22px] bg-[#2F6BFF]/10 pointer-events-none" />}

                            {!file && (
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-blue-100/70 shadow-inner flex items-center justify-center text-[#2F6BFF]">
                                        <CloudUpload size={26} />
                                    </div>
                                    <div className="text-[14px] font-black text-slate-900">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง</div>
                                    <div className="text-[12px] font-bold text-slate-500">รูปภาพจะแสดงตัวอย่าง • PDF จะแสดงเป็นไฟล์</div>
                                </div>
                            )}

                            {!!file && (
                                <div className="flex items-start gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-blue-100/70 shadow-inner flex items-center justify-center text-[#2F6BFF] shrink-0">
                                        {fileKind === "image" ? <ImageIcon size={24} /> : <FileText size={24} />}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="text-[14px] font-black text-slate-900 truncate">{file.name}</div>
                                                <div className="text-[12px] font-bold text-slate-500 mt-1">
                                                    {file.type || "unknown"} • {formatBytes(file.size)}
                                                </div>
                                                <div className="mt-2 inline-flex items-center gap-2 text-[12px] font-black text-emerald-700">
                                                    <CheckCircle2 size={16} />
                                                    พร้อมอัปโหลด
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setNewFile(null);
                                                }}
                                                className="p-2 rounded-2xl bg-white border border-blue-100/70 shadow-sm active:scale-95 transition"
                                                aria-label="Remove"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>

                                        {fileKind === "image" && previewUrl && (
                                            <div className="mt-3 rounded-[18px] overflow-hidden border border-blue-100/70 bg-white">
                                                <img src={previewUrl} alt="slip preview" className="w-full h-auto" />
                                                <div className="px-4 py-3 text-[11px] font-bold text-slate-500 bg-[#F8FAFF] border-t border-blue-100/70">
                                                    * ถ้าภาพไม่ชัด ลองอัปโหลดใหม่อีกครั้ง (แนะนำถ่ายตรง ๆ ไม่เอียง)
                                                </div>
                                            </div>
                                        )}

                                        {fileKind === "pdf" && (
                                            <div className="mt-3 rounded-[18px] border border-blue-100/70 bg-[#F8FAFF] p-3">
                                                <div className="text-[12px] font-bold text-slate-600">
                                                    ไฟล์ PDF จะถูกส่งให้เจ้าของตรวจสอบ (ดาวน์โหลด/เปิดดูได้)
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Form */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="rounded-[22px] border border-blue-100/70 bg-white p-4 shadow-[0_10px_18px_rgba(15,23,42,0.05)]">
                                <div className="text-[12px] font-black text-slate-700">วันที่โอน (ถ้ามี)</div>
                                <input
                                    type="date"
                                    value={transferDate}
                                    onChange={(e) => setTransferDate(e.target.value)}
                                    className="mt-2 w-full h-11 rounded-2xl bg-[#F8FAFF] border border-blue-100/70 px-4 text-[14px] font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            <div className="rounded-[22px] border border-blue-100/70 bg-white p-4 shadow-[0_10px_18px_rgba(15,23,42,0.05)]">
                                <div className="text-[12px] font-black text-slate-700">เวลาโอน (ถ้ามี)</div>
                                <input
                                    type="time"
                                    value={transferTime}
                                    onChange={(e) => setTransferTime(e.target.value)}
                                    className="mt-2 w-full h-11 rounded-2xl bg-[#F8FAFF] border border-blue-100/70 px-4 text-[14px] font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            <div className="rounded-[22px] border border-blue-100/70 bg-white p-4 shadow-[0_10px_18px_rgba(15,23,42,0.05)]">
                                <div className="flex items-center justify-between">
                                    <div className="text-[12px] font-black text-slate-700">จำนวนเงิน (บาท)</div>
                                    {!amountOk && <div className="text-[11px] font-black text-rose-700">ใส่จำนวนเงินให้ถูกต้อง</div>}
                                </div>

                                <input
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                                    placeholder="เช่น 8240"
                                    className={cx(
                                        "mt-2 w-full h-11 rounded-2xl bg-[#F8FAFF] border px-4 text-[14px] font-bold text-slate-900 outline-none focus:ring-2",
                                        amountOk ? "border-blue-100/70 focus:ring-blue-200" : "border-rose-200 focus:ring-rose-200"
                                    )}
                                />

                                {typeof locState.amountDue === "number" && (
                                    <div className="mt-2 text-[11px] font-bold text-slate-500">
                                        แนะนำใส่ยอดตรงกับบิล: {formatNumber(locState.amountDue)} บาท
                                    </div>
                                )}
                            </div>

                            <div className="rounded-[22px] border border-blue-100/70 bg-white p-4 shadow-[0_10px_18px_rgba(15,23,42,0.05)] md:col-span-2">
                                <div className="text-[12px] font-black text-slate-700">หมายเหตุ (ถ้ามี)</div>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="เช่น โอนจากบัญชี xxx เวลาใกล้เคียง…"
                                    className="mt-2 w-full min-h-[96px] rounded-2xl bg-[#F8FAFF] border border-blue-100/70 p-4 text-[14px] font-bold text-slate-900 outline-none resize-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="fixed left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] px-5"
                    style={{ bottom: `calc(${TAB_BAR_H}px + env(safe-area-inset-bottom))` }}
                >
                    <div className="bg-[#F6F8FF]/85 backdrop-blur supports-[backdrop-filter]:backdrop-blur-lg border border-blue-100/60 rounded-[24px] shadow-[0_18px_60px_rgba(15,23,42,0.10)]">
                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => nav(-1)}
                                    className="h-[56px] rounded-2xl font-black text-[16px] bg-white/85 border border-blue-100/70 shadow-[0_14px_26px_rgba(15,23,42,0.07)] active:scale-[0.98] transition"
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    type="button"
                                    disabled={!canSubmit}
                                    onClick={onSubmit}
                                    className={cx(
                                        "relative h-[56px] rounded-2xl font-black text-[16px] text-white overflow-hidden",
                                        "bg-[#2F6BFF] shadow-[0_16px_28px_rgba(47,107,255,0.26)] active:scale-[0.98] transition",
                                        !canSubmit && "opacity-50 cursor-not-allowed active:scale-100"
                                    )}
                                >
                                    {submitting && (
                                        <span className="pointer-events-none absolute inset-0 opacity-35">
                                            <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.6s_infinite]" />
                                        </span>
                                    )}
                                    <span className="relative inline-flex items-center justify-center gap-2">
                                        {submitting ? (
                                            <>
                                                <RefreshCw className="animate-spin" size={18} />
                                                กำลังอัปโหลด...
                                            </>
                                        ) : (
                                            <>
                                                <CloudUpload size={18} />
                                                อัปโหลดสลิป
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>

                            <div className="mt-2 text-[11px] font-bold text-slate-500 px-1">
                                * หลังต่อ backend: จะส่ง multipart/form-data ไปที่ API แล้วบันทึกไฟล์ + meta ลง database
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ height: `calc(${TAB_BAR_H}px + 160px + env(safe-area-inset-bottom))` }} />
            </div>
        </div>
    );
}