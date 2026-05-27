import React, { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export default function CustomersFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortOption,
  setSortOption,
}) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="px-4 pt-4 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full h-[30px] rounded-[8px] border border-[#cfd6e4] bg-white pl-9 pr-3 text-[11px] text-[#374151] outline-none"
          />
        </div>

        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setShowSortMenu((prev) => !prev)}
            className="h-[30px] px-3 rounded-[7px] border border-[#cfd6e4] bg-white text-[11px] text-[#4b5563] font-medium flex items-center gap-2"
          >
            <SlidersHorizontal size={12} />
            Filters
          </button>

          {showSortMenu && (
            <div className="absolute left-0 top-[36px] z-20 w-[220px] rounded-[10px] border border-[#d9deea] bg-white shadow-lg p-2">
              <p className="px-2 py-1 text-[11px] font-semibold text-[#6b7280]">
                Sort By
              </p>

              <button
                type="button"
                onClick={() => {
                  setSortOption("recent");
                  setShowSortMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-[6px] text-[12px] ${
                  sortOption === "recent"
                    ? "bg-[#dbeafe] text-[#0f4aa8]"
                    : "text-[#374151] hover:bg-[#f3f4f6]"
                }`}
              >
                Recently Added
              </button>

              <button
                type="button"
                onClick={() => {
                  setSortOption("name_asc");
                  setShowSortMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-[6px] text-[12px] ${
                  sortOption === "name_asc"
                    ? "bg-[#dbeafe] text-[#0f4aa8]"
                    : "text-[#374151] hover:bg-[#f3f4f6]"
                }`}
              >
                Alphabetical (asc)
              </button>

              <button
                type="button"
                onClick={() => {
                  setSortOption("name_desc");
                  setShowSortMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-[6px] text-[12px] ${
                  sortOption === "name_desc"
                    ? "bg-[#dbeafe] text-[#0f4aa8]"
                    : "text-[#374151] hover:bg-[#f3f4f6]"
                }`}
              >
                Alphabetical (desc)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#4b5563]">Status:</span>

        <div className="h-[30px] rounded-[8px] border border-[#cfd6e4] bg-[#f8fafc] flex items-center p-[2px] gap-[2px]">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-4 h-full rounded-[6px] text-[11px] font-semibold ${
              statusFilter === "all"
                ? "bg-[#dbeafe] text-[#0f4aa8]"
                : "text-[#4b5563]"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-4 h-full rounded-[6px] text-[11px] font-semibold ${
              statusFilter === "active"
                ? "bg-[#dbeafe] text-[#0f4aa8]"
                : "text-[#4b5563]"
            }`}
          >
            Active
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={`px-4 h-full rounded-[6px] text-[11px] font-semibold ${
              statusFilter === "inactive"
                ? "bg-[#dbeafe] text-[#0f4aa8]"
                : "text-[#4b5563]"
            }`}
          >
            Inactive
          </button>
        </div>
      </div>
    </div>
  );
}