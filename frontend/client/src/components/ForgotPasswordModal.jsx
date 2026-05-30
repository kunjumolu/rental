import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";

// Stages: "email" → "otp" → "newPassword" → "success"
export default function ForgotPasswordModal({ isOpen, onClose, defaultEmail = "" }) {
  const [stage, setStage] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Stage 1: email
  const [email, setEmail] = useState("");

  // Stage 2: OTP
  const [otp, setOtp] = useState("");

  // Stage 3: new password
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Reset everything when modal opens
  useEffect(() => {
    if (isOpen) {
      setStage("email");
      setEmail(defaultEmail || "");
      setOtp("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPw(false);
      setError("");
      setLoading(false);
    }
  }, [isOpen, defaultEmail]);

  // ───────────── Step 1: Send email, trigger OTP to inbox ─────────────
  const handleRequestOtp = async (e) => {
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
      if (!res.ok || !data.success) throw new Error(data.message);

      setStage("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ───────────── Step 2: Verify OTP ─────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("OTP must be 6 digits");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      setResetToken(data.data.resetToken);
      setStage("newPassword");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ───────────── Step 3: Set new password ─────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) return setError("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      setStage("success");
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
          <div className="flex items-center gap-2">
            {stage !== "email" && stage !== "success" && (
              <button
                onClick={() => {
                  setError("");
                  if (stage === "otp") setStage("email");
                  if (stage === "newPassword") setStage("otp");
                }}
                className="text-[#6b7280] hover:text-[#111827]"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-[20px] font-bold text-[#111827]">
              {stage === "email" && "Forgot Password"}
              {stage === "otp" && "Enter OTP"}
              {stage === "newPassword" && "New Password"}
              {stage === "success" && "Success!"}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#111827]">
            <X size={22} />
          </button>
        </div>

        {/* Progress dots */}
        {stage !== "success" && (
          <div className="flex justify-center gap-2 pt-4">
            <Dot active={stage === "email"} done={stage !== "email"} />
            <Dot active={stage === "otp"} done={stage === "newPassword"} />
            <Dot active={stage === "newPassword"} done={false} />
          </div>
        )}

        {/* Body */}
        <div className="px-7 py-6">

          {/* ─────────── Stage 1: Email ─────────── */}
          {stage === "email" && (
            <form onSubmit={handleRequestOtp}>
              <p className="text-[14px] text-[#6b7280] leading-6 mb-5">
                Enter your registered email. We'll send a 6-digit OTP to your inbox.
              </p>

              <label className="block text-[13px] font-semibold text-[#374151] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
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
                  className={`h-[48px] w-full rounded-[10px] border pl-11 pr-4 text-[14px] outline-none focus:ring-4 ${
                    error
                      ? "border-red-500 focus:ring-red-100"
                      : "border-[#e5e7eb] focus:border-[#1e40af] focus:ring-blue-100"
                  } disabled:bg-slate-50`}
                />
              </div>

              {error && <ErrorMsg msg={error} />}

              <ButtonRow
                onCancel={onClose}
                loading={loading}
                loadingText="Sending OTP..."
                submitText="Send OTP"
              />
            </form>
          )}

          {/* ─────────── Stage 2: OTP ─────────── */}
          {stage === "otp" && (
            <form onSubmit={handleVerifyOtp}>

              {/* Info banner — no OTP shown, user checks email */}
              <div className="mb-5 rounded-[12px] bg-purple-50 border border-purple-200 p-4">
                <div className="flex items-start gap-3">
                  <Mail size={20} className="text-[#6B21A8] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#6B21A8]">OTP Sent to Your Email</p>
                    <p className="text-[12px] text-[#9333ea] mt-1">
                      A 6-digit OTP has been sent to <strong>{email}</strong>. Check your inbox (and spam folder).
                    </p>
                    <p className="text-[11px] text-[#9333ea] mt-1">Valid for 10 minutes.</p>
                  </div>
                </div>
              </div>

              <label className="block text-[13px] font-semibold text-[#374151] mb-2">
                Enter OTP
              </label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  placeholder="123456"
                  required
                  disabled={loading}
                  autoFocus
                  className={`h-[52px] w-full rounded-[10px] border pl-11 pr-4 text-[20px] tracking-[8px] text-center font-semibold outline-none focus:ring-4 ${
                    error
                      ? "border-red-500 focus:ring-red-100"
                      : "border-[#e5e7eb] focus:border-[#6B21A8] focus:ring-purple-100"
                  } disabled:bg-slate-50`}
                />
              </div>

              {error && <ErrorMsg msg={error} />}

              <ButtonRow
                onCancel={onClose}
                loading={loading}
                loadingText="Verifying..."
                submitText="Verify OTP"
                color="purple"
              />

              <button
                type="button"
                onClick={() => {
                  setOtp("");
                  setError("");
                  setStage("email");
                }}
                className="mt-3 w-full text-center text-[13px] text-[#6B21A8] hover:underline"
              >
                Didn't get OTP? Request again
              </button>
            </form>
          )}

          {/* ─────────── Stage 3: New password ─────────── */}
          {stage === "newPassword" && (
            <form onSubmit={handleResetPassword}>
              <p className="text-[14px] text-[#6b7280] leading-6 mb-5">
                Create a new password for <strong>{email}</strong>
              </p>

              <label className="block text-[13px] font-semibold text-[#374151] mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type={showPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="At least 6 characters"
                  required
                  disabled={loading}
                  className="h-[48px] w-full rounded-[10px] border border-[#e5e7eb] pl-11 pr-12 text-[14px] outline-none focus:border-[#6B21A8] focus:ring-4 focus:ring-purple-100 disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <label className="block text-[13px] font-semibold text-[#374151] mt-4 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type={showPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Re-enter password"
                  required
                  disabled={loading}
                  className="h-[48px] w-full rounded-[10px] border border-[#e5e7eb] pl-11 pr-4 text-[14px] outline-none focus:border-[#6B21A8] focus:ring-4 focus:ring-purple-100 disabled:bg-slate-50"
                />
              </div>

              {error && <ErrorMsg msg={error} />}

              <ButtonRow
                onCancel={onClose}
                loading={loading}
                loadingText="Resetting..."
                submitText="Reset Password"
                color="purple"
              />
            </form>
          )}

          {/* ─────────── Stage 4: Success ─────────── */}
          {stage === "success" && (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 size={36} className="text-green-600" />
              </div>
              <h3 className="text-[18px] font-bold text-[#111827] mb-2">
                Password Reset Successful
              </h3>
              <p className="text-[14px] text-[#6b7280] leading-6">
                Your password has been changed. You can now log in with your new password.
              </p>
              <button
                onClick={onClose}
                className="mt-6 h-[44px] w-full rounded-[10px] bg-[#6B21A8] text-white font-semibold text-[14px] hover:bg-[#581c87] transition"
              >
                Go to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ────────── Small helper components ──────────
function Dot({ active, done }) {
  return (
    <div
      className={`h-2 w-8 rounded-full transition-all ${
        done ? "bg-green-500" : active ? "bg-[#6B21A8]" : "bg-[#e5e7eb]"
      }`}
    />
  );
}

function ErrorMsg({ msg }) {
  return (
    <div className="mt-3 flex items-center gap-1.5">
      <AlertCircle size={14} className="text-red-500 shrink-0" />
      <p className="text-[13px] font-medium text-red-600">{msg}</p>
    </div>
  );
}

function ButtonRow({ onCancel, loading, loadingText, submitText, color = "blue" }) {
  const bg =
    color === "purple"
      ? "bg-[#6B21A8] hover:bg-[#581c87]"
      : "bg-[#1e3a8a] hover:bg-blue-800";

  return (
    <div className="mt-6 flex gap-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="flex-1 h-[44px] rounded-[10px] border border-[#e5e7eb] text-[14px] font-medium text-[#374151] hover:bg-[#f9fafb] disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className={`flex-1 h-[44px] rounded-[10px] flex items-center justify-center gap-2 font-semibold text-[14px] text-white transition ${
          loading ? "bg-slate-400 cursor-not-allowed" : bg
        }`}
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? loadingText : submitText}
      </button>
    </div>
  );
}