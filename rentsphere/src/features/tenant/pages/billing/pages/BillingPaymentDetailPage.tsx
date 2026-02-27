import { ChevronLeft } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type DetailState = {
    billId?: string;
    unitText?: string;
    billDateText?: string;
    statusText?: string;
    methodText?: string;
    paymentAtText?: string;
    total?: number;

    items?: Array<{ label: string; amount: number; icon?: React.ReactNode }>;
    slipUrl?: string;

    timeline?: Array<{ title: string; time?: string; sub?: string; done?: boolean; active?: boolean }>;
};

function cx(...cls: Array<string | false | undefined | null>) {
    return cls.filter(Boolean).join(" ");
}

function formatNumber(n: number) {
    return n.toLocaleString("th-TH");
}

function useEnterAnim() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 10);
        return () => clearTimeout(t);
    }, []);
    return mounted;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cx(
                "bg-white rounded-[22px] overflow-hidden",
                "border border-blue-100/60",
                "shadow-[0_14px_40px_rgba(15,23,42,0.08)]",
                className
            )}
        >
            {children}
        </div>
    );
}

function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#2F6BFF] rounded-full" />
                <div className="text-[15px] font-black text-slate-900 tracking-widest">{children}</div>
            </div>
            {right}
        </div>
    );
}

function StatusPill({ text }: { text: string }) {
    return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {text}
        </span>
    );
}

function MiniPill({ text }: { text: string }) {
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black whitespace-nowrap">
            {text}
        </span>
    );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cx(
                "relative overflow-hidden",
                "w-full h-[56px] rounded-2xl font-black text-[16px]",
                "bg-[#2F6BFF] text-white",
                "shadow-[0_18px_32px_rgba(47,107,255,0.28)]",
                "active:scale-[0.98] transition"
            )}
        >
            <span className="absolute inset-0 opacity-30 pointer-events-none">
                <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.6s_infinite]" />
            </span>
            <span className="relative">{children}</span>
        </button>
    );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cx(
                "w-full h-[56px] rounded-2xl font-black text-[16px]",
                "bg-white text-slate-900",
                "border border-blue-100/70",
                "shadow-[0_14px_26px_rgba(15,23,42,0.07)]",
                "active:scale-[0.98] transition"
            )}
        >
            {children}
        </button>
    );
}

