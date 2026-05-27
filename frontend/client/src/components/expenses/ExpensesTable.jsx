import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

export default function ExpensesTable({ expenses, onView, onEdit, onDelete }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN");
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const statusColors = {
    "non-billable": "text-[#6b7280]",
    "billable": "text-[#2563eb]",
    "invoiced": "text-[#10b981]",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
            <th className="px-4 py-4 text-left text-[12px] font-semibold text-[#6b7280] uppercase tracking-wide">Date</th>
            <th className="px-4 py-4 text-left text-[12px] font-semibold text-[#6b7280] uppercase tracking-wide">Expense Account</th>
            <th className="px-4 py-4 text-left text-[12px] font-semibold text-[#6b7280] uppercase tracking-wide">Reference#</th>
            <th className="px-4 py-4 text-left text-[12px] font-semibold text-[#6b7280] uppercase tracking-wide">Vendor Name</th>
            <th className="px-4 py-4 text-left text-[12px] font-semibold text-[#6b7280] uppercase tracking-wide">Paid Through</th>
            <th className="px-4 py-4 text-left text-[12px] font-semibold text-[#6b7280] uppercase tracking-wide">Customer Name</th>
            <th className="px-4 py-4 text-left text-[12px] font-semibold text-[#6b7280] uppercase tracking-wide">Status</th>
            <th className="px-4 py-4 text-right text-[12px] font-semibold text-[#6b7280] uppercase tracking-wide">Amount</th>
            <th className="px-4 py-4 text-left text-[12px] font-semibold text-[#6b7280] uppercase tracking-wide">Actions</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((expense, index) => (
            <tr
              key={expense.id}
              className={`border-b border-[#f3f4f6] ${
                index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
              } hover:bg-[#f9fafb] transition`}
            >
              <td className="px-4 py-4 text-[14px] text-[#374151]">
                {formatDate(expense.date)}
              </td>
              <td
                className="px-4 py-4 text-[14px] text-[#2563eb] font-medium cursor-pointer hover:underline"
                onClick={() => onView(expense)}
              >
                {expense.expense_account || "-"}
              </td>
              <td className="px-4 py-4 text-[14px] text-[#374151]">
                {expense.reference_number || "-"}
              </td>
              <td className="px-4 py-4 text-[14px] text-[#374151]">
                {expense.vendor_name || "-"}
              </td>
              <td className="px-4 py-4 text-[14px] text-[#374151]">
                {expense.paid_through || "-"}
              </td>
              <td className="px-4 py-4 text-[14px] text-[#374151]">
                {expense.customer_name || "-"}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`text-[13px] font-semibold uppercase ${
                    statusColors[expense.status] || "text-[#6b7280]"
                  }`}
                >
                  {expense.status || "non-billable"}
                </span>
              </td>
              <td className="px-4 py-4 text-[14px] font-semibold text-[#111827] text-right">
                {formatCurrency(expense.amount)}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onView(expense)}
                    className="text-[#111827] hover:text-[#6B21A8] transition"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(expense)}
                    className="text-[#111827] hover:text-[#6B21A8] transition"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="text-[#ef4444] hover:text-[#b91c1c] transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}