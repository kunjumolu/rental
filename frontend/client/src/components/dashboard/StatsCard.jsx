import { DollarSign, ShoppingCart, AlertTriangle, Package } from "lucide-react";

const iconMap = {
  revenue: DollarSign,
  rentals: ShoppingCart,
  overdue: AlertTriangle,
  inventory: Package,
};

const iconColorMap = {
  revenue: "#3b82f6",
  rentals: "#3b82f6",
  overdue: "#f59e0b",
  inventory: "#3b82f6",
};

export default function StatsCard({
  title,
  value,
  change,
  changeLabel,
  type,
}) {
  const Icon = iconMap[type] || DollarSign;
  const iconColor = iconColorMap[type] || "#3b82f6";
  const isNegative = change && change.startsWith("-");
  const isOverdue = type === "overdue";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 flex flex-col gap-1.5 flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <span className="text-xs sm:text-sm text-gray-500 font-medium truncate">
          {title}
        </span>
        <Icon size={16} className="sm:w-5 sm:h-5 shrink-0" color={iconColor} />
      </div>
      <div
        className={`text-2xl sm:text-[28px] md:text-[32px] font-bold leading-tight truncate ${
          isOverdue ? "text-red-500" : "text-gray-900"
        }`}
      >
        {value}
      </div>
      {change && (
        <div className="flex items-center gap-1 text-[11px] sm:text-[13px] flex-wrap">
          <span
            className={`flex items-center gap-0.5 whitespace-nowrap ${
              isNegative ? "text-amber-500" : "text-emerald-500"
            }`}
          >
            {isNegative ? "↘" : "↗"} {change}
          </span>
          <span className="text-gray-400">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
