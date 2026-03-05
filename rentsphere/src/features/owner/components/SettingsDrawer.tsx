import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import Step_0 from "@/features/owner/pages/AddCondo/steps/Step_0";
import Step_1 from "@/features/owner/pages/AddCondo/steps/Step_1";
import Step_2 from "@/features/owner/pages/AddCondo/steps/Step_2";
import Step_3 from "@/features/owner/pages/AddCondo/steps/Step_3";
import Step_4 from "@/features/owner/pages/AddCondo/steps/Step_4";
import Step_5 from "@/features/owner/pages/AddCondo/steps/Step_5";
import Step6RoomPrice from "@/features/owner/pages/AddCondo/steps/Step6_RoomPrice";
import Step7Review from "@/features/owner/pages/AddCondo/steps/Step7_Review";
import Step8RoomService from "@/features/owner/pages/AddCondo/steps/Step8_RoomService";

/* ===== Step registry ===== */

const STEP_COMPONENTS: Record<string, React.FC> = {
    "step-0": Step_0,
    "step-1": Step_1,
    "step-2": Step_2,
    "step-3": Step_3,
    "step-4": Step_4,
    "step-5": Step_5,
    "step-6": Step6RoomPrice,
    "step-7": Step7Review,
    "step-8": Step8RoomService,
};

const STEP_LABELS: Record<string, string> = {
    "step-0": "ตั้งค่าคอนโด",
    "step-1": "ค่าบริการ",
    "step-2": "การคิดค่าน้ำ / ค่าไฟ",
    "step-3": "บัญชีธนาคาร",
    "step-4": "จัดการชั้น",
    "step-5": "ผังห้อง",
    "step-6": "ค่าห้อง",
    "step-7": "สถานะห้อง",
    "step-8": "ค่าบริการรายห้อง",
};

/* ===== Context ===== */

type SettingsDrawerContextType = {
    isOpen: boolean;
    currentStep: string | null;
    openStep: (step: string) => void;
    close: () => void;
};

const Ctx = createContext<SettingsDrawerContextType | null>(null);

export function useSettingsDrawer() {
    return useContext(Ctx);
}

/* ===== CSS keyframes ===== */

const KEYFRAMES = `
@keyframes __sd_slide{from{transform:translateX(100%);opacity:.85}to{transform:translateX(0);opacity:1}}
@keyframes __sd_fade{from{opacity:0}to{opacity:1}}
`;

/* ===== Provider + Drawer ===== */

export function SettingsDrawerProvider({ children }: { children: React.ReactNode }) {
    const [currentStep, setCurrentStep] = useState<string | null>(null);

    const openStep = useCallback((step: string) => setCurrentStep(step), []);
    const close = useCallback(() => setCurrentStep(null), []);

    const isOpen = currentStep !== null;

    /* ESC to close */
    useEffect(() => {
        if (!isOpen) return;
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [isOpen, close]);

    /* Lock body scroll */
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const StepComponent = currentStep ? STEP_COMPONENTS[currentStep] ?? null : null;
    const stepLabel = currentStep ? STEP_LABELS[currentStep] ?? "การตั้งค่า" : "";

    /* ===== Sidebar inside drawer for quick step switching ===== */
    const stepKeys = useMemo(() => Object.keys(STEP_COMPONENTS), []);

    return (
        <Ctx.Provider value={{ isOpen, currentStep, openStep, close }}>
            {children}

            {isOpen && StepComponent && (
                <>
                    <style>{KEYFRAMES}</style>

                    <div className="fixed inset-0 z-[200] flex">
                        {/* backdrop */}
                        <div
                            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                            style={{ animation: "__sd_fade .2s ease-out" }}
                            onClick={close}
                        />

                        {/* panel */}
                        <div
                            className="ml-auto relative flex h-full bg-[#EEF4FF] shadow-[-8px_0_30px_rgba(0,0,0,0.12)]"
                            style={{ animation: "__sd_slide .25s ease-out", width: "min(1300px, 92vw)" }}
                        >
                            {/* mini sidebar */}
                            <div className="w-[220px] shrink-0 bg-[#D6E6FF] border-r border-blue-100/80 overflow-y-auto py-4 px-3 flex flex-col gap-1">
                                <div className="text-sm font-extrabold text-gray-500 px-3 pb-2 tracking-wide">
                                    การตั้งค่า
                                </div>
                                {stepKeys.map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setCurrentStep(key)}
                                        className={[
                                            "w-full text-left rounded-xl px-3 py-2.5",
                                            "text-[14px] font-bold transition-all duration-150",
                                            key === currentStep
                                                ? "bg-white text-gray-900 shadow-sm font-extrabold"
                                                : "text-gray-700 hover:bg-white/60 hover:text-gray-900",
                                        ].join(" ")}
                                    >
                                        {STEP_LABELS[key] ?? key}
                                    </button>
                                ))}
                            </div>

                            {/* content area */}
                            <div className="flex-1 flex flex-col min-w-0">
                                {/* header */}
                                <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-[#D6E6FF] border-b border-blue-100/80">
                                    <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                                        {stepLabel}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={close}
                                        className="w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center transition"
                                    >
                                        <X className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>

                                {/* step content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <StepComponent key={currentStep} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Ctx.Provider>
    );
}
