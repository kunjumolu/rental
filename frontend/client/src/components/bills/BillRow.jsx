import React, { useState } from "react";
import { CheckCircle, DollarSign, Eye, Pencil, Trash2 } from "lucide-react";

export default function BillRow({
  bill,
  index,
  onStatusChange,
  onMarkPaid,
  onView,
  onEdit,
  onDelete,
}) {
  const [updating, setUpdating] = useState(false);

  const statusColors = {
    pending: { bg: "#fef3c7", color: "#92400e" },
    paid: { bg: "#d1fae5", color: "#065f46" },
    overdue: { bg: "#fee2e2", color: "#b91c1c" },
    draft: { bg: "#f3f4f6", color: "#374151" },
  };

  const formatCurrency = (v) =>
    `₹${Number(v || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString("en-IN");
    } catch {
      return d;
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === bill.status) return;
    setUpdating(true);
    try {
      await onStatusChange?.(bill.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const style = statusColors[bill.status] || {
    bg: "#f3f4f6",
    color: "#374151",
  };

  return (
    <tr
      className={`border-b border-[#f3f4f6] ${
        index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
      } hover:bg-[#f9fafb] transition`}
    >
      <td
        className="px-3 sm:px-4 py-3 sm:py-4 text-[13px] sm:text-[14px] font-semibold text-[#6B21A8] cursor-pointer hover:underline"
        onClick={() => onView?.(bill)}
      >
        {bill.bill_number || "-"}
      </td>

      <td className="px-3 sm:px-4 py-3 sm:py-4">
        <div className="text-[13px] sm:text-[14px] font-medium text-[#111827]">
          {bill.vendor_name || "-"}
        </div>
        {bill.vendor_email && (
          <div className="text-[11px] sm:text-[12px] text-[#9ca3af] mt-0.5 hidden sm:block">
            {bill.vendor_email}
          </div>
        )}
      </td>

      <td className="px-3 sm:px-4 py-3 sm:py-4 text-[13px] sm:text-[14px] text-[#6b7280] hidden md:table-cell">
        {formatDate(bill.bill_date || bill.created_at)}
      </td>

      <td
        className={`px-3 sm:px-4 py-3 sm:py-4 text-[13px] sm:text-[14px] ${
          bill.status === "overdue"
            ? "text-[#ef4444] font-semibold"
            : "text-[#6b7280]"
        }`}
      >
        {formatDate(bill.due_date)}
      </td>

      <td className="px-3 sm:px-4 py-3 sm:py-4 text-[13px] sm:text-[14px] font-semibold text-[#111827] text-right">
        {formatCurrency(bill.amount)}
      </td>

      <td
        className={`px-3 sm:px-4 py-3 sm:py-4 text-[13px] sm:text-[14px] font-semibold text-right ${
          Number(bill.balance_amount) > 0
            ? "text-[#ef4444]"
            : "text-[#10b981]"
        }`}
      >
        {formatCurrency(bill.balance_amount)}
      </td>

      {/* Status — clickable dropdown */}
      <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
        <select
          value={bill.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          style={{
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            background: style.bg,
            color: style.color,
            border: `1px solid ${style.color}30`,
            cursor: updating ? "not-allowed" : "pointer",
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
            textTransform: "capitalize",
          }}
        >
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </td>

      {/* Actions */}
      <td className="px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onView?.(bill)}
            className="p-1.5 text-[#111827] hover:text-[#2563eb] transition"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEdit?.(bill)}
            className="p-1.5 text-[#111827] hover:text-[#6B21A8] transition"
            title="Edit"
          >
            <Pencil size={16} />
          </button>

          {bill.status !== "paid" && Number(bill.balance_amount) > 0 && (
            <button
              onClick={() => onMarkPaid?.(bill)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] bg-[#10b981] text-white text-[12px] font-semibold hover:bg-[#059669] transition"
              title="Mark as Paid"
            >
              <DollarSign size={12} />
              Pay
            </button>
          )}
          {bill.status === "paid" && (
            <span className="hidden sm:flex items-center gap-1 text-[#10b981] text-[12px] font-semibold px-1">
              <CheckCircle size={14} /> Paid
            </span>
          )}

          <button
            onClick={() => onDelete?.(bill)}
            className="p-1.5 text-[#ef4444] hover:text-[#b91c1c] transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
