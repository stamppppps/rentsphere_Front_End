import ReviewBlock from "../components/ReviewBlock";
import { useAddCondoStore } from "../store/addCondo.store";

export default function Step7_Review({
    onBack,
    onNext,
}: {
    onBack?: () => void;
    onNext?: () => void;
}) {
    const floors = useAddCondoStore((s) => s.floors);

    return (
        <div className="p-6">
            <div className="mx-auto max-w-5xl">
                <h1 className="mb-4 text-center text-xl font-semibold">สรุปข้อมูลก่อนบันทึก</h1>

                <ReviewBlock floors={floors} />

                <div className="mt-6 flex justify-between">
                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-lg border px-6 py-2 hover:bg-gray-50"
                    >
                        ย้อนกลับ
                    </button>

                    <button
                        type="button"
                        onClick={onNext}
                        className="rounded-lg bg-purple-500 px-6 py-2 text-white shadow hover:opacity-95"
                    >
                        ยืนยัน
                    </button>
                </div>
            </div>
        </div>
    );
}
