import { useState } from "react";

import BillingFilter from "./componentsbill/BillingFilter";
import BillingTable from "./componentsbill/BillingTable";
import InvoiceDetail from "./InvoiceDetail";

import { mockBillingData as initialData } from "./mock";
import type { BillingItem } from "./types";
import OwnerShell from "@/features/owner/components/OwnerShell";

export default function BillingPage() {
  /* ==================== state ==================== */
  const [billingData, setBillingData] = useState<BillingItem[]>(initialData);
  const [selectedItem, setSelectedItem] = useState<BillingItem | null>(null);

  /* ==================== handlers ==================== */
  const handleCompletePayment = (id: string) => {
    setBillingData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPaid: true } : item
      )
    );
    setSelectedItem(null);
  };

  /* ==================== invoice detail ==================== */
  if (selectedItem) {
    return (
      <OwnerShell activeKey="billing" showSidebar>
        <div className="max-w-7xl mx-auto pt-10 px-6">
          <InvoiceDetail
            item={selectedItem}
            onBack={() => setSelectedItem(null)}
            onComplete={() => handleCompletePayment(selectedItem.id)}
          />
        </div>
      </OwnerShell>
    );
  }

  /* ==================== billing list ==================== */
  return (
    <OwnerShell activeKey="billing" showSidebar>
      <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pt-10 px-6">

      {/* ===== Stepper ===== */}
      <div className="flex justify-center items-center mb-12">
        <div className="flex items-center w-full max-w-xl">

          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-medium">
              1. เลือกวันจดมิเตอร์
            </span>
          </div>

          <div className="flex-grow h-[1px] bg-gray-200 mx-4 -mt-7" />

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mb-2 text-white font-bold">
              2
            </div>
            <span className="text-purple-600 text-sm font-bold">
              2. สร้างใบแจ้งหนี้
            </span>
          </div>
        </div>
      </div>

      {/* ===== Search Bar ===== */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          placeholder="ค้นหาเลขห้อง"
          className="
            w-full
            bg-white
            rounded-2xl
            border-0
            py-4
            pl-12
            pr-4
            shadow-sm
            focus:ring-1
            focus:ring-purple-400
            focus:outline-none
            text-gray-600
          "
        />
      </div>

      {/* ===== Filters ===== */}
      <BillingFilter />

      {/* ===== Table ===== */}
        <BillingTable
          data={billingData}
          onSelect={(item) => setSelectedItem(item)}
        />
      </div>
    </OwnerShell>
  );
}
