import React from "react";
import { Eye, Pencil, Trash2, CheckCircle, Printer } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { printInvoice } from "../../utils/printInvoice";

export default function InvoiceRow({ invoice, onView, onEdit, onDelete, onMarkPaid, onPrint }) {
  const statusClasses = {
    paid: "bg-[#2563eb] text-white",
    overdue: "bg-[#ef4444] text-white",
    sent: "bg-[#f3f4f6] text-[#111827]",
    draft: "bg-[#f3f4f6] text-[#111827]",
  };

  const handlePrint = async () => {
    if (onPrint) {
      await onPrint(invoice);
    } else {
      printInvoice(invoice);
    }
  };

  return (
    <tr className="border-t border-[#e5e7eb]">
      <td className="px-4 py-4 text-[14px] font-medium text-[#111827]">
        {invoice.invoiceNumber}
      </td>

      <td className="px-4 py-4">
        <div className="text-[14px] font-medium text-[#111827]">
          {invoice.customerName}
        </div>
        <div className="text-[12px] text-[#6b7280]">
          {invoice.customerEmail}
        </div>
      </td>

      <td className="px-4 py-4 text-[14px] text-[#111827]">
        {invoice.issueDate}
      </td>

      <td className="px-4 py-4 text-[14px] text-[#111827]">
        {invoice.dueDate}
      </td>

      <td className="px-4 py-4 text-[14px] font-medium text-[#111827]">
        {formatCurrency(invoice.total)}
      </td>

      <td
        className={`px-4 py-4 text-[14px] font-medium ${
          Number(invoice.balance) > 0 ? "text-[#ef4444]" : "text-[#10b981]"
        }`}
      >
        {formatCurrency(invoice.balance)}
      </td>

      <td className="px-4 py-4">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-[12px] font-semibold ${
            statusClasses[invoice.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {invoice.status}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onView(invoice)}
            className="text-[#111827] hover:text-[#2563eb] transition"
            title="View"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => onEdit(invoice)}
            className="text-[#111827] hover:text-[#2563eb] transition"
            title="Edit"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={handlePrint}
            className="text-[#6B21A8] hover:text-[#581c87] transition"
            title="Print"
          >
            <Printer size={18} />
          </button>

          {invoice.balance > 0 && (
            <button
              onClick={() => onMarkPaid(invoice)}
              className="text-[#10b981] hover:text-[#059669] transition"
              title="Mark as Paid"
            >
              <CheckCircle size={18} />
            </button>
          )}

          <button
            onClick={() => onDelete(invoice)}
            className="text-[#ef4444] hover:text-[#b91c1c] transition"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}