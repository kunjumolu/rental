import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomersPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button key={i} onClick={() => onPageChange(i)}
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded border text-[11px] sm:text-xs ${
            currentPage === i
              ? "border-blue-500 bg-blue-100 text-blue-700 font-semibold"
              : "border-gray-300 bg-white text-gray-600"
          }`}>
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="px-3 sm:px-4 h-[44px] sm:h-[48px] flex items-center justify-between">
      <p className="text-[11px] sm:text-xs text-gray-600">
        Showing {startItem} to {endItem} of {totalItems} results
      </p>

      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 bg-white disabled:opacity-40">
          <ChevronLeft size={14} />
        </button>

        {renderPageNumbers()}

        <button onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 bg-white disabled:opacity-40">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
