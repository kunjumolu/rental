import React from "react";

const tabs = [
  "General Ledger",
  "Accounts Payable",
  "Accounts Receivable",
  "Chart of Accounts",
  "Tax Rates",
];

export default function AccountingTabs({ activeTab, onTabChange }) {
  return (
    <div className="w-full overflow-x-auto border-b border-gray-200 mb-4 sm:mb-6 -mx-4 sm:mx-0 px-4 sm:px-0">
      <div className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 sm:px-5 py-3 text-xs sm:text-sm whitespace-nowrap transition-all duration-200 border-b-2 -mb-px ${
                isActive
                  ? "border-[#111827] text-[#111827] font-semibold"
                  : "border-transparent text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
