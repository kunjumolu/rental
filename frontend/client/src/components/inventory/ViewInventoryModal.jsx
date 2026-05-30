import React from "react";

export default function ViewInventoryModal({ isOpen, onClose, item }) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-4">
      <div className="w-full max-w-[700px] rounded-[14px] sm:rounded-[18px] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[#e5e7eb]">
          <h2 className="text-[17px] sm:text-[18px] md:text-[20px] font-bold text-[#111827]">Inventory Item Details</h2>
          <button onClick={onClose} className="text-[24px] sm:text-[28px] text-[#6b7280] hover:text-[#111827] leading-none">&times;</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 max-h-[60vh] overflow-y-auto">
          <Info label="SKU" value={item.sku} />
          <Info label="Name" value={item.name} />
          <Info label="Category" value={item.category} />
          <Info label="Serial Number" value={item.serialNumber} />
          <Info label="Daily Rate" value={`$${Number(item.dailyRate).toFixed(2)}`} />
          <Info label="Weekly Rate" value={`$${Number(item.weeklyRate).toFixed(2)}`} />
          <Info label="Monthly Rate" value={`$${Number(item.monthlyRate).toFixed(2)}`} />
          <Info label="Total Quantity" value={item.totalQuantity} />
          <Info label="Available Quantity" value={item.availableQuantity} />
          <Info label="Condition" value={item.condition} />
          <Info label="Location" value={item.location} />
          <Info label="Status" value={item.status} />
          <div className="sm:col-span-2">
            <Info label="Description" value={item.description || "-"} />
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex justify-end">
          <button
            onClick={onClose}
            className="h-[42px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[11px] sm:text-[12px] font-medium text-[#6b7280]">{label}</p>
      <div className="mt-1 rounded-[8px] sm:rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] px-2.5 sm:px-3 py-2 text-[13px] sm:text-[14px] text-[#111827]">
        {value}
      </div>
    </div>
  );
}
