import React from "react";
import { useNavigate } from "react-router-dom";

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899"];

export default function TopCustomers({ customers = [], onViewAll }) {
  const navigate = useNavigate();

  const validCustomers = customers.filter(
    (c) =>
      c &&
      c.name &&
      c.name.trim() !== "" &&
      Number(c.revenue || 0) >= 0
  );

  const getInitials = (name) => {
    if (!name) return "NA";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const handleCustomerClick = (customer) => {
    if (customer.id || customer.name) {
      navigate("/customers", { state: { searchCustomer: customer.name } });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
          Top Customers
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs sm:text-[13px] text-blue-500 bg-transparent border-none cursor-pointer font-medium"
        >
          View All
        </button>
      </div>

      {/* EMPTY STATE */}
      {validCustomers.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-xs sm:text-sm">
          No top customers available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 sm:gap-4">
          {validCustomers.map((c, index) => (
            <div
              key={c.id || index}
              onClick={() => handleCustomerClick(c)}
              className="border border-gray-100 rounded-xl p-3 sm:p-4 bg-white transition cursor-pointer hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 active:scale-[0.98]"
            >
              {/* CUSTOMER INFO */}
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-[10px] text-white flex items-center justify-center text-[11px] sm:text-[13px] font-bold shrink-0"
                  style={{ background: colors[index % colors.length] }}
                >
                  {getInitials(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Top customer
                  </div>
                </div>
              </div>

              {/* REVENUE */}
              <div>
                <div className="text-lg sm:text-[22px] font-bold text-gray-900">
                  ₹{Number(c.revenue || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-1">
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
