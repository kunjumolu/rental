import React, { useEffect, useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const refTypeColors = {
  invoice: { bg: "#eff6ff", color: "#3b82f6" },
  payment: { bg: "#f0fdf4", color: "#10b981" },
  bill: { bg: "#f5f3ff", color: "#8b5cf6" },
};

const colStyle = {
  padding: "13px 16px",
  fontSize: "13px",
  color: "#374151",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "middle",
};

const headerStyle = {
  padding: "10px 16px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#6b7280",
  textAlign: "left",
  borderBottom: "1px solid #e5e7eb",
  background: "#fff",
};

export default function GeneralLedger() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLedgerEntries();
  }, []);

  const fetchLedgerEntries = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/ledger", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch ledger entries");
      }

      setEntries(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const search = searchTerm.toLowerCase();
      return (
        entry.account_name?.toLowerCase().includes(search) ||
        entry.account_code?.toLowerCase().includes(search) ||
        entry.reference_id?.toLowerCase().includes(search) ||
        entry.description?.toLowerCase().includes(search)
      );
    });
  }, [entries, searchTerm]);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          padding: "20px 24px 16px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <BookOpen size={18} color="#374151" />
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 }}>
            General Ledger
          </h3>
        </div>

        <input
          type="text"
          placeholder="Search ledger..."
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

      {loading ? (
        <div style={{ padding: "24px", color: "#6b7280", fontSize: "14px" }}>
          Loading ledger entries...
        </div>
      ) : error ? (
        <div style={{ padding: "24px", color: "red", fontSize: "14px" }}>
          {error}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div style={{ padding: "24px", color: "#6b7280", fontSize: "14px" }}>
          No ledger entries found.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...headerStyle, width: "110px" }}>Date</th>
                <th style={headerStyle}>Account</th>
                <th style={headerStyle}>Reference</th>
                <th style={headerStyle}>Description</th>
                <th style={{ ...headerStyle, textAlign: "right" }}>Debit</th>
                <th style={{ ...headerStyle, textAlign: "right" }}>Credit</th>
                <th style={{ ...headerStyle, textAlign: "right" }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, i) => {
                const refStyle = refTypeColors[entry.reference_type] || refTypeColors.invoice;

                return (
                  <tr
                    key={entry.id}
                    style={{
                      background: i % 2 === 0 ? "#fff" : "#fafafa",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f9ff")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafafa")
                    }
                  >
                    <td style={{ ...colStyle, color: "#6b7280", fontSize: "12px" }}>
                      {entry.entry_date}
                    </td>

                    <td style={colStyle}>
                      <div style={{ fontWeight: 500, color: "#111827" }}>
                        {entry.account_name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                        {entry.account_code}
                      </div>
                    </td>

                    <td style={colStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 600,
                          background: refStyle.bg,
                          color: refStyle.color,
                          marginBottom: "3px",
                        }}
                      >
                        {entry.reference_type}
                      </span>
                      <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                        {entry.reference_id}
                      </div>
                    </td>

                    <td style={{ ...colStyle, color: "#374151" }}>
                      {entry.description}
                    </td>

                    <td style={{ ...colStyle, textAlign: "right", fontWeight: 600 }}>
                      {Number(entry.debit) > 0 ? (
                        <span style={{ color: "#10b981" }}>
                          {formatCurrency(entry.debit)}
                        </span>
                      ) : (
                        <span style={{ color: "#d1d5db" }}>–</span>
                      )}
                    </td>

                    <td style={{ ...colStyle, textAlign: "right", fontWeight: 600 }}>
                      {Number(entry.credit) > 0 ? (
                        <span style={{ color: "#ef4444" }}>
                          {formatCurrency(entry.credit)}
                        </span>
                      ) : (
                        <span style={{ color: "#d1d5db" }}>–</span>
                      )}
                    </td>

                    <td
                      style={{
                        ...colStyle,
                        textAlign: "right",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {formatCurrency(entry.balance)}
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