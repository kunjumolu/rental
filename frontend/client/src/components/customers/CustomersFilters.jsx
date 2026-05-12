import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export default function CustomersFilters() {
  return (
    <div className="px-4 pt-4 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative w-[190px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
          />
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="w-full h-[30px] rounded-[8px] border border-[#cfd6e4] bg-white pl-9 pr-3 text-[11px] text-[#374151] outline-none"
          />
        </div>

        <button className="h-[30px] px-3 rounded-[7px] border border-[#cfd6e4] bg-white text-[11px] text-[#4b5563] font-medium flex items-center gap-2">
          <SlidersHorizontal size={12} />
          Filters
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#4b5563]">Status:</span>

        <div className="h-[30px] rounded-[8px] border border-[#cfd6e4] bg-[#f8fafc] flex items-center p-[2px] gap-[2px]">
          <button className="px-4 h-full rounded-[6px] bg-[#dbeafe] text-[#0f4aa8] text-[11px] font-semibold">
            All
          </button>
          <button className="px-4 h-full rounded-[6px] text-[#4b5563] text-[11px] font-medium">
            Active
          </button>
          <button className="px-4 h-full rounded-[6px] text-[#4b5563] text-[11px] font-medium">
            Inactive
          </button>
        </div>
      </div>
    </div>
  );
}