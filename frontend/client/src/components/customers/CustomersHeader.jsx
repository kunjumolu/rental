import usePermission from "../../hooks/usePermission";
import { Plus } from "lucide-react";
import { Search } from "lucide-react";

export default function CustomersHeader({ onAddClick, searchTerm, setSearchTerm }) {
  const { can } = usePermission();

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[24px] font-bold text-[#1f2937]">Customers</h1>
        <p className="mt-1 text-[14px] text-[#6b7280]">
          Manage your enterprise client directory and active rentals.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="h-[42px] w-full rounded-[12px] border border-[#d1d5db] pl-9 pr-4 outline-none text-[14px]"
          />
        </div>

        {can("ADD_CUSTOMER") && (
          <button
            onClick={onAddClick}
            className="h-[36px] px-5 rounded-[8px] bg-[#0f4aa8] text-white text-[13px] font-semibold flex items-center gap-2"
          >
            <Plus size={14} />
            Add Customer
          </button>
        )}
      </div>
    </div>
  );
}