import React from "react";

const colors = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#6366f1",
  "#ec4899",
];

export default function TopCustomers({
  customers = [],
  onViewAll,
}) {
  // SAFE DATA FILTER
  const validCustomers = customers.filter(
    (c) =>
      c &&
      c.name &&
      c.name.trim() !== "" &&
      Number(c.revenue || 0) >= 0
  );

  // GET INITIALS
  const getInitials = (name) => {
    if (!name) return "NA";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#111827",
          }}
        >
          Top Customers
        </h3>

        <button
          onClick={onViewAll}
          style={{
            fontSize: "13px",
            color: "#3b82f6",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          View All
        </button>
      </div>

      {/* EMPTY STATE */}
      {validCustomers.length === 0 ? (
        <div
          style={{
            padding: "30px 0",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "14px",
          }}
        >
          No top customers available
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "18px",
          }}
        >
          {validCustomers.map((c, index) => (
            <div
              key={c.id || index}
              style={{
                border: "1px solid #f3f4f6",
                borderRadius: "12px",
                padding: "16px",
                background: "#fff",
                transition: "0.2s",
              }}
            >
              {/* CUSTOMER INFO */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background:
                      colors[index % colors.length],
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {getInitials(c.name)}
                </div>

                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#111827",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.name}
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#9ca3af",
                      marginTop: "2px",
                    }}
                  >
                    Top customer
                  </div>
                </div>
              </div>

              {/* REVENUE */}
              <div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  ₹{Number(c.revenue || 0).toLocaleString()}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    marginTop: "4px",
                  }}
                >
                  Lifetime revenue
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}