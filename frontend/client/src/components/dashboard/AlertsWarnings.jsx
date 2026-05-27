import { AlertTriangle, DollarSign, Package, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const iconConfig = {
  overdue_rentals: {
    icon: AlertTriangle,
    iconColor: "#f59e0b",
    bg: "#fffbeb",
    borderColor: "#fde68a",
    route: "/rentals",
  },
  unpaid_invoices: {
    icon: DollarSign,
    iconColor: "#ef4444",
    bg: "#fef2f2",
    borderColor: "#fecaca",
    route: "/invoices & billing",
    state: { activeTab: "Accounts Receivable" },
  },
  low_stock: {
    icon: Package,
    iconColor: "#f59e0b",
    bg: "#fffbeb",
    borderColor: "#fde68a",
    route: "/inventory",
  },
  bills_to_pay: {
    icon: FileText,
    iconColor: "#a855f7",
    bg: "#faf5ff",
    borderColor: "#e9d5ff",
    route: "/accounting",
    state: { activeTab: "Accounts Payable" },
  },
};

export default function AlertsWarnings({ alerts = [] }) {
  const navigate = useNavigate();

  const handleView = (alert) => {
    const cfg = iconConfig[alert.type];
    if (!cfg) return;

    if (cfg.state) {
      navigate(cfg.route, { state: cfg.state });
    } else {
      navigate(cfg.route);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "24px",
        flex: 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <AlertTriangle size={18} color="#f59e0b" />
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>Alerts & Warnings</h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {alerts.map((alert) => {
          const cfg = iconConfig[alert.type] || iconConfig.low_stock;
          const Icon = cfg.icon;

          return (
            <div
              key={alert.text}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                background: cfg.bg,
                border: `1px solid ${cfg.borderColor}`,
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon size={16} color={cfg.iconColor} />
                <span style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>
                  {alert.text}
                </span>
              </div>

              <button
                onClick={() => handleView(alert)}
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                  padding: "2px 6px",
                }}
              >
                View
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}