import { CheckCircle2, ChevronLeft } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type SuccessState = {
    total?: number;
    methodText?: string;
    paymentAtText?: string;
    statusText?: string;
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
        const t = setTimeout(() => setMounted(true), 20);
        return () => clearTimeout(t);
    }, []);
    return mounted;
}

function CardShell({
    children,
    className = "",
    style,
}: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div
            style={style}
            className={cx(
                "bg-white rounded-[26px] overflow-hidden",
                "border border-blue-100/60",
                "shadow-[0_18px_60px_rgba(15,23,42,0.10)]",
                className
            )}
        >
            {children}
        </div>
    );
}

function PillStatus({ text }: { text: string }) {

    return (
        <span
            className={cx(
                "inline-flex items-center gap-2",
                "px-4 py-2 rounded-full",
                "bg-amber-50 text-amber-900 border border-amber-200",
                "text-xs font-black whitespace-nowrap"
            )}
        >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
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
                "w-full h-[60px] rounded-2xl font-black text-[18px]",
                "bg-[#2F6BFF] text-white",
                "shadow-[0_20px_38px_rgba(47,107,255,0.32)]",
                "active:scale-[0.98] transition"
            )}
        >
            {/* sheen */}
            <span className="absolute inset-0 opacity-30 pointer-events-none">
                <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.8s_infinite]" />
            </span>
            {children}
        </button>
    );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cx(
                "w-full h-[60px] rounded-2xl font-black text-[18px]",
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

function TimelineItem({
    title,
    desc,
    done,
    active,
    last,
}: {
    title: string;
    desc?: string;
    done?: boolean;
    active?: boolean;
    last?: boolean;
}) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div
                    className={cx(
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center",
                        done
                            ? "bg-emerald-50 border-emerald-200"
                            : active
                                ? "bg-[#EEF3FF] border-blue-200 shadow-[0_0_0_6px_rgba(47,107,255,0.10)]"
                                : "bg-white border-blue-200"
                    )}
                >
                    {done ? (
                        <CheckCircle2 size={22} className="text-emerald-600" />
                    ) : (
                        <div className={cx("w-3 h-3 rounded-full", active ? "bg-[#2F6BFF] animate-pulse" : "bg-blue-200")} />
                    )}
                </div>

                {!last && <div className="w-[3px] flex-1 bg-blue-200/70 rounded-full mt-1" />}
            </div>

            <div className="pt-1">
                <div className={cx("text-[16px] font-black", done || active ? "text-slate-900" : "text-slate-700")}>
                    {title}
                </div>
                {desc && <div className="mt-1 text-xs font-bold text-slate-500 leading-relaxed">{desc}</div>}
            </div>
        </div>
    );
}

