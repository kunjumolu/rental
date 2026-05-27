import React from "react";
import { Search, Plus } from "lucide-react";

export default function InvoicesHeader({ searchTerm, setSearchTerm, onNewInvoice }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[24px] font-bold text-[#111827]">
          Invoices & Billing
        </h1>
        <p className="mt-1 text-[14px] text-[#6b7280]">
          Create, manage, and track invoices and payments
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-[250px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoices..."
            className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] bg-white pl-11 pr-4 text-[14px] outline-none"
          />
        </div>

        <button
          onClick={onNewInvoice}
          className="h-[46px] px-5 rounded-[12px] bg-[#2563eb] text-white font-semibold flex items-center gap-2"
        >
          <Plus size={18} />
          New Invoice
        </button>
      </div>
    </div>
  );
}