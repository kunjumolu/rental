import React from "react";
import { X } from "lucide-react";

export default function ViewVendorModal({ isOpen, onClose, vendor }) {
  if (!isOpen || !vendor) return null;

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const sections = [
    {
      title: "Basic Information",
      fields: [
        { label: "Name", value: vendor.name },
        { label: "Company Name", value: vendor.company_name },
        { label: "Contact Person", value: vendor.contact_person },
        { label: "Salutation", value: vendor.salutation },
        { label: "First Name", value: vendor.first_name },
        { label: "Last Name", value: vendor.last_name },
      ],
    },
    {
      title: "Contact Details",
      fields: [
        { label: "Email", value: vendor.email },
        { label: "Work Phone", value: vendor.work_phone },
        { label: "Mobile", value: vendor.mobile },
        { label: "Address", value: vendor.address },
      ],
    },
    {
      title: "Financial Details",
      fields: [
        { label: "PAN", value: vendor.pan },
        { label: "Currency", value: vendor.currency },
        { label: "Payment Terms", value: vendor.payment_terms },
        { label: "Opening Balance", value: formatCurrency(vendor.opening_balance) },
        { label: "Payables", value: formatCurrency(vendor.payables) },
        { label: "Unused Credits", value: formatCurrency(vendor.unused_credits) },
      ],
    },
    {
      title: "Other",
      fields: [
        { label: "Notes", value: vendor.notes },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[720px] max-h-[92vh] overflow-hidden rounded-[18px] bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#e5e7eb]">
          <div>
            <h2 className="text-[20px] font-bold text-[#111827]">
              {vendor.name}
            </h2>
            {vendor.company_name && (
              <p className="text-[13px] text-[#6b7280] mt-1">
                {vendor.company_name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827]"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-[13px] font-bold text-[#6B21A8] uppercase tracking-wide mb-3">
                {section.title}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field.label}>
                    <p className="text-[11px] font-medium text-[#9ca3af] mb-1 uppercase tracking-wide">
                      {field.label}
                    </p>
                    <div className="rounded-[8px] border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-[14px] text-[#111827]">
                      {field.value || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end px-8 py-4 border-t border-[#e5e7eb]">
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