import React from "react";

export default function CustomersHeader({ onAddClick }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[24px] font-bold text-[#1f2937]">Customers</h1>
        <p className="mt-1 text-[14px] text-[#6b7280]">
          Manage your enterprise client directory and active rentals.
        </p>
      </div>

      <button
        onClick={onAddClick}
        className="h-[36px] px-5 rounded-[8px] bg-[#0f4aa8] text-white text-[13px] font-semibold"
      >
        + Add Customer
      </button>
    </div>
  );
}