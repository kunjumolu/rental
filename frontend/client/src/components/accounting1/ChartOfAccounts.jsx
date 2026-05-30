import React, { useEffect, useMemo, useState } from "react";
import useWindowSize from "../hooks/useWindowSize";

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { isSm, isMd, isLg } = useWindowSize();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/chart-of-accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch chart of accounts");
      }
      setAccounts(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const search = searchTerm.toLowerCase();
      return (
        account.account_code?.toLowerCase().includes(search) ||
        account.account_name?.toLowerCase().includes(search) ||
        account.account_type?.toLowerCase().includes(search)
      );
    });
  }, [accounts, searchTerm]);

  const typeColors = {
    Asset: { bg: "#dbeafe", color: "#1d4ed8" },
    Liability: { bg: "#fee2e2", color: "#b91c1c" },
    Equity: { bg: "#ede9fe", color: "#6d28d9" },
    Revenue: { bg: "#d1fae5", color: "#065f46" },
    Expense: { bg: "#fef3c7", color: "#92400e" },
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
          padding: isMd ? "20px 24px" : "12px 16px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: isSm ? "center" : "stretch",
          flexDirection: isSm ? "row" : "column",
          gap: "12px",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: isSm ? "16px" : "15px",
              fontWeight: 600,
              color: "#111827",
              margin: 0,
            }}
          >
            Chart of Accounts
          </h3>
          <p
            style={{
              fontSize: "13px",
              color: "#6b7280",
              marginTop: "4px",
              lineHeight: 1.5,
            }}
          >
            View and manage your accounting account structure
          </p>
        </div>
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            height: "40px",
            width: isSm ? "240px" : "100%",
            minWidth: 0,
            border: "1px solid #d1d5db",
            borderRadius: "10px",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Body */}
      {loading ? (
        <div
          style={{
            padding: "24px",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          Loading accounts...
        </div>
      ) : error ? (
        <div
          style={{
            padding: "24px",
            color: "red",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div
          style={{
            padding: "24px",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          No accounts found.
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: isMd ? "700px" : "500px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={headerCell}>Account Code</th>
                <th style={headerCell}>Account Name</th>
                <th style={headerCell}>Account Type</th>
                <th style={{ ...headerCell, display: isMd ? "table-cell" : "none" }}>Parent Account</th>
                <th style={headerCell}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account, index) => {
                const typeStyle = typeColors[account.account_type] || {
                  bg: "#f3f4f6",
                  color: "#374151",
                };
                return (
                  <tr
                    key={account.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      background: index % 2 === 0 ? "#fff" : "#fafafa",
                    }}
                  >
                    <td
                      style={{
                        ...bodyCell,
                        fontWeight: 600,
                        color: "#111827",
                        fontSize: isSm ? "14px" : "13px",
                      }}
                    >
                      {account.account_code}
                    </td>
                    <td style={{ ...bodyCell, fontSize: isSm ? "14px" : "13px" }}>{account.account_name}</td>
                    <td style={{ ...bodyCell, fontSize: isSm ? "14px" : "13px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: isSm ? "12px" : "11px",
                          fontWeight: 600,
                          background: typeStyle.bg,
                          color: typeStyle.color,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {account.account_type}
                      </span>
                    </td>
                    <td style={{ ...bodyCell, display: isMd ? "table-cell" : "none" }}>
                      {account.parent_account_id
                        ? account.parent_account_id
                        : "-"}
                    </td>
                    <td style={{ ...bodyCell, fontSize: isSm ? "14px" : "13px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: isSm ? "12px" : "11px",
                          fontWeight: 600,
                          background: account.is_active
                            ? "#d1fae5"
                            : "#f3f4f6",
                          color: account.is_active
                            ? "#065f46"
                            : "#6b7280",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {account.is_active ? "Active" : "Inactive"}
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
  padding: "12px 14px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#6b7280",
  background: "#fff",
  whiteSpace: "nowrap",
};

const bodyCell = {
  padding: "12px 14px",
  color: "#374151",
  whiteSpace: "nowrap",
};
