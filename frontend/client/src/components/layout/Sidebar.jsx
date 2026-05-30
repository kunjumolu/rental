import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Box, Calculator, Settings,
  Plus, HelpCircle, LogOut, X, ShoppingCartIcon, Receipt,
  FileIcon, ShoppingBag, ChevronDown, ChevronRight, Store, Wallet,
  UserCog, UserCircle
} from 'lucide-react';
import usePermission from '../../hooks/usePermission';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { can } = usePermission();
  const [purchasesOpen, setPurchasesOpen] = useState(false);
  const [profileOpen, setProfileOpen]     = useState(false);

  const showPurchases =
    can("VIEW_VENDORS") || can("VIEW_EXPENSES") || can("VIEW_BILLS");

  const showProfile =
    can("VIEW_PROFILE") || can("MANAGE_USERS");

  const NavItem = ({ icon: Icon, label, to }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all ${
          isActive
            ? 'bg-[#f3e8ff] text-[#6B21A8]'
            : 'text-slate-500 hover:bg-slate-50'
        }`
      }
    >
      <Icon size={20} />
      <span className="text-sm font-semibold">{label}</span>
    </NavLink>
  );

  const SubItem = ({ icon: Icon, label, to }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm font-semibold ${
          isActive
            ? 'bg-[#f3e8ff] text-[#6B21A8]'
            : 'text-slate-500 hover:bg-slate-50'
        }`
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">

          {/* Logo */}
          <div className="flex items-center justify-between mb-4">
            <img
              src="/white legacy.jpg"
              alt="White Legacy"
              style={{
                height: "auto",
                width: "100%",
                maxWidth: "180px",
                objectFit: "contain",
                border: "none",
                boxShadow: "none",
                background: "transparent",
              }}
            />
            <button
              className="lg:hidden text-slate-500 ml-2"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* New Rental shortcut */}
          {can("ADD_RENTAL") && (
            <button
              onClick={() => navigate("/rentals")}
              className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold mb-6 shadow-sm transition text-white"
              style={{ backgroundColor: "#27276e" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3e4484")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#27276e")}
            >
              <Plus size={18} />
              New Rental
            </button>
          )}

          {/* Main nav */}
          <nav className="space-y-1 flex-1 overflow-y-auto">

            {can("VIEW_DASHBOARD") && (
              <NavItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
            )}
            {can("VIEW_CUSTOMERS") && (
              <NavItem icon={Users} label="Customers" to="/customers" />
            )}
            {can("VIEW_INVENTORY") && (
              <NavItem icon={Box} label="Inventory" to="/inventory" />
            )}
            {can("VIEW_RENTALS") && (
              <NavItem icon={ShoppingCartIcon} label="Rentals" to="/rentals" />
            )}
            {can("VIEW_ACCOUNTING") && (
              <NavItem icon={Calculator} label="Accounting" to="/accounting" />
            )}
            {can("VIEW_INVOICES") && (
              <NavItem icon={Receipt} label="Invoices & Billing" to="/invoices & billing" />
            )}

            {/* ───────── Purchases dropdown ───────── */}
            {showPurchases && (
              <div>
                <button
                  onClick={() => setPurchasesOpen(!purchasesOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={20} />
                    <span className="text-sm font-semibold">Purchases</span>
                  </div>
                  {purchasesOpen ? (
                    <ChevronDown size={16} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-400" />
                  )}
                </button>

                {purchasesOpen && (
                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-[#f3e8ff] pl-3">
                    {can("VIEW_VENDORS")  && <SubItem icon={Store}   label="Vendors"  to="/vendors"  />}
                    {can("VIEW_EXPENSES") && <SubItem icon={Wallet}  label="Expenses" to="/expenses" />}
                    {can("VIEW_BILLS")    && <SubItem icon={Receipt} label="Bills"    to="/bills"    />}
                  </div>
                )}
              </div>
            )}

            {/* ───────── Profile dropdown ───────── */}
            {showProfile && (
              <div>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <UserCircle size={20} />
                    <span className="text-sm font-semibold">Profile</span>
                  </div>
                  {profileOpen ? (
                    <ChevronDown size={16} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-400" />
                  )}
                </button>

                {profileOpen && (
                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-[#f3e8ff] pl-3">
                    {can("VIEW_PROFILE") && (
                      <SubItem icon={UserCircle} label="My Profile" to="/profile" />
                    )}
                    {can("MANAGE_USERS") && (
                      <SubItem icon={UserCog} label="User Management" to="/users" />
                    )}
                  </div>
                )}
              </div>
            )}

            {can("VIEW_REPORTS") && (
              <NavItem icon={FileIcon} label="Reports" to="/reports" />
            )}

            <NavItem icon={Settings} label="Settings" to="/settings" />
          </nav>

          {/* Bottom: Logout */}
          <div className="border-t border-slate-100 pt-4 space-y-1">
            {/* <NavItem icon={HelpCircle} label="Help Center" to="/help" /> */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer text-slate-500 hover:bg-slate-50 transition"
            >
              <LogOut size={20} />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
