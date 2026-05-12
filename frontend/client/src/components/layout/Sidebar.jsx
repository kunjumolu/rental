import React from 'react';
// 1. Import NavLink from react-router-dom
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Box, Key, Calculator, Settings, Plus, HelpCircle, LogOut, X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  
  // 2. Update NavItem to use NavLink and the "to" prop
  const NavItem = ({ icon: Icon, label, to }) => (
    <NavLink
      to={to}
      // NavLink gives us an "isActive" boolean automatically
      className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all ${
        isActive ? 'bg-[#EBF2FF] text-[#0047AB]' : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      <Icon size={20} />
      <span className="text-sm font-semibold">{label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white"><Box size={20} /></div>
              <div>
                <h1 className="text-sm font-bold leading-none">Asset Intelligence</h1>
                <p className="text-[10px] text-slate-400 font-medium">Enterprise Management</p>
              </div>
            </div>
            <button className="lg:hidden" onClick={() => setIsOpen(false)}><X size={20}/></button>
          </div>

          <button className="w-full bg-[#0047AB] text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold mb-8 shadow-sm">
            <Plus size={18} /> New Rental
          </button>

          <nav className="space-y-1 flex-1">
            {/* 3. Provide the "to" paths for your routes */}
            <NavItem icon={LayoutDashboard} label="Dashboard" to="/" />
            <NavItem icon={Users} label="Customers" to="/customers" />
            <NavItem icon={Box} label="Inventory" to="/inventory" />
            <NavItem icon={Key} label="Rentals" to="/rentals" />
            <NavItem icon={Calculator} label="Accounting" to="/accounting" />
            <NavItem icon={Settings} label="Settings" to="/settings" />
            
            {/* Added the Test link so you can click it */}
            <NavItem icon={Box} label="Connection Test" to="/test" />
          </nav>

          <div className="border-t border-slate-100 pt-4 space-y-1">
            <NavItem icon={HelpCircle} label="Help Center" to="/help" />
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer text-slate-500 hover:bg-slate-50">
              <LogOut size={20} />
              <span className="text-sm font-semibold">Logout</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;