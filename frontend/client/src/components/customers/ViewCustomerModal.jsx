import React from "react";

export default function ViewCustomerModal({ isOpen, onClose, customer }) {
  if (!isOpen || !customer) return null;

  const info = [
    { label: "Customer ID", value: customer.customerId || customer.idNumber || "-" },
    { label: "Full Name", value: customer.name },
    { label: "Email", value: customer.email || "-" },
    { label: "Phone", value: customer.phone || "-" },
    { label: "Address", value: customer.address || "-", span: true },
    { label: "City", value: customer.city || "-" },
    { label: "State", value: customer.state || "-" },
    { label: "Country", value: customer.country || "-" },
    { label: "Status", value: customer.status || "-" },
    { label: "Active Rentals", value: customer.activeRentals ?? 0 },
    {
      label: "Balance",
      value: `₹${Number(customer.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    },
    { label: "Notes", value: customer.notes || "-", span: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-3 sm:px-4">
      <div className="w-full max-w-[700px] max-h-[90vh] rounded-[12px] sm:rounded-[16px] bg-white shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900">Customer Details</h2>
          <button onClick={onClose} className="text-xl sm:text-2xl text-gray-500 leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5">
          {info.map((item, index) => (
            <div key={index} className={item.span ? "col-span-1 sm:col-span-2" : ""}>
              <p className="text-[11px] sm:text-xs font-medium text-gray-500">{item.label}</p>
              <div className="mt-1 rounded-[10px] border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] sm:text-sm text-gray-900 break-words">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
          <button onClick={onClose}
            className="h-[40px] sm:h-[42px] rounded-[10px] border border-gray-300 px-5 text-[13px] sm:text-sm font-medium text-gray-700 w-full sm:w-auto">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
