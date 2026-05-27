import React from "react";
import { X, Printer } from "lucide-react";

export default function ViewExpenseModal({ isOpen, onClose, expense }) {
  if (!isOpen || !expense) return null;

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

  const handlePrint = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expense - ${expense.expense_account}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #111827; }
          h1 { font-size: 28px; font-weight: 800; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
          .label { color: #6b7280; }
          .value { font-weight: 600; }
          .total { font-size: 20px; font-weight: 800; padding: 16px 0; }
          .btn { margin-top: 32px; padding: 12px 28px; background: #6B21A8; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; }
          @media print { .btn { display: none; } }
        </style>
      </head>
      <body>
        <h1>Expense Receipt</h1>
        <p style="color:#6b7280;margin-bottom:24px;">${expense.expense_account}</p>
        <div class="row"><span class="label">Date</span><span class="value">${formatDate(expense.date)}</span></div>
        <div class="row"><span class="label">Expense Account</span><span class="value">${expense.expense_account}</span></div>
        <div class="row"><span class="label">Reference#</span><span class="value">${expense.reference_number || "-"}</span></div>
        <div class="row"><span class="label">Vendor</span><span class="value">${expense.vendor_name || "-"}</span></div>
        <div class="row"><span class="label">Paid Through</span><span class="value">${expense.paid_through || "-"}</span></div>
        <div class="row"><span class="label">Customer</span><span class="value">${expense.customer_name || "-"}</span></div>
        <div class="row"><span class="label">Status</span><span class="value">${expense.status || "-"}</span></div>
        <div class="row"><span class="label">Notes</span><span class="value">${expense.notes || "-"}</span></div>
        <div class="row total"><span class="label">Amount</span><span class="value">${formatCurrency(expense.amount)}</span></div>
        <button class="btn" onclick="window.print()">🖨️ Print</button>
      </body>
      </html>
    `;

    const win = window.open("", "_blank", "width=700,height=600");
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  const fields = [
    { label: "Date", value: formatDate(expense.date) },
    { label: "Expense Account", value: expense.expense_account },
    { label: "Reference#", value: expense.reference_number },
    { label: "Amount", value: formatCurrency(expense.amount) },
    { label: "Currency", value: expense.currency },
    { label: "Paid Through", value: expense.paid_through },
    { label: "Vendor", value: expense.vendor_name },
    { label: "Invoice#", value: expense.invoice_number },
    { label: "Customer", value: expense.customer_name },
    { label: "Status", value: expense.status },
    { label: "Notes", value: expense.notes },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[620px] max-h-[92vh] overflow-hidden rounded-[18px] bg-white shadow-2xl flex flex-col">

        <div className="flex items-center justify-between px-8 py-5 border-b border-[#e5e7eb]">
          <div>
            <h2 className="text-[20px] font-bold text-[#111827]">
              {expense.expense_account}
            </h2>
            <p className="text-[13px] text-[#6b7280] mt-1">
              {formatDate(expense.date)}
            </p>
          </div>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#111827]">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3">
          {fields.map((field) => (
            <div key={field.label} className="flex justify-between items-start py-2 border-b border-[#f3f4f6]">
              <span className="text-[13px] text-[#6b7280] font-medium">
                {field.label}
              </span>
              <span className="text-[14px] text-[#111827] font-medium text-right max-w-[280px]">
                {field.value || "-"}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center px-8 py-4 border-t border-[#e5e7eb]">
          <button
            onClick={handlePrint}
            className="h-[42px] px-5 rounded-[12px] bg-[#6B21A8] text-white text-[14px] font-semibold flex items-center gap-2 hover:bg-[#581c87] transition"
          >
            <Printer size={16} />
            Print
          </button>

          <button
            onClick={onClose}
            className="h-[42px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium text-[#374151]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}