import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import InvoiceRow from "./InvoiceRow";

const ITEMS_PER_PAGE = 10;

export default function InvoicesTable({
  invoices,
  onView,
  onEdit,
  onDelete,
  onMarkPaid,
  onPrint,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [invoices]);

  const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInvoices = invoices.slice(startIndex, endIndex);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePageClick = (page) => setCurrentPage(page);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-[#e5e7eb] bg-[#f9fafb]">
              <th className="px-4 py-4 text-[13px] font-semibold text-[#6b7280]">Invoice #</th>
              <th className="px-4 py-4 text-[13px] font-semibold text-[#6b7280]">Customer</th>
              <th className="px-4 py-4 text-[13px] font-semibold text-[#6b7280]">Issue Date</th>
              <th className="px-4 py-4 text-[13px] font-semibold text-[#6b7280]">Due Date</th>
              <th className="px-4 py-4 text-[13px] font-semibold text-[#6b7280]">Total</th>
              <th className="px-4 py-4 text-[13px] font-semibold text-[#6b7280]">Balance</th>
              <th className="px-4 py-4 text-[13px] font-semibold text-[#6b7280]">Status</th>
              <th className="px-4 py-4 text-[13px] font-semibold text-[#6b7280]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentInvoices.map((invoice) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onMarkPaid={onMarkPaid}
                onPrint={onPrint}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-[#e5e7eb]">
          <p className="text-[13px] text-[#6b7280]">
            Showing{" "}
            <span className="font-semibold text-[#111827]">{startIndex + 1}</span>{" "}
            to{" "}
            <span className="font-semibold text-[#111827]">
              {Math.min(endIndex, invoices.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#111827]">{invoices.length}</span>{" "}
            results
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-[8px] border border-[#d1d5db] flex items-center justify-center text-[#6b7280] disabled:opacity-40 hover:bg-[#f3f4f6] transition"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={`dots-${index}`}
                  className="h-8 w-8 flex items-center justify-center text-[#6b7280] text-[13px]"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`h-8 w-8 rounded-[8px] border text-[13px] font-medium transition ${
                    currentPage === page
                      ? "bg-[#2563eb] text-white border-[#2563eb]"
                      : "border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6]"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-[8px] border border-[#d1d5db] flex items-center justify-center text-[#6b7280] disabled:opacity-40 hover:bg-[#f3f4f6] transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {invoices.length === 0 && (
        <div className="p-6 text-center text-[14px] text-[#6b7280]">
          No invoices found.
        </div>
      )}
    </div>
  );
}