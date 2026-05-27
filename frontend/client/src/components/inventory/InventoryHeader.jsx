import React from "react";
import { Search, Plus } from "lucide-react";

export default function InventoryHeader({ searchTerm, setSearchTerm, onAddItem }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[24px] font-bold text-[#111827]">Inventory</h1>
        <p className="mt-1 text-[14px] text-[#6b7280]">
          Manage rental equipment, stock levels, and maintenance
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-[240px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inventory..."
            className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] bg-white pl-11 pr-4 text-[14px] outline-none"
          />
        </div>

        <button
          onClick={onAddItem}
          className="h-[46px] px-5 rounded-[12px] bg-[#2563eb] text-white font-semibold flex items-center gap-2"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>
    </div>
  );
}