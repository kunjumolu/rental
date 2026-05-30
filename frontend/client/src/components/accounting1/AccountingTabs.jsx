import { useState } from "react";

const tabs = [
  "General Ledger",
  "Accounts Payable",
  "Accounts Receivable",
  "Chart of Accounts",
   "Tax Rates",
];

export default function AccountingTabs({ activeTab, onTabChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        borderBottom: "1px solid #e5e7eb",
        marginBottom: "24px",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#111827" : "#6b7280",
              background: "none",
              border: "none",
              borderBottom: isActive ? "2px solid #111827" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: "-1px",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
