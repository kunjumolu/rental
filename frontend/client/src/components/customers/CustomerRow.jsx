import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

export default function CustomerRow({ customer, onView, onEdit, onDelete }) {
  const getInitials = (name) => {
    if (!name) return "NA";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-[#bcd3ff]",
      "bg-[#ffc9b3]",
      "bg-[#d9dee7]",
      "bg-[#c7d2fe]",
      "bg-[#bfdbfe]",
      "bg-[#fde68a]",
      "bg-[#fecaca]",
      "bg-[#bbf7d0]",
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const formatBalance = (amount) => {
    return `$${Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const isDangerBalance = Number(customer.balance) >= 10000;

  return (
    <tr className="border-b border-[#d9deea]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full ${getAvatarColor(customer.name)} flex items-center justify-center text-[12px] font-bold text-[#334155]`}
          >
            {getInitials(customer.name)}
          </div>

          <span className="text-[13px] font-semibold text-[#1f2937]">
            {customer.name}
          </span>
        </div>
      </td>

      <td className="px-4 py-3 text-[13px] text-[#6b7280]">
        {customer.phone || "-"}
      </td>

      <td className="px-4 py-3 text-[13px] text-[#374151]">
        {customer.activeRentals ?? 0}
      </td>

      <td className={`px-4 py-3 text-[13px] font-semibold ${isDangerBalance ? "text-[#dc2626]" : "text-[#1f2937]"}`}>
        {formatBalance(customer.balance)}
      </td>

      <td className="px-4 py-3">
        <span
          className={`inline-flex px-3 py-[3px] rounded-full text-[11px] font-medium ${
            customer.status === "active"
              ? "bg-[#dbeafe] text-[#64748b]"
              : "bg-[#e5e7eb] text-[#4b5563]"
          }`}
        >
          {customer.status === "active" ? "Active" : "Inactive"}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => onView(customer)} className="text-[#64748b] hover:text-[#0f4aa8]">
            <Eye size={16} />
          </button>
          <button onClick={() => onEdit(customer)} className="text-[#64748b] hover:text-[#0f4aa8]">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(customer)} className="text-[#64748b] hover:text-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}