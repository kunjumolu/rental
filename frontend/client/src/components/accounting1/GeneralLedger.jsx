import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Search,
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import useWindowSize from "../hooks/useWindowSize";

const refTypeColors = {
  invoice: { bg: "#eff6ff", color: "#2563eb" },
  payment: { bg: "#ecfdf5", color: "#059669" },
  bill: { bg: "#f5f3ff", color: "#7c3aed" },
  journal: { bg: "#f3f4f6", color: "#374151" },
};

const headerStyle = {
  padding: "14px 18px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#6b7280",
  textAlign: "left",
  borderBottom: "1px solid #e5e7eb",
  background: "#f9fafb",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
};

const colStyle = {
  padding: "16px 18px",
  fontSize: "14px",
  color: "#374151",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "middle",
};

export default function GeneralLedger() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { isSm, isMd, isLg } = useWindowSize();

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

  const totals = useMemo(() => {
    return filteredEntries.reduce(
      (acc, entry) => {
        acc.debit += Number(entry.debit || 0);
        acc.credit += Number(entry.credit || 0);
        return acc;
      },
      {
        debit: 0,
        credit: 0,
      }
    );
  }, [filteredEntries]);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: isMd ? "22px 24px" : "16px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: isSm ? "center" : "stretch",
          gap: "16px",
          flexWrap: "wrap",
          flexDirection: isSm ? "row" : "column",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "#eef2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOpen size={18} color="#4f46e5" />
            </div>
            <h3
              style={{
                fontSize: isSm ? "17px" : "15px",
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              General Ledger
            </h3>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "#6b7280",
              margin: 0,
            }}
          >
            View and track all accounting journal entries
          </p>
        </div>
        <div
          style={{
            position: "relative",
            width: isSm ? "260px" : "100%",
          }}
        >
          <Search
            size={16}
            color="#9ca3af"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            placeholder="Search ledger..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              height: "42px",
              width: "100%",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              padding: "0 14px 0 38px",
              fontSize: "14px",
              outline: "none",
              background: "#fff",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Summary */}
      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isSm ? "repeat(3, 1fr)" : "1fr",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              padding: isMd ? "18px 24px" : "14px 16px",
              borderRight: isSm ? "1px solid #e5e7eb" : "none",
              borderBottom: isSm ? "none" : "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                margin: "0 0 6px",
                fontWeight: 600,
              }}
            >
              TOTAL DEBIT
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <ArrowUpRight size={18} color="#10b981" />
              <h4
                style={{
                  margin: 0,
                  fontSize: isMd ? "20px" : "17px",
                  fontWeight: 700,
                  color: "#10b981",
                }}
              >
                {formatCurrency(totals.debit)}
              </h4>
            </div>
          </div>
          <div
            style={{
              padding: isMd ? "18px 24px" : "14px 16px",
              borderRight: isSm ? "1px solid #e5e7eb" : "none",
              borderBottom: isSm ? "none" : "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                margin: "0 0 6px",
                fontWeight: 600,
              }}
            >
              TOTAL CREDIT
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <ArrowDownRight size={18} color="#ef4444" />
              <h4
                style={{
                  margin: 0,
                  fontSize: isMd ? "20px" : "17px",
                  fontWeight: 700,
                  color: "#ef4444",
                }}
              >
                {formatCurrency(totals.credit)}
              </h4>
            </div>
          </div>
          <div
            style={{
              padding: isMd ? "18px 24px" : "14px 16px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                margin: "0 0 6px",
                fontWeight: 600,
              }}
            >
              TOTAL ENTRIES
            </p>
            <h4
              style={{
                margin: 0,
                fontSize: isMd ? "20px" : "17px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {filteredEntries.length}
            </h4>
          </div>
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div
          style={{
            padding: "24px",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: isMd
                  ? "110px 1.3fr 1fr 1.4fr 120px 120px 120px"
                  : "80px 1fr 80px",
                gap: "16px",
                padding: "14px 0",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              {Array.from({
                length: isMd ? 7 : 3,
              }).map((__, j) => (
                <div
                  key={j}
                  style={{
                    height: "16px",
                    borderRadius: "6px",
                    background: "#f3f4f6",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : error ? (
        <div
          style={{
            padding: "24px",
            color: "#ef4444",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div
          style={{
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "10px",
            }}
          >
            📚
          </div>
          <h4
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            No ledger entries found
          </h4>
          <p
            style={{
              marginTop: "6px",
              color: "#9ca3af",
              fontSize: "14px",
            }}
          >
            Try changing your search or create accounting transactions.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: isMd ? "1100px" : isSm ? "700px" : "500px",
            }}
          >
            <thead>
              <tr>
                <th style={{ ...headerStyle, width: "120px" }}>Date</th>
                <th style={headerStyle}>Account</th>
                <th style={{ ...headerStyle, display: isMd ? "table-cell" : "none" }}>Reference</th>
                <th style={{ ...headerStyle, display: isMd ? "table-cell" : "none" }}>Description</th>
                <th style={{ ...headerStyle, textAlign: "right" }}>
                  Debit
                </th>
                <th style={{ ...headerStyle, textAlign: "right" }}>
                  Credit
                </th>
                <th style={{ ...headerStyle, textAlign: "right", display: isSm ? "table-cell" : "none" }}>
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, i) => {
                const refStyle =
                  refTypeColors[entry.reference_type] ||
                  refTypeColors.journal;
                return (
                  <tr
                    key={entry.id}
                    style={{
                      background: i % 2 === 0 ? "#fff" : "#fafafa",
                      transition: "0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f9fafb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        i % 2 === 0 ? "#fff" : "#fafafa";
                    }}
                  >
                    <td
                      style={{
                        ...colStyle,
                        color: "#6b7280",
                        fontSize: isSm ? "13px" : "12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.entry_date}
                    </td>
                    <td style={{ ...colStyle, fontSize: isSm ? "14px" : "13px" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#111827",
                        }}
                      >
                        {entry.account_name}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#9ca3af",
                          marginTop: "3px",
                        }}
                      >
                        {entry.account_code}
                      </div>
                    </td>
                    <td style={{ ...colStyle, display: isMd ? "table-cell" : "none" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: refStyle.bg,
                          color: refStyle.color,
                          textTransform: "capitalize",
                          marginBottom: "6px",
                        }}
                      >
                        {entry.reference_type}
                      </span>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {entry.reference_id || "-"}
                      </div>
                    </td>
                    <td
                      style={{
                        ...colStyle,
                        maxWidth: "280px",
                        color: "#374151",
                        display: isMd ? "table-cell" : "none",
                      }}
                    >
                      {entry.description || "-"}
                    </td>
                    <td
                      style={{
                        ...colStyle,
                        textAlign: "right",
                        fontWeight: 700,
                        fontSize: isSm ? "14px" : "13px",
                      }}
                    >
                      {Number(entry.debit) > 0 ? (
                        <span style={{ color: "#10b981" }}>
                          {formatCurrency(entry.debit)}
                        </span>
                      ) : (
                        <span style={{ color: "#d1d5db" }}>—</span>
                      )}
                    </td>
                    <td
                      style={{
                        ...colStyle,
                        textAlign: "right",
                        fontWeight: 700,
                        fontSize: isSm ? "14px" : "13px",
                      }}
                    >
                      {Number(entry.credit) > 0 ? (
                        <span style={{ color: "#ef4444" }}>
                          {formatCurrency(entry.credit)}
                        </span>
                      ) : (
                        <span style={{ color: "#d1d5db" }}>—</span>
                      )}
                    </td>
                    <td
                      style={{
                        ...colStyle,
                        textAlign: "right",
                        fontWeight: 700,
                        color: "#111827",
                        display: isSm ? "table-cell" : "none",
                        fontSize: isSm ? "14px" : "13px",
                      }}
                    >
                      {formatCurrency(entry.balance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr
                style={{
                  background: "#f9fafb",
                  borderTop: "2px solid #e5e7eb",
                }}
              >
                <td
                  colSpan={isMd ? 4 : 2}
                  style={{
                    padding: "16px 18px",
                    textAlign: "right",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  Totals
                </td>
                <td
                  style={{
                    padding: "16px 18px",
                    textAlign: "right",
                    fontSize: isSm ? "14px" : "13px",
                    fontWeight: 700,
                    color: "#10b981",
                  }}
                >
                  {formatCurrency(totals.debit)}
                </td>
                <td
                  style={{
                    padding: "16px 18px",
                    textAlign: "right",
                    fontSize: isSm ? "14px" : "13px",
                    fontWeight: 700,
                    color: "#ef4444",
                  }}
                >
                  {formatCurrency(totals.credit)}
                </td>
                <td style={{ display: isSm ? "table-cell" : "none" }}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
