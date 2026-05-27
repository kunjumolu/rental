import React from "react";
import { Eye, Trash2, Pencil } from "lucide-react";

export default function RentalRow({ rental, onView, onEdit, onDelete }) {
  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;


  const statusClasses = {
    active: "bg-[#2563eb] text-white",
    overdue: "bg-[#ef4444] text-white",
    returned: "bg-[#f3f4f6] text-[#374151]",
    pending: "bg-[#f3f4f6] text-[#111827]",
    completed: "bg-[#d1fae5] text-[#065f46]",
  };

  const itemNames =
    Array.isArray(rental.items) && rental.items.length > 0
      ? rental.items.map((item) => item.itemName).join(", ")
      : `${rental.itemsCount || 0} items`;

  const itemCount =
    Array.isArray(rental.items) ? rental.items.length : rental.itemsCount || 0;

  return (
    <tr className="border-t border-[#e5e7eb]">
      <td className="px-4 py-4 text-[14px] font-medium text-[#111827]">
        {rental.orderNumber}
      </td>

      <td className="px-4 py-4">
        <div className="text-[14px] font-medium text-[#111827]">
          {rental.customerName}
        </div>
        <div className="text-[12px] text-[#6b7280]">{rental.customerPhone}</div>
      </td>

      <td className="px-4 py-4 text-[14px] text-[#111827]">
        <div className="font-medium">{itemCount} item{itemCount !== 1 ? "s" : ""}</div>
        <div className="text-[12px] text-[#6b7280] max-w-[220px] truncate" title={itemNames}>
          {itemNames}
        </div>
      </td>

      <td className="px-4 py-4 text-[14px] text-[#111827]">
        {rental.startDate} - {rental.endDate}
      </td>

      <td className="px-4 py-4 text-[14px] font-medium text-[#111827]">
        {formatCurrency(rental.total)}
      </td>

      <td
        className={`px-4 py-4 text-[14px] font-medium ${
          Number(rental.balance) > 0 ? "text-[#ef4444]" : "text-[#10b981]"
        }`}
      >
        {formatCurrency(rental.balance)}
      </td>

      <td className="px-4 py-4">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-[12px] font-semibold ${
            statusClasses[rental.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {rental.status}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => onView(rental)} className="text-[#111827]">
            <Eye size={18} />
          </button>
          <button onClick={() => onEdit(rental)} className="text-[#111827]">
            <Pencil size={18} />
          </button>
          <button onClick={() => onDelete(rental)} className="text-[#ef4444]">
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}