export default function BillingPaymentDetailPage() {
    const nav = useNavigate();
    const { billId } = useParams<{ billId: string }>();
    const location = useLocation();
    const mounted = useEnterAnim();

    const state = (location.state || {}) as DetailState;

    const data = useMemo(() => {
        const total = state.total ?? 4200;

        return {
            billId: state.billId ?? billId ?? "1025",
            unitText: state.unitText ?? "A-302",
            billDateText: state.billDateText ?? "24 พฤษภาคม 2024",
            statusText: state.statusText ?? "รอตรวจสอบ",
            methodText: state.methodText ?? "โอนผ่านธนาคาร",
            paymentAtText:
                state.paymentAtText ??
                new Date()
                    .toLocaleString("th-TH", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    .replace(",", " |") + " น.",
            total,
            items:
                state.items ??
                [
                    { label: "ค่าเช่า", amount: 3500 },
                    { label: "ค่าน้ำ", amount: 300 },
                    { label: "ค่าไฟฟ้า", amount: 350 },
                    { label: "ค่าส่วนกลาง", amount: 50 },
                ],
            slipUrl: state.slipUrl ?? "https://dummyimage.com/320x380/edf2ff/64748b.png&text=SLIP",
            timeline:
                state.timeline ??
                [
                    { title: "ส่งข้อมูลการชำระเงินแล้ว", time: "วันนี้ | 09:45 น.", done: true },
                    { title: "เจ้าหน้าที่กำลังตรวจสอบ", sub: "รอตรวจสอบ", active: true },
                    { title: "ยืนยันการชำระเงินแล้ว", sub: "สถานะจะเปลี่ยนเป็น “ชำระแล้ว”", done: false, active: false },
                ],
        };
    }, [billId, state]);

    const sum = useMemo(() => data.items.reduce((acc, it) => acc + (it.amount || 0), 0), [data.items]);

    // ✅ ตามที่ขอ:
    // - กลับไปหน้าชำระเงิน => ไปหน้า success
    // - ไปหน้าแรก => ไปหน้า billing page
    const goSuccess = () => nav(`/tenant/billing/${data.billId}/pay/success`, { replace: true });
    const goBillingHome = () => nav(`/tenant/billing`, { replace: true });

    return (
        <div className="min-h-screen bg-[#F8FAFF] pb-28">
            <style>{`
        @keyframes pop { 0% { transform: translateY(10px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(260%); } }
      `}</style>

            {/* soft background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-[#2F6BFF]/10 blur-3xl" />
                <div className="absolute -bottom-24 right-0 w-[360px] h-[360px] rounded-full bg-indigo-400/10 blur-3xl" />
            </div>

            {/* ===== Top Bar ===== */}
            <div className="sticky top-0 z-40">
                <div className="bg-[#F8FAFF]/85 backdrop-blur supports-[backdrop-filter]:backdrop-blur-lg border-b border-blue-100/40">
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
                            <div className="text-2xl font-black text-slate-900">บิล / การชำระเงิน</div>
                            <div className="absolute right-0 w-10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 relative">
                {/* header */}
                <div className={cx("mt-4", mounted ? "opacity-100" : "opacity-0")} style={{ animation: mounted ? "pop .30s ease-out both" : undefined }}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="text-[18px] font-black text-slate-900">ใบแจ้งหนี้ #{data.billId}</div>
                            <div className="mt-1 text-sm font-bold text-slate-600">
                                Unit : {data.unitText} | {data.billDateText}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <MiniPill text={data.methodText} />
                                <div className="text-xs font-bold text-slate-500">{data.paymentAtText}</div>
                            </div>
                        </div>
                        <StatusPill text={data.statusText} />
                    </div>
                </div>

                {/* quick summary */}
                <div className="mt-4" style={{ animation: mounted ? "pop .30s ease-out .06s both" : undefined }}>
                    <Card className="relative">
                        <div className="absolute inset-0 pointer-events-none opacity-[0.10]">
                            <div className="h-full w-full bg-gradient-to-br from-blue-300 via-indigo-200 to-transparent" />
                        </div>

                        <div className="relative p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-black text-slate-600 tracking-widest">ยอดรวมทั้งหมด</div>
                                    <div className="mt-1 text-[30px] font-black text-slate-900 leading-none">{formatNumber(sum)}</div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-500">ยอดที่ชำระ</div>
                                    <div className="mt-1 text-[20px] font-black text-slate-900">{formatNumber(data.total)} บาท</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* current bill */}
                <div className="mt-5" style={{ animation: mounted ? "pop .30s ease-out .10s both" : undefined }}>
                    <SectionTitle right={<span className="text-xs font-bold text-slate-500">ดูรายการ</span>}>บิลปัจจุบัน</SectionTitle>

                    <div className="mt-3">
                        <Card>
                            <div className="px-5 py-4 space-y-3">
                                {data.items.map((it, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="text-sm font-bold text-slate-700">{it.label}</div>
                                        <div className="text-sm font-black text-slate-900">{formatNumber(it.amount)}</div>
                                    </div>
                                ))}

                                <div className="pt-4 mt-4 border-t border-blue-100/60 flex items-center justify-between">
                                    <div className="text-[16px] font-black text-slate-900">รวมทั้งหมด</div>
                                    <div className="text-[18px] font-black text-slate-900">{formatNumber(sum)}</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* payment info */}
                <div className="mt-5" style={{ animation: mounted ? "pop .30s ease-out .14s both" : undefined }}>
                    <SectionTitle>ข้อมูลการชำระเงิน</SectionTitle>

                    <div className="mt-3">
                        <Card>
                            <div className="px-5 py-4 border-b border-blue-100/60">
                                <div className="text-sm font-black text-slate-900">{data.methodText}</div>
                            </div>

                            <div className="px-5 py-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-bold text-slate-600">ยอดเงินที่ชำระ</div>
                                    <div className="text-sm font-black text-slate-900">{formatNumber(data.total)}</div>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="text-sm font-bold text-slate-600">วันที่และเวลา</div>
                                    <div className="text-sm font-black text-slate-900 text-right">{data.paymentAtText}</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* slip + timeline */}
                <div className="mt-5" style={{ animation: mounted ? "pop .30s ease-out .18s both" : undefined }}>
                    <SectionTitle right={<span className="text-xs font-bold text-slate-500">กำลังตรวจสอบ</span>}>สลิปการชำระเงิน</SectionTitle>

                    <div className="mt-3">
                        <Card>
                            <div className="p-4 grid grid-cols-[120px_1fr] gap-4 items-start">
                                <div className="rounded-[16px] overflow-hidden border border-blue-100/70 bg-[#F6FAFF] shadow-[0_12px_22px_rgba(15,23,42,0.06)]">
                                    <img src={data.slipUrl} alt="slip" className="w-full h-[160px] object-cover" />
                                </div>

                                <div className="space-y-3">
                                    {data.timeline.map((t, i) => {
                                        const dotClass = t.done
                                            ? "bg-emerald-50 border-emerald-200"
                                            : t.active
                                                ? "bg-amber-50 border-amber-200"
                                                : "bg-white border-blue-200";

                                        const coreClass = t.done
                                            ? "bg-emerald-500"
                                            : t.active
                                                ? "bg-amber-400 animate-pulse"
                                                : "bg-blue-200";

                                        return (
                                            <div key={i} className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className={cx("w-9 h-9 rounded-full border-2 flex items-center justify-center", dotClass)}>
                                                        <div className={cx("w-3 h-3 rounded-full", coreClass)} />
                                                    </div>
                                                    {i !== data.timeline.length - 1 && <div className="w-[3px] flex-1 bg-blue-200/70 rounded-full mt-1" />}
                                                </div>

                                                <div className="pt-1 min-w-0">
                                                    <div className="text-[14px] font-black text-slate-900">{t.title}</div>
                                                    {t.time && <div className="text-xs font-bold text-slate-500">{t.time}</div>}
                                                    {t.sub && <div className="text-xs font-bold text-slate-500">{t.sub}</div>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3" style={{ animation: mounted ? "pop .30s ease-out .22s both" : undefined }}>
                    <PrimaryButton onClick={goSuccess}>กลับไปหน้าการชำระเงิน</PrimaryButton>
                    <SecondaryButton onClick={goBillingHome}>ไปหน้าแรก</SecondaryButton>
                </div>

                <div className="mt-4 text-[11px] font-bold text-slate-500 leading-relaxed text-center">
                    หากข้อมูลไม่ถูกต้อง คุณสามารถส่งสลิปใหม่ได้จากหน้าบิลเดิม
                </div>
            </div>
        </div>
    );
}