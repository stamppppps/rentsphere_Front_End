import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
    open: boolean;
    selectedCount: number;
    onClose: () => void;
    onSave: (price: number) => void;
};

export default function SetRoomPriceModal({
    open,
    selectedCount,
    onClose,
    onSave,
}: Props) {
    const [price, setPrice] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!open) return;
        setPrice("");
        requestAnimationFrame(() => inputRef.current?.focus());
    }, [open]);

    const canSave = useMemo(() => {
        const v = price.trim();
        if (v === "") return false;
        const n = Number(v);
        return Number.isFinite(n) && n >= 0;
    }, [price]);

    if (!open) return null;

    const handleSave = () => {
        const v = price.trim();
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0) return;
        onSave(n);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[60] font-sarabun"
            onKeyDown={(e) => {
                if (e.key === "Escape") onClose();
                if (e.key === "Enter" && canSave) handleSave();
            }}
        >
            <div
                className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative w-full max-w-[920px] rounded-2xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.28)] border border-blue-100/70 overflow-hidden">
                    <div className="px-8 py-6 bg-[#f3f7ff] border-b border-blue-100/60">
                        <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            ระบุค่าห้อง
                        </div>
                    </div>

                    <div className="px-8 py-7">
                        <div className="text-base font-bold text-gray-800">
                            ราคาค่าเช่ารายเดือน{" "}
                            <span className="text-red-500 font-extrabold">*</span>
                        </div>

                        <div className="mt-3 flex items-stretch rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-200">
                            <input
                                ref={inputRef}
                                type="number"
                                inputMode="numeric"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="เช่น 3500"
                                className="flex-1 h-16 px-6 text-2xl font-extrabold text-gray-900 outline-none placeholder:text-gray-400"
                            />

                            <div className="h-16 px-6 grid place-items-center bg-[#f3f7ff] border-l border-blue-100/60 text-lg font-extrabold text-gray-800 whitespace-nowrap">
                                บาท / เดือน
                            </div>
                        </div>

                        <div className="mt-4 text-base font-bold text-gray-700">
                            เลือกไปทั้งหมด{" "}
                            <span className="font-extrabold text-gray-900">
                                {selectedCount}
                            </span>{" "}
                            ห้อง
                        </div>
                    </div>

                    <div className="px-8 py-5 bg-white border-t border-blue-100/60 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-[46px] px-7 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-[0_10px_20px_rgba(0,0,0,0.10)] transition hover:bg-gray-50 active:scale-[0.98]"
                        >
                            ปิด
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!canSave}
                            className="h-[46px] px-8 rounded-xl text-white font-extrabold text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition active:scale-[0.98]
                         bg-blue-600 hover:bg-blue-700 disabled:bg-blue-200 disabled:cursor-not-allowed disabled:text-white/70"
                        >
                            บันทึก
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}