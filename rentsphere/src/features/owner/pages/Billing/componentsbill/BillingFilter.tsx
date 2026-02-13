/* ==================== component ==================== */
export default function BillingFilter() {
  return (
    <div
      className="
        bg-white
        rounded-3xl
        p-8
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
      {/* ===== รอบบิล ===== */}
      <div className="flex items-center gap-4">
        <span className="text-[#64748B] font-medium">
          รอบบิล:
        </span>

        <div className="relative">
          <select
            className="
              appearance-none
              border
              border-gray-200
              rounded-xl
              px-5
              py-2.5
              pr-12
              bg-white
              min-w-[140px]
              text-[#1E293B]
              font-medium
              transition-all
              focus:outline-none
              focus:ring-2
              focus:ring-purple-100
            "
          >
            <option>27-2025</option>
          </select>

          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ===== divider ===== */}
      <div className="h-10 w-[1px] bg-gray-100 hidden lg:block" />

      {/* ===== ค่าน้ำ ===== */}
      <div className="flex items-center gap-4">
        <span className="text-[#64748B] font-medium whitespace-nowrap">
          ค่าน้ำ (บาท/หน่วย):
        </span>

        <input
          type="text"
          defaultValue="18"
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
            transition-all
            focus:outline-none
            focus:ring-2
            focus:ring-purple-100
          "
        />
      </div>

      {/* ===== ค่าไฟ ===== */}
      <div className="flex items-center gap-4">
        <span className="text-[#64748B] font-medium whitespace-nowrap">
          ค่าไฟ (บาท/หน่วย):
        </span>

        <input
          type="text"
          defaultValue="7"
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
            transition-all
            focus:outline-none
            focus:ring-2
            focus:ring-purple-100
          "
        />
      </div>
    </div>
  );
}