import React from "react";
import { X } from "lucide-react";

export default function ViewRentalModal({ isOpen, onClose, rental }) {
  if (!isOpen || !rental) return null;

  const itemSubtotal = Array.isArray(rental.items)
    ? rental.items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
    : 0;

  const taxAmount = itemSubtotal * ((Number(rental.taxRate) || 0) / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-[860px] max-h-[92vh] overflow-hidden rounded-[20px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#e5e7eb]">
          <h2 className="text-[24px] font-bold text-[#111827]">Rental Order Details</h2>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#6b7280]"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-2 gap-5">
            <InfoCard label="Order #" value={rental.orderNumber} />
            <InfoCard label="Customer" value={rental.customerName} />
            <InfoCard label="Phone" value={rental.customerPhone || "-"} />
            <InfoCard label="Status" value={rental.status} />
            <InfoCard label="Start Date" value={rental.startDate} />
            <InfoCard label="End Date" value={rental.endDate} />
            <InfoCard label="Tax Rate" value={`${Number(rental.taxRate || 0)}%`} />
            <InfoCard label="Deposit Amount" value={`$${Number(rental.depositAmount || 0).toFixed(2)}`} />
          </div>

          {/* Items */}
          <div className="mt-8">
            <h3 className="text-[18px] font-semibold text-[#111827] mb-4">Rented Items</h3>

            {Array.isArray(rental.items) && rental.items.length > 0 ? (
              <div className="overflow-hidden rounded-[14px] border border-[#e5e7eb]">
                <table className="w-full">
                  <thead className="bg-[#f9fafb]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#374151]">Item Name</th>
                      <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#374151]">Qty</th>
                      <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#374151]">Days</th>
                      <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#374151]">Rate</th>
                      <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#374151]">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rental.items.map((item) => (
                      <tr key={item.id} className="border-t border-[#e5e7eb]">
                        <td className="px-4 py-3 text-[14px] text-[#111827] font-medium">
                          {item.itemName}
                        </td>
                        <td className="px-4 py-3 text-[14px] text-[#374151]">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-[14px] text-[#374151]">
                          {item.days}
                        </td>
                        <td className="px-4 py-3 text-[14px] text-[#374151]">
                          ${Number(item.rate || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-[14px] text-[#111827] font-medium">
                          ${Number(item.subtotal || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[14px] text-[#6b7280]">No rental items found.</p>
            )}
          </div>

          {/* Summary */}
          <div className="mt-8 rounded-[16px] border border-[#e5e7eb] p-5">
            <div className="space-y-2 text-[16px] text-[#111827]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${itemSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({Number(rental.taxRate || 0)}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Deposit:</span>
                <span>${Number(rental.depositAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Balance:</span>
                <span>${Number(rental.balance || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 text-[22px] font-bold">
                <span>Total:</span>
                <span>${Number(rental.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-8">
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">
              Notes
            </label>
            <div className="rounded-[12px] border border-[#d1d5db] bg-[#f9fafb] px-4 py-3 text-[14px] text-[#374151] min-h-[56px]">
              {rental.notes || "-"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-8 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="h-[44px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div>
      <label className="mb-2 block text-[14px] font-medium text-[#111827]">
        {label}
      </label>
      <div className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] px-4 flex items-center text-[14px] text-[#374151] bg-[#f9fafb]">
        {value || "-"}
      </div>
    </div>
  );
}