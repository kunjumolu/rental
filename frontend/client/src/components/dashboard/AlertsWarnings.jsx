import { AlertTriangle, DollarSign, Package, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const iconConfig = {
  overdue_rentals: {
    icon: AlertTriangle,
    iconColor: "#f59e0b",
    bg: "#fffbeb",
    borderColor: "#fde68a",
    route: "/rentals",
    state: { activeFilter: "overdue" },
  },
  unpaid_invoices: {
    icon: DollarSign,
    iconColor: "#ef4444",
    bg: "#fef2f2",
    borderColor: "#fecaca",
    route: "/invoices & billing",
    state: { activeFilter: "overdue" },
  },
  low_stock: {
    icon: Package,
    iconColor: "#f59e0b",
    bg: "#fffbeb",
    borderColor: "#fde68a",
    route: "/inventory",
    state: { activeFilter: "low_stock" },
  },
  bills_to_pay: {
    icon: FileText,
    iconColor: "#a855f7",
    bg: "#faf5ff",
    borderColor: "#e9d5ff",
    route: "/expenses",
    state: { activeFilter: "non-billable" },
  },
};

export default function AlertsWarnings({ alerts = [] }) {
  const navigate = useNavigate();

  const handleView = (alert) => {
    const cfg = iconConfig[alert.type];
    if (!cfg) return;

    navigate(cfg.route, { state: cfg.state });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 flex-1">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} color="#f59e0b" />
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
          Alerts & Warnings
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        {alerts.map((alert) => {
          const cfg = iconConfig[alert.type] || iconConfig.low_stock;
          const Icon = cfg.icon;

          return (
            <div
              key={alert.text}
              className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-lg border"
              style={{
                background: cfg.bg,
                borderColor: cfg.borderColor,
              }}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Icon size={16} color={cfg.iconColor} className="shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700 font-medium truncate">
                  {alert.text}
                </span>
              </div>

              <button
                onClick={() => handleView(alert)}
                className="text-xs sm:text-sm text-gray-500 bg-none border-none cursor-pointer font-medium px-1.5 shrink-0 whitespace-nowrap"
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
