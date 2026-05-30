import { DollarSign } from "lucide-react";

export default function FinancialPosition({ financial }) {
  const positions = [
    {
      label: "Outstanding Receivables",
      sublabel: `${financial.overdueInvoices} overdue invoices`,
      amount: `$${financial.outstandingReceivables.toLocaleString()}`,
      color: "#3b82f6",
    },
    {
      label: "Outstanding Payables",
      sublabel: `${financial.overdueBills} overdue bills`,
      amount: `$${financial.outstandingPayables.toLocaleString()}`,
      color: "#ef4444",
    },
    {
      label: "Net Position",
      sublabel: "AR – AP",
      amount: `${financial.netPosition < 0 ? "-" : ""}$${Math.abs(financial.netPosition).toLocaleString()}`,
      color: financial.netPosition < 0 ? "#ef4444" : "#10b981",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 flex-1">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign size={18} color="#3b82f6" />
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
          Financial Position
        </h3>
      </div>
      <div className="flex flex-col">
        {positions.map((pos, i) => (
          <div
            key={pos.label}
            className={`flex justify-between items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3.5 ${
              i % 2 === 0 ? "bg-gray-50" : "bg-white"
            } ${i === 0 ? "rounded-t-lg" : ""} ${
              i === positions.length - 1 ? "rounded-b-lg" : ""
            }`}
          >
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {pos.label}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {pos.sublabel}
              </div>
            </div>
            <span
              className="font-bold text-sm sm:text-[15px] whitespace-nowrap shrink-0"
              style={{ color: pos.color }}
            >
              {pos.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
