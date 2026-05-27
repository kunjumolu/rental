import { Activity } from "lucide-react";

const colorMap = {
  rental: "#3b82f6",
  payment: "#10b981",
  invoice: "#3b82f6",
  maintenance: "#a855f7",
};

export default function RecentActivity({ activities = [] }) {
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
        <Activity size={18} color="#6b7280" />
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>Recent Activity</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {activities.map((act, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: colorMap[act.type] || "#6b7280",
                marginTop: "5px",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", color: "#111827", fontWeight: 500, lineHeight: 1.4 }}>
                {act.title}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "3px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                  {act.date ? new Date(act.date).toLocaleDateString() : ""}
                </span>
                {act.amount !== null && act.amount !== undefined && (
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#3b82f6" }}>
                    ₹{Number(act.amount).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}