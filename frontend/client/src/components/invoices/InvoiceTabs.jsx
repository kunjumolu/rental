import React from "react";

export default function InvoiceTabs({ activeTab, setActiveTab }) {
  const tabs = ["Invoices", "Generate from Rentals"];

  return (
    <div className="mt-5 sm:mt-6 md:mt-8">
      <div className="inline-flex rounded-[10px] sm:rounded-[14px] bg-[#f3f4f6] p-1 w-full sm:w-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-[34px] sm:h-[36px] md:h-[38px] px-3 sm:px-4 rounded-[8px] sm:rounded-[12px] text-[12px] sm:text-[13px] md:text-[14px] font-medium flex-1 sm:flex-none whitespace-nowrap ${
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
