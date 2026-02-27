import { ChevronLeft, Download, FileText, Minus, Plus, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// ✅ ตั้งค่า worker (Vite/React)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url
).toString();

function cx(...cls: Array<string | false | undefined | null>) {
    return cls.filter(Boolean).join(" ");
}

function useEnterAnim() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 10);
        return () => clearTimeout(t);
    }, []);
    return mounted;
}

type ViewerState = "loading" | "ready" | "empty" | "error";
type LocationState = { pdfUrl?: string; title?: string };

export default function BillingPdfViewerPage() {
    const nav = useNavigate();
    const { billId } = useParams<{ billId: string }>();
    const location = useLocation();
    const mounted = useEnterAnim();

    const locState = (location.state || {}) as LocationState;

    // ✅ mock: วาง pdf ใน public แล้วเรียก /sample.pdf
    const mockPdfUrl = useMemo(() => locState.pdfUrl ?? "/sample.pdf", [locState.pdfUrl]);
    const title = locState.title ?? "รายละเอียดบิล";

    const [viewState, setViewState] = useState<ViewerState>("loading");
    const [pdfUrl, setPdfUrl] = useState<string>("");

    const [numPages, setNumPages] = useState<number>(1);
    const [page, setPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);

    const canPrev = page > 1;
    const canNext = page < numPages;

    useEffect(() => {
        // mock loading (ตอนต่อ BE ค่อย fetch แล้ว set)
        const t = setTimeout(() => {
            if (mockPdfUrl) {
                setPdfUrl(mockPdfUrl);
                setViewState("ready");
            } else {
                setViewState("empty");
            }
        }, 320);
        return () => clearTimeout(t);
    }, [mockPdfUrl]);

    useEffect(() => {
        setPage((p) => Math.min(Math.max(1, p), numPages));
    }, [numPages]);

    const zoomOut = () => setScale((s) => Math.max(0.6, Number((s - 0.1).toFixed(2))));
    const zoomIn = () => setScale((s) => Math.min(2.0, Number((s + 0.1).toFixed(2))));

    const onDownload = () => {
        if (!pdfUrl) return;
        window.open(pdfUrl, "_blank"); // เปิดแท็บใหม่ให้ browser download/open
    };

    const onShare = async () => {
        if (!pdfUrl) return;

        // Web Share API (มือถือจะเวิร์คสุด)
        const canShare = typeof navigator !== "undefined" && (navigator as any).share;
        if (canShare) {
            try {
                await (navigator as any).share({
                    title: `Invoice #${billId ?? ""}`,
                    text: "แชร์ไฟล์ใบแจ้งหนี้",
                    url: window.location.origin + pdfUrl,
                });
            } catch {
                // ผู้ใช้กดยกเลิก ก็เงียบๆ
            }
            return;
        }

        // fallback: copy link
        try {
            await navigator.clipboard.writeText(window.location.origin + pdfUrl);
            alert("คัดลอกลิงก์แล้ว ✅");
        } catch {
            alert("แชร์ไม่ได้ ลองกดดาวน์โหลดแทนนะ");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFF] pb-20">
            <style>{`
        @keyframes pop { 
          0% { transform: translateY(10px); opacity: 0; } 
          100% { transform: translateY(0); opacity: 1; } 
        }
        @keyframes shimmer { 
          0% { transform: translateX(-120%); } 
          100% { transform: translateX(260%); } 
        }
      `}</style>

            {/* soft glow background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-[#2F6BFF]/10 blur-3xl" />
                <div className="absolute -bottom-24 right-0 w-[380px] h-[380px] rounded-full bg-indigo-400/10 blur-3xl" />
            </div>

            {/* ===== Top Bar ===== */}
            <div className="sticky top-0 z-40">
                <div className="bg-[#F8FAFF]/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-lg border-b border-blue-100/40">
                    <div className="px-6 pt-7 pb-3">
                        <div className="relative flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => nav(-1)}
                                className="absolute left-0 p-2.5 rounded-2xl bg-white/70 backdrop-blur border border-white/60 text-slate-800 shadow-sm active:scale-95 transition"
                                aria-label="Back"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <div className="text-2xl font-black text-slate-900">{title}</div>
                            <div className="absolute right-0 w-10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 relative">
                {/* ===== Header ===== */}
                <div
                    className={cx("mt-4", mounted ? "opacity-100" : "opacity-0")}
                    style={{ animation: mounted ? "pop .32s ease-out both" : undefined }}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="text-[18px] font-black text-slate-900">ใบแจ้งหนี้ #{billId ?? "—"}</div>
                            <div className="mt-1 text-xs font-bold text-slate-600">ดูไฟล์ PDF ที่เจ้าของห้องอัปโหลด</div>
                        </div>

                        {/* iOS-like chips */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onDownload}
                                className={cx(
                                    "h-10 px-3 rounded-2xl",
                                    "bg-white/75 backdrop-blur",
                                    "border border-blue-100/70",
                                    "shadow-[0_10px_18px_rgba(15,23,42,0.06)]",
                                    "active:scale-[0.98] transition",
                                    viewState !== "ready" && "opacity-50 pointer-events-none"
                                )}
                            >
                                <div className="flex items-center gap-2 text-slate-800">
                                    <Download size={18} />
                                    <span className="text-xs font-black">ดาวน์โหลด</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={onShare}
                                className={cx(
                                    "h-10 px-3 rounded-2xl",
                                    "bg-white/75 backdrop-blur",
                                    "border border-blue-100/70",
                                    "shadow-[0_10px_18px_rgba(15,23,42,0.06)]",
                                    "active:scale-[0.98] transition",
                                    viewState !== "ready" && "opacity-50 pointer-events-none"
                                )}
                            >
                                <div className="flex items-center gap-2 text-slate-800">
                                    <Share2 size={18} />
                                    <span className="text-xs font-black">แชร์</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ===== Viewer Card ===== */}
                <div
                    className={cx("mt-4", mounted ? "opacity-100" : "opacity-0")}
                    style={{ animation: mounted ? "pop .32s ease-out .06s both" : undefined }}
                >
                    <div className="rounded-[24px] overflow-hidden border border-blue-100/70 bg-white/65 backdrop-blur shadow-[0_18px_60px_rgba(15,23,42,0.10)]">
                        {/* Toolbar */}
                        <div className="px-5 py-4 border-b border-blue-100/50 bg-white/60">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-11 h-11 rounded-2xl bg-[#EEF3FF] border border-blue-100/70 shadow-inner flex items-center justify-center text-[#2F6BFF]">
                                        <FileText size={22} />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-[14px] font-black text-slate-900 truncate">เอกสารบิล (PDF)</div>
                                        <div className="text-[11px] font-bold text-slate-500">แสดงผลแบบฝังในแอป</div>
                                    </div>
                                </div>

                                {/* right controls */}
                                <div className="flex items-center gap-2">
                                    {/* status */}
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

                                    {/* zoom / page (iOS segmented) */}
                                    <div className="hidden md:flex items-center gap-2">
                                        <div className="h-10 rounded-2xl bg-white/80 border border-blue-100/70 shadow-[0_10px_18px_rgba(15,23,42,0.06)] overflow-hidden flex">
                                            <button
                                                type="button"
                                                onClick={zoomOut}
                                                className="w-10 h-10 flex items-center justify-center text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition"
                                                aria-label="Zoom out"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <div className="px-3 h-10 flex items-center justify-center text-xs font-black text-slate-700 tabular-nums">
                                                {Math.round(scale * 100)}%
                                            </div>
                                            <button
                                                type="button"
                                                onClick={zoomIn}
                                                className="w-10 h-10 flex items-center justify-center text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition"
                                                aria-label="Zoom in"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>

                                        <div className="h-10 px-3 rounded-2xl bg-white/80 border border-blue-100/70 shadow-[0_10px_18px_rgba(15,23,42,0.06)] flex items-center gap-2">
                                            <button
                                                type="button"
                                                disabled={!canPrev}
                                                onClick={() => canPrev && setPage((p) => p - 1)}
                                                className={cx(
                                                    "w-8 h-8 rounded-xl font-black",
                                                    canPrev ? "hover:bg-slate-50" : "opacity-40 cursor-not-allowed"
                                                )}
                                            >
                                                ‹
                                            </button>
                                            <div className="text-xs font-black text-slate-700 tabular-nums">
                                                {page} / {numPages}
                                            </div>
                                            <button
                                                type="button"
                                                disabled={!canNext}
                                                onClick={() => canNext && setPage((p) => p + 1)}
                                                className={cx(
                                                    "w-8 h-8 rounded-xl font-black",
                                                    canNext ? "hover:bg-slate-50" : "opacity-40 cursor-not-allowed"
                                                )}
                                            >
                                                ›
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content: thumbnails + main */}
                        <div className="p-4">
                            {viewState === "loading" && (
                                <div className="rounded-[20px] overflow-hidden border border-blue-100/60 bg-white shadow-[0_12px_22px_rgba(15,23,42,0.06)]">
                                    <div className="h-[70vh] relative">
                                        <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-[#F3F7FF] to-white" />
                                        <div className="absolute inset-0 opacity-30 pointer-events-none">
                                            <div className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2.6s_infinite]" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {viewState === "empty" && (
                                <div className="rounded-[20px] border border-blue-100/60 bg-white p-6 text-center shadow-[0_12px_22px_rgba(15,23,42,0.06)]">
                                    <div className="text-[16px] font-black text-slate-900">ยังไม่มีไฟล์ PDF ของบิล</div>
                                    <div className="mt-2 text-xs font-bold text-slate-500">
                                        เจ้าของห้องยังไม่ได้อัปโหลดบิล หรือไฟล์ถูกลบ
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => nav(-1)}
                                        className="mt-5 h-[52px] w-full rounded-2xl font-black bg-[#2F6BFF] text-white shadow-[0_16px_28px_rgba(47,107,255,0.26)] active:scale-[0.98] transition"
                                    >
                                        กลับ
                                    </button>
                                </div>
                            )}

                            {(viewState === "ready" || viewState === "error") && (
                                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
                                    {/* Thumbnails (md+) */}
                                    <div className="hidden md:block">
                                        <div className="rounded-[20px] border border-blue-100/60 bg-white shadow-[0_12px_22px_rgba(15,23,42,0.06)] overflow-hidden">
                                            <div className="px-4 py-3 border-b border-blue-100/60 text-xs font-black text-slate-700">
                                                หน้า
                                            </div>

                                            <div className="p-3 space-y-3 max-h-[70vh] overflow-auto">
                                                <Document
                                                    file={pdfUrl}
                                                    onLoadSuccess={({ numPages }) => {
                                                        setNumPages(numPages);
                                                        setViewState("ready");
                                                    }}
                                                    onLoadError={() => setViewState("error")}
                                                    loading={<div className="text-xs font-bold text-slate-500">กำลังโหลด…</div>}
                                                >
                                                    {Array.from({ length: numPages }).map((_, i) => {
                                                        const p = i + 1;
                                                        const active = p === page;

                                                        return (
                                                            <button
                                                                key={p}
                                                                type="button"
                                                                onClick={() => setPage(p)}
                                                                className={cx(
                                                                    "w-full text-left p-2 rounded-2xl border transition",
                                                                    active
                                                                        ? "border-[#8BB2FF] bg-[#EEF3FF]"
                                                                        : "border-blue-100/70 hover:bg-[#F6FAFF]"
                                                                )}
                                                            >
                                                                <div className="rounded-xl overflow-hidden bg-white border border-blue-100/60">
                                                                    <Page
                                                                        pageNumber={p}
                                                                        width={190}
                                                                        renderTextLayer={false}
                                                                        renderAnnotationLayer={false}
                                                                    />
                                                                </div>
                                                                <div className="mt-2 text-xs font-black text-slate-700">หน้า {p}</div>
                                                            </button>
                                                        );
                                                    })}
                                                </Document>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main PDF */}
                                    <div className="rounded-[20px] overflow-hidden border border-blue-100/60 bg-white shadow-[0_12px_22px_rgba(15,23,42,0.06)]">
                                        <div className="p-3 overflow-auto">
                                            <div className="flex justify-center">
                                                <Document
                                                    file={pdfUrl}
                                                    onLoadSuccess={({ numPages }) => {
                                                        setNumPages(numPages);
                                                        setViewState("ready");
                                                    }}
                                                    onLoadError={() => setViewState("error")}
                                                    loading={<div className="p-6 text-slate-600 font-bold">กำลังโหลด PDF…</div>}
                                                >
                                                    <Page
                                                        pageNumber={page}
                                                        scale={scale}
                                                        renderTextLayer={false}
                                                        renderAnnotationLayer={false}
                                                    />
                                                </Document>
                                            </div>

                                            {viewState === "error" && (
                                                <div className="p-4 text-center">
                                                    <div className="text-sm font-black text-rose-700">โหลดไฟล์ PDF ไม่ได้</div>
                                                    <div className="mt-1 text-xs font-bold text-slate-500">
                                                        ลองกด “ดาวน์โหลด” เพื่อเปิดในแท็บใหม่
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-3 text-[11px] font-bold text-slate-500 leading-relaxed">
                                * ถ้าไฟล์ไม่แสดงผล ลองกด “ดาวน์โหลด” เพื่อเปิดในแท็บใหม่
                            </div>

                            {/* Mobile controls */}
                            {viewState === "ready" && (
                                <div className="md:hidden mt-3 flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        disabled={!canPrev}
                                        onClick={() => canPrev && setPage((p) => p - 1)}
                                        className={cx(
                                            "h-11 px-4 rounded-2xl font-black text-sm",
                                            "bg-white border border-blue-100/70 shadow-[0_10px_18px_rgba(15,23,42,0.06)]",
                                            !canPrev && "opacity-40"
                                        )}
                                    >
                                        ก่อนหน้า
                                    </button>

                                    <div className="text-xs font-black text-slate-700 tabular-nums">
                                        {page} / {numPages} • {Math.round(scale * 100)}%
                                    </div>

                                    <button
                                        type="button"
                                        disabled={!canNext}
                                        onClick={() => canNext && setPage((p) => p + 1)}
                                        className={cx(
                                            "h-11 px-4 rounded-2xl font-black text-sm",
                                            "bg-white border border-blue-100/70 shadow-[0_10px_18px_rgba(15,23,42,0.06)]",
                                            !canNext && "opacity-40"
                                        )}
                                    >
                                        ถัดไป
                                    </button>
                                </div>
                            )}

                            {viewState === "ready" && (
                                <div className="md:hidden mt-2 flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={zoomOut}
                                        className="h-11 w-11 rounded-2xl bg-white border border-blue-100/70 shadow-[0_10px_18px_rgba(15,23,42,0.06)] active:scale-[0.98] transition flex items-center justify-center"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={zoomIn}
                                        className="h-11 w-11 rounded-2xl bg-white border border-blue-100/70 shadow-[0_10px_18px_rgba(15,23,42,0.06)] active:scale-[0.98] transition flex items-center justify-center"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== Bottom ===== */}
                <div
                    className={cx("mt-4", mounted ? "opacity-100" : "opacity-0")}
                    style={{ animation: mounted ? "pop .32s ease-out .12s both" : undefined }}
                >
                    <button
                        type="button"
                        onClick={() => nav(`/tenant/billing`, { replace: true })}
                        className={cx(
                            "w-full h-[58px] rounded-2xl font-black text-[17px]",
                            "bg-white/80 backdrop-blur",
                            "border border-blue-100/70",
                            "shadow-[0_14px_26px_rgba(15,23,42,0.07)]",
                            "active:scale-[0.98] transition"
                        )}
                    >
                        กลับไปหน้าบิล
                    </button>
                </div>
            </div>
        </div>
    );
} 