export default function BillingPaymentSuccessPage() {
    const nav = useNavigate();
    const { billId } = useParams<{ billId: string }>();
    const location = useLocation();

    const mounted = useEnterAnim();
    const state = (location.state || {}) as SuccessState;

    const total = state.total ?? 4200;
    const methodText = state.methodText ?? "โอนผ่านธนาคาร";
    const statusText = state.statusText ?? "รอตรวจสอบ";
    const paymentAtText =
        state.paymentAtText ??
        new Date()
            .toLocaleString("th-TH", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
            .replace(",", " |");

    const titleText = useMemo(() => "ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว", []);
    const subText = useMemo(() => "การชำระเงินของคุณอยู่ระหว่างการตรวจสอบ", []);

    return (
        <div className="min-h-screen bg-[#F8FAFF] pb-32">
            <style>{`
        @keyframes shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(260%); } }
        @keyframes pop { 0% { transform: translateY(10px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes floaty { 0% { transform: translateY(0); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0); } }
        @keyframes conf { 0% { transform: translateY(-10px) rotate(0deg); opacity: 0; } 10% { opacity: .9; } 100% { transform: translateY(120px) rotate(180deg); opacity: 0; } }
      `}</style>

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

            <div className="px-6">
                <CardShell
                    className={cx("mt-4", mounted ? "opacity-100" : "opacity-0")}
                    style={{ animation: mounted ? "pop .35s ease-out both" : undefined }}
                >
                    <div className="p-6 relative">
                        {/* glow background */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-[#2F6BFF]/10 blur-3xl" />
                            <div className="absolute -bottom-24 right-0 w-[320px] h-[320px] rounded-full bg-indigo-400/10 blur-3xl" />
                        </div>

                        {/* confetti (เบา ๆ) */}
                        <div className="absolute inset-x-0 top-2 pointer-events-none opacity-70">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <span
                                    key={i}
                                    style={{
                                        left: `${8 + i * 7}%`,
                                        animationDelay: `${i * 0.12}s`,
                                    } as React.CSSProperties}
                                    className={cx(
                                        "absolute top-0 w-2 h-2 rounded-sm",
                                        "bg-gradient-to-br from-blue-400 to-indigo-300",
                                        "animate-[conf_1.8s_ease-in-out_infinite]"
                                    )}
                                />
                            ))}
                        </div>

                        <div className="relative flex flex-col items-center text-center">
                            {/* Success medal */}
                            <div className="relative" style={{ animation: "floaty 3.2s ease-in-out infinite" }}>
                                <div className="w-[96px] h-[96px] rounded-full bg-white border border-blue-100/70 shadow-[0_18px_32px_rgba(15,23,42,0.10)] flex items-center justify-center">
                                    <div className="w-[80px] h-[80px] rounded-full bg-[#EEF3FF] border border-blue-100/70 flex items-center justify-center relative overflow-hidden">
                                        {/* sparkle */}
                                        <span className="absolute inset-0 opacity-25 pointer-events-none">
                                            <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2.6s_infinite]" />
                                        </span>
                                        <CheckCircle2 size={44} className="text-emerald-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 text-[22px] font-black text-slate-900">{titleText}</div>
                            <div className="mt-1 text-sm font-bold text-slate-600">{subText}</div>

                            {/* ===== Summary Card ===== */}
                            <div className="mt-5 w-full">
                                <div className="rounded-[20px] border border-blue-100/60 bg-white shadow-[0_16px_30px_rgba(15,23,42,0.07)] overflow-hidden">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="text-left">
                                                <div className="text-[16px] font-black text-slate-900">ใบแจ้งหนี้ #{billId ?? "—"}</div>
                                                <div className="mt-1 text-xs font-bold text-slate-500">{paymentAtText} น.</div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-[26px] font-black text-slate-900 leading-none">{formatNumber(total)}</div>
                                                <div className="mt-1 text-xs font-bold text-slate-500">บาท</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <div className="rounded-[16px] border border-blue-100/70 bg-[#F6FAFF] p-3 text-left">
                                                <div className="text-[11px] font-black text-slate-600">วิธีชำระเงิน</div>
                                                <div className="mt-1 text-[14px] font-black text-slate-900">{methodText}</div>
                                            </div>

                                            <div className="rounded-[16px] border border-blue-100/70 bg-[#F6FAFF] p-3 text-left">
                                                <div className="text-[11px] font-black text-slate-600">สถานะ</div>
                                                <div className="mt-2">
                                                    <PillStatus text={statusText} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-blue-100/60 flex items-center justify-between">
                                            <div className="text-[16px] font-black text-slate-900">ยอดรวม</div>
                                            <div className="text-[16px] font-black text-slate-900">{formatNumber(total)} บาท</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ===== Timeline ===== */}
                            <div className="mt-6 w-full text-left">
                                <div className="flex items-center justify-between px-1">
                                    <div className="text-sm font-black text-slate-800 tracking-widest">สถานะการตรวจสอบ</div>
                                    <div className="text-xs font-bold text-slate-500">ปกติภายใน 24 ชม.</div>
                                </div>

                                <div className="mt-4 space-y-4">
                                    <TimelineItem
                                        title="ส่งข้อมูลการชำระเงินแล้ว"
                                        desc="ระบบได้รับข้อมูลสลิปของคุณเรียบร้อย"
                                        done
                                    />
                                    <TimelineItem
                                        title="เจ้าหน้าที่กำลังตรวจสอบ"
                                        desc="กำลังตรวจสอบยอดเงินและข้อมูลบัญชี"
                                        active
                                    />
                                    <TimelineItem
                                        title="ยืนยันการชำระเงินแล้ว"
                                        desc="เมื่ออนุมัติแล้ว สถานะจะเปลี่ยนเป็น “ชำระแล้ว”"
                                        last
                                    />
                                </div>
                            </div>

                            {/* ===== Buttons ===== */}
                            <div className="mt-6 w-full space-y-3">
                                <PrimaryButton
                                    onClick={() => {
                                        nav(`/tenant/billing/${billId}/payment-detail`, {
                                            state: {
                                                billId,
                                                total,
                                                methodText,
                                                paymentAtText,
                                                statusText,
                                                unitText: "A-302",
                                                billDateText: "24 พฤษภาคม 2024",
                                                slipUrl: "....",//url สลิปจริง
                                            },
                                        });
                                    }}
                                >
                                    ดูรายละเอียดการชำระเงิน
                                </PrimaryButton>

                                <SecondaryButton
                                    onClick={() => {
                                        nav(`/tenant/home`, { replace: true });
                                    }}
                                >
                                    กลับหน้าหลัก
                                </SecondaryButton>

                                <div className="mt-2 text-[11px] font-bold text-slate-500 leading-relaxed text-center">
                                    หากข้อมูลไม่ถูกต้อง คุณสามารถส่งสลิปใหม่ได้จากหน้าบิลเดิม
                                </div>
                            </div>
                        </div>
                    </div>
                </CardShell>
            </div>
        </div>
    );
}