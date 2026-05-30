import React from "react";
import { Search, Plus } from "lucide-react";

export default function RentalsHeader({ searchTerm, setSearchTerm, onNewOrder }) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-[#111827]">Rental Orders</h1>
          <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-[14px] text-[#6b7280]">
            Manage rental transactions from booking to return
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-[200px] md:w-[230px] lg:w-[260px]">
            <Search size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search orders..."
              className="h-[40px] sm:h-[44px] w-full rounded-[12px] border border-[#d1d5db] bg-white pl-10 sm:pl-11 pr-4 text-[14px] outline-none"
            />
          </div>

          <button
            onClick={onNewOrder}
            className="h-[40px] sm:h-[44px] px-4 sm:px-5 rounded-[12px] bg-[#2563eb] text-white font-semibold flex items-center gap-2 shrink-0 text-[14px]"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Order</span>
          </button>
        </div>
      </div>
    </>
  );
}
