import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, Plus, Menu, Box, Key, Users, FileText } from 'lucide-react';

const Topbar = ({ onMenuClick }) => {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowCreateMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createOptions = [
    { icon: Box, label: 'New Asset', color: 'text-blue-600' },
    { icon: Key, label: 'New Rental', color: 'text-green-600' },
    { icon: Users, label: 'New Customer', color: 'text-purple-600' },
    { icon: FileText, label: 'New Invoice', color: 'text-orange-600' },
  ];

  return (
    <header className="w-full h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-slate-600">
          <Menu size={24} />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search assets, customers, or invoices..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <span className="text-sm font-medium text-slate-500 cursor-pointer hidden md:block hover:text-blue-600 transition-colors">Support</span>
        
        {/* CREATE NEW DROPDOWN CONTAINER */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="bg-[#0047AB] text-white px-3 md:px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 transition-all shadow-sm active:scale-95"
          >
            <Plus size={16} className={`transition-transform duration-200 ${showCreateMenu ? 'rotate-45' : ''}`} /> 
            <span className="hidden xs:inline">Create New</span>
          </button>

          {/* ACTUAL DROPDOWN MENU */}
          {showCreateMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 animate-in fade-in zoom-in duration-150 origin-top-right">
              <div className="px-4 py-2 border-b border-slate-50 mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</p>
              </div>
              
              {createOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    console.log(`Creating: ${option.label}`);
                    setShowCreateMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0047AB] transition-colors group"
                >
                  <div className={`p-1.5 rounded-md bg-slate-50 group-hover:bg-white transition-colors`}>
                    <option.icon size={16} className={option.color} />
                  </div>
                  <span className="font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 border-l pl-4 md:pl-6 border-slate-200 ml-2">
          <div className="relative cursor-pointer group">
            <Bell size={20} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
          <HelpCircle size={20} className="text-slate-500 hidden sm:block cursor-pointer hover:text-blue-600 transition-colors" />
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden cursor-pointer border border-slate-200 hover:ring-2 hover:ring-blue-500/30 transition-all">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;