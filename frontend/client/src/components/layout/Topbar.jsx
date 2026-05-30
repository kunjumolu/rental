import React, { useState, useRef, useEffect } from 'react';
import {
  Bell, Plus, Menu, Box, Key, Users, FileText,
  User, Settings, LogOut, ChevronRight, Package, AlertTriangle,
  CreditCard, Clock, CheckCircle, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return { open, setOpen, ref };
}

const getIconComponent = (iconType) => {
  switch (iconType) {
    case 'clock': return Clock;
    case 'alert': return AlertTriangle;
    case 'file': return FileText;
    case 'credit': return CreditCard;
    case 'package': return Package;
    default: return Bell;
  }
};

// Map notification types to routes + filters
const getNotificationNavConfig = (notification) => {
  const type = (notification.type || "").toLowerCase();
  const title = (notification.title || "").toLowerCase();
  const description = (notification.description || "").toLowerCase();

  // Rental related
  if (type.includes("rental") || title.includes("rental")) {
    if (type.includes("overdue") || title.includes("overdue") || description.includes("overdue")) {
      return { route: "/rentals", state: { activeFilter: "overdue" } };
    }
    if (type.includes("pending") || title.includes("pending")) {
      return { route: "/rentals", state: { activeFilter: "pending" } };
    }
    if (type.includes("active") || title.includes("active")) {
      return { route: "/rentals", state: { activeFilter: "active" } };
    }
    if (type.includes("return") || title.includes("return")) {
      return { route: "/rentals", state: { activeFilter: "returned" } };
    }
    return { route: "/rentals", state: {} };
  }

  // Invoice related
  if (type.includes("invoice") || title.includes("invoice")) {
    if (type.includes("overdue") || title.includes("overdue") || type.includes("unpaid") || title.includes("unpaid")) {
      return { route: "/invoices & billing", state: { activeFilter: "overdue" } };
    }
    if (type.includes("paid") || title.includes("paid")) {
      return { route: "/invoices & billing", state: { activeFilter: "paid" } };
    }
    if (type.includes("draft") || title.includes("draft")) {
      return { route: "/invoices & billing", state: { activeFilter: "draft" } };
    }
    return { route: "/invoices & billing", state: {} };
  }

  // Inventory / Stock related
  if (type.includes("inventory") || type.includes("stock") || title.includes("stock") || title.includes("inventory") || type.includes("item")) {
    if (type.includes("low") || title.includes("low") || type.includes("out") || title.includes("out")) {
      return { route: "/inventory", state: { activeFilter: "low_stock" } };
    }
    return { route: "/inventory", state: {} };
  }

  // Expense related
  if (type.includes("expense") || type.includes("bill") || title.includes("expense") || title.includes("bill")) {
    if (type.includes("billable") || title.includes("billable")) {
      return { route: "/expenses", state: { activeFilter: "non-billable" } };
    }
    return { route: "/expenses", state: {} };
  }

  // Customer related
  if (type.includes("customer") || title.includes("customer")) {
    return { route: "/customers", state: {} };
  }

  // Payment related
  if (type.includes("payment") || title.includes("payment")) {
    return { route: "/invoices & billing", state: { activeFilter: "paid" } };
  }

  // Fallback: use notification.link if available
  if (notification.link) {
    return { route: notification.link, state: {} };
  }

  return null;
};

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const create = useDropdown();
  const notif  = useDropdown();
  const user   = useDropdown();

  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [profileName, setProfileName] = useState("Admin");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileRole, setProfileRole] = useState("Admin");

  useEffect(() => {
    fetchProfileFromSettings();
    loadFromLocalStorage();
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadFromLocalStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.email) setProfileEmail(userData.email);
        if (userData.role) setProfileRole(userData.role);
        if (userData.full_name) setProfileName(userData.full_name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfileFromSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/settings/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success && data.data) {
        if (data.data.full_name) setProfileName(data.data.full_name);
        if (data.data.email) setProfileEmail(data.data.email);
        if (data.data.role) setProfileRole(data.data.role);
      }
    } catch (err) {
      console.error("Fetch profile settings error:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setNotifLoading(false);
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const dismissNotification = (e, id) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    user.setOpen(false);
    navigate("/login");
  };

  const handleNotificationClick = (notification) => {
    markOneRead(notification.id);

    const navConfig = getNotificationNavConfig(notification);

    if (navConfig) {
      navigate(navConfig.route, { state: navConfig.state });
      notif.setOpen(false);
    } else if (notification.link) {
      navigate(notification.link);
      notif.setOpen(false);
    }
  };

  const createOptions = [
    { icon: Box,      label: 'New Item',     color: 'text-blue-600',   path: '/inventory',          state: { openAddModal: true } },
    { icon: Key,      label: 'New Rental',   color: 'text-green-600',  path: '/rentals',            state: { openAddModal: true } },
    { icon: Users,    label: 'New Customer', color: 'text-purple-600', path: '/customers',          state: { openAddModal: true } },
    { icon: FileText, label: 'New Invoice',  color: 'text-orange-600', path: '/invoices & billing', state: { openAddModal: true } },
  ];

  const userMenuItems = [
    { icon: User,     label: 'Profile',     path: '/settings?tab=profile' },
    { icon: Settings, label: 'Preferences', path: '/settings?tab=system'  },
  ];

  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <header className="w-full h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-600"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-5">

        {/* Create New */}
        <div className="relative" ref={create.ref}>
          <button
            onClick={() => { create.setOpen(!create.open); notif.setOpen(false); user.setOpen(false); }}
            className="bg-[#0047AB] text-white px-3 md:px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 transition-all shadow-sm active:scale-95"
          >
            <Plus
              size={16}
              className={`transition-transform duration-200 ${create.open ? 'rotate-45' : ''}`}
            />
            <span className="hidden xs:inline">Create New</span>
          </button>

          {create.open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 origin-top-right">
              <div className="px-4 py-2 border-b border-slate-100 mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Quick Actions
                </p>
              </div>

              {createOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    navigate(option.path, { state: option.state });
                    create.setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0047AB] transition-colors group"
                >
                  <div className="p-1.5 rounded-md bg-slate-50 group-hover:bg-white transition-colors">
                    <option.icon size={16} className={option.color} />
                  </div>
                  <span className="font-semibold">{option.label}</span>
                  <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-blue-400 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Icons cluster */}
        <div className="flex items-center gap-3 border-l pl-4 md:pl-5 border-slate-200">

          {/* Bell / Notifications */}
          <div className="relative" ref={notif.ref}>
            <button
              onClick={() => {
                notif.setOpen(!notif.open);
                user.setOpen(false);
                create.setOpen(false);
                if (!notif.open) fetchNotifications();
              }}
              className="relative p-1 group"
            >
              <Bell size={20} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 border-2 border-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notif.open && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllRead}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50">
                  {notifLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-xs">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <CheckCircle size={32} className="mb-2 text-slate-300" />
                      <p className="text-sm font-medium">You're all caught up!</p>
                      <p className="text-xs mt-1">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const Icon = getIconComponent(n.iconType);
                      const navConfig = getNotificationNavConfig(n);
                      const isClickable = !!(navConfig || n.link);

                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group relative ${
                            isClickable ? 'cursor-pointer' : 'cursor-default'
                          } ${!n.read ? 'bg-blue-50/40' : ''}`}
                        >
                          {!n.read && (
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          )}

                          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${n.iconBg} flex items-center justify-center mt-0.5`}>
                            <Icon size={15} className={n.iconColor} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!n.read ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'} leading-snug`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
                              {n.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[11px] text-slate-400">{n.date}</p>
                              {isClickable && (
                                <span className="text-[10px] font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                  View →
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={(e) => dismissNotification(e, n.id)}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 transition-all self-start mt-0.5"
                          >
                            <X size={13} className="text-slate-400" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="border-t border-slate-100 px-4 py-2.5 text-center">
                    <button
                      onClick={() => {
                        fetchNotifications();
                        notif.setOpen(false);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Refresh notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Avatar / Profile Dropdown */}
          <div className="relative" ref={user.ref}>
            <button
              onClick={() => { user.setOpen(!user.open); notif.setOpen(false); create.setOpen(false); }}
              className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-[#6B21A8] flex items-center justify-center text-white text-[13px] font-bold border border-slate-200 hover:ring-2 hover:ring-blue-500/30 transition-all">
                {getInitials(profileName)}
              </div>

              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-800 leading-none">
                  {profileName}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{profileRole}</p>
              </div>
            </button>

            {user.open && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 origin-top-right">
                <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
                  <p className="text-sm font-bold text-slate-800">{profileName}</p>
                  <p className="text-xs text-slate-400">{profileEmail}</p>
                </div>

                {userMenuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { navigate(item.path); user.setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0047AB] transition-colors"
                  >
                    <item.icon size={15} className="text-slate-400" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} className="text-red-400" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Topbar;
