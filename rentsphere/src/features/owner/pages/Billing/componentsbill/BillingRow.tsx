import BillingStatus from "./BillingStatus";
import type { BillingItem } from "../types";


/* ==================== types ==================== */
interface BillingRowProps {
  item: BillingItem;
  onSelect: (item: BillingItem) => void;
}


/* ==================== component ==================== */
export default function BillingRow({ item, onSelect }: BillingRowProps) {
  /* ===== derived state ===== */
  const isOccupied = item.status === "ไม่ว่าง";
  const canCreateInvoice = isOccupied && !item.isPaid;

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">

      {/* ===== ห้อง ===== */}
      <td className="px-6 py-6 text-[#1E293B] font-bold text-xl">
        {item.roomNumber}
      </td>

      {/* ===== สถานะ ===== */}
      <td className="px-6 py-6">
        <BillingStatus status={item.status} />
      </td>

      {/* ===== มิเตอร์น้ำ ===== */}
      <td className="px-6 py-6">
        {isOccupied && item.waterMeter ? (
          <div className="text-[#1E293B]">
            <div className="font-semibold text-base">
              {item.waterMeter.totalUnits} หน่วย
            </div>
            <div className="text-gray-400 text-xs">
              ยูนิต {item.waterMeter.previous} - {item.waterMeter.current}
            </div>
          </div>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>

      {/* ===== มิเตอร์ไฟ ===== */}
      <td className="px-6 py-6">
        {isOccupied && item.elecMeter ? (
          <div className="text-[#1E293B]">
            <div className="font-semibold text-base">
              {item.elecMeter.totalUnits} หน่วย
            </div>
            <div className="text-gray-400 text-xs">
              ยูนิต {item.elecMeter.previous} - {item.elecMeter.current}
            </div>
          </div>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>

      {/* ===== ยอดรวม ===== */}
      <td className="px-6 py-6">
        {isOccupied ? (
          <div className="flex items-center text-[#8B5CF6] font-bold text-lg">
            <span className="mr-1">฿</span>
            <span>{item.estimatedTotal.toLocaleString()}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">
            ห้องว่าง ไม่สามารถสร้างใบแจ้งหนี้ได้
          </span>
        )}
      </td>

      {/* ===== การจัดการ ===== */}
      <td className="px-6 py-6 text-right">
        {canCreateInvoice ? (
          <button
            onClick={() => onSelect(item)}
            className="
              text-white
              px-6 py-2.5
              !rounded-2xl
              text-sm
              font-medium
              !shadow-sm
              !transition-all
              !hover:bg-[#7C3AED]
            "
            style={{ backgroundColor: "#7C3AED" }}
          >
            สร้างใบแจ้งหนี้
          </button>
        ) : (
          <button
            disabled
            className="
              bg-[#E3E3E3]
              text-[#CBD5E1]
              px-6 py-2.5
              !rounded-2xl
              text-sm
              font-medium
              cursor-not-allowed
            "
          >
            สร้างใบแจ้งหนี้
          </button>
        )}
      </td>
    </tr>
  );
}