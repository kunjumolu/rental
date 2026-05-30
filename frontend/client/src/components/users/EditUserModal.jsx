import React, { useState, useEffect } from "react";
import { X, Mail, User, Shield, AlertCircle, Loader2 } from "lucide-react";

export default function EditUserModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({ email: "", full_name: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email,
        full_name: user.full_name || "",
        role: user.role,
      });
      setError("");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[480px] rounded-[18px] bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#e5e7eb]">
          <div>
            <h2 className="text-[20px] font-bold text-[#111827]">Edit User</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">ID #{user.id}</p>
          </div>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#111827]">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-2">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] pl-9 pr-3 outline-none text-[14px] focus:border-[#6B21A8] focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] pl-9 pr-3 outline-none text-[14px] focus:border-[#6B21A8] focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] pl-9 pr-3 outline-none text-[14px] focus:border-[#6B21A8] focus:ring-2 focus:ring-purple-100 bg-white appearance-none"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-[13px]">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-[42px] px-5 rounded-[10px] border border-[#d1d5db] text-[14px] font-medium text-[#374151] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-[42px] px-5 rounded-[10px] bg-[#6B21A8] text-white text-[14px] font-semibold hover:bg-[#581c87] disabled:opacity-60 inline-flex items-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
