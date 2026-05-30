import React, { useState, useMemo, useEffect } from "react";
import InventoryRow from "./InventoryRow";
import { Eye, Pencil, Wrench, Trash2, Tag, ChevronLeft, ChevronRight } from "lucide-react";

export default function InventoryTable({ items, onView, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage]);

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

  const statusClasses = {
    available: "bg-[#2563eb] text-white",
    low_stock: "bg-[#ef4444] text-white",
    out_of_stock: "bg-[#ef4444] text-white",
    maintenance: "bg-[#f3e8ff] text-[#7c3aed]",
  };

  const formatStatus = (status) => {
    if (status === "low_stock") return "low stock";
    if (status === "out_of_stock") return "out of stock";
    return status;
  };

  return (
    <div className="w-full">

      {/* Mobile Card Layout */}
      <div className="block lg:hidden space-y-3">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className="rounded-[12px] border border-[#e5e7eb] bg-white p-3 sm:p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#eef4ff] flex items-center justify-center shrink-0">
                  <Tag size={16} className="text-[#2563eb]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-[#111827] truncate">{item.name}</div>
                  <div className="text-[12px] text-[#6b7280]">{item.sku}</div>
                </div>
              </div>
              <span
                className={`inline-flex px-2 py-1 rounded-full text-[11px] font-semibold shrink-0 ${
                  statusClasses[item.status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {formatStatus(item.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              <div>
                <span className="text-[#6b7280]">Category: </span>
                <span className="text-[#111827] font-medium">{item.category}</span>
              </div>
              <div>
                <span className="text-[#6b7280]">Daily: </span>
                <span className="text-[#111827] font-medium">₹{Number(item.dailyRate).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#6b7280]">Stock: </span>
                <span className="text-[#10b981] font-semibold">{item.availableQuantity}</span>
                <span className="text-[#111827]"> / {item.totalQuantity}</span>
              </div>
              <div>
                <span className="text-[#6b7280]">Weekly: </span>
                <span className="text-[#111827] font-medium">₹{Number(item.weeklyRate).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f3f4f6]">
              <button onClick={() => onView(item)} className="text-[#111827] hover:text-[#2563eb]" title="View">
                <Eye size={16} />
              </button>
              <button onClick={() => onEdit(item)} className="text-[#111827] hover:text-[#2563eb]" title="Edit">
                <Pencil size={16} />
              </button>
              <button className="text-[#111827] hover:text-[#f59e0b]" title="Maintenance">
                <Wrench size={16} />
              </button>
              <button onClick={() => onDelete(item)} className="text-[#ef4444] hover:text-[#b91c1c]" title="Delete">
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
            <tr className="text-left border-b border-[#e5e7eb]">
              <th className="px-3 xl:px-4 py-4 xl:py-5 text-[13px] xl:text-[14px] font-semibold text-[#111827]">
                Item
              </th>
              <th className="px-3 xl:px-4 py-4 xl:py-5 text-[13px] xl:text-[14px] font-semibold text-[#111827]">
                Category
              </th>
              <th className="px-3 xl:px-4 py-4 xl:py-5 text-[13px] xl:text-[14px] font-semibold text-[#111827]">
                Rates
              </th>
              <th className="px-3 xl:px-4 py-4 xl:py-5 text-[13px] xl:text-[14px] font-semibold text-[#111827]">
                Stock
              </th>
              <th className="px-3 xl:px-4 py-4 xl:py-5 text-[13px] xl:text-[14px] font-semibold text-[#111827]">
                Status
              </th>
              <th className="px-3 xl:px-4 py-4 xl:py-5 text-[13px] xl:text-[14px] font-semibold text-[#111827]">
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
      </div>

      {/* Simple Pagination — arrows only */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-200">
          <p className="text-[12px] sm:text-[13px] text-[#6b7280]">
            Showing{" "}
            <span className="font-semibold text-[#111827]">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>
            {" "}to{" "}
            <span className="font-semibold text-[#111827]">
              {Math.min(currentPage * itemsPerPage, items.length)}
            </span>
            {" "}of{" "}
            <span className="font-semibold text-[#111827]">{items.length}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-[8px] border border-[#d1d5db] flex items-center justify-center text-[#6b7280] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f3f4f6] transition"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-[12px] sm:text-[13px] font-medium text-[#374151] min-w-[60px] text-center">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-[8px] border border-[#d1d5db] flex items-center justify-center text-[#6b7280] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f3f4f6] transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
