import React from "react";
import { Search, Plus } from "lucide-react";

export default function VendorsHeader({ searchTerm, setSearchTerm, onNewVendor }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[24px] font-bold text-[#111827]">Vendors</h1>
        <p className="mt-1 text-[14px] text-[#6b7280]">
          Manage your supplier and vendor records
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-[240px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendors..."
            className="h-[42px] w-full rounded-[12px] border border-[#d1d5db] pl-9 pr-4 outline-none text-[14px]"
          />
        </div>

        <button
          onClick={onNewVendor}
          className="h-[42px] px-5 rounded-[12px] bg-[#6B21A8] text-white text-[14px] font-semibold flex items-center gap-2 hover:bg-[#581c87] transition"
        >
          <Plus size={16} />
          New Vendor
        </button>
      </div>
    </div>
  );
}