import React from "react";

export default function InvoiceStatsCards({ stats, activeFilter, onFilterChange }) {
  const cards = [
    { label: "ALL", value: stats.all, filter: "all" },
    { label: "DRAFT", value: stats.draft, filter: "draft" },
    { label: "SENT", value: stats.sent, filter: "sent" },
    { label: "PAID", value: stats.paid, filter: "paid" },
    { label: "OVERDUE", value: stats.overdue, filter: "overdue" },
  ];

  return (
    <div className="mt-5 sm:mt-6 md:mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
      {cards.map((card, index) => (
        <button
          key={index}
          onClick={() => onFilterChange(card.filter)}
          className={`rounded-[12px] sm:rounded-[14px] md:rounded-[18px] border bg-white px-3 sm:px-4 md:px-5 py-5 sm:py-8 md:py-10 lg:py-12 text-left transition-all cursor-pointer ${
            activeFilter === card.filter
              ? "border-[#2563eb] bg-[#eff6ff]"
              : "border-[#e5e7eb] hover:border-[#2563eb] hover:bg-[#f0f9ff]"
          }`}
        >
          <p className="text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px] text-[#6b7280]">{card.label}</p>
          <h3 className="mt-1 sm:mt-2 text-[24px] sm:text-[30px] md:text-[36px] lg:text-[42px] font-bold text-[#111827]">
            {card.value}
          </h3>
        </button>
      ))}
    </div>
  );
}
