import React from "react";
import BillRow from "./BillRow";

export default function BillsTable({
  bills,
  onStatusChange, onMarkPaid, onView, onEdit, onDelete,
}) {
  if (bills.length === 0) {
    return (
      <div className="p-6 text-center text-[14px] text-[#6b7280]">
        No bills found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
            <Th>Bill #</Th>
            <Th>Vendor</Th>
            <Th>Bill Date</Th>
            <Th>Due Date</Th>
            <Th align="right">Amount</Th>
            <Th align="right">Balance</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill, index) => (
            <BillRow
              key={bill.id}
              bill={bill}
              index={index}
              onStatusChange={onStatusChange}
              onMarkPaid={onMarkPaid}
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

function Th({ children, align = "left" }) {
  return (
    <th className={`px-4 py-4 text-${align} text-[12px] font-semibold text-[#6b7280] uppercase tracking-wide`}>
      {children}
    </th>
  );
}
