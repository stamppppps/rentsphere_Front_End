import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Step9_Success() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const condoId = params.get("condoId"); 

  const editPath = useMemo(() => {
    return condoId ? `/owner/add-condo/step-0?condoId=${condoId}` : "/owner/add-condo/step-0";
  }, [condoId]);

  const goStart = () => {
   
    nav("/owner/condo", { state: { justCreated: true, condoId } });
  };

  const goDashboard = () => {
   
    if (condoId) nav("/owner/dashboard", { state: { condoId } });
    else nav("/owner/dashboard");
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#EEF4FF] px-4">
      <div className="w-full max-w-[640px] rounded-2xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] border border-blue-100/60 overflow-hidden">
        <div className="px-8 py-8 text-center bg-[#f3f7ff] border-b border-blue-100/60">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
            <svg className="h-9 w-9 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900">การตั้งค่าเสร็จเรียบร้อย</h1>
          <p className="mt-2 text-sm font-bold text-gray-600">คุณสามารถเริ่มใช้งานและจัดการคอนโดมิเนียมได้ทันที</p>
        </div>

        <div className="px-8 py-8 text-center">
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={goStart}
              className="h-[46px] px-8 rounded-xl bg-[#93C5FD] hover:bg-[#7fb4fb] text-white font-extrabold shadow-lg active:scale-[0.98] transition"
            >
              เริ่มต้นใช้งาน
            </button>

            <button
              type="button"
              onClick={goDashboard}
              className="h-[46px] px-7 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold hover:bg-gray-50 active:scale-[0.98] transition"
            >
              กลับไปหน้า Dashboard
            </button>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => nav(editPath)}
              className="text-sm font-extrabold text-gray-500 underline underline-offset-4 hover:text-gray-700"
            >
              แก้ไขการตั้งค่าอีกครั้ง
            </button>
          </div>

      
          {!condoId && (
            <div className="mt-5 text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              ⚠️ ไม่พบ condoId ใน URL (ควรเข้าหน้านี้แบบ ?condoId=...)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}