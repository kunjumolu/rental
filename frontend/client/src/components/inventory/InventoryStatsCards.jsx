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
    <div className="mt-8 grid grid-cols-4 gap-5">
      {cards.map((card, index) => (
        <div key={index} className="rounded-[18px] border border-[#e5e7eb] bg-white px-5 py-14">
          <div className={`w-[52px] h-[52px] rounded-[14px] ${card.bg} flex items-center justify-center`}>
            {card.icon}
          </div>
          <div className="mt-5">
            <h3 className="text-[42px] font-bold text-[#111827]">{card.value}</h3>
            <p className="text-[16px] text-[#6b7280]">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}