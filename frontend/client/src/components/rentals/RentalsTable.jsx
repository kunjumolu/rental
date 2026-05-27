import React, { useState, useMemo, useEffect } from "react";
import RentalRow from "./RentalRow";

export default function RentalsTable({
  rentals,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(rentals.length / itemsPerPage);

  const paginatedRentals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return rentals.slice(startIndex, startIndex + itemsPerPage);
  }, [rentals, currentPage]);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [rentals, currentPage, totalPages]);

  return (
    <div className="w-full">
      <table className="w-full">
        <thead>
          <tr className="text-left">
            <th className="px-4 py-5 text-[14px] font-semibold text-[#111827]">
              Order #
            </th>
            <th className="px-4 py-5 text-[14px] font-semibold text-[#111827]">
              Customer
            </th>
            <th className="px-4 py-5 text-[14px] font-semibold text-[#111827]">
              Items
            </th>
            <th className="px-4 py-5 text-[14px] font-semibold text-[#111827]">
              Period
            </th>
            <th className="px-4 py-5 text-[14px] font-semibold text-[#111827]">
              Total
            </th>
            <th className="px-4 py-5 text-[14px] font-semibold text-[#111827]">
              Balance
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
          {paginatedRentals.map((rental) => (
            <RentalRow
              key={rental.id}
              rental={rental}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
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
              {Math.min(currentPage * itemsPerPage, rentals.length)}
            </span>{" "}
            of <span className="font-medium">{rentals.length}</span> results
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