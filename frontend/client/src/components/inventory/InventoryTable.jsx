import React, { useState, useMemo, useEffect } from "react";
import InventoryRow from "./InventoryRow";

export default function InventoryTable({ items, onView, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage]);

  // Reset to page 1 if items change and current page is out of range
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [items, currentPage, totalPages]);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-[#e5e7eb]">
            <th className="px-4 py-5 text-[14px] font-semibold text-[#111827]">
              Item
            </th>
            <th className="px-4 py-5 text-[14px] font-semibold text-[#111827]">
              Category
            </th>
            <th className="px-4 py-5 text-[14px] font-semibold text-[#111827]">
              Rates
            </th>
            <th className="px-4 py-5 text-[14px] font-semibold text-[#111827]">
              Stock
            </th>
            <th className="px-4 py-5 text-[14px] font-semibold text-[#111827]">
              Status
            </th>
            <th className="px-4 py-5 text-[14px] font-semibold text-[#111827]">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {paginatedItems.map((item) => (
            <InventoryRow
              key={item.id}
              item={item}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, items.length)}
            </span>{" "}
            of <span className="font-medium">{items.length}</span> results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={`px-3 py-1 text-sm font-medium rounded border ${
                  currentPage === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}