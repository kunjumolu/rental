import React from "react";
import { X, Printer } from "lucide-react";
import { printInvoice } from "../../utils/printInvoice";

export default function ViewInvoiceModal({ isOpen, onClose, invoice }) {
  if (!isOpen || !invoice) return null;

  const items = Array.isArray(invoice.items) ? invoice.items : [];

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const taxAmount = subtotal * ((Number(invoice.taxRate || 0)) / 100);
  const paidAmount = Number(invoice.paidAmount || 0);
  const balance = Number(invoice.balance || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[760px] max-h-[92vh] overflow-y-auto rounded-[20px] bg-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-[#6b7280] hover:text-[#111827]"
        >
          <X size={24} />
        </button>

        <div className="px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-[#111827] uppercase">
                Invoice
              </h1>
              <p className="text-[20px] font-semibold text-[#6B21A8] mt-2">
                {invoice.invoiceNumber}
              </p>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex px-4 py-1 rounded-full font-semibold text-[14px] ${
                  invoice.status === "paid"
                    ? "bg-[#d1fae5] text-[#065f46]"
                    : invoice.status === "overdue"
                    ? "bg-[#fee2e2] text-[#b91c1c]"
                    : "bg-[#f3f4f6] text-[#374151]"
                }`}
              >
                {invoice.status}
              </span>
              <div className="mt-3 text-[14px] text-[#6b7280]">
                <div>Issue: {invoice.issueDate}</div>
                <div>Due: {invoice.dueDate}</div>
              </div>
            </div>
          </div>

          {/* From / Bill To */}
          <div className="mt-8 border-t border-[#e5e7eb] pt-8 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-[12px] font-semibold text-[#6b7280] uppercase mb-3">
                From
              </h3>
              <div className="text-[14px] text-[#111827] space-y-1">
                <div className="font-semibold text-[16px]">White Legacy</div>
                <div>Kerala, India</div>
                <div>operations@whitelegacy.com</div>
              </div>
            </div>

            <div>
              <h3 className="text-[12px] font-semibold text-[#6b7280] uppercase mb-3">
                Bill To
              </h3>
              <div className="text-[14px] text-[#111827] space-y-1">
                <div className="font-semibold text-[16px]">
                  {invoice.customerName}
                </div>
                <div>{invoice.customerAddress || "-"}</div>
                <div>{invoice.customerEmail || "-"}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-10">
            <div className="grid grid-cols-12 gap-4 pb-3 border-b border-[#e5e7eb] text-[13px] font-semibold text-[#6b7280]">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>

            {items.length === 0 ? (
              <div className="py-6 text-center text-[14px] text-[#6b7280]">
                No items found
              </div>
            ) : (
              <div className="divide-y divide-[#e5e7eb]">
                {items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="grid grid-cols-12 gap-4 py-4 text-[14px] text-[#111827]"
                  >
                    <div className="col-span-6 font-medium">
                      {item.description}
                    </div>
                    <div className="col-span-2 text-center text-[#6b7280]">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-right text-[#6b7280]">
                      ₹{Number(item.unitPrice || 0).toFixed(2)}
                    </div>
                    <div className="col-span-2 text-right font-semibold">
                      ₹{Number(item.amount || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="mt-8 border-t border-[#e5e7eb] pt-6 flex justify-end">
            <div className="w-[300px] space-y-2">
              <div className="flex justify-between text-[15px] text-[#374151]">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[15px] text-[#374151]">
                <span>Tax ({invoice.taxRate || 0}%):</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between text-[15px] text-[#374151]">
                  <span>Discount:</span>
                  <span>₹{Number(invoice.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[20px] font-bold text-[#111827] pt-2 border-t border-[#e5e7eb]">
                <span>Total:</span>
                <span>₹{Number(invoice.total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[15px] text-[#10b981]">
                <span>Paid:</span>
                <span>₹{paidAmount.toFixed(2)}</span>
              </div>
              <div
                className={`flex justify-between text-[15px] font-semibold ${
                  balance > 0 ? "text-[#ef4444]" : "text-[#10b981]"
                }`}
              >
                <span>Balance Due:</span>
                <span>₹{balance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 rounded-[14px] bg-[#f9fafb] px-5 py-4 text-[14px] text-[#374151]">
              <span className="font-semibold">Notes: </span>
              {invoice.notes}
            </div>
          )}
        </div>

        {/* Footer with Print button */}
        <div className="px-8 pb-8 flex justify-between items-center border-t border-[#e5e7eb] pt-4">
          <button
            onClick={() => printInvoice(invoice)}
            className="h-[44px] px-6 rounded-[12px] bg-[#6B21A8] text-white text-[14px] font-semibold flex items-center gap-2 hover:bg-[#581c87] transition"
          >
            <Printer size={18} />
            Print
          </button>

          <button
            onClick={onClose}
            className="h-[44px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium text-[#374151]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}