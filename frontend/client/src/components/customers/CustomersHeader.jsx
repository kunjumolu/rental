import usePermission from "../../hooks/usePermission";
import { Plus, Search } from "lucide-react";

export default function CustomersHeader({ onAddClick, searchTerm, setSearchTerm }) {
  const { can } = usePermission();

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customers</h1>
        <p className="mt-1 text-[13px] sm:text-sm text-gray-500">
          Manage your enterprise client directory and active rentals.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="h-[40px] sm:h-[42px] w-full rounded-xl border border-gray-300 pl-9 pr-4 outline-none text-[13px] sm:text-sm" />
        </div>

        {can("ADD_CUSTOMER") && (
          <button onClick={onAddClick}
            className="h-[40px] sm:h-[36px] px-5 rounded-lg sm:rounded-xl bg-[#0f4aa8] text-white text-[13px] font-semibold flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus size={14} />
            Add Customer
          </button>
        )}
      </div>
    </div>
  );
}
