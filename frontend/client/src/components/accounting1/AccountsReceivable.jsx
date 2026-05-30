import React, { useEffect, useMemo, useState } from "react";

export default function AccountsReceivable() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:5000/api/invoices",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch receivable records"
        );
      }
      setInvoices(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const search = searchTerm.toLowerCase();
      return (
        invoice.invoiceNumber
          ?.toLowerCase()
          .includes(search) ||
        invoice.customerName
          ?.toLowerCase()
          .includes(search) ||
        invoice.customerEmail
          ?.toLowerCase()
          .includes(search)
      );
    });
  }, [invoices, searchTerm]);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  const statusStyles = {
    draft: {
      bg: "#f3f4f6",
      color: "#374151",
    },
    sent: {
      bg: "#dbeafe",
      color: "#1d4ed8",
    },
    paid: {
      bg: "#d1fae5",
      color: "#065f46",
    },
    overdue: {
      bg: "#fee2e2",
      color: "#b91c1c",
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Accounts Receivable
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track customer invoices and outstanding
            receivables
          </p>
        </div>
        <input
          type="text"
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          className="
            h-10 sm:h-11
            w-full
            sm:w-[200px] md:w-[260px]
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
      </div>

      {/* Body */}
      {loading ? (
        <div className="p-6 text-sm text-gray-500">
          Loading receivable records...
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-red-500">
          {error}
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="p-6 sm:p-10 text-center">
          <div className="text-4xl sm:text-5xl mb-3">
            📄
          </div>
          <p className="font-semibold text-gray-700 text-sm sm:text-base">
            No receivable records found
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Customer invoices will appear here
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[700px] sm:min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className={headerCell}>
                  Invoice #
                </th>
                <th className={headerCell}>
                  Customer
                </th>
                <th className={`${headerCell} hidden md:table-cell`}>
                  Issue Date
                </th>
                <th className={headerCell}>
                  Due Date
                </th>
                <th className={`${headerCell} text-right`}>
                  Total
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
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(
                (invoice, index) => {
                  const style =
                    statusStyles[
                      invoice.status
                    ] || {
                      bg: "#f3f4f6",
                      color: "#374151",
                    };
                  const paidAmount =
                    Number(
                      invoice.total || 0
                    ) -
                    Number(
                      invoice.balance || 0
                    );
                  return (
                    <tr
                      key={invoice.id}
                      className={
                        index % 2 === 0
                          ? "bg-white border-b border-gray-100"
                          : "bg-gray-50 border-b border-gray-100"
                      }
                    >
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900">
                        {
                          invoice.invoiceNumber
                        }
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm">
                        <div className="font-medium text-gray-900">
                          {
                            invoice.customerName
                          }
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-400 mt-1 hidden sm:block">
                          {
                            invoice.customerEmail
                          }
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                        {
                          invoice.issueDate
                        }
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                        {invoice.dueDate}
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium text-right">
                        {formatCurrency(
                          invoice.total
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium text-green-600 text-right hidden sm:table-cell">
                        {formatCurrency(
                          paidAmount
                        )}
                      </td>
                      <td
                        className={`
                          px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-right
                          ${
                            Number(
                              invoice.balance
                            ) > 0
                              ? "text-red-500"
                              : "text-green-600"
                          }
                        `}
                      >
                        {formatCurrency(
                          invoice.balance
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                        <span
                          style={{
                            background:
                              style.bg,
                            color:
                              style.color,
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
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const headerCell =
  "px-3 sm:px-4 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-500";
