import React from "react";
import { Eye, Pencil, Wrench, Trash2, Tag } from "lucide-react";

export default function InventoryRow({ item, onView, onEdit, onDelete }) {
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
    <tr className="border-t border-[#e5e7eb]">
      <td className="px-3 lg:px-4 py-3 lg:py-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-[36px] h-[36px] lg:w-[40px] lg:h-[40px] rounded-[10px] lg:rounded-[12px] bg-[#eef4ff] flex items-center justify-center shrink-0">
            <Tag size={16} className="text-[#2563eb] lg:hidden" />
            <Tag size={18} className="text-[#2563eb] hidden lg:block" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] lg:text-[14px] font-medium text-[#111827] truncate">
              {item.name}
            </div>
            <div className="text-[11px] lg:text-[12px] text-[#6b7280]">{item.sku}</div>
          </div>
        </div>
      </td>

      <td className="px-3 lg:px-4 py-3 lg:py-4 text-[13px] lg:text-[14px] text-[#111827]">
        {item.category}
      </td>

      <td className="px-3 lg:px-4 py-3 lg:py-4 text-[13px] lg:text-[14px] text-[#6b7280]">
        <div>D: ₹{Number(item.dailyRate).toFixed(2)}</div>
        <div>W: ₹{Number(item.weeklyRate).toFixed(2)}</div>
      </td>

      <td className="px-3 lg:px-4 py-3 lg:py-4 text-[13px] lg:text-[14px]">
        <div className="text-[#111827]">
          <span className="text-[#10b981] font-semibold">
            {item.availableQuantity}
          </span>{" "}
          / {item.totalQuantity}
        </div>
        <div className="text-[#6b7280] text-[11px] lg:text-[12px]">
          {item.rentedQuantity} rented, {item.maintenanceQuantity} maint.
        </div>
      </td>

      <td className="px-3 lg:px-4 py-3 lg:py-4">
        <span
          className={`inline-flex px-2 lg:px-3 py-1 rounded-full text-[11px] lg:text-[12px] font-semibold ${
            statusClasses[item.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {formatStatus(item.status)}
        </span>
      </td>

      <td className="px-3 lg:px-4 py-3 lg:py-4">
        <div className="flex items-center gap-2 lg:gap-4">
          <button
            onClick={() => onView(item)}
            className="text-[#111827] hover:text-[#2563eb]"
            title="View"
          >
            <Eye size={16} className="lg:hidden" />
            <Eye size={18} className="hidden lg:block" />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="text-[#111827] hover:text-[#2563eb]"
            title="Edit"
          >
            <Pencil size={16} className="lg:hidden" />
            <Pencil size={18} className="hidden lg:block" />
          </button>
          <button
            className="text-[#111827] hover:text-[#f59e0b]"
            title="Maintenance"
          >
            <Wrench size={16} className="lg:hidden" />
            <Wrench size={18} className="hidden lg:block" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="text-[#ef4444] hover:text-[#b91c1c]"
            title="Delete"
          >
            <Trash2 size={16} className="lg:hidden" />
            <Trash2 size={18} className="hidden lg:block" />
          </button>
        </div>
      </td>
    </tr>
  );
}
