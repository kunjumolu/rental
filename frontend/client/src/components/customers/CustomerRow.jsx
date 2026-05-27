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
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${getAvatarColor(customer.name)} flex items-center justify-center text-[12px] font-bold text-[#334155]`}>
            {getInitials(customer.name)}
          </div>
          <span className="text-[13px] font-semibold text-[#1f2937]">
            {customer.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-[13px] text-[#6b7280]">{customer.phone || "-"}</td>
      <td className="px-4 py-3 text-[13px] text-[#374151]">{customer.activeRentals ?? 0}</td>
      <td className={`px-4 py-3 text-[13px] font-semibold ${Number(customer.balance) >= 10000 ? "text-[#dc2626]" : "text-[#1f2937]"}`}>
        {formatCurrency(customer.balance)}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-3 py-[3px] rounded-full text-[11px] font-medium ${
          customer.status === "active" ? "bg-[#dbeafe] text-[#64748b]" : "bg-[#e5e7eb] text-[#4b5563]"
        }`}>
          {customer.status === "active" ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => onView(customer)} className="text-[#64748b] hover:text-[#0f4aa8]">
            <Eye size={16} />
          </button>
          {can("EDIT_CUSTOMER") && (
            <button onClick={() => onEdit(customer)} className="text-[#64748b] hover:text-[#0f4aa8]">
              <Pencil size={16} />
            </button>
          )}
          {can("DELETE_CUSTOMER") && (
            <button onClick={() => onDelete(customer)} className="text-[#64748b] hover:text-red-600">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}