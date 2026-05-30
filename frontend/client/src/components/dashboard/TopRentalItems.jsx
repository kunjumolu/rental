import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const colors = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#a855f7"];

export default function TopRentalItems({ items = [] }) {
  const filteredItems = items.filter((item) => Number(item.value) > 0);

  const data = filteredItems.map((item, index) => ({
    name: item.name,
    value: Number(item.value),
    color: colors[index % colors.length],
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6 flex-1 min-w-0">
      <h3 className="text-[13px] sm:text-sm md:text-base font-semibold text-gray-900 mb-2 sm:mb-3">
        Top Rental Items
      </h3>

      {data.length === 0 ? (
        <div className="h-[160px] sm:h-[180px] md:h-[200px] flex items-center justify-center text-gray-400 text-xs sm:text-sm">
          No rental data available yet
        </div>
      ) : (
        <>
          <div className="h-[150px] sm:h-[170px] md:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  activeIndex={-1}
                  activeShape={null}
                  isAnimationActive={true}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                      style={{ outline: "none", cursor: "pointer" }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  cursor={false}
                  formatter={(value, name) => [
                    `${value} times rented`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    backgroundColor: "#ffffff",
                    padding: "8px 12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-x-2 gap-y-1 sm:gap-x-2.5 sm:gap-y-1.5 mt-2 sm:mt-3">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-1"
              >
                <span
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <span className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-500 whitespace-nowrap">
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
