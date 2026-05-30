import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatYAxis = (value) => {
  if (value === 0) return "₹0k";
  return `₹${value / 1000}k`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "8px 12px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
        fontSize: "13px",
      }}
    >
      <p style={{ margin: "0 0 4px 0", fontWeight: 600, color: "#374151" }}>
        {label}
      </p>
      {payload.map((entry, index) => (
        <p
          key={index}
          style={{ margin: "2px 0", color: entry.color, fontSize: "13px" }}
        >
          ₹{Number(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function RevenueChart({ data = [] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6 flex-[2] min-w-0">
      <h3 className="text-[13px] sm:text-sm md:text-base font-semibold text-gray-900 mb-2.5 sm:mb-3.5 md:mb-5">
        Revenue vs Expenses
      </h3>

      <div className="h-[200px] sm:h-[240px] md:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barGap={2}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              width={45}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
            />
            <Legend
              iconType="square"
              iconSize={10}
              formatter={(value) => (
                <span className="text-[11px] sm:text-[12px] md:text-[13px] text-gray-500">
                  {value}
                </span>
              )}
            />
            <Bar
              dataKey="expenses"
              name="expenses"
              fill="#ef4444"
              radius={[3, 3, 0, 0]}
              activeBar={false}
            />
            <Bar
              dataKey="revenue"
              name="revenue"
              fill="#3b82f6"
              radius={[3, 3, 0, 0]}
              activeBar={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        .recharts-wrapper,
        .recharts-wrapper *,
        .recharts-surface {
          outline: none !important;
        }
        .recharts-cartesian-grid-bg {
          display: none !important;
        }
        .recharts-rectangle.recharts-tooltip-cursor {
          display: none !important;
        }
        .recharts-wrapper .recharts-surface {
          overflow: visible !important;
        }
      `}</style>
    </div>
  );
}
