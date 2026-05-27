import React, { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2, DollarSign, Plus } from "lucide-react";
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
        throw new Error(data.message || "Failed to fetch payable records");
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

      const res = await fetch(`http://localhost:5000/api/bills/${bill.id}/pay`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to mark bill paid");
      }

      fetchBills();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDelete = async (billId) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/bills/${billId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete bill");
      }

      setBills((prev) => prev.filter((b) => b.id !== billId));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const search = searchTerm.toLowerCase();
      return (
        bill.bill_number?.toLowerCase().includes(search) ||
        bill.vendor_name?.toLowerCase().includes(search) ||
        bill.vendor_email?.toLowerCase().includes(search)
      );
    });
  }, [bills, searchTerm]);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN");
    } catch {
      return dateStr;
    }
  };

  const statusStyles = {
    pending: { bg: "#fef3c7", color: "#92400e" },
    paid: { bg: "#d1fae5", color: "#065f46" },
    overdue: { bg: "#fee2e2", color: "#b91c1c" },
    draft: { bg: "#f3f4f6", color: "#374151" },
  };

  const totalPayables = filteredBills
    .filter((b) => b.status !== "paid")
    .reduce((sum, b) => sum + Number(b.balance_amount || 0), 0);

  const overdueCount = filteredBills.filter(
    (b) => b.status === "overdue"
  ).length;

  const pendingCount = filteredBills.filter(
    (b) => b.status === "pending"
  ).length;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#111827",
              margin: 0,
            }}
          >
            Accounts Payable
          </h3>
          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
            Vendor bills and outstanding payables
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              height: "40px",
              width: "220px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              padding: "0 14px",
              fontSize: "14px",
              outline: "none",
            }}
          />

          <button
            onClick={() => navigate("/bills")}
            style={{
              height: "40px",
              padding: "0 14px",
              borderRadius: "10px",
              background: "#6B21A8",
              color: "#fff",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
            New Bill
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderRight: "1px solid #e5e7eb",
          }}
        >
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0" }}>
            Total Payables
          </p>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#ef4444", margin: 0 }}>
            {formatCurrency(totalPayables)}
          </p>
        </div>
        <div
          style={{
            padding: "16px 24px",
            borderRight: "1px solid #e5e7eb",
          }}
        >
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0" }}>
            Pending Bills
          </p>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#f59e0b", margin: 0 }}>
            {pendingCount}
          </p>
        </div>
        <div style={{ padding: "16px 24px" }}>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0" }}>
            Overdue Bills
          </p>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#ef4444", margin: 0 }}>
            {overdueCount}
          </p>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ padding: "24px", color: "#6b7280", fontSize: "14px" }}>
          Loading payable records...
        </div>
      ) : error ? (
        <div style={{ padding: "24px", color: "red", fontSize: "14px" }}>
          {error}
        </div>
      ) : filteredBills.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "14px",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>📄</div>
          <p style={{ fontWeight: 600, color: "#6b7280", marginBottom: "4px" }}>
            No bills found
          </p>
          <p>Create your first bill from the Purchases → Bills section</p>
          <button
            onClick={() => navigate("/bills")}
            style={{
              marginTop: "16px",
              padding: "8px 20px",
              borderRadius: "10px",
              background: "#6B21A8",
              color: "#fff",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go to Bills
          </button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                <th style={headerCell}>Bill #</th>
                <th style={headerCell}>Vendor</th>
                <th style={headerCell}>Bill Date</th>
                <th style={headerCell}>Due Date</th>
                <th style={{ ...headerCell, textAlign: "right" }}>Amount</th>
                <th style={{ ...headerCell, textAlign: "right" }}>Paid</th>
                <th style={{ ...headerCell, textAlign: "right" }}>Balance</th>
                <th style={headerCell}>Status</th>
                <th style={headerCell}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBills.map((bill, index) => {
                const style = statusStyles[bill.status] || {
                  bg: "#f3f4f6",
                  color: "#374151",
                };

                return (
                  <tr
                    key={bill.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      background: index % 2 === 0 ? "#fff" : "#fafafa",
                    }}
                  >
                    <td style={{ ...bodyCell, fontWeight: 600, color: "#6B21A8" }}>
                      {bill.bill_number || "-"}
                    </td>

                    <td style={bodyCell}>
                      <div style={{ fontWeight: 500, color: "#111827" }}>
                        {bill.vendor_name || "-"}
                      </div>
                      {bill.vendor_email && (
                        <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                          {bill.vendor_email}
                        </div>
                      )}
                    </td>

                    <td style={{ ...bodyCell, color: "#6b7280" }}>
                      {formatDate(bill.bill_date || bill.created_at)}
                    </td>

                    <td
                      style={{
                        ...bodyCell,
                        color:
                          bill.status === "overdue" ? "#ef4444" : "#6b7280",
                        fontWeight:
                          bill.status === "overdue" ? 600 : 400,
                      }}
                    >
                      {formatDate(bill.due_date)}
                    </td>

                    <td style={{ ...bodyCell, textAlign: "right", fontWeight: 600 }}>
                      {formatCurrency(bill.amount)}
                    </td>

                    <td
                      style={{
                        ...bodyCell,
                        textAlign: "right",
                        color: "#10b981",
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(bill.paid_amount)}
                    </td>

                    <td
                      style={{
                        ...bodyCell,
                        textAlign: "right",
                        fontWeight: 600,
                        color:
                          Number(bill.balance_amount) > 0
                            ? "#ef4444"
                            : "#10b981",
                      }}
                    >
                      {formatCurrency(bill.balance_amount)}
                    </td>

                    <td style={bodyCell}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: style.bg,
                          color: style.color,
                          textTransform: "capitalize",
                        }}
                      >
                        {bill.status}
                      </span>
                    </td>

                    <td style={bodyCell}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {Number(bill.balance_amount) > 0 &&
                          bill.status !== "paid" && (
                            <button
                              onClick={() => handleMarkPaid(bill)}
                              title="Mark as Paid"
                              style={iconBtn}
                            >
                              <DollarSign size={16} color="#10b981" />
                            </button>
                          )}
                        <button
                          onClick={() => navigate("/bills")}
                          title="View in Bills"
                          style={iconBtn}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(bill.id)}
                          title="Delete"
                          style={{ ...iconBtn, color: "#ef4444" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Footer totals */}
            <tfoot>
              <tr style={{ borderTop: "2px solid #e5e7eb", background: "#f9fafb" }}>
                <td
                  colSpan={4}
                  style={{
                    padding: "14px 16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#111827",
                    textAlign: "right",
                  }}
                >
                  Total Outstanding:
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#111827",
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(
                    filteredBills.reduce(
                      (sum, b) => sum + Number(b.amount || 0),
                      0
                    )
                  )}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#10b981",
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(
                    filteredBills.reduce(
                      (sum, b) => sum + Number(b.paid_amount || 0),
                      0
                    )
                  )}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#ef4444",
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(totalPayables)}
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

const headerCell = {
  textAlign: "left",
  padding: "14px 16px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#6b7280",
  background: "#f9fafb",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const bodyCell = {
  padding: "14px 16px",
  fontSize: "14px",
  color: "#374151",
};

const iconBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#374151",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px",
  borderRadius: "6px",
};