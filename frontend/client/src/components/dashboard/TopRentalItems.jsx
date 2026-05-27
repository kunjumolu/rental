import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const colors = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#a855f7"];

export default function TopRentalItems({ items = [] }) {
  const filteredItems = items.filter((item) => Number(item.value) > 0);

  const data = filteredItems.map((item, index) => ({
    name: item.name,
    value: Number(item.value),
    color: colors[index % colors.length],
  }));

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "24px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "#111827",
          marginBottom: "16px",
        }}
      >
        Top Rental Items
      </h3>

      {data.length === 0 ? (
        <div
          style={{
            height: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            fontSize: "14px",
          }}
        >
          No rental data available yet
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [`${value} times rented`, name]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
            {data.map((item) => (
              <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: item.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "11px", color: "#6b7280" }}>
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}