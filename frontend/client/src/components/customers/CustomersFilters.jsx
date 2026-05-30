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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative w-full sm:w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full h-[30px] sm:h-[32px] rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-[11px] sm:text-xs text-gray-700 outline-none" />
        </div>

        <div className="relative shrink-0" ref={filterRef}>
          <button type="button" onClick={() => setShowSortMenu((prev) => !prev)}
            className="h-[30px] sm:h-[32px] px-3 rounded-lg border border-gray-300 bg-white text-[11px] sm:text-xs text-gray-600 font-medium flex items-center gap-2 whitespace-nowrap">
            <SlidersHorizontal size={12} />
            Filters
          </button>

          {showSortMenu && (
            <div className="absolute left-0 top-[36px] z-20 w-[200px] sm:w-[220px] rounded-[10px] border border-gray-200 bg-white shadow-lg p-2">
              <p className="px-2 py-1 text-[11px] font-semibold text-gray-500">Sort By</p>

              <button type="button" onClick={() => { setSortOption("recent"); setShowSortMenu(false); }}
                className={`w-full text-left px-3 py-2 rounded-md text-xs ${
                  sortOption === "recent" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}>
                Recently Added
              </button>

              <button type="button" onClick={() => { setSortOption("name_asc"); setShowSortMenu(false); }}
                className={`w-full text-left px-3 py-2 rounded-md text-xs ${
                  sortOption === "name_asc" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}>
                Alphabetical (asc)
              </button>

              <button type="button" onClick={() => { setSortOption("name_desc"); setShowSortMenu(false); }}
                className={`w-full text-left px-3 py-2 rounded-md text-xs ${
                  sortOption === "name_desc" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}>
                Alphabetical (desc)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-600">Status:</span>
        <div className="h-[30px] sm:h-[32px] rounded-lg border border-gray-300 bg-gray-50 flex items-center p-[2px] gap-[2px]">
          <button type="button" onClick={() => setStatusFilter("all")}
            className={`px-3 sm:px-4 h-full rounded-md text-[11px] font-semibold ${
              statusFilter === "all" ? "bg-blue-100 text-blue-700" : "text-gray-600"
            }`}>
            All
          </button>
          <button type="button" onClick={() => setStatusFilter("active")}
            className={`px-3 sm:px-4 h-full rounded-md text-[11px] font-semibold ${
              statusFilter === "active" ? "bg-blue-100 text-blue-700" : "text-gray-600"
            }`}>
            Active
          </button>
          <button type="button" onClick={() => setStatusFilter("inactive")}
            className={`px-3 sm:px-4 h-full rounded-md text-[11px] font-semibold ${
              statusFilter === "inactive" ? "bg-blue-100 text-blue-700" : "text-gray-600"
            }`}>
            Inactive
          </button>
        </div>
      </div>
    </div>
  );
}
