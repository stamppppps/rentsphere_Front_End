interface BillingFilterProps {
  waterRate: number;
  electricRate: number;
  selectedMonth: string;
}

function monthLabelFromInput(value: string) {
  const [year, month] = value.split("-").map(Number);

  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  if (!year || !month) return value;
  return `${months[month - 1]} ${year + 543}`;
}

export default function BillingFilter({
  waterRate,
  electricRate,
  selectedMonth,
}: BillingFilterProps) {
  return (
    <div
      className="
        bg-white
        rounded-3xl
        p-6 md:p-8
        shadow-sm
        border
        border-gray-100
        flex
        flex-wrap
        items-center
        gap-x-12
        gap-y-4
        mb-8
      "
    >
      <div className="flex items-center gap-4">
        <span className="text-[#64748B] font-medium whitespace-nowrap">
          รอบบิล:
        </span>

        <div className="px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1E293B] font-semibold">
          {monthLabelFromInput(selectedMonth)}
        </div>
      </div>

      <div className="h-10 w-[1px] bg-gray-100 hidden lg:block" />

      <div className="flex items-center gap-4">
        <span className="text-[#64748B] font-medium whitespace-nowrap">
          ค่าน้ำ (บาท/หน่วย):
        </span>

        <input
          type="text"
          value={waterRate}
          readOnly
          aria-label="อัตราค่าน้ำ"
          className="
            w-20
            bg-white
            border
            border-gray-200
            rounded-xl
            px-4
            py-2.5
            text-center
            text-[#1E293B]
            font-semibold
            focus:outline-none
          "
        />
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[#64748B] font-medium whitespace-nowrap">
          ค่าไฟ (บาท/หน่วย):
        </span>

        <input
          type="text"
          value={electricRate}
          readOnly
          aria-label="อัตราค่าไฟ"
          className="
            w-20
            bg-white
            border
            border-gray-200
            rounded-xl
            px-4
            py-2.5
            text-center
            text-[#1E293B]
            font-semibold
            focus:outline-none
          "
        />
      </div>
    </div>
  );
}