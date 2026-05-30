import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  // States: 'verifying' | 'invalid' | 'form' | 'success'
  const [stage, setStage] = useState("verifying");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // 1) Verify token on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/auth/verify-reset-token/${token}`
        );
        const data = await res.json();
        if (!alive) return;

        if (res.ok && data.success) {
          setEmail(data.data?.email || "");
          setStage("form");
        } else {
          setErrorMsg(data.message || "Invalid or expired reset link");
          setStage("invalid");
        }
      } catch (err) {
        if (!alive) return;
        setErrorMsg("Could not verify reset link. Please try again.");
        setStage("invalid");
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  // 2) Submit new password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (password.length < 6) {
      return setFormError("Password must be at least 6 characters");
    }
    if (password !== confirm) {
      return setFormError("Passwords do not match");
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password");
      }

      setStage("success");
      // Auto-redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f9fafb] px-4">
      <div className="w-full max-w-[460px] rounded-[18px] bg-white shadow-xl p-8 md:p-10">
        {/* Logo */}
        <div className="text-center mb-7">
          <h1 className="font-['Raleway'] text-[24px] font-extrabold text-[#111827]">
            White Legacy
          </h1>
          <p className="text-[11px] tracking-widest text-[#9ca3af] mt-1">
            MINIMAL · MAJESTIC · MEMORABLE
          </p>
        </div>

        {/* --------- STAGE: verifying --------- */}
        {stage === "verifying" && (
          <div className="text-center py-10">
            <Loader2
              size={40}
              className="mx-auto animate-spin text-[#6B21A8]"
            />
            <p className="mt-4 text-[14px] text-[#6b7280]">
              Verifying reset link...
            </p>
          </div>
        )}

        {/* --------- STAGE: invalid --------- */}
        {stage === "invalid" && (
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <XCircle size={32} className="text-red-600" />
            </div>
            <h2 className="text-[20px] font-bold text-[#111827] mb-2">
              Invalid or Expired Link
            </h2>
            <p className="text-[14px] text-[#6b7280] leading-6 mb-6">
              {errorMsg}
            </p>
            <Link
              to="/login"
              className="inline-block h-[44px] px-6 rounded-[10px] bg-[#1e3a8a] text-white font-semibold text-[14px] hover:bg-blue-800 transition leading-[44px]"
            >
              Back to Login
            </Link>
          </div>
        )}

        {/* --------- STAGE: form --------- */}
        {stage === "form" && (
          <>
            <h2 className="text-[22px] font-bold text-[#111827] mb-2">
              Set a new password
            </h2>
            <p className="text-[14px] text-[#6b7280] mb-6">
              Resetting password for <strong>{email}</strong>
            </p>

            <form onSubmit={handleSubmit}>
              <label className="block text-[13px] font-semibold text-[#374151] mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormError("");
                  }}
                  placeholder="At least 6 characters"
                  required
                  disabled={submitting}
                  className="h-[48px] w-full rounded-[10px] border border-[#e5e7eb] bg-white pl-11 pr-12 text-[14px] outline-none focus:border-[#1e40af] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <label className="block text-[13px] font-semibold text-[#374151] mt-5 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setFormError("");
                  }}
                  placeholder="Re-enter password"
                  required
                  disabled={submitting}
                  className="h-[48px] w-full rounded-[10px] border border-[#e5e7eb] bg-white pl-11 pr-4 text-[14px] outline-none focus:border-[#1e40af] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>

              {formError && (
                <div className="mt-3 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-red-500 shrink-0" />
                  <p className="text-[13px] font-medium text-red-600">
                    {formError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`mt-7 flex h-[50px] w-full items-center justify-center gap-2 rounded-[10px] font-semibold text-[15px] text-white transition ${
                  submitting
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-[#1e3a8a] hover:bg-blue-800"
                }`}
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Resetting..." : "Reset Password"}
              </button>

              <div className="mt-5 text-center">
                <Link
                  to="/login"
                  className="text-[13px] text-[#1e40af] hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </>
        )}

        {/* --------- STAGE: success --------- */}
        {stage === "success" && (
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h2 className="text-[20px] font-bold text-[#111827] mb-2">
              Password reset successful
            </h2>
            <p className="text-[14px] text-[#6b7280] leading-6 mb-6">
              Your password has been changed. Redirecting you to login...
            </p>
            <Link
              to="/login"
              className="inline-block h-[44px] px-6 rounded-[10px] bg-[#1e3a8a] text-white font-semibold text-[14px] hover:bg-blue-800 transition leading-[44px]"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
