import React from "react";
import { Package, CheckCircle2, AlertTriangle, Wrench } from "lucide-react";

export default function InventoryStatsCards({ stats }) {
  const cards = [
    {
      icon: <Package size={22} className="text-[#2563eb]" />,
      label: "Total Items",
      value: stats.totalItems,
      bg: "bg-[#eef4ff]"
    },
    {
      icon: <CheckCircle2 size={22} className="text-[#10b981]" />,
      label: "Available",
      value: stats.available,
      bg: "bg-[#ecfdf5]"
    },
    {
      icon: <AlertTriangle size={22} className="text-[#f59e0b]" />,
      label: "Low/Out Stock",
      value: stats.lowOutStock,
      bg: "bg-[#fff7ed]"
    },
    {
      icon: <Wrench size={22} className="text-[#a855f7]" />,
      label: "In Maintenance",
      value: stats.maintenance,
      bg: "bg-[#f5f3ff]"
    }
  ];

  return (
    <div className="mt-5 sm:mt-6 md:mt-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {cards.map((card, index) => (
        <div key={index} className="rounded-[12px] sm:rounded-[14px] md:rounded-[18px] border border-[#e5e7eb] bg-white px-3 sm:px-4 md:px-5 py-5 sm:py-8 md:py-10 lg:py-14">
          <div className={`w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] md:w-[52px] md:h-[52px] rounded-[10px] sm:rounded-[12px] md:rounded-[14px] ${card.bg} flex items-center justify-center`}>
            {card.icon}
          </div>
          <div className="mt-3 sm:mt-4 md:mt-5">
            <h3 className="text-[24px] sm:text-[30px] md:text-[36px] lg:text-[42px] font-bold text-[#111827]">{card.value}</h3>
            <p className="text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px] text-[#6b7280]">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
