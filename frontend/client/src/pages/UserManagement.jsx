import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  KeyRound,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import AddUserModal from "../components/users/AddUserModal";
import EditUserModal from "../components/users/EditUserModal";
import ResetPasswordModal from "../components/users/ResetPasswordModal";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [pwUser, setPwUser] = useState(null);

  // Current user (to prevent self-deactivation in UI)
  const me = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (filterRole) params.set("role", filterRole);
      if (filterStatus) params.set("status", filterStatus);

      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/users?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setUsers(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.is_active ? "deactivate" : "reactivate";
    if (!window.confirm(`Are you sure you want to ${action} ${user.email}?`))
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/users/${user.id}/status`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(s) ||
      (u.full_name || "").toLowerCase().includes(s)
    );
  });

  const roleBadge = (role) => {
    const styles = {
      admin: "bg-purple-100 text-purple-700",
      manager: "bg-blue-100 text-blue-700",
      staff: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase ${styles[role] || styles.staff}`}>
        {role === "admin" && <ShieldAlert size={11} />}
        {role}
      </span>
    );
  };

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[26px] font-bold text-[#111827]">User Management</h1>
          <p className="text-[14px] text-gray-500 mt-1">
            Add, edit, and manage system users — admin only
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="h-[42px] inline-flex items-center gap-2 rounded-[10px] bg-[#6B21A8] hover:bg-[#581c87] px-4 text-[14px] font-semibold text-white transition"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px] max-w-[400px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-[42px] w-full pl-9 pr-3 rounded-[10px] border border-[#d1d5db] outline-none text-[14px] bg-white focus:border-[#6B21A8] focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="h-[42px] px-3 rounded-[10px] border border-[#d1d5db] outline-none text-[14px] bg-white"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-[42px] px-3 rounded-[10px] border border-[#d1d5db] outline-none text-[14px] bg-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="mt-5 rounded-[16px] border border-[#e5e7eb] bg-white overflow-hidden">
        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-[#6B21A8]" />
          </div>
        ) : error ? (
          <div className="p-6 text-red-600 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No users found.
          </div>
        ) : (
          <table className="w-full text-[14px]">
            <thead className="bg-[#f9fafb]">
              <tr className="text-left text-[12px] font-semibold uppercase tracking-wide text-[#6b7280]">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-[#f1f5f9] hover:bg-[#fafafa]"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-purple-100 text-[#6B21A8] flex items-center justify-center font-bold">
                        {(u.full_name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-[#111827]">
                          {u.full_name || "—"}
                          {u.id === me.id && (
                            <span className="ml-2 text-[10px] text-[#6B21A8] font-bold">YOU</span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500">ID #{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{u.email}</td>
                  <td className="px-5 py-3">{roleBadge(u.role)}</td>
                  <td className="px-5 py-3">
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-[13px]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setEditUser(u)}
                        title="Edit"
                        className="p-1.5 text-gray-500 hover:text-[#6B21A8] hover:bg-purple-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setPwUser(u)}
                        title="Reset Password"
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <KeyRound size={16} />
                      </button>
                      {u.id !== me.id && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={u.is_active ? "Deactivate" : "Reactivate"}
                          className={`p-1.5 rounded ${
                            u.is_active
                              ? "text-gray-500 hover:text-red-600 hover:bg-red-50"
                              : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {u.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={() => {
          setIsAddOpen(false);
          fetchUsers();
        }}
      />
      <EditUserModal
        user={editUser}
        onClose={() => setEditUser(null)}
        onUpdated={() => {
          setEditUser(null);
          fetchUsers();
        }}
      />
      <ResetPasswordModal
        user={pwUser}
        onClose={() => setPwUser(null)}
        onDone={() => setPwUser(null)}
      />
    </div>
  );
}
