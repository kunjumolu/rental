export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: ["admin", "manager", "staff"],

  VIEW_CUSTOMERS: ["admin", "manager", "staff"],
  ADD_CUSTOMER: ["admin", "manager"],
  EDIT_CUSTOMER: ["admin", "manager"],
  DELETE_CUSTOMER: ["admin"],

  VIEW_INVENTORY: ["admin", "manager", "staff"],
  ADD_INVENTORY: ["admin", "manager"],
  EDIT_INVENTORY: ["admin", "manager"],
  DELETE_INVENTORY: ["admin"],

  VIEW_RENTALS: ["admin", "manager", "staff"],
  ADD_RENTAL: ["admin", "manager", "staff"],
  EDIT_RENTAL: ["admin", "manager"],
  DELETE_RENTAL: ["admin"],

  VIEW_INVOICES: ["admin", "manager", "staff"],
  ADD_INVOICE: ["admin", "manager"],
  EDIT_INVOICE: ["admin", "manager"],
  DELETE_INVOICE: ["admin"],
  MARK_INVOICE_PAID: ["admin", "manager"],

  VIEW_ACCOUNTING: ["admin", "manager"],
  VIEW_REPORTS: ["admin", "manager"],

  VIEW_PURCHASES: ["admin", "manager"],
  VIEW_VENDORS: ["admin", "manager"],
  ADD_VENDOR: ["admin", "manager"],
  EDIT_VENDOR: ["admin", "manager"],
  DELETE_VENDOR: ["admin"],

  VIEW_EXPENSES: ["admin", "manager"],
  ADD_EXPENSE: ["admin", "manager"],
  EDIT_EXPENSE: ["admin", "manager"],
  DELETE_EXPENSE: ["admin"],

  VIEW_BILLS: ["admin", "manager"],
  ADD_BILL: ["admin", "manager"],
  DELETE_BILL: ["admin"],

  VIEW_SETTINGS: ["admin", "manager", "staff"],
  EDIT_SETTINGS: ["admin"],
};

export const getUserRole = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (payload.role || "staff").toLowerCase();
  } catch {
    return "staff";
  }
};

export const hasPermission = (permission) => {
  const role = getUserRole();
  if (!role || !permission) return false;
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(role.toLowerCase());
};