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
        <DollarSign size={18} color="#3b82f6" />
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>Financial Position</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {positions.map((pos, i) => (
          <div
            key={pos.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 16px",
              background: i % 2 === 0 ? "#f9fafb" : "#fff",
              borderRadius: i === 0 ? "8px 8px 0 0" : i === positions.length - 1 ? "0 0 8px 8px" : "0",
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{pos.label}</div>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{pos.sublabel}</div>
            </div>
            <span style={{ fontWeight: 700, fontSize: "15px", color: pos.color }}>{pos.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}