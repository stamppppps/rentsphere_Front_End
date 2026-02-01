import { useEffect, useMemo, useState } from "react";

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

    useEffect(() => {
        if (open) setPrice("");
    }, [open]);

    const canSave = useMemo(() => {
        const v = price.trim();
        if (v === "") return false;               // ต้องกรอก
        const n = Number(v);
        return Number.isFinite(n) && n >= 0;      // เป็นเลข และไม่ติดลบ
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center font-sarabun">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl mx-6 bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-10 py-8 border-b border-gray-200">
                    <h3 className="text-4xl font-extrabold text-gray-900">ระบุค่าห้อง</h3>
                </div>

                {/* Body */}
                <div className="px-10 py-10">
                    <label className="block text-2xl font-bold text-gray-900 mb-4">
                        ราคาค่าเช่ารายเดือน <span className="text-red-500 ml-2">*</span>
                    </label>

                    <div className="flex rounded-2xl overflow-hidden shadow-sm">
                        <input
                            type="number"
                            inputMode="numeric"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="เช่น 3500"
                            className="flex-1 border border-gray-300 rounded-l-2xl px-8 py-6 text-3xl font-bold text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div
                            className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-2xl px-10 flex items-center
                         text-2xl font-bold text-gray-700 whitespace-nowrap"
                        >
                            บาท / เดือน
                        </div>
                    </div>

                    <div className="mt-6 text-2xl font-bold text-gray-800">
                        เลือกไปทั้งหมด {selectedCount} ห้อง
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-8 bg-gray-100 border-t border-gray-200 flex justify-end gap-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-12 py-4 bg-white border border-gray-300 rounded-2xl
                       text-2xl font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
                    >
                        ปิด
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!canSave}
                        className={[
                            "px-12 py-4 rounded-2xl text-2xl font-extrabold !text-white shadow-lg transition-all active:scale-95",
                            canSave
                                ? "!bg-blue-600 hover:!bg-blue-700 !shadow-blue-500/30"
                                : "!bg-blue-300 cursor-not-allowed opacity-60",
                        ].join(" ")}
                    >
                        บันทึก
                    </button>

                </div>
            </div>
        </div>
    );
}
