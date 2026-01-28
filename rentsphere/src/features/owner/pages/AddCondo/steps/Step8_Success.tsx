import { useState } from "react";
import { useAddCondoStore } from "../store/addCondo.store";

async function fakeSubmit(payload: unknown) {
    // TODO: เปลี่ยนเป็น API จริงในอนาคต
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true, payload };
}

export default function Step8_Success({
    onGoHome,
}: {
    onGoHome?: () => void;
}) {
    const floors = useAddCondoStore((s) => s.floors);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState<string>("");

    const handleSubmit = async () => {
        try {
            setStatus("loading");
            setErrorMsg("");

            const payload = { floors }; //payload ที่ Step 8 ส่ง backend
            const res = await fakeSubmit(payload);

            if (!res.ok) throw new Error("Submit failed");
            setStatus("success");
        } catch (e: any) {
            setStatus("error");
            setErrorMsg(e?.message ?? "เกิดข้อผิดพลาด");
        }
    };

    return (
        <div className="p-6">
            <div className="mx-auto max-w-xl rounded-xl border bg-white p-6 text-center shadow-sm">
                <h1 className="text-xl font-semibold">บันทึกข้อมูล</h1>

                {status === "idle" && (
                    <>
                        <p className="mt-2 text-gray-700">กดปุ่มด้านล่างเพื่อบันทึกข้อมูลคอนโดและค่าห้อง</p>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="mt-5 rounded-lg bg-purple-600 px-6 py-2 text-white hover:opacity-95"
                        >
                            บันทึก
                        </button>
                    </>
                )}

                {status === "loading" && (
                    <p className="mt-4 text-gray-700">กำลังบันทึกข้อมูล...</p>
                )}

                {status === "success" && (
                    <>
                        <div className="mt-4 text-green-600">บันทึกสำเร็จ</div>
                        <button
                            type="button"
                            onClick={onGoHome}
                            className="mt-5 rounded-lg bg-slate-900 px-6 py-2 text-white hover:opacity-95"
                        >
                            ไปหน้าหลัก
                        </button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="mt-4 text-red-600">บันทึกไม่สำเร็จ</div>
                        <div className="mt-2 text-sm text-red-500">{errorMsg}</div>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="mt-5 rounded-lg bg-purple-600 px-6 py-2 text-white hover:opacity-95"
                        >
                            ลองใหม่
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
