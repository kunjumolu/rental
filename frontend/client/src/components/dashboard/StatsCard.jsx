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

export default function StatsCard({ title, value, change, changeLabel, type }) {
  const Icon = iconMap[type] || DollarSign;
  const iconColor = iconColorMap[type] || "#3b82f6";
  const isNegative = change && change.startsWith("-");
  const isOverdue = type === "overdue";

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: 500 }}>{title}</span>
        <Icon size={20} color={iconColor} />
      </div>
      <div
        style={{
          fontSize: "32px",
          fontWeight: 700,
          color: isOverdue ? "#ef4444" : "#111827",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {change && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px" }}>
          <span
            style={{
              color: isNegative ? "#f59e0b" : "#10b981",
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            {isNegative ? "↘" : "↗"} {change}
          </span>
          <span style={{ color: "#9ca3af" }}>{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
