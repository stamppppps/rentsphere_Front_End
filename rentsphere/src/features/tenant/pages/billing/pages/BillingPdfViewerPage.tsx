import { ChevronLeft, Download, FileText, Minus, Plus, Share2 } from "lucide-react";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useLocation, useNavigate, useParams } from "react-router-dom";
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

function cx(...cls: Array<string | false | undefined | null>) {
    return cls.filter(Boolean).join(" ");
}

type ViewerState = "loading" | "ready" | "empty" | "error";
type LocationState = { title?: string };

type MockBill = {
    billId: string;
    monthText: string;
    dueDateText: string;
    roomNo: string;
    tenantName: string;
    total: number;
    pdfBase64?: string;
};

const MOCK_BILLS: Record<string, MockBill> = {
    "1025": {
        billId: "1025",
        monthText: "รอบเดือน 12-2025",
        dueDateText: "10 ธ.ค. 2025",
        roomNo: "101",
        tenantName: "วิลาวัณย์ เทียนเฮง",
        total: 8240,
        pdfBase64:
            "JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDIgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbMyAwIFJdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNjEyIDc5Ml0vUmVzb3VyY2VzPDwvRm9udDw8L0YxIDQgMCBSPj4+Pi9Db250ZW50cyA1IDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYT4+CmVuZG9iago1IDAgb2JqCjw8L0xlbmd0aCAxMTY+PnN0cmVhbQpCVAovRjEgMjQgVGYKMTAwIDcwMCBUZAooUmVudFNwaGVyZSBJbnZvaWNlICMxMDI1KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDYyIDAwMDAwIG4gCjAwMDAwMDAxMTkgMDAwMDAgbiAKMDAwMDAwMDI2NCAwMDAwMCBuIAowMDAwMDAwMzQxIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNDU0CiUlRU9G",
    },
};

async function mockGetBillFromDb(billId: string): Promise<MockBill | null> {
    await new Promise((r) => setTimeout(r, 250));
    return MOCK_BILLS[billId] ?? null;
}

