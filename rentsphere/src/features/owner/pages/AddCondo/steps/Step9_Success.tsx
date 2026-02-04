import { useNavigate } from "react-router-dom";

export default function Step9_Success() {
    const nav = useNavigate();

    return (
        <div className="-mx-8 -my-8 w-[calc(100%+64px)] h-[calc(100vh-64px+64px)] bg-[#eef5ff] font-sarabun">

            <div className="w-full h-[calc(100vh-64px)] grid place-items-center">
                <div className="w-full max-w-[640px] rounded-2xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] border border-blue-100/60 overflow-hidden">
                    <div className="px-6 py-6 bg-[#f3f7ff] border-b border-blue-100/60 text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
                            <svg
                                className="h-9 w-9 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={3}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-extrabold text-gray-900">
                            การตั้งค่าเสร็จเรียบร้อย
                        </h1>
                    </div>

                    <div className="px-8 py-8 text-center">
                        <p className="text-base font-bold text-gray-600">
                            คุณสามารถเริ่มใช้งานและจัดการคอนโดมิเนียมได้ทันที
                        </p>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => nav("/owner/condo")}
                                className={[
                                    "h-[48px] px-10 rounded-xl text-white font-extrabold text-base",
                                    "shadow-[0_14px_28px_rgba(0,0,0,0.22)] transition",
                                    "!bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.97]",
                                    "focus:outline-none focus:ring-2 focus:ring-blue-200",
                                ].join(" ")}
                            >
                                เริ่มต้นใช้งาน
                            </button>
                        </div>

                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => nav("/owner/dashboard")}
                                className="text-sm font-extrabold text-gray-500 underline underline-offset-4 hover:text-gray-700"
                            >
                                กลับไปหน้า Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
