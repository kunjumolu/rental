import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Eye, Pencil, Trash2, CheckCircle, Printer } from "lucide-react";
import InvoiceRow from "./InvoiceRow";
import { formatCurrency } from "../../utils/currency";
import { printInvoice } from "../../utils/printInvoice";

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

  const statusClasses = {
    paid: "bg-[#2563eb] text-white",
    overdue: "bg-[#ef4444] text-white",
    sent: "bg-[#f3f4f6] text-[#111827]",
    draft: "bg-[#f3f4f6] text-[#111827]",
  };

  return (
    <div className="w-full">

      {/* Mobile Card Layout */}
      <div className="block lg:hidden space-y-3">
        {currentInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="rounded-[12px] border border-[#e5e7eb] bg-white p-3 sm:p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-[#111827] truncate">{invoice.invoiceNumber}</p>
                <p className="text-[13px] text-[#6b7280] truncate">{invoice.customerName}</p>
              </div>
              <span
                className={`inline-flex px-2 py-1 rounded-full text-[11px] font-semibold shrink-0 ${
                  statusClasses[invoice.status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {invoice.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
              <div>
                <span className="text-[#6b7280]">Issue: </span>
                <span className="text-[#111827]">{invoice.issueDate}</span>
              </div>
              <div>
                <span className="text-[#6b7280]">Due: </span>
                <span className="text-[#111827]">{invoice.dueDate}</span>
              </div>
              <div>
                <span className="text-[#6b7280]">Total: </span>
                <span className="text-[#111827] font-medium">{formatCurrency(invoice.total)}</span>
              </div>
              <div>
                <span className="text-[#6b7280]">Balance: </span>
                <span className={`font-medium ${Number(invoice.balance) > 0 ? "text-[#ef4444]" : "text-[#10b981]"}`}>
                  {formatCurrency(invoice.balance)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f3f4f6]">
              <button onClick={() => onView(invoice)} className="text-[#111827] hover:text-[#2563eb]" title="View">
                <Eye size={16} />
              </button>
              <button onClick={() => onEdit(invoice)} className="text-[#111827] hover:text-[#2563eb]" title="Edit">
                <Pencil size={16} />
              </button>
              <button
                onClick={() => { if (onPrint) onPrint(invoice); else printInvoice(invoice); }}
                className="text-[#6B21A8] hover:text-[#581c87]" title="Print"
              >
                <Printer size={16} />
              </button>
              {invoice.balance > 0 && (
                <button onClick={() => onMarkPaid(invoice)} className="text-[#10b981] hover:text-[#059669]" title="Mark Paid">
                  <CheckCircle size={16} />
                </button>
              )}
              <button onClick={() => onDelete(invoice)} className="text-[#ef4444] hover:text-[#b91c1c]" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-[#e5e7eb] bg-[#f9fafb]">
              <th className="px-3 xl:px-4 py-3 xl:py-4 text-[12px] xl:text-[13px] font-semibold text-[#6b7280]">Invoice #</th>
              <th className="px-3 xl:px-4 py-3 xl:py-4 text-[12px] xl:text-[13px] font-semibold text-[#6b7280]">Customer</th>
              <th className="px-3 xl:px-4 py-3 xl:py-4 text-[12px] xl:text-[13px] font-semibold text-[#6b7280]">Issue Date</th>
              <th className="px-3 xl:px-4 py-3 xl:py-4 text-[12px] xl:text-[13px] font-semibold text-[#6b7280]">Due Date</th>
              <th className="px-3 xl:px-4 py-3 xl:py-4 text-[12px] xl:text-[13px] font-semibold text-[#6b7280]">Total</th>
              <th className="px-3 xl:px-4 py-3 xl:py-4 text-[12px] xl:text-[13px] font-semibold text-[#6b7280]">Balance</th>
              <th className="px-3 xl:px-4 py-3 xl:py-4 text-[12px] xl:text-[13px] font-semibold text-[#6b7280]">Status</th>
              <th className="px-3 xl:px-4 py-3 xl:py-4 text-[12px] xl:text-[13px] font-semibold text-[#6b7280]">Actions</th>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 sm:py-4 border-t border-[#e5e7eb]">
          <p className="text-[12px] sm:text-[13px] text-[#6b7280] order-2 sm:order-1">
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

          <div className="flex items-center gap-1 order-1 sm:order-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-[8px] border border-[#d1d5db] flex items-center justify-center text-[#6b7280] disabled:opacity-40 hover:bg-[#f3f4f6] transition"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={`dots-${index}`}
                  className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center text-[#6b7280] text-[12px] sm:text-[13px]"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-[8px] border text-[12px] sm:text-[13px] font-medium transition ${
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
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-[8px] border border-[#d1d5db] flex items-center justify-center text-[#6b7280] disabled:opacity-40 hover:bg-[#f3f4f6] transition"
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
