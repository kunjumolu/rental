import { useEffect, useRef, useState } from "react";
import { ChevronDown, ArrowUp, ArrowDown } from "lucide-react";

const PERIODS = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Quarter", value: "quarter" },
  { label: "This Year", value: "year" },
];

const SORT_OPTIONS = [
  { label: "Default Order", value: "default" },
  { label: "Highest Value", value: "desc" },
  { label: "Lowest Value", value: "asc" },
];

export default function FinancialSummaryCards() {
  const [summary, setSummary] = useState({
    totalAssets: 0,
    liabilities: 0,
    equity: 0,
    revenue: 0,
    expenses: 0,
    netIncome: 0,
  });

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const periodRef = useRef(null);
  const sortRef = useRef(null);

  useEffect(() => {
    fetchSummary(period);
  }, [period]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (periodRef.current && !periodRef.current.contains(e.target)) {
        setPeriodDropdownOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSummary = async (selectedPeriod) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      let dateFilter = "";
      let expenseDateFilter = "";

      if (selectedPeriod === "today") {
        dateFilter = `AND DATE(issue_date) = CURRENT_DATE`;
        expenseDateFilter = `AND DATE(date) = CURRENT_DATE`;
      } else if (selectedPeriod === "week") {
        dateFilter = `AND issue_date >= DATE_TRUNC('week', CURRENT_DATE)`;
        expenseDateFilter = `AND date >= DATE_TRUNC('week', CURRENT_DATE)`;
      } else if (selectedPeriod === "month") {
        dateFilter = `AND issue_date >= DATE_TRUNC('month', CURRENT_DATE)`;
        expenseDateFilter = `AND date >= DATE_TRUNC('month', CURRENT_DATE)`;
      } else if (selectedPeriod === "quarter") {
        dateFilter = `AND issue_date >= DATE_TRUNC('quarter', CURRENT_DATE)`;
        expenseDateFilter = `AND date >= DATE_TRUNC('quarter', CURRENT_DATE)`;
      } else if (selectedPeriod === "year") {
        dateFilter = `AND issue_date >= DATE_TRUNC('year', CURRENT_DATE)`;
        expenseDateFilter = `AND date >= DATE_TRUNC('year', CURRENT_DATE)`;
      }

      const res = await fetch(
        `http://localhost:5000/api/accounting/summary?period=${selectedPeriod}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (data.success && data.data) {
        const d = data.data;
        setSummary({
          totalAssets: Number(d.totalAssets || 0),
          liabilities: Number(d.liabilities || 0),
          equity: Number(d.equity || 0),
          revenue: Number(d.revenue || 0),
          expenses: Number(d.expenses || 0),
          netIncome: Number(d.netIncome || 0),
        });
      }
    } catch (err) {
      console.error("Financial summary fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const selectedPeriodLabel =
    PERIODS.find((p) => p.value === period)?.label || "All";

  const selectedSortLabel =
    SORT_OPTIONS.find((s) => s.value === sortOrder)?.label || "Default Order";

  const baseSummaryItems = [
    { label: "Total Assets", value: summary.totalAssets, color: "#3b82f6" },
    { label: "Liabilities", value: summary.liabilities, color: "#ef4444" },
    { label: "Equity", value: summary.equity, color: "#3b82f6" },
    { label: "Revenue", value: summary.revenue, color: "#10b981" },
    { label: "Expenses", value: summary.expenses, color: "#ef4444" },
    {
      label: "Net Income",
      value: summary.netIncome,
      color: summary.netIncome >= 0 ? "#10b981" : "#ef4444",
    },
  ];

  const summaryItems = [...baseSummaryItems].sort((a, b) => {
    if (sortOrder === "asc") return a.value - b.value;
    if (sortOrder === "desc") return b.value - a.value;
    return 0;
  });

  const maxValue = Math.max(...summaryItems.map((s) => Math.abs(s.value)), 1);

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>
          Financial Summary
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Period Filter */}
          <div ref={periodRef} style={{ position: "relative" }}>
            <button
              onClick={() => {
                setPeriodDropdownOpen(!periodDropdownOpen);
                setSortDropdownOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                height: "38px",
                padding: "0 14px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                background: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
                cursor: "pointer",
              }}
            >
              <span style={{ color: "#9ca3af", fontWeight: 500 }}>Filter By:</span>
              <span>{selectedPeriodLabel}</span>
              <ChevronDown
                size={15}
                style={{
                  color: "#6b7280",
                  transform: periodDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {periodDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "44px",
                  zIndex: 30,
                  width: "200px",
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                }}
              >
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setPeriod(p.value);
                      setPeriodDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: period === p.value ? "#fff" : "#374151",
                      background: period === p.value ? "#2563eb" : "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (period !== p.value)
                        e.currentTarget.style.background = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      if (period !== p.value)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div ref={sortRef} style={{ position: "relative" }}>
            <button
              onClick={() => {
                setSortDropdownOpen(!sortDropdownOpen);
                setPeriodDropdownOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                height: "38px",
                padding: "0 14px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                background: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
                cursor: "pointer",
              }}
            >
              {sortOrder === "asc" ? (
                <ArrowUp size={14} style={{ color: "#6b7280" }} />
              ) : sortOrder === "desc" ? (
                <ArrowDown size={14} style={{ color: "#6b7280" }} />
              ) : (
                <ArrowDown size={14} style={{ color: "#9ca3af" }} />
              )}
              <span style={{ color: "#9ca3af", fontWeight: 500 }}>Sort:</span>
              <span>{selectedSortLabel}</span>
              <ChevronDown
                size={15}
                style={{
                  color: "#6b7280",
                  transform: sortDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {sortDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "44px",
                  zIndex: 30,
                  width: "200px",
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                }}
              >
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => {
                      setSortOrder(s.value);
                      setSortDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: sortOrder === s.value ? "#fff" : "#374151",
                      background: sortOrder === s.value ? "#2563eb" : "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (sortOrder !== s.value)
                        e.currentTarget.style.background = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      if (sortOrder !== s.value)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "16px",
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px 18px",
                }}
              >
                <div style={{ height: "12px", background: "#f3f4f6", borderRadius: "6px", marginBottom: "12px", width: "60%" }} />
                <div style={{ height: "24px", background: "#f3f4f6", borderRadius: "6px", width: "80%" }} />
              </div>
            ))
          : summaryItems.map((item) => (
              <div
                key={item.label}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px 18px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginBottom: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: item.color }}>
                  {formatCurrency(item.value)}
                </div>
                <div style={{ marginTop: "10px", height: "4px", background: "#f3f4f6", borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      background: item.color,
                      borderRadius: "999px",
                      width: `${Math.min((Math.abs(item.value) / maxValue) * 100, 100)}%`,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            ))}
      </div>

      {!loading && (
        <p style={{ marginTop: "10px", fontSize: "12px", color: "#9ca3af", textAlign: "right" }}>
          Showing:{" "}
          <span style={{ fontWeight: 600, color: "#6b7280" }}>{selectedPeriodLabel}</span>
        </p>
      )}
    </div>
  );
}