import React from "react";
import type { BillingItem } from "../types";

interface InvoiceInfoProps {
  item: BillingItem;
  isPaid: boolean;
}

function formatThaiDate(value?: string) {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";

  return dt.toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInvoiceStatusLabel(item: BillingItem, isPaid: boolean) {
  if (isPaid || item.isPaid) {
    return {
      text: "ชำระแล้ว",
      className: "bg-[#DCFCE7] text-[#22C55E]",
    };
  }

  const status = String(item.invoiceStatus || "").toUpperCase();

  if (status === "ISSUED") {
    return {
      text: "ออกบิลแล้ว",
      className: "bg-blue-50 text-blue-600",
    };
  }

  if (status === "OVERDUE") {
    return {
      text: "ค้างชำระ",
      className: "bg-red-50 text-red-500",
    };
  }

  if (status === "CANCELLED") {
    return {
      text: "ยกเลิก",
      className: "bg-gray-100 text-gray-500",
    };
  }

  return {
    text: "ฉบับร่าง",
    className: "bg-amber-50 text-amber-600",
  };
}

const InvoiceInfo: React.FC<InvoiceInfoProps> = ({ item, isPaid }) => {
  const statusInfo = getInvoiceStatusLabel(item, isPaid);

  const invoiceNo =
    item.invoiceNo ||
    (item.invoiceId
      ? `INV-${item.invoiceId.slice(-8).toUpperCase()}`
      : `DRAFT-${item.roomNumber}`);

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-6 mb-12">
      <div className="space-y-2">
        <h2 className="text-[#8B5CF6] text-xl font-bold">
          {item.condoName || "RentSphere"}
        </h2>

        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
          {item.condoAddress || ""}
          {item.condoAddress ? <br /> : null}
          {item.tenantName ? `ผู้เช่า: ${item.tenantName}` : ""}
        </p>
      </div>

      <div className="text-left sm:text-right space-y-1">
        <div className="flex items-center sm:justify-end gap-2 mb-2">
          <span className="text-gray-400 text-sm">สถานะ:</span>
          <span className={`${statusInfo.className} text-xs px-2 py-0.5 rounded-md font-bold`}>
            {statusInfo.text}
          </span>
        </div>

        <div className="text-sm">
          <span className="text-gray-400 font-medium">เลขที่:</span>{" "}
          <span className="text-[#1E293B] font-semibold">{invoiceNo}</span>
        </div>

        <div className="text-sm">
          <span className="text-gray-400 font-medium">ห้อง:</span>{" "}
          <span className="text-[#1E293B] font-bold">{item.roomNumber}</span>
        </div>

        <div className="text-sm">
          <span className="text-gray-400 font-medium">วันที่ออกบิล:</span>{" "}
          <span className="text-[#1E293B] font-semibold">
            {formatThaiDate(item.invoiceDate)}
          </span>
        </div>

        <div className="text-sm">
          <span className="text-gray-400 font-medium">รอบบิล:</span>{" "}
          <span className="text-[#1E293B] font-semibold">
            {formatThaiDate(item.billingMonth)}
          </span>
        </div>

        <div className="text-sm">
          <span className="text-gray-400 font-medium">ครบกำหนด:</span>{" "}
          <span className="text-[#1E293B] font-semibold">
            {formatThaiDate(item.dueDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceInfo;