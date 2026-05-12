import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout Components
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

// Pages
import Login from './pages/Login';
import { Dashboard } from "./pages/Dashboard";
import { TestConnection } from './pages/TestConnection';
import Customers from './pages/Customers';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <Routes>

        {/* Login Page WITHOUT Sidebar & Topbar */}
        <Route path="/" element={<Login />} />

        {/* Dashboard Layout */}
        <Route
          path="/*"
          element={
            <div className="flex min-h-screen bg-[#F8FAFC]">

              {/* Sidebar */}
              <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
              />

              <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

                {/* Topbar */}
                <Topbar
                  onMenuClick={() => setIsSidebarOpen(true)}
                />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4">
                  <Routes>

                    <Route
                      path="/dashboard"
                      element={<Dashboard />}
                    />

                    <Route
                      path="/test"
                      element={<TestConnection />}
                    />
                    <Route path="/customers" element={<Customers />} />

                  </Routes>
                </main>

              </div>
            </div>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;