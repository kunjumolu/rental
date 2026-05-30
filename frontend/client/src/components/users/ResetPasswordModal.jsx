import React, { useState, useEffect } from "react";
import { X, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, KeyRound } from "lucide-react";

export default function ResetPasswordModal({ user, onClose, onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setPassword("");
      setConfirm("");
      setError("");
      setSuccess(false);
      setShowPw(false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    if (password !== confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/users/${user.id}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword: password }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      setSuccess(true);
      setTimeout(() => onDone(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[440px] rounded-[18px] bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#111827]">Reset Password</h2>
              <p className="text-[12px] text-gray-500">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#111827]">
            <X size={22} />
          </button>
        </div>

        <div className="px-7 py-6">
          {success ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h3 className="text-[16px] font-bold text-[#111827] mb-1">
                Password reset successfully
              </h3>
              <p className="text-[13px] text-gray-500">
                Share the new password with {user.full_name || user.email} securely.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[13px] text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                ⚠️ This will immediately change the user's password. Share the new
                password with them securely (don't send it via email).
              </p>

              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] pl-9 pr-10 outline-none text-[14px] focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] pl-9 pr-3 outline-none text-[14px] focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-[13px]">
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
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
                  className="h-[42px] px-5 rounded-[10px] bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
