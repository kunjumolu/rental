import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-[#F8FAFC]">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                  <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
                  <main className="flex-1 overflow-y-auto p-4">
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
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;