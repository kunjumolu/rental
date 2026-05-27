import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  FileText, BarChart2, ChevronDown, ChevronRight,
  Users, Package, DollarSign, ShoppingCart,
  TrendingUp, TrendingDown, RefreshCw, ArrowLeft,
} from "lucide-react";

const API_BASE = "http://localhost:5000";
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];

const DATE_RANGES = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Quarter", value: "quarter" },
  { label: "This Year", value: "year" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Previous Week", value: "prev_week" },
  { label: "Previous Month", value: "prev_month" },
  { label: "Previous Quarter", value: "prev_quarter" },
  { label: "Previous Year", value: "prev_year" },
  { label: "All Time", value: "all" },
];

const REPORT_SECTIONS = [
  { title: "Business Overview", key: "business-overview", icon: BarChart2, color: "#2563eb" },
  { title: "Sales", key: "sales", icon: TrendingUp, color: "#10b981" },
  { title: "Receivables", key: "receivables", icon: DollarSign, color: "#f59e0b" },
  { title: "Payments Received", key: "payments", icon: ShoppingCart, color: "#10b981" },
  { title: "Payables", key: "payables", icon: TrendingDown, color: "#ef4444" },
  { title: "Purchases & Expenses", key: "expenses", icon: FileText, color: "#a855f7" },
  { title: "Inventory", key: "inventory", icon: Package, color: "#06b6d4" },
  { title: "Customers", key: "customers", icon: Users, color: "#6B21A8" },
  { title: "Rentals", key: "rentals", icon: ShoppingCart, color: "#2563eb" },
];

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

