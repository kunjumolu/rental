import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import TopRentalItems from "../components/dashboard/TopRentalItems";
import FinancialPosition from "../components/dashboard/FinancialPosition";
import AlertsWarnings from "../components/dashboard/AlertsWarnings";
import RecentActivity from "../components/dashboard/RecentActivity";
import TopCustomers from "../components/dashboard/TopCustomers";

const REFRESH_INTERVAL = 30000; // 30 seconds

export default function DashboardPage() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalRevenue: 0,
      activeRentals: 0,
      overdueRentals: 0,
      availableInventory: 0,
    },
    financial: {
      outstandingReceivables: 0,
      overdueInvoices: 0,
      outstandingPayables: 0,
      overdueBills: 0,
      netPosition: 0,
    },
    alerts: [],
    recentActivity: [],
    topCustomers: [],
    topRentalItems: [],
    revenueChart: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/dashboard/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }

      setDashboardData(data.data);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const handleManualRefresh = () => {
    fetchDashboard(true);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);

    if (diff < 10) return "just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdated.toLocaleTimeString("en-IN");
  };

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${Number(dashboardData.stats.totalRevenue).toLocaleString("en-IN")}`,
      type: "revenue",
    },
    {
      title: "Active Rentals",
      value: String(dashboardData.stats.activeRentals),
      type: "rentals",
    },
    {
      title: "Overdue Rentals",
      value: String(dashboardData.stats.overdueRentals),
      type: "overdue",
    },
    {
      title: "Available Inventory",
      value: String(dashboardData.stats.availableInventory),
      type: "inventory",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <main style={{ padding: "28px 28px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0 }}>
              Dashboard
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              Real-time overview of your rental business performance
            </p>
          </div>

          {/* Refresh button + last updated */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                background: refreshing ? "#f9fafb" : "#fff",
                color: "#374151",
                fontSize: "13px",
                fontWeight: 600,
                cursor: refreshing ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              <RefreshCw
                size={14}
                style={{
                  color: "#6b7280",
                  animation: refreshing ? "spin 1s linear infinite" : "none",
                }}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            {lastUpdated && (
              <LiveIndicator lastUpdated={formatLastUpdated()} />
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", fontSize: "14px", color: "#6b7280" }}>
            Loading dashboard...
          </div>
        ) : error ? (
          <div style={{ padding: "20px", fontSize: "14px", color: "red" }}>
            {error}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
              {stats.map((stat) => (
                <StatsCard key={stat.title} {...stat} />
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
              <RevenueChart data={dashboardData.revenueChart} />
              <TopRentalItems items={dashboardData.topRentalItems} />
            </div>

            {/* Middle Row */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
              <FinancialPosition financial={dashboardData.financial} />
              <AlertsWarnings alerts={dashboardData.alerts} />
              <RecentActivity activities={dashboardData.recentActivity} />
            </div>

            {/* Top Customers */}
            <TopCustomers
              customers={dashboardData.topCustomers}
              onViewAll={() => navigate("/customers")}
            />
          </>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function LiveIndicator({ lastUpdated }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "#10b981",
          display: "inline-block",
          animation: "pulse 2s infinite",
        }}
      />
      {/* <span style={{ fontSize: "11px", color: "#6b7280" }}>
        Live • Updated {lastUpdated}
      </span> */}

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}