import React, { useState, useEffect } from "react";
import { X, Mail, Lock, User, Shield, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function AddUserModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm({ full_name: "", email: "", password: "", role: "staff" });
      setError("");
      setShowPw(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[480px] rounded-[18px] bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#e5e7eb]">
          <h2 className="text-[20px] font-bold text-[#111827]">Add New User</h2>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#111827]">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
          <Field
            icon={User}
            label="Full Name"
            value={form.full_name}
            onChange={(v) => setForm({ ...form, full_name: v })}
            placeholder="John Doe"
          />

          <Field
            icon={Mail}
            type="email"
            label="Email Address"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            placeholder="john@example.com"
            required
          />

          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                required
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] pl-9 pr-10 outline-none text-[14px] focus:border-[#6B21A8] focus:ring-2 focus:ring-purple-100"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
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
                {/* <option value="admin">Admin</option> */}
              </select>
            </div>
            <p className="text-[12px] text-gray-500 mt-1">
              {/* {form.role === "admin" && "Full access to all features"} */}
              {form.role === "manager" && "Can view, add and edit (no delete)"}
              {form.role === "staff" && "View-only access mostly"}
            </p>
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
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, type = "text", placeholder, required }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-[#374151] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] pl-9 pr-3 outline-none text-[14px] focus:border-[#6B21A8] focus:ring-2 focus:ring-purple-100"
        />
      </div>
    </div>
  );
}
