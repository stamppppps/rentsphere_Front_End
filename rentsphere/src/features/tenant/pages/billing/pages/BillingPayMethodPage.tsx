import { ChevronLeft } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type PayMethod = "BANK" | "PROMPTPAY";

type BillStatus = "UNPAID" | "PENDING_REVIEW" | "PAID" | "OVERDUE";

type PayBillSummary = {
    billId: string;
    unitText: string;
    dueDateText: string;
    total: number;
    status: BillStatus;
};

function formatNumber(n: number) {
    return n.toLocaleString("th-TH");
}

function statusText(s: BillStatus) {
    switch (s) {
        case "UNPAID":
            return "ยังไม่ได้ชำระ";
        case "PENDING_REVIEW":
            return "รอตรวจสอบ";
        case "PAID":
            return "ชำระแล้ว";
        case "OVERDUE":
            return "เกินกำหนด";
        default:
            return "—";
    }
}

function statusBadgeClass(s: BillStatus) {
    switch (s) {
        case "PAID":
            return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "PENDING_REVIEW":
            return "bg-amber-100 text-amber-800 border-amber-200";
        case "OVERDUE":
            return "bg-rose-100 text-rose-700 border-rose-200";
        case "UNPAID":
        default:
            return "bg-blue-50 text-blue-700 border-blue-200";
    }
}

/* =========================
        Micro Animations
   ========================= */
function useEnterAnim() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 10);
        return () => clearTimeout(t);
    }, []);
    return mounted;
}

/* =========================
        UI Shells
   ========================= */
function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={[
                "bg-white",
                "rounded-[22px]",
                "shadow-[0_14px_40px_rgba(15,23,42,0.08)]",
                "border border-blue-100/60",
                "overflow-hidden",
                className,
            ].join(" ")}
        >
            {children}
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-6 bg-[#2F6BFF] rounded-full" />
            <span className="text-sm font-black text-slate-800 tracking-widest">{children}</span>
        </div>
    );
}

function PrimaryButton({
    children,
    disabled,
    onClick,
}: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={[
                "w-full h-[58px] rounded-2xl font-black text-lg",
                "transition-all duration-200",
                disabled
                    ? "bg-[#E5E7EB] text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-[#2F6BFF] text-white shadow-[0_18px_32px_rgba(47,107,255,0.28)] active:scale-[0.98]",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

/* =========================
        Inline SVG Icons
   ========================= */
function IconBox({
    children,
    active,
}: {
    children: React.ReactNode;
    active?: boolean;
}) {
    return (
        <div
            className={[
                "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                active
                    ? "bg-[#EAF1FF] border border-blue-200 text-[#2F6BFF]"
                    : "bg-[#F4F8FF] border border-blue-100/70 text-[#2F6BFF]",
                "shadow-inner",
            ].join(" ")}
        >
            {children}
        </div>
    );
}

function BankSvg() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 10.5 12 4l9 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 10.5V20h14v-9.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M7.5 20V12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 20V12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M16.5 20V12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function QRSvg() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M7 7h4v4H7V7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M13 7h4v4h-4V7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M7 13h4v4H7v-4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path d="M13 13h2v2h-2v-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M17 13h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M13 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M17 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 3h6M3 3v6M21 3h-6M21 3v6M3 21h6M3 21v-6M21 21h-6M21 21v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function Radio({ checked }: { checked: boolean }) {
    return (
        <div
            className={[
                "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                checked ? "border-[#2F6BFF] bg-[#2F6BFF]/10" : "border-blue-200 bg-white",
                "transition",
            ].join(" ")}
            aria-hidden="true"
        >
            <div
                className={[
                    "w-3 h-3 rounded-full",
                    checked ? "bg-[#2F6BFF]" : "bg-transparent",
                    "transition",
                ].join(" ")}
            />
        </div>
    );
}

function MethodCard({
    title,
    subtitle,
    icon,
    selected,
    onClick,
}: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "w-full text-left",
                "rounded-[18px] border",
                "px-4 py-4",
                "flex items-center gap-4",
                "transition-all duration-200",
                selected
                    ? "border-[#2F6BFF] bg-[#F3F8FF] shadow-[0_14px_26px_rgba(47,107,255,0.10)]"
                    : "border-blue-100/70 bg-white shadow-[0_10px_18px_rgba(15,23,42,0.06)]",
                "active:scale-[0.99]",
            ].join(" ")}
        >
            <IconBox active={selected}>{icon}</IconBox>

            <div className="flex-1 min-w-0">
                <div className="text-[18px] font-black text-slate-900 leading-tight">{title}</div>
                <div className="mt-1 text-[12px] font-bold text-slate-600 leading-snug">{subtitle}</div>
            </div>

            <Radio checked={selected} />
        </button>
    );
}

/* =========================
            Page
   ========================= */