/** base64 -> Blob URL (ปลอดภัยกับ react-pdf มากกว่า data/ArrayBuffer) */
function base64ToBlobUrl(base64: string) {
    // รองรับทั้ง base64 ปกติ และ base64 ที่มี prefix data:application/pdf;base64,
    const clean = base64.includes(",") ? base64.split(",").pop()! : base64;

    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const blob = new Blob([bytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
}

export default function BillingPdfViewerPage() {
    const nav = useNavigate();
    const { billId = "1025" } = useParams<{ billId: string }>();
    const location = useLocation();
    const locState = (location.state || {}) as LocationState;

    const [viewState, setViewState] = useState<ViewerState>("loading");
    const [bill, setBill] = useState<MockBill | null>(null);

    const [blobUrl, setBlobUrl] = useState<string>("");
    const blobRef = useRef<string>("");

    const [numPages, setNumPages] = useState(0);
    const [page, setPage] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [reloadKey, setReloadKey] = useState(0);

    const title = useMemo(() => locState.title ?? "รายละเอียดบิล", [locState.title]);

    const cleanupBlob = () => {
        if (blobRef.current) {
            URL.revokeObjectURL(blobRef.current);
            blobRef.current = "";
        }
        setBlobUrl("");
    };

    useEffect(() => {
        let alive = true;

        (async () => {
            setViewState("loading");
            setBill(null);
            setNumPages(0);
            setPage(1);
            cleanupBlob();

            const data = await mockGetBillFromDb(String(billId));
            if (!alive) return;

            if (!data) {
                setViewState("empty");
                return;
            }

            setBill(data);

            if (!data.pdfBase64) {
                setViewState("empty");
                return;
            }

            try {
                const url = base64ToBlobUrl(data.pdfBase64);
                blobRef.current = url;
                setBlobUrl(url);
                // รอ Document onLoadSuccess แล้วค่อย set ready
            } catch (e) {
                console.error("mock pdf decode error:", e);
                setViewState("error");
            }
        })();

        return () => {
            alive = false;
            cleanupBlob();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billId, reloadKey]);

    useEffect(() => {
        if (numPages <= 0) return;
        setPage((p) => Math.min(Math.max(1, p), numPages));
    }, [numPages]);

    const canPrev = page > 1;
    const canNext = numPages > 0 && page < numPages;

    const zoomOut = () => setScale((s) => Math.max(0.6, Number((s - 0.1).toFixed(2))));
    const zoomIn = () => setScale((s) => Math.min(2.0, Number((s + 0.1).toFixed(2))));

    const canUseActions = viewState === "ready" && !!blobUrl;

    const onDownload = () => {
        if (!blobUrl) return;
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `invoice-${billId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const onShare = async () => {
        try {
            await navigator.clipboard.writeText(`Invoice #${billId}`);
            alert("คัดลอกข้อความแล้ว");
        } catch {
            alert("แชร์ไม่ได้ในตอนนี้");
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F8FF] pb-20">
            {/* Top bar */}
            <div className="sticky top-0 z-40">
                <div className="bg-[#F6F8FF]/85 backdrop-blur border-b border-blue-100/50">
                    <div className="px-5 pt-6 pb-3">
                        <div className="relative flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => nav(-1)}
                                className="absolute left-0 p-3 rounded-2xl bg-white/80 border border-blue-100/70 shadow-sm active:scale-95 transition"
                            >
                                <ChevronLeft size={22} />
                            </button>
                            <div className="text-[22px] font-black text-slate-900">{title}</div>
                            <div className="absolute right-0 w-10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5">
                {/* Header */}
                <div className="mt-4">
                    <div className="rounded-[22px] bg-gradient-to-b from-[#EAF0FF] to-[#F6F8FF] border border-blue-100/70 shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-[22px] font-black text-slate-900 leading-tight truncate">
                                    ใบแจ้งหนี้ #{billId}
                                </div>
                                <div className="mt-1 text-[13px] font-bold text-slate-600 leading-tight">
                                    {bill ? `${bill.monthText} • กำหนดชำระ ${bill.dueDateText}` : "กำลังโหลดข้อมูลบิล…"}
                                </div>
                                {bill && (
                                    <div className="mt-2 text-[13px] font-black text-slate-900">
                                        รวม {bill.total.toLocaleString("th-TH")} บาท • ห้อง {bill.roomNo}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={onDownload}
                                    className={cx(
                                        "h-11 px-4 rounded-2xl bg-white/85 border border-blue-100/70 shadow-[0_10px_18px_rgba(15,23,42,0.06)] active:scale-[0.98] transition",
                                        !canUseActions && "opacity-50 pointer-events-none"
                                    )}
                                >
                                    <div className="flex items-center gap-2 text-slate-800">
                                        <Download size={18} />
                                        <span className="text-[13px] font-black">ดาวน์โหลด</span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={onShare}
                                    className={cx(
                                        "h-11 px-4 rounded-2xl bg-white/85 border border-blue-100/70 shadow-[0_10px_18px_rgba(15,23,42,0.06)] active:scale-[0.98] transition",
                                        viewState === "empty" && "opacity-50 pointer-events-none"
                                    )}
                                >
                                    <div className="flex items-center gap-2 text-slate-800">
                                        <Share2 size={18} />
                                        <span className="text-[13px] font-black">แชร์</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Viewer */}
                <div className="mt-4">
                    <div className="rounded-[26px] overflow-hidden border border-blue-100/70 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.10)]">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-blue-100/60 bg-white">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-11 h-11 rounded-2xl bg-[#EEF3FF] border border-blue-100/70 shadow-inner flex items-center justify-center text-[#2F6BFF] shrink-0">
                                            <FileText size={22} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[14px] font-black text-slate-900 truncate leading-tight">
                                                ใบแจ้งหนี้ (PDF)
                                            </div>
                                            <div className="text-[12px] font-bold text-slate-500 leading-tight">
                                                แสดงผลในแอป (mock จาก database)
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        {viewState === "ready" && (
                                            <span className="px-3 py-1.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                พร้อมดู
                                            </span>
                                        )}
                                        {viewState === "loading" && (
                                            <span className="px-3 py-1.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                                                กำลังโหลด…
                                            </span>
                                        )}
                                        {viewState === "empty" && (
                                            <span className="px-3 py-1.5 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                                                ไม่พบไฟล์
                                            </span>
                                        )}
                                        {viewState === "error" && (
                                            <span className="px-3 py-1.5 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                                                โหลดไม่ได้
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="h-11 rounded-2xl bg-[#F6F8FF] border border-blue-100/70 shadow-inner overflow-hidden flex">
                                        <button
                                            type="button"
                                            onClick={zoomOut}
                                            disabled={viewState !== "ready"}
                                            className={cx(
                                                "w-12 h-11 flex items-center justify-center text-slate-800 active:scale-[0.98] transition",
                                                viewState !== "ready" && "opacity-40 cursor-not-allowed"
                                            )}
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <div className="px-4 h-11 flex items-center justify-center text-[13px] font-black text-slate-700 tabular-nums">
                                            {Math.round(scale * 100)}%
                                        </div>
                                        <button
                                            type="button"
                                            onClick={zoomIn}
                                            disabled={viewState !== "ready"}
                                            className={cx(
                                                "w-12 h-11 flex items-center justify-center text-slate-800 active:scale-[0.98] transition",
                                                viewState !== "ready" && "opacity-40 cursor-not-allowed"
                                            )}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    <div className="h-11 px-3 rounded-2xl bg-[#F6F8FF] border border-blue-100/70 shadow-inner flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={!canPrev || viewState !== "ready"}
                                            onClick={() => canPrev && setPage((p) => p - 1)}
                                            className={cx(
                                                "w-9 h-9 rounded-xl font-black text-slate-700",
                                                canPrev && viewState === "ready" ? "active:scale-[0.98] transition" : "opacity-40 cursor-not-allowed"
                                            )}
                                        >
                                            ‹
                                        </button>

                                        <div className="text-[13px] font-black text-slate-700 tabular-nums min-w-[64px] text-center">
                                            {page} / {Math.max(1, numPages)}
                                        </div>

                                        <button
                                            type="button"
                                            disabled={!canNext || viewState !== "ready"}
                                            onClick={() => canNext && setPage((p) => p + 1)}
                                            className={cx(
                                                "w-9 h-9 rounded-xl font-black text-slate-700",
                                                canNext && viewState === "ready" ? "active:scale-[0.98] transition" : "opacity-40 cursor-not-allowed"
                                            )}
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            {viewState === "empty" && (
                                <div className="rounded-[22px] border border-blue-100/70 bg-white p-6 text-center shadow-[0_12px_22px_rgba(15,23,42,0.06)]">
                                    <div className="text-[16px] font-black text-slate-900">ยังไม่มีไฟล์ PDF ของบิล</div>
                                    <div className="mt-2 text-xs font-bold text-slate-500">(mock DB ยังไม่ได้ใส่ pdfBase64)</div>
                                    <button
                                        type="button"
                                        onClick={() => setReloadKey((k) => k + 1)}
                                        className="mt-5 h-[52px] w-full rounded-2xl font-black bg-[#2F6BFF] text-white shadow-[0_14px_24px_rgba(47,107,255,0.24)] active:scale-[0.98] transition"
                                    >
                                        ลองโหลดใหม่
                                    </button>
                                </div>
                            )}

                            {blobUrl && (
                                <Document
                                    key={blobUrl}
                                    file={blobUrl}
                                    onLoadSuccess={({ numPages }) => {
                                        setNumPages(numPages);
                                        setViewState("ready");
                                    }}
                                    onLoadError={(e) => {
                                        console.error("PDF load error:", e);
                                        setViewState("error");
                                    }}
                                    loading={
                                        <div className="rounded-[22px] overflow-hidden border border-blue-100/60 bg-white shadow-[0_12px_22px_rgba(15,23,42,0.06)]">
                                            <div className="h-[64vh] animate-pulse bg-gradient-to-b from-[#F3F7FF] to-white" />
                                        </div>
                                    }
                                >
                                    <div className="rounded-[22px] overflow-hidden border border-blue-100/60 bg-white shadow-[0_12px_22px_rgba(15,23,42,0.06)]">
                                        <div className="p-3 overflow-auto">
                                            <div className="flex justify-center">
                                                <Page pageNumber={page} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
                                            </div>
                                        </div>
                                    </div>
                                </Document>
                            )}

                            {viewState === "error" && (
                                <div className="mt-3 rounded-[22px] border border-blue-100/70 bg-white p-6 shadow-[0_12px_22px_rgba(15,23,42,0.06)]">
                                    <div className="text-[18px] font-black text-slate-900">Failed to load PDF file.</div>
                                    <div className="mt-2 text-xs font-bold text-slate-500">
                                        ถ้ายัง error ให้เช็คว่า `npm ls pdfjs-dist` เหลือ 5.4.296 ตัวเดียว และ worker เป็น .mjs?url
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setReloadKey((k) => k + 1)}
                                        className="mt-4 h-[52px] w-full rounded-2xl font-black bg-[#2F6BFF] text-white shadow-[0_14px_24px_rgba(47,107,255,0.24)] active:scale-[0.98] transition"
                                    >
                                        ลองโหลดใหม่
                                    </button>
                                </div>
                            )}

                            <div className="mt-3 text-[11px] font-bold text-slate-500 leading-relaxed">
                                * ตอนนี้เป็น mock DB + mock PDF เพื่อทดสอบ UI/Viewer ก่อนต่อ backend
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-4">
                    <button
                        type="button"
                        onClick={() => nav(`/tenant/billing`, { replace: true })}
                        className="w-full h-[58px] rounded-2xl font-black text-[17px] bg-white/85 border border-blue-100/70 shadow-[0_14px_26px_rgba(15,23,42,0.07)] active:scale-[0.98] transition"
                    >
                        กลับไปหน้าบิล
                    </button>
                </div>
            </div>
        </div>
    );
}