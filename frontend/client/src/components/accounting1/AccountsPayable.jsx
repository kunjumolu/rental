import React, { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Trash2,
  DollarSign,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AccountsPayable() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/bills", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch payable records"
        );
      }
      setBills(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (bill) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/bills/${bill.id}/pay`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to mark bill paid"
        );
      }
      fetchBills();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDelete = async (billId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this bill?"
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/bills/${billId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete bill"
        );
      }
      setBills((prev) =>
        prev.filter((b) => b.id !== billId)
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const search = searchTerm.toLowerCase();
      return (
        bill.bill_number
          ?.toLowerCase()
          .includes(search) ||
        bill.vendor_name
          ?.toLowerCase()
          .includes(search) ||
        bill.vendor_email
          ?.toLowerCase()
          .includes(search)
      );
    });
  }, [bills, searchTerm]);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString(
        "en-IN"
      );
    } catch {
      return dateStr;
    }
  };

  const statusStyles = {
    pending: {
      bg: "#fef3c7",
      color: "#92400e",
    },
    paid: {
      bg: "#d1fae5",
      color: "#065f46",
    },
    overdue: {
      bg: "#fee2e2",
      color: "#b91c1c",
    },
    draft: {
      bg: "#f3f4f6",
      color: "#374151",
    },
  };

  const totalPayables = filteredBills
    .filter((b) => b.status !== "paid")
    .reduce(
      (sum, b) =>
        sum + Number(b.balance_amount || 0),
      0
    );

  const overdueCount = filteredBills.filter(
    (b) => b.status === "overdue"
  ).length;

  const pendingCount = filteredBills.filter(
    (b) => b.status === "pending"
  ).length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Accounts Payable
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Vendor bills and outstanding payables
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
          <input
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="
              h-10 sm:h-11
              w-full
              sm:w-[200px] md:w-[240px]
              border
              border-gray-300
              rounded-xl
              px-3 sm:px-4
              text-xs sm:text-sm
              outline-none
              focus:ring-2
              focus:ring-purple-500
            "
          />
          <button
            onClick={() => navigate("/bills")}
            className="
              h-10 sm:h-11
              px-3 sm:px-4
              rounded-xl
              bg-[#6B21A8]
              text-white
              text-xs sm:text-sm
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              hover:bg-purple-800
              transition
              w-full sm:w-auto
            "
          >
            <Plus size={16} />
            New Bill
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-200">
        <div className="p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-gray-200">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
            Total Payables
          </p>
          <p className="text-lg sm:text-2xl font-bold text-red-500">
            {formatCurrency(totalPayables)}
          </p>
        </div>
        <div className="p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-gray-200">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
            Pending Bills
          </p>
          <p className="text-lg sm:text-2xl font-bold text-amber-500">
            {pendingCount}
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
            Overdue Bills
          </p>
          <p className="text-lg sm:text-2xl font-bold text-red-500">
            {overdueCount}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="p-6 text-sm text-gray-500">
          Loading payable records...
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-red-500">
          {error}
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="p-6 sm:p-10 text-center">
          <div className="text-4xl sm:text-5xl mb-3">
            📄
          </div>
          <p className="font-semibold text-gray-700 text-sm sm:text-base">
            No bills found
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Create your first bill from the Bills
            section
          </p>
          <button
            onClick={() => navigate("/bills")}
            className="
              mt-4 sm:mt-5
              px-4 sm:px-5
              py-2 sm:py-2.5
              rounded-xl
              bg-[#6B21A8]
              text-white
              text-xs sm:text-sm
              font-semibold
              hover:bg-purple-800
              transition
            "
          >
            Go to Bills
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[800px] sm:min-w-[1000px] w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className={headerCell}>
                  Bill #
                </th>
                <th className={headerCell}>
                  Vendor
                </th>
                <th className={`${headerCell} hidden md:table-cell`}>
                  Bill Date
                </th>
                <th className={headerCell}>
                  Due Date
                </th>
                <th className={`${headerCell} text-right`}>
                  Amount
                </th>
                <th className={`${headerCell} text-right hidden sm:table-cell`}>
                  Paid
                </th>
                <th className={`${headerCell} text-right`}>
                  Balance
                </th>
                <th className={`${headerCell} hidden md:table-cell`}>
                  Status
                </th>
                <th className={headerCell}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill, index) => {
                const style =
                  statusStyles[bill.status] || {
                    bg: "#f3f4f6",
                    color: "#374151",
                  };
                return (
                  <tr
                    key={bill.id}
                    className={
                      index % 2 === 0
                        ? "bg-white border-b border-gray-100"
                        : "bg-gray-50 border-b border-gray-100"
                    }
                  >
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#6B21A8]">
                      {bill.bill_number || "-"}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm">
                      <div className="font-medium text-gray-900">
                        {bill.vendor_name || "-"}
                      </div>
                      {bill.vendor_email && (
                        <div className="text-[10px] sm:text-xs text-gray-400 mt-1 hidden sm:block">
                          {bill.vendor_email}
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                      {formatDate(
                        bill.bill_date ||
                          bill.created_at
                      )}
                    </td>
                    <td
                      className={`
                        px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm
                        ${
                          bill.status === "overdue"
                            ? "text-red-500 font-semibold"
                            : "text-gray-500"
                        }
                      `}
                    >
                      {formatDate(bill.due_date)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-right">
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-green-500 text-right hidden sm:table-cell">
                      {formatCurrency(
                        bill.paid_amount
                      )}
                    </td>
                    <td
                      className={`
                        px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-right
                        ${
                          Number(
                            bill.balance_amount
                          ) > 0
                            ? "text-red-500"
                            : "text-green-500"
                        }
                      `}
                    >
                      {formatCurrency(
                        bill.balance_amount
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                      <span
                        style={{
                          background: style.bg,
                          color: style.color,
                        }}
                        className="
                          inline-flex
                          px-2 sm:px-3
                          py-1
                          rounded-full
                          text-[10px] sm:text-xs
                          font-semibold
                          capitalize
                        "
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {Number(
                          bill.balance_amount
                        ) > 0 &&
                          bill.status !==
                            "paid" && (
                            <button
                              onClick={() =>
                                handleMarkPaid(
                                  bill
                                )
                              }
                              style={iconBtn}
                            >
                              <DollarSign
                                size={14}
                                color="#10b981"
                              />
                            </button>
                          )}
                        <button
                          onClick={() =>
                            navigate("/bills")
                          }
                          style={iconBtn}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              bill.id
                            )
                          }
                          style={{
                            ...iconBtn,
                            color: "#ef4444",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td
                  colSpan={4}
                  className="
                    px-3 sm:px-4 py-3 sm:py-4
                    text-xs sm:text-sm
                    font-bold
                    text-right
                    text-gray-900
                  "
                >
                  Total Outstanding:
                </td>
                <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-bold text-right">
                  {formatCurrency(
                    filteredBills.reduce(
                      (sum, b) =>
                        sum +
                        Number(
                          b.amount || 0
                        ),
                      0
                    )
                  )}
                </td>
                <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-bold text-green-500 text-right hidden sm:table-cell">
                  {formatCurrency(
                    filteredBills.reduce(
                      (sum, b) =>
                        sum +
                        Number(
                          b.paid_amount || 0
                        ),
                      0
                    )
                  )}
                </td>
                <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-bold text-red-500 text-right">
                  {formatCurrency(
                    totalPayables
                  )}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

const headerCell =
  "px-3 sm:px-4 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-500";

const iconBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px",
  borderRadius: "6px",
};
