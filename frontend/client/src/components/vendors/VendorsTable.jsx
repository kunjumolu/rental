import React from "react";
import VendorRow from "./VendorRow";

export default function VendorsTable({ vendors, onView, onEdit, onDelete }) {
  if (vendors.length === 0) {
    return (
      <div className="p-6 text-center text-[14px] text-[#6b7280]">
        No vendors found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
            <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#6b7280]">Name</th>
            <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#6b7280]">Company Name</th>
            <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#6b7280]">Email</th>
            <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#6b7280]">Work Phone</th>
            <th className="px-4 py-4 text-right text-[13px] font-semibold text-[#6b7280]">Payables</th>
            <th className="px-4 py-4 text-right text-[13px] font-semibold text-[#6b7280]">Unused Credits</th>
            <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#6b7280]">Actions</th>
          </tr>
        </thead>

        <tbody>
          {vendors.map((vendor, index) => (
            <VendorRow
              key={vendor.id}
              vendor={vendor}
              index={index}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}