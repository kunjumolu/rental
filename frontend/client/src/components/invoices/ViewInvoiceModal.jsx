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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-4">
      <div className="w-full max-w-[760px] max-h-[92vh] overflow-y-auto rounded-[14px] sm:rounded-[18px] md:rounded-[20px] bg-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-3 sm:right-5 top-3 sm:top-5 text-[#6b7280] hover:text-[#111827] z-10"
        >
          <X size={22} className="sm:hidden" />
          <X size={24} className="hidden sm:block" />
        </button>

        <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 pr-8 sm:pr-0">
            <div>
              <h1 className="text-[20px] sm:text-[24px] md:text-[28px] font-bold text-[#111827] uppercase">
                Invoice
              </h1>
              <p className="text-[16px] sm:text-[18px] md:text-[20px] font-semibold text-[#6B21A8] mt-1 sm:mt-2">
                {invoice.invoiceNumber}
              </p>
            </div>

            <div className="sm:text-right">
              <span
                className={`inline-flex px-3 sm:px-4 py-1 rounded-full font-semibold text-[12px] sm:text-[14px] ${
                  invoice.status === "paid"
                    ? "bg-[#d1fae5] text-[#065f46]"
                    : invoice.status === "overdue"
                    ? "bg-[#fee2e2] text-[#b91c1c]"
                    : "bg-[#f3f4f6] text-[#374151]"
                }`}
              >
                {invoice.status}
              </span>
              <div className="mt-2 sm:mt-3 text-[12px] sm:text-[13px] md:text-[14px] text-[#6b7280]">
                <div>Issue: {invoice.issueDate}</div>
                <div>Due: {invoice.dueDate}</div>
              </div>
            </div>
          </div>

          {/* From / Bill To */}
          <div className="mt-5 sm:mt-6 md:mt-8 border-t border-[#e5e7eb] pt-5 sm:pt-6 md:pt-8 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
            <div>
              <h3 className="text-[11px] sm:text-[12px] font-semibold text-[#6b7280] uppercase mb-2 sm:mb-3">
                From
              </h3>
              <div className="text-[13px] sm:text-[14px] text-[#111827] space-y-1">
                <div className="font-semibold text-[14px] sm:text-[16px]">White Legacy</div>
                <div>Kerala, India</div>
                <div>operations@whitelegacy.com</div>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] sm:text-[12px] font-semibold text-[#6b7280] uppercase mb-2 sm:mb-3">
                Bill To
              </h3>
              <div className="text-[13px] sm:text-[14px] text-[#111827] space-y-1">
                <div className="font-semibold text-[14px] sm:text-[16px]">
                  {invoice.customerName}
                </div>
                <div>{invoice.customerAddress || "-"}</div>
                <div>{invoice.customerEmail || "-"}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-6 sm:mt-8 md:mt-10">
            {/* Mobile: card layout for items */}
            <div className="block sm:hidden space-y-3">
              <div className="text-[12px] font-semibold text-[#6b7280] uppercase pb-2 border-b border-[#e5e7eb]">
                Items
              </div>
              {items.length === 0 ? (
                <div className="py-4 text-center text-[13px] text-[#6b7280]">
                  No items found
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={item.id || index} className="py-3 border-b border-[#f3f4f6] last:border-0 space-y-1">
                    <p className="text-[13px] font-medium text-[#111827]">{item.description}</p>
                    <div className="flex justify-between text-[12px] text-[#6b7280]">
                      <span>Qty: {item.quantity} × ₹{Number(item.unitPrice || 0).toFixed(2)}</span>
                      <span className="font-semibold text-[#111827]">₹{Number(item.amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop: grid layout for items */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-12 gap-3 md:gap-4 pb-3 border-b border-[#e5e7eb] text-[12px] md:text-[13px] font-semibold text-[#6b7280]">
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
                      className="grid grid-cols-12 gap-3 md:gap-4 py-3 md:py-4 text-[13px] md:text-[14px] text-[#111827]"
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
          </div>

          {/* Totals */}
          <div className="mt-5 sm:mt-6 md:mt-8 border-t border-[#e5e7eb] pt-4 sm:pt-5 md:pt-6 flex justify-end">
            <div className="w-full sm:w-[280px] md:w-[300px] space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-[13px] sm:text-[14px] md:text-[15px] text-[#374151]">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px] sm:text-[14px] md:text-[15px] text-[#374151]">
                <span>Tax ({invoice.taxRate || 0}%):</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between text-[13px] sm:text-[14px] md:text-[15px] text-[#374151]">
                  <span>Discount:</span>
                  <span>₹{Number(invoice.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[16px] sm:text-[18px] md:text-[20px] font-bold text-[#111827] pt-2 border-t border-[#e5e7eb]">
                <span>Total:</span>
                <span>₹{Number(invoice.total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px] sm:text-[14px] md:text-[15px] text-[#10b981]">
                <span>Paid:</span>
                <span>₹{paidAmount.toFixed(2)}</span>
              </div>
              <div
                className={`flex justify-between text-[13px] sm:text-[14px] md:text-[15px] font-semibold ${
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
            <div className="mt-5 sm:mt-6 md:mt-8 rounded-[10px] sm:rounded-[14px] bg-[#f9fafb] px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-[13px] sm:text-[14px] text-[#374151]">
              <span className="font-semibold">Notes: </span>
              {invoice.notes}
            </div>
          )}
        </div>

        {/* Footer with Print button */}
        <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3 border-t border-[#e5e7eb] pt-3 sm:pt-4">
          <button
            onClick={() => printInvoice(invoice)}
            className="h-[42px] sm:h-[44px] px-5 sm:px-6 rounded-[12px] bg-[#6B21A8] text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#581c87] transition w-full sm:w-auto"
          >
            <Printer size={16} className="sm:hidden" />
            <Printer size={18} className="hidden sm:block" />
            Print
          </button>

          <button
            onClick={onClose}
            className="h-[42px] sm:h-[44px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium text-[#374151] w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
