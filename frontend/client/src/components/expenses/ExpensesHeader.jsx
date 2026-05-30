import React from "react";
import { Search, Plus } from "lucide-react";

export default function ExpensesHeader({ searchTerm, setSearchTerm, onNewExpense }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-[#111827]">All Expenses</h1>
        <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-[14px] text-[#6b7280]">
          Track and manage your business expenses
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none sm:w-[200px] md:w-[220px] lg:w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses..."
            className="h-[40px] sm:h-[42px] w-full rounded-[12px] border border-[#d1d5db] pl-9 pr-4 outline-none text-[14px]"
          />
        </div>
        <button
          onClick={onNewExpense}
          className="h-[40px] sm:h-[42px] px-4 sm:px-5 rounded-[12px] bg-[#6B21A8] text-white text-[14px] font-semibold flex items-center gap-2 hover:bg-[#581c87] transition shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>
    </div>
  );
}
