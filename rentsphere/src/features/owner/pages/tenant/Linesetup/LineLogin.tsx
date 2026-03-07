import React from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const LineLogin: React.FC = () => {
    const onLogin = () => {
        window.location.href = `${API}/auth/line/login`;
    };

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-[#D2E8FF] p-6">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8">
                <div className="text-center mb-6">
                    <div className="text-3xl font-black text-slate-900">RentSphere</div>
                    <div className="text-sm text-gray-500 font-semibold mt-1">
                        ระบบจัดการคอนโดมิเนียม
                    </div>
                </div>

                <h1 className="text-2xl font-black mb-2">สมัคร / เข้าสู่ระบบ</h1>
                <p className="text-sm text-gray-600 mb-6">
                    เข้าสู่ระบบด้วย LINE เพื่อเชื่อมกับห้องพักของคุณ
                </p>

                <button
                    onClick={onLogin}
                    className="w-full py-4 rounded-2xl font-extrabold text-lg text-white shadow-[0_12px_22px_rgba(6,199,85,0.3)] transition active:scale-[0.99]"
                    style={{ background: "linear-gradient(135deg, #06C755, #00B900)" }}
                >
                    เข้าสู่ระบบด้วย LINE
                </button>

                <div className="text-center text-xs text-gray-400 font-semibold mt-4">
                    * หลังจาก Login LINE สำเร็จ ระบบจะให้กรอกรหัสเข้าพัก 6 หลัก
                </div>
            </div>
        </div>
    );
};

export default LineLogin;
