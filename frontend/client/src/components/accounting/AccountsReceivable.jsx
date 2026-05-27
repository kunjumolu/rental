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

      const res = await fetch("http://localhost:5000/api/invoices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch receivable records");
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
        invoice.invoiceNumber?.toLowerCase().includes(search) ||
        invoice.customerName?.toLowerCase().includes(search) ||
        invoice.customerEmail?.toLowerCase().includes(search)
      );
    });
  }, [invoices, searchTerm]);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
            Accounts Receivable
          </h3>
          <p
            style={{
              fontSize: "13px",
              color: "#6b7280",
              marginTop: "4px",
            }}
          >
            Track customer invoices and outstanding receivables
          </p>
        </div>

        <input
          type="text"
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            height: "40px",
            width: "240px",
            border: "1px solid #d1d5db",
            borderRadius: "10px",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
          }}
        />
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ padding: "24px", color: "#6b7280", fontSize: "14px" }}>
          Loading receivable records...
        </div>
      ) : error ? (
        <div style={{ padding: "24px", color: "red", fontSize: "14px" }}>
          {error}
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div style={{ padding: "24px", color: "#6b7280", fontSize: "14px" }}>
          No receivable records found.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={headerCell}>Invoice #</th>
                <th style={headerCell}>Customer</th>
                <th style={headerCell}>Issue Date</th>
                <th style={headerCell}>Due Date</th>
                <th style={headerCell}>Total</th>
                <th style={headerCell}>Paid</th>
                <th style={headerCell}>Balance</th>
                <th style={headerCell}>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.map((invoice, index) => {
                const style = statusStyles[invoice.status] || {
                  bg: "#f3f4f6",
                  color: "#374151",
                };

                const paidAmount =
                  Number(invoice.total || 0) - Number(invoice.balance || 0);

                return (
                  <tr
                    key={invoice.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      background: index % 2 === 0 ? "#fff" : "#fafafa",
                    }}
                  >
                    <td style={bodyCell}>
                      <span style={{ fontWeight: 600, color: "#111827" }}>
                        {invoice.invoiceNumber}
                      </span>
                    </td>

                    <td style={bodyCell}>
                      <div style={{ fontWeight: 500, color: "#111827" }}>
                        {invoice.customerName}
                      </div>
                      <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                        {invoice.customerEmail}
                      </div>
                    </td>

                    <td style={bodyCell}>{invoice.issueDate}</td>
                    <td style={bodyCell}>{invoice.dueDate}</td>
                    <td style={bodyCell}>{formatCurrency(invoice.total)}</td>
                    <td style={bodyCell}>{formatCurrency(paidAmount)}</td>
                    <td style={{ ...bodyCell, fontWeight: 600, color: Number(invoice.balance) > 0 ? "#ef4444" : "#10b981" }}>
                      {formatCurrency(invoice.balance)}
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
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const headerCell = {
  textAlign: "left",
  padding: "14px 16px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#6b7280",
  background: "#fff",
};

const bodyCell = {
  padding: "14px 16px",
  fontSize: "14px",
  color: "#374151",
};