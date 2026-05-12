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
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-6 h-6 rounded border text-[11px] ${
            currentPage === i
              ? "border-[#3b82f6] bg-[#dbeafe] text-[#1d4ed8] font-semibold"
              : "border-[#d1d5db] bg-white text-[#4b5563]"
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="px-4 h-[48px] flex items-center justify-between">
      <p className="text-[12px] text-[#4b5563]">
        Showing {startItem} to {endItem} of {totalItems} results
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-6 h-6 rounded border border-[#d1d5db] flex items-center justify-center text-[#4b5563] bg-white disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="w-6 h-6 rounded border border-[#d1d5db] flex items-center justify-center text-[#4b5563] bg-white disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}