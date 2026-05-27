import React from "react";

export default function InvoiceTabs({ activeTab, setActiveTab }) {
  const tabs = ["Invoices", "Generate from Rentals"];

  return (
    <div className="mt-8">
      <div className="inline-flex rounded-[14px] bg-[#f3f4f6] p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-[38px] px-4 rounded-[12px] text-[14px] font-medium ${
              activeTab === tab
                ? "bg-white text-[#111827] shadow-sm"
                : "text-[#111827]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}