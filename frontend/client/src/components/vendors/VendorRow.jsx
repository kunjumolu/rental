import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

export default function VendorRow({ vendor, index, onView, onEdit, onDelete }) {
  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <tr
      className={`border-b border-[#f3f4f6] ${
        index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
      }`}
    >
      <td className="px-4 py-4">
        <p className="text-[14px] font-semibold text-[#6B21A8] cursor-pointer hover:underline"
           onClick={() => onView(vendor)}>
          {vendor.name}
        </p>
      </td>
      <td className="px-4 py-4 text-[14px] text-[#374151]">
        {vendor.company_name || "-"}
      </td>
      <td className="px-4 py-4 text-[14px] text-[#374151]">
        {vendor.email || "-"}
      </td>
      <td className="px-4 py-4 text-[14px] text-[#374151]">
        {vendor.work_phone || vendor.phone || "-"}
      </td>
      <td className="px-4 py-4 text-[14px] text-right font-medium text-[#374151]">
        {formatCurrency(vendor.payables)}
      </td>
      <td className="px-4 py-4 text-[14px] text-right font-medium text-[#374151]">
        {formatCurrency(vendor.unused_credits)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onView(vendor)}
            className="text-[#111827] hover:text-[#6B21A8] transition"
            title="View"
          >
            <Eye size={17} />
          </button>
          <button
            onClick={() => onEdit(vendor)}
            className="text-[#111827] hover:text-[#6B21A8] transition"
            title="Edit"
          >
            <Pencil size={17} />
          </button>
          <button
            onClick={() => onDelete(vendor)}
            className="text-[#ef4444] hover:text-[#b91c1c] transition"
            title="Delete"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </td>
    </tr>
  );
}