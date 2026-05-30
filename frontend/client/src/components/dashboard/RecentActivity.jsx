import { Activity } from "lucide-react";

const colorMap = {
  rental: "#3b82f6",
  payment: "#10b981",
  invoice: "#3b82f6",
  maintenance: "#a855f7",
};

export default function RecentActivity({ activities = [] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 flex-1">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} color="#6b7280" />
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
          Recent Activity
        </h3>
      </div>
      <div className="flex flex-col gap-3.5">
        {activities.map((act, i) => (
          <div key={i} className="flex gap-2.5 items-start">
            <span
              className="w-2 h-2 rounded-full mt-[5px] shrink-0"
              style={{ background: colorMap[act.type] || "#6b7280" }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-[13px] text-gray-900 font-medium leading-snug line-clamp-2">
                {act.title}
              </div>
              <div className="flex gap-2 mt-1 items-center flex-wrap">
                <span className="text-xs text-gray-400">
                  {act.date
                    ? new Date(act.date).toLocaleDateString()
                    : ""}
                </span>
                {act.amount !== null && act.amount !== undefined && (
                  <span className="text-xs font-semibold text-blue-500">
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
