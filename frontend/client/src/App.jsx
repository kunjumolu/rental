import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
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
import MyProfile from './pages/MyProfile';
import UserManagement from './pages/UserManagement';

// ============================================================
// AppLayout — sidebar + topbar wrapper for all authenticated pages
// ============================================================
function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard';
  const isReports = location.pathname === '/reports';

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar:
          - Reports page → always a drawer (even on desktop)
          - All other pages → visible on lg+, drawer on mobile */}
      {isReports ? (
        <>
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          <div
            className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          </div>
        </>
      ) : (
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {isDashboard ? (
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        ) : (
          /* Mobile hamburger (+ Reports page always shows it) */
          <div
            className={`${
              isReports ? '' : 'lg:hidden'
            } sticky top-0 z-20 bg-white border-b border-slate-200 px-4 h-14 flex items-center shrink-0`}
          >
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <Menu size={24} />
            </button>
          </div>
        )}

        <main
          className={`flex-1 overflow-y-auto ${isReports ? '' : 'p-4'}`}
        >
          <Routes>
            {/* ───── Core pages ───── */}
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

            {/* ───── Purchases group ───── */}
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

            {/* ───── Profile group ───── */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute permission="VIEW_PROFILE">
                  <MyProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute permission="MANAGE_USERS">
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            {/* ───── Settings ───── */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute permission="VIEW_SETTINGS">
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Default fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ============================================================
// App — top-level router
// ============================================================
function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* All other paths require authentication */}
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
