import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from "./pages/Dashboard";
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import Rentals from './pages/Rentals';
import Invoices from './pages/Invoices';
import Accounting from './pages/Accounting';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';
import Vendors from './pages/Vendors';
import Expenses from './pages/Expenses';
import Bills from './pages/Bills';
import ResetPassword from './pages/ResetPassword';
 
function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";
  const isReports = location.pathname === "/reports";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Main Sidebar — always visible on lg+ for normal pages, always hidden (drawer only) on Reports */}
      {isReports ? (
        /* Reports page: sidebar is ALWAYS a drawer (even on desktop) */
        <>
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setIsSidebarOpen(false)} />
          )}
          <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          </div>
        </>
      ) : (
        /* All other pages: sidebar visible on lg+, drawer on mobile */
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {isDashboard ? (
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        ) : (
          /* Mobile hamburger (+ Reports page always shows it) */
          <div className={`${isReports ? "" : "lg:hidden"} sticky top-0 z-20 bg-white border-b border-slate-200 px-4 h-14 flex items-center shrink-0`}>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <Menu size={24} />
            </button>
          </div>
        )}
        <main className={`flex-1 overflow-y-auto ${isReports ? "" : "p-4"}`}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute permission="VIEW_DASHBOARD">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customers"
              element={
                <ProtectedRoute permission="VIEW_CUSTOMERS">
                  <Customers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/inventory"
              element={
                <ProtectedRoute permission="VIEW_INVENTORY">
                  <Inventory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/rentals"
              element={
                <ProtectedRoute permission="VIEW_RENTALS">
                  <Rentals />
                </ProtectedRoute>
              }
            />

            <Route
              path="/invoices & billing"
              element={
                <ProtectedRoute permission="VIEW_INVOICES">
                  <Invoices />
                </ProtectedRoute>
              }
            />

            <Route
              path="/accounting"
              element={
                <ProtectedRoute permission="VIEW_ACCOUNTING">
                  <Accounting />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute permission="VIEW_REPORTS">
                  <Reports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendors"
              element={
                <ProtectedRoute permission="VIEW_VENDORS">
                  <Vendors />
                </ProtectedRoute>
              }
            />

            <Route
              path="/expenses"
              element={
                <ProtectedRoute permission="VIEW_EXPENSES">
                  <Expenses />
                </ProtectedRoute>
              }
            />
             

          <Route
              path="/bills"
              element={
                <ProtectedRoute permission="VIEW_BILLS">
                  <Bills />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute permission="VIEW_SETTINGS">
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
