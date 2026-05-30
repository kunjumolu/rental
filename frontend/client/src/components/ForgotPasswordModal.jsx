import React, { useState, useEffect } from "react";
import { X, Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordModal({ isOpen, onClose, defaultEmail = "" }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail || "");
      setError("");
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen, defaultEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset link");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[460px] rounded-[18px] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#e5e7eb]">
          <h2 className="text-[20px] font-bold text-[#111827]">Forgot Password</h2>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#111827]">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {success ? (
            // ----------------- SUCCESS STATE -----------------
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h3 className="text-[17px] font-bold text-[#111827] mb-2">
                Check your inbox
              </h3>
              <p className="text-[14px] text-[#6b7280] leading-6">
                If an account exists for <strong>{email}</strong>, we've sent a
                password reset link. It will expire in <strong>1 hour</strong>.
              </p>
              <p className="text-[12px] text-[#9ca3af] mt-3">
                Don't see the email? Check your spam folder.
              </p>
              <button
                onClick={onClose}
                className="mt-6 h-[44px] w-full rounded-[10px] bg-[#1e3a8a] text-white font-semibold text-[14px] hover:bg-blue-800 transition"
              >
                Got it
              </button>
            </div>
          ) : (
            // ----------------- FORM STATE -----------------
            <form onSubmit={handleSubmit}>
              <p className="text-[14px] text-[#6b7280] leading-6 mb-5">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              <label className="block text-[13px] font-semibold text-[#374151] mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className={`h-[48px] w-full rounded-[10px] border bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none transition-all focus:ring-4 ${
                    error
                      ? "border-red-500 focus:ring-red-100"
                      : "border-[#e5e7eb] focus:border-[#1e40af] focus:ring-blue-100"
                  } disabled:bg-slate-50`}
                />
              </div>

              {error && (
                <div className="mt-2 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-red-500 shrink-0" />
                  <p className="text-[13px] font-medium text-red-600">{error}</p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 h-[44px] rounded-[10px] border border-[#e5e7eb] text-[14px] font-medium text-[#374151] hover:bg-[#f9fafb] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 h-[44px] rounded-[10px] flex items-center justify-center gap-2 font-semibold text-[14px] text-white transition ${
                    loading
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-[#1e3a8a] hover:bg-blue-800"
                  }`}
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
