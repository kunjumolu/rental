import React from "react";

export default function ViewCustomerModal({ isOpen, onClose, customer }) {
  if (!isOpen || !customer) return null;

  const info = [
    { label: "Full Name", value: customer.name },
    { label: "Email", value: customer.email || "-" },
    { label: "Phone", value: customer.phone || "-" },
    { label: "Address", value: customer.address || "-" },
    { label: "City", value: customer.city || "-" },
    { label: "Country", value: customer.country || "-" },
    { label: "ID Number", value: customer.idNumber || "-" },
    { label: "Status", value: customer.status || "-" },
    { label: "Active Rentals", value: customer.activeRentals ?? 0 },
    { label: "Balance", value: `$${Number(customer.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
    { label: "Notes", value: customer.notes || "-" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[700px] rounded-[16px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">
          <h2 className="text-[20px] font-bold text-[#111827]">Customer Details</h2>
          <button onClick={onClose} className="text-[22px] text-[#6b7280]">×</button>
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 py-5">
          {info.map((item, index) => (
            <div key={index} className={item.label === "Notes" ? "col-span-2" : ""}>
              <p className="text-[12px] font-medium text-[#6b7280]">{item.label}</p>
              <div className="mt-1 rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-[14px] text-[#111827]">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-[#e5e7eb] px-6 py-4">
          <button
            onClick={onClose}
            className="h-[40px] rounded-[10px] border border-[#d1d5db] px-5 text-[14px] font-medium text-[#374151]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}