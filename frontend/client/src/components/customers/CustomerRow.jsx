import usePermission from "../../hooks/usePermission";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

export default function CustomerRow({ customer, onView, onEdit, onDelete }) {
  const { can } = usePermission();

  const getInitials = (name) => {
    if (!name) return "NA";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ["bg-[#bcd3ff]", "bg-[#ffc9b3]", "bg-[#d9dee7]", "bg-[#c7d2fe]", "bg-[#bfdbfe]"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <tr className="border-b border-[#d9deea]">
      <td className="px-3 sm:px-4 py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${getAvatarColor(customer.name)} flex items-center justify-center text-[10px] sm:text-xs font-bold text-[#334155] shrink-0`}>
            {getInitials(customer.name)}
          </div>
          <span className="text-[12px] sm:text-[13px] font-semibold text-[#1f2937] truncate max-w-[120px] sm:max-w-none">
            {customer.name}
          </span>
        </div>
      </td>
      <td className="px-3 sm:px-4 py-3 text-[12px] sm:text-[13px] text-gray-500 hidden sm:table-cell">
        {customer.phone || "-"}
      </td>
      <td className="px-3 sm:px-4 py-3 text-[12px] sm:text-[13px] text-gray-700">
        {customer.activeRentals ?? 0}
      </td>
      <td className={`px-3 sm:px-4 py-3 text-[12px] sm:text-[13px] font-semibold ${
        Number(customer.balance) >= 10000 ? "text-red-600" : "text-gray-900"
      }`}>
        {formatCurrency(customer.balance)}
      </td>
      <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
        <span className={`inline-flex px-2 sm:px-3 py-[2px] sm:py-[3px] rounded-full text-[10px] sm:text-[11px] font-medium ${
          customer.status === "active" ? "bg-blue-100 text-gray-500" : "bg-gray-100 text-gray-600"
        }`}>
          {customer.status === "active" ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-3 sm:px-4 py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => onView(customer)} className="text-gray-500 hover:text-[#0f4aa8]">
            <Eye size={15} className="sm:w-4 sm:h-4" />
          </button>
          {can("EDIT_CUSTOMER") && (
            <button onClick={() => onEdit(customer)} className="text-gray-500 hover:text-[#0f4aa8]">
              <Pencil size={15} className="sm:w-4 sm:h-4" />
            </button>
          )}
          {can("DELETE_CUSTOMER") && (
            <button onClick={() => onDelete(customer)} className="text-gray-500 hover:text-red-600">
              <Trash2 size={15} className="sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