export default function BillingPayMethodPage() {
    const nav = useNavigate();
    const { billId } = useParams<{ billId: string }>();

    // ===== MOCK =====
    const bill: PayBillSummary = {
        billId: billId || "1025",
        unitText: "A-302",
        dueDateText: "31 พฤษภาคม 2024",
        total: 4200,
        status: "UNPAID",
    };

    const mounted = useEnterAnim();
    const [method, setMethod] = useState<PayMethod | null>(null);

    const isLocked = useMemo(() => bill.status === "PAID" || bill.status === "PENDING_REVIEW", [bill.status]);

    const ctaText = useMemo(() => {
        if (!method) return "เลือกวิธีการชำระเงิน";
        if (method === "PROMPTPAY") return "แสดง QR เพื่อชำระ";
        return "ดูบัญชี / อัปโหลดสลิป";
    }, [method]);

    const onContinue = () => {
        if (!method) return;

        if (method === "PROMPTPAY") {
            nav(`/tenant/billing/${bill.billId}/pay/qr`, {
                state: { billId: bill.billId, total: bill.total },
            });
            return;
        }

        // BANK
        nav(`/tenant/billing/${bill.billId}/pay/bank-transfer`, {
            state: { billId: bill.billId, total: bill.total },
        });
    };
    return (
        <div className="min-h-screen bg-[#F8FAFF] pb-36">
            {/* ===== Top Bar ===== */}
            <div className="sticky top-0 z-40">
                <div className="bg-[#F8FAFF]/85 backdrop-blur supports-[backdrop-filter]:backdrop-blur-lg">
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

            <div
                className={[
                    "px-6",
                    "transition-all duration-500",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
                ].join(" ")}
            >
                {/* ===== Summary Card ===== */}
                <CardShell className="mt-2">
                    <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-[18px] font-black text-slate-900">ยอดรวม</div>
                                <div className="mt-1 text-[34px] font-black text-slate-900 leading-none">{formatNumber(bill.total)}</div>
                                <div className="mt-3 text-sm font-bold text-slate-600">
                                    วันครบกำหนดชำระ: {bill.dueDateText}
                                </div>
                                <div className="mt-1 text-sm font-bold text-slate-600">Unit : {bill.unitText}</div>
                            </div>

                            <div
                                className={[
                                    "px-4 py-2 rounded-full border text-xs font-black whitespace-nowrap",
                                    statusBadgeClass(bill.status),
                                ].join(" ")}
                            >
                                {statusText(bill.status)}
                            </div>
                        </div>
                    </div>
                </CardShell>

                {/* ===== Methods ===== */}
                <div className="mt-6">
                    <SectionTitle>เลือกวิธีการชำระเงิน</SectionTitle>

                    <div className="mt-3 space-y-3">
                        <MethodCard
                            title="โอนผ่านธนาคาร"
                            subtitle="เหมาะสำหรับการโอนและแนบสลิป • ตรวจสอบภายใน 24 ชม."
                            selected={method === "BANK"}
                            onClick={() => !isLocked && setMethod("BANK")}
                            icon={<BankSvg />}
                        />

                        <MethodCard
                            title="QR พร้อมเพย์"
                            subtitle="ชำระได้ทันทีผ่านแอปธนาคาร • แนะนำ"
                            selected={method === "PROMPTPAY"}
                            onClick={() => !isLocked && setMethod("PROMPTPAY")}
                            icon={<QRSvg />}
                        />
                    </div>

                    {/* lock hint */}
                    {isLocked && (
                        <div className="mt-4 text-xs font-bold text-slate-500">
                            * บิลนี้อยู่ในสถานะ “{statusText(bill.status)}” จึงไม่สามารถเลือกวิธีชำระเงินได้
                        </div>
                    )}
                </div>

                {/* ===== Fee summary ===== */}
                <div className="mt-6">
                    <CardShell>
                        <div className="p-5">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-bold text-slate-600">ยอดบิล</div>
                                <div className="text-sm font-black text-slate-900">{formatNumber(bill.total)}</div>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                                <div className="text-sm font-bold text-slate-600">ค่าธรรมเนียม</div>
                                <div className="text-sm font-black text-slate-900">0</div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-blue-100/70 flex items-center justify-between">
                                <div className="text-[16px] font-black text-slate-900">ยอดที่ต้องชำระจริง</div>
                                <div className="text-[18px] font-black text-slate-900">{formatNumber(bill.total)}</div>
                            </div>
                        </div>
                    </CardShell>
                </div>

                {/* ===== CTA ===== */}
                <div className="mt-7">
                    <PrimaryButton disabled={!method || isLocked} onClick={onContinue}>
                        {ctaText}
                    </PrimaryButton>
                    <div className="mt-3 text-[11px] font-bold text-slate-500 leading-relaxed">
                        โปรดตรวจสอบยอดเงินและชื่อบัญชีก่อนชำระ • หากโอนผ่านธนาคาร กรุณาอัปโหลดสลิปเพื่อให้เจ้าหน้าที่ตรวจสอบ
                    </div>
                </div>
            </div>
        </div>
    );
}