export default function Reports() {
  const [period, setPeriod] = useState("month");
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [view, setView] = useState("table");
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target)) {
        setDateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchReport = useCallback(async (type, selectedPeriod) => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/reports/${type}?period=${selectedPeriod}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setReportData((prev) => ({ ...prev, [type]: data }));
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  }, []);

  useEffect(() => {
    if (activeReport) {
      fetchReport(activeReport, period);
    }
  }, [activeReport, period, fetchReport]);

  const selectedPeriodLabel =
    DATE_RANGES.find((d) => d.value === period)?.label || "This Month";

  const currentData = activeReport ? reportData[activeReport] : null;
  const isLoading = activeReport ? loading[activeReport] : false;

  return (
    <div className="flex h-full min-h-screen bg-[#f3f4f6]">

      {/* Left Sidebar */}
      <div className="w-[260px] bg-white border-r border-[#e5e7eb] flex-shrink-0 overflow-y-auto">
        <div className="p-5 border-b border-[#e5e7eb]">
          <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest">
            ALL REPORTS
          </p>
        </div>

        <div className="py-2">
          {REPORT_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeReport === section.key;

            return (
              <button
                key={section.key}
                onClick={() => {
                  setActiveReport(section.key);
                  setView("table");
                }}
                className={`w-full flex items-center justify-between px-5 py-3 text-[14px] font-medium transition-all ${
                  isActive
                    ? "bg-[#eff6ff] text-[#2563eb] border-r-2 border-[#2563eb]"
                    : "text-[#374151] hover:bg-[#f9fafb]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-[6px] flex items-center justify-center"
                    style={{ background: `${section.color}18` }}
                  >
                    <Icon size={14} style={{ color: section.color }} />
                  </div>
                  <span>{section.title}</span>
                </div>
                <ChevronRight
                  size={14}
                  className={isActive ? "text-[#2563eb]" : "text-[#9ca3af]"}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* No report selected — show All Reports overview */}
        {!activeReport ? (
          <AllReportsOverview
            onSelect={(key) => {
              setActiveReport(key);
              setView("table");
            }}
          />
        ) : (
          <>
            {/* Top Bar */}
            <div className="bg-white border-b border-[#e5e7eb] px-6 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {/* Back button */}
                  <button
                    onClick={() => setActiveReport(null)}
                    className="flex items-center gap-2 text-[14px] font-medium text-[#6b7280] hover:text-[#111827] transition"
                  >
                    <ArrowLeft size={16} />
                    All Reports
                  </button>
                  <span className="text-[#d1d5db]">/</span>
                  <h2 className="text-[18px] font-bold text-[#111827]">
                    {REPORT_SECTIONS.find((r) => r.key === activeReport)?.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Date Range Dropdown */}
                  <div ref={dateDropdownRef} className="relative">
                    <button
                      onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                      className="flex items-center gap-2 h-[38px] px-4 rounded-[10px] border border-[#d1d5db] bg-white text-[13px] font-semibold text-[#374151] hover:bg-[#f9fafb] transition"
                    >
                      <span className="text-[#9ca3af] font-medium">Date Range:</span>
                      <span className="text-[#2563eb]">{selectedPeriodLabel}</span>
                      <ChevronDown
                        size={14}
                        className={`text-[#6b7280] transition-transform ${
                          dateDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {dateDropdownOpen && (
                      <div className="absolute right-0 top-[44px] z-30 w-[220px] rounded-[14px] border border-[#e5e7eb] bg-white shadow-xl overflow-hidden">
                        <div className="max-h-[320px] overflow-y-auto py-1">
                          {DATE_RANGES.map((range) => (
                            <button
                              key={range.value}
                              onClick={() => {
                                setPeriod(range.value);
                                setDateDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-[14px] font-medium transition-all ${
                                period === range.value
                                  ? "bg-[#2563eb] text-white"
                                  : "text-[#374151] hover:bg-[#f3f4f6]"
                              }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* View toggle */}
                  <div className="flex items-center gap-1 bg-[#f3f4f6] rounded-[10px] p-1">
                    <button
                      onClick={() => setView("table")}
                      className={`px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all ${
                        view === "table"
                          ? "bg-white text-[#111827] shadow-sm"
                          : "text-[#6b7280]"
                      }`}
                    >
                      Table View
                    </button>
                    <button
                      onClick={() => setView("chart")}
                      className={`px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all ${
                        view === "chart"
                          ? "bg-white text-[#111827] shadow-sm"
                          : "text-[#6b7280]"
                      }`}
                    >
                      Chart View
                    </button>
                  </div>

                  {/* Refresh */}
                  <button
                    onClick={() => fetchReport(activeReport, period)}
                    className="h-[38px] w-[38px] rounded-[10px] border border-[#d1d5db] flex items-center justify-center bg-white hover:bg-[#f3f4f6] transition"
                  >
                    <RefreshCw
                      size={15}
                      className={`text-[#6b7280] ${isLoading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {lastUpdated && (
                <p className="text-[11px] text-[#9ca3af] mt-2">
                  Last updated:{" "}
                  {lastUpdated.toLocaleTimeString("en-IN")} •{" "}
                  {selectedPeriodLabel}
                </p>
              )}
            </div>

            {/* Report Body */}
            <div className="p-6 flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[14px] text-[#6b7280]">
                      Loading report...
                    </p>
                  </div>
                </div>
              ) : currentData ? (
                <ReportContent
                  reportKey={activeReport}
                  data={currentData}
                  view={view}
                />
              ) : (
                <div className="flex items-center justify-center py-20 text-[14px] text-[#9ca3af]">
                  No data available
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// All Reports Overview page
function AllReportsOverview({ onSelect }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-[#111827]">Reports</h1>
        <p className="text-[14px] text-[#6b7280] mt-1">
          Select a report to view detailed analytics
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {REPORT_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.key}
              onClick={() => onSelect(section.key)}
              className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 text-left hover:border-[#2563eb] hover:shadow-md transition-all group"
            >
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4"
                style={{ background: `${section.color}15` }}
              >
                <Icon size={22} style={{ color: section.color }} />
              </div>
              <h3 className="text-[16px] font-bold text-[#111827] group-hover:text-[#2563eb] transition-colors">
                {section.title}
              </h3>
              <p className="text-[13px] text-[#9ca3af] mt-1">
                {getReportDescription(section.key)}
              </p>
              <div className="mt-4 flex items-center gap-1 text-[12px] font-semibold text-[#2563eb] opacity-0 group-hover:opacity-100 transition-opacity">
                View Report
                <ChevronRight size={14} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getReportDescription(key) {
  const descriptions = {
    "business-overview": "Profit & Loss, Revenue vs Expenses summary",
    "sales": "All invoices and sales transactions",
    "receivables": "Customers with outstanding balances",
    "payments": "Payments received from customers",
    "payables": "Vendor bills and outstanding payables",
    "expenses": "Business expenses by category",
    "inventory": "Stock levels and rental performance",
    "customers": "Customer revenue and activity",
    "rentals": "All rental orders and status",
  };
  return descriptions[key] || "View detailed report";
}

function ReportContent({ reportKey, data, view }) {
  switch (reportKey) {
    case "business-overview": return <BusinessOverviewReport data={data} view={view} />;
    case "sales": return <SalesReport data={data} view={view} />;
    case "receivables": return <ReceivablesReport data={data} view={view} />;
    case "payments": return <PaymentsReport data={data} view={view} />;
    case "payables": return <PayablesReport data={data} view={view} />;
    case "expenses": return <ExpensesReport data={data} view={view} />;
    case "inventory": return <InventoryReport data={data} view={view} />;
    case "customers": return <CustomersReport data={data} view={view} />;
    case "rentals": return <RentalsReport data={data} view={view} />;
    default: return null;
  }
}

function SummaryCards({ cards }) {
  return (
    <div
      className="grid gap-4 mb-6"
      style={{ gridTemplateColumns: `repeat(${Math.min(cards.length, 4)}, 1fr)` }}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-[16px] border border-[#e5e7eb] p-5"
        >
          <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wide mb-2">
            {card.label}
          </p>
          <p
            className="text-[22px] font-bold"
            style={{ color: card.color || "#111827" }}
          >
            {card.value}
          </p>
          {card.sub && (
            <p className="text-[12px] text-[#9ca3af] mt-1">{card.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ReportTable({ columns, rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-10 text-center">
        <p className="text-[40px] mb-3">📊</p>
        <p className="text-[16px] font-semibold text-[#6b7280]">No data found</p>
        <p className="text-[13px] text-[#9ca3af] mt-1">
          Try selecting a different date range
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[16px] border border-[#e5e7eb] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[11px] font-bold text-[#6b7280] uppercase tracking-wide ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-[#f3f4f6] hover:bg-[#f0f9ff] transition ${
                  index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-[13px] text-[#374151] ${
                      col.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Individual report components
function BusinessOverviewReport({ data, view }) {
  const d = data?.data || {};

  const cards = [
    { label: "Total Revenue", value: formatCurrency(d.revenue), color: "#10b981", sub: `${d.paidCount || 0} paid invoices` },
    { label: "Total Expenses", value: formatCurrency(d.expenses), color: "#ef4444", sub: `${d.expenseCount || 0} expenses` },
    { label: "Net Income", value: formatCurrency(d.netIncome), color: (d.netIncome || 0) >= 0 ? "#10b981" : "#ef4444", sub: "Revenue - Expenses" },
    { label: "Outstanding", value: formatCurrency(d.outstanding), color: "#f59e0b", sub: `${d.unpaidCount || 0} unpaid invoices` },
  ];

  const chartData = [
    { name: "Revenue", value: d.revenue || 0, fill: "#10b981" },
    { name: "Expenses", value: d.expenses || 0, fill: "#ef4444" },
    { name: "Outstanding", value: d.outstanding || 0, fill: "#f59e0b" },
  ];

  const rentalCards = [
    { label: "Total Rentals", value: String(d.totalRentals || 0), color: "#2563eb" },
    { label: "Active", value: String(d.activeRentals || 0), color: "#10b981" },
    { label: "Completed", value: String(d.completedRentals || 0), color: "#6b7280" },
    { label: "Overdue", value: String(d.overdueRentals || 0), color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <SummaryCards cards={cards} />
      <SummaryCards cards={rentalCards} />
      {view === "chart" ? (
        <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6">
          <h3 className="text-[15px] font-bold text-[#111827] mb-4">Financial Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [formatCurrency(v), ""]} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6">
          <h3 className="text-[15px] font-bold text-[#111827] mb-4">Profit & Loss Summary</h3>
          <div className="space-y-1">
            {[
              { label: "Total Revenue", value: d.revenue, color: "#10b981" },
              { label: "Total Expenses", value: d.expenses, color: "#ef4444" },
              { label: "Net Income", value: d.netIncome, color: (d.netIncome || 0) >= 0 ? "#10b981" : "#ef4444" },
              { label: "Outstanding Receivables", value: d.outstanding, color: "#f59e0b" },
              { label: "Total Rental Value", value: d.totalRentalValue, color: "#2563eb" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-3 border-b border-[#f3f4f6]">
                <span className="text-[14px] text-[#374151] font-medium">{item.label}</span>
                <span className="text-[16px] font-bold" style={{ color: item.color }}>
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SalesReport({ data, view }) {
  const rows = data?.data || [];
  const summary = data?.summary || {};

  const cards = [
    { label: "Total Sales", value: formatCurrency(summary.total), color: "#10b981" },
    { label: "Total Collected", value: formatCurrency(summary.totalPaid), color: "#2563eb" },
    { label: "Outstanding", value: formatCurrency(summary.totalOutstanding), color: "#ef4444" },
    { label: "Total Invoices", value: String(rows.length), color: "#6b7280" },
  ];

  const columns = [
    { key: "invoice_number", label: "Invoice #" },
    { key: "customer_name", label: "Customer" },
    { key: "issue_date", label: "Date", render: (v) => formatDate(v) },
    { key: "total_amount", label: "Total", align: "right", render: (v) => formatCurrency(v) },
    { key: "paid_amount", label: "Paid", align: "right", render: (v) => formatCurrency(v) },
    { key: "balance_amount", label: "Balance", align: "right", render: (v) => (
      <span style={{ color: Number(v) > 0 ? "#ef4444" : "#10b981" }}>{formatCurrency(v)}</span>
    )},
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <div className="space-y-6">
      <SummaryCards cards={cards} />
      <ReportTable columns={columns} rows={rows} />
    </div>
  );
}

function ReceivablesReport({ data, view }) {
  const rows = data?.data || [];
  const summary = data?.summary || {};

  const cards = [
    { label: "Total Outstanding", value: formatCurrency(summary.totalOutstanding), color: "#ef4444" },
    { label: "Customers with Balance", value: String(rows.length), color: "#f59e0b" },
  ];

  const columns = [
    { key: "customer_name", label: "Customer" },
    { key: "customer_email", label: "Email" },
    { key: "invoice_count", label: "Invoices", align: "right" },
    { key: "total_invoiced", label: "Total", align: "right", render: (v) => formatCurrency(v) },
    { key: "total_paid", label: "Paid", align: "right", render: (v) => formatCurrency(v) },
    { key: "outstanding_balance", label: "Outstanding", align: "right", render: (v) => (
      <span className="text-[#ef4444] font-bold">{formatCurrency(v)}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <SummaryCards cards={cards} />
      <ReportTable columns={columns} rows={rows} />
    </div>
  );
}

function PaymentsReport({ data, view }) {
  const rows = data?.data || [];
  const summary = data?.summary || {};

  const cards = [
    { label: "Total Received", value: formatCurrency(summary.totalReceived), color: "#10b981" },
    { label: "Payments Count", value: String(rows.length), color: "#2563eb" },
  ];

  const columns = [
    { key: "invoice_number", label: "Invoice #" },
    { key: "customer_name", label: "Customer" },
    { key: "payment_date", label: "Date", render: (v) => formatDate(v) },
    { key: "total_amount", label: "Invoice Total", align: "right", render: (v) => formatCurrency(v) },
    { key: "paid_amount", label: "Received", align: "right", render: (v) => (
      <span className="text-[#10b981] font-bold">{formatCurrency(v)}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <SummaryCards cards={cards} />
      <ReportTable columns={columns} rows={rows} />
    </div>
  );
}

function PayablesReport({ data, view }) {
  const rows = data?.data || [];
  const summary = data?.summary || {};

  const cards = [
    { label: "Total Payable", value: formatCurrency(summary.totalPayable), color: "#ef4444" },
    { label: "Pending Bills", value: String(rows.length), color: "#f59e0b" },
  ];

  const columns = [
    { key: "bill_number", label: "Bill #" },
    { key: "vendor_name", label: "Vendor" },
    { key: "due_date", label: "Due Date", render: (v) => formatDate(v) },
    { key: "amount", label: "Amount", align: "right", render: (v) => formatCurrency(v) },
    { key: "paid_amount", label: "Paid", align: "right", render: (v) => formatCurrency(v) },
    { key: "balance_amount", label: "Balance", align: "right", render: (v) => (
      <span className="text-[#ef4444] font-bold">{formatCurrency(v)}</span>
    )},
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <div className="space-y-6">
      <SummaryCards cards={cards} />
      <ReportTable columns={columns} rows={rows} />
    </div>
  );
}

function ExpensesReport({ data, view }) {
  const rows = data?.data || [];
  const summary = data?.summary || {};
  const byCategory = summary.byCategory || {};

  const cards = [
    { label: "Total Expenses", value: formatCurrency(summary.total), color: "#ef4444" },
    { label: "Count", value: String(rows.length), color: "#6b7280" },
    { label: "Avg per Expense", value: formatCurrency(rows.length > 0 ? (summary.total || 0) / rows.length : 0), color: "#f59e0b" },
  ];

  const chartData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  const columns = [
    { key: "date", label: "Date", render: (v) => formatDate(v) },
    { key: "expense_account", label: "Account" },
    { key: "vendor_name", label: "Vendor" },
    { key: "paid_through", label: "Paid Through" },
    { key: "amount", label: "Amount", align: "right", render: (v) => (
      <span className="text-[#ef4444] font-bold">{formatCurrency(v)}</span>
    )},
    { key: "status", label: "Status" },
  ];

  return (
    <div className="space-y-6">
      <SummaryCards cards={cards} />
      {view === "chart" && chartData.length > 0 ? (
        <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6">
          <h3 className="text-[15px] font-bold text-[#111827] mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} paddingAngle={2}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [formatCurrency(v), ""]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ReportTable columns={columns} rows={rows} />
      )}
    </div>
  );
}

function InventoryReport({ data, view }) {
  const rows = data?.data || [];
  const summary = data?.summary || {};

  const cards = [
    { label: "Total Items", value: String(summary.totalItems || 0), color: "#2563eb" },
    { label: "Total Revenue", value: formatCurrency(summary.totalRevenue), color: "#10b981" },
    { label: "Low/Out of Stock", value: String(summary.lowStock || 0), color: "#ef4444" },
  ];

  const columns = [
    { key: "name", label: "Item" },
    { key: "sku", label: "SKU" },
    { key: "category", label: "Category" },
    { key: "total_quantity", label: "Total", align: "right" },
    { key: "available_quantity", label: "Available", align: "right", render: (v) => (
      <span style={{ color: Number(v) > 0 ? "#10b981" : "#ef4444" }} className="font-semibold">{v}</span>
    )},
    { key: "rented_quantity", label: "Rented", align: "right" },
    { key: "rental_count", label: "Orders", align: "right" },
    { key: "total_revenue", label: "Revenue", align: "right", render: (v) => formatCurrency(v) },
    { key: "status", label: "Status", render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        v === 'available' ? 'bg-[#dbeafe] text-[#1d4ed8]' :
        v === 'out_of_stock' ? 'bg-[#fee2e2] text-[#b91c1c]' :
        v === 'low_stock' ? 'bg-[#fef3c7] text-[#92400e]' :
        'bg-[#f3e8ff] text-[#7c3aed]'
      }`}>
        {(v || "").replaceAll("_", " ")}
      </span>
    )},
  ];

  return (
    <div className="space-y-6">
      <SummaryCards cards={cards} />
      <ReportTable columns={columns} rows={rows} />
    </div>
  );
}

function CustomersReport({ data, view }) {
  const rows = data?.data || [];
  const summary = data?.summary || {};

  const cards = [
    { label: "Total Customers", value: String(summary.totalCustomers || 0), color: "#6B21A8" },
    { label: "Total Revenue", value: formatCurrency(summary.totalRevenue), color: "#10b981" },
  ];

  const columns = [
    { key: "name", label: "Customer" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "total_rentals", label: "Rentals", align: "right" },
    { key: "total_invoices", label: "Invoices", align: "right" },
    { key: "total_paid", label: "Revenue", align: "right", render: (v) => (
      <span className="text-[#10b981] font-bold">{formatCurrency(v)}</span>
    )},
    { key: "outstanding", label: "Outstanding", align: "right", render: (v) => (
      <span style={{ color: Number(v) > 0 ? "#ef4444" : "#10b981" }} className="font-bold">
        {formatCurrency(v)}
      </span>
    )},
  ];

  return (
    <div className="space-y-6">
      <SummaryCards cards={cards} />
      {view === "chart" ? (
        <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6">
          <h3 className="text-[15px] font-bold text-[#111827] mb-4">Top Customers by Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rows.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [formatCurrency(v), "Revenue"]} />
              <Bar dataKey="total_paid" fill="#6B21A8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ReportTable columns={columns} rows={rows} />
      )}
    </div>
  );
}

function RentalsReport({ data, view }) {
  const rows = data?.data || [];
  const summary = data?.summary || {};

  const cards = [
    { label: "Total Rentals", value: String(rows.length), color: "#2563eb" },
    { label: "Total Value", value: formatCurrency(summary.total), color: "#10b981" },
    { label: "Collected", value: formatCurrency(summary.collected), color: "#2563eb" },
    { label: "Outstanding", value: formatCurrency(summary.outstanding), color: "#ef4444" },
  ];

  const columns = [
    { key: "order_number", label: "Order #" },
    { key: "customer_name", label: "Customer" },
    { key: "start_date", label: "Start", render: (v) => formatDate(v) },
    { key: "end_date", label: "End", render: (v) => formatDate(v) },
    { key: "items_count", label: "Items", align: "right" },
    { key: "total_amount", label: "Total", align: "right", render: (v) => formatCurrency(v) },
    { key: "balance_amount", label: "Balance", align: "right", render: (v) => (
      <span style={{ color: Number(v) > 0 ? "#ef4444" : "#10b981" }} className="font-bold">
        {formatCurrency(v)}
      </span>
    )},
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <div className="space-y-6">
      <SummaryCards cards={cards} />
      <ReportTable columns={columns} rows={rows} />
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    paid: "bg-[#d1fae5] text-[#065f46]",
    active: "bg-[#dbeafe] text-[#1d4ed8]",
    overdue: "bg-[#fee2e2] text-[#b91c1c]",
    pending: "bg-[#fef3c7] text-[#92400e]",
    completed: "bg-[#d1fae5] text-[#065f46]",
    returned: "bg-[#f3f4f6] text-[#374151]",
    draft: "bg-[#f3f4f6] text-[#374151]",
    sent: "bg-[#dbeafe] text-[#1d4ed8]",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
      colors[status] || "bg-[#f3f4f6] text-[#374151]"
    }`}>
      {status}
    </span>
  );
}