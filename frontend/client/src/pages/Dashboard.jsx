import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

  const fetchDashboard = useCallback(async () => {
    try {
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
      setError("");
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchDashboard]);

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
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
            Real-time overview of your rental business performance
          </p>
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
    </div>
  );
}
