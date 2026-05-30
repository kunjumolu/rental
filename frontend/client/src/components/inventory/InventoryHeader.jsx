import React from "react";
import { Search, Plus } from "lucide-react";

export default function InventoryHeader({ searchTerm, setSearchTerm, onAddItem }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-[#111827]">Inventory</h1>
        <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-[14px] text-[#6b7280]">
          Manage rental equipment, stock levels, and maintenance
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none sm:w-[200px] md:w-[220px] lg:w-[240px]">
          <Search size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inventory..."
            className="h-[42px] sm:h-[46px] w-full rounded-[12px] border border-[#d1d5db] bg-white pl-10 sm:pl-11 pr-4 text-[14px] outline-none"
          />
        </div>

        <button
          onClick={onAddItem}
          className="h-[42px] sm:h-[46px] px-4 sm:px-5 rounded-[12px] bg-[#2563eb] text-white font-semibold flex items-center gap-2 shrink-0 text-[14px]"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Item</span>
        </button>
      </div>
    </div>
  );
}
