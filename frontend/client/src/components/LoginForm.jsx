import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials");
      }

      // SUCCESS LOGIC:
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // ✅ FIX: Navigate to '/dashboard' instead of '/'
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.message);
      console.error("Login Error:", err);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="w-full max-w-[430px]">
      {/* Heading */}
      <h1 className="font-['Raleway'] text-[34px] font-extrabold text-[#111827]">
        Welcome back
      </h1>

      <p className="mt-2 text-[15px] leading-7 text-[#6b7280]">
        Please enter your credentials to access your dashboard.
      </p>

      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Email */}
        <div className="mt-8">
          <label className="mb-2 block text-[14px] font-semibold text-[#374151]">
            Email Address
          </label>

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            
            {/* Added name attribute and value binding */}
            <input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@erms.com"
              required
              disabled={loading} // Disable while loading
              className="h-[52px] w-full rounded-[10px] border border-[#e5e7eb] bg-white pl-11 pr-4 text-[15px] text-[#111827] outline-none transition-all focus:border-[#1e40af] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mt-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#374151]">
            Password
          </label>

          <div className="relative">
            <Lock 
                size={18} 
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  error ? "text-red-500" : "text-[#9ca3af]"
                }`} 
            />

            <input 
              name="password"
              type={showPassword ? "text" : "password"} 
              value={formData.password}
              onChange={handleChange}
              placeholder="password123"
              required
              disabled={loading}
              className={`h-[52px] w-full rounded-[10px] border bg-white pl-11 pr-12 text-[15px] text-[#111827] outline-none transition-all focus:ring-4 ${
                error ? "border-red-500 focus:ring-red-100" : "border-[#e5e7eb] focus:ring-blue-100"
              } disabled:bg-slate-50`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-slate-900"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Conditional Error Display */}
          {error && (
            <div className="mt-2 flex items-center gap-1.5 animate-in fade-in duration-200">
              <AlertCircle size={15} className="text-red-500 shrink-0" />
              <p className="text-[13px] font-medium text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Remember + Forgot */}
        <div className="mt-6 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-[14px] text-[#374151] select-none">Remember me</span>
          </label>

          <a href="#" className="text-[14px] font-medium text-[#1e40af] hover:underline">
            Forgot Password?
          </a>
        </div>

        {/* Button */}
        <button
          type="submit" // Changed to submit to trigger form onSubmit
          disabled={loading} // Disabled while waiting for server
          className={`mt-8 flex h-[54px] w-full items-center justify-center gap-2 rounded-[10px] font-semibold text-[15px] transition-all shadow-lg shadow-blue-200 ${
            loading 
              ? "bg-slate-400 text-white cursor-not-allowed" 
              : "bg-[#1e3a8a] text-white hover:bg-blue-800 active:scale-[0.98]"
          }`}
        >
          {loading && <Loader2 size={17} className="animate-spin" />}
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#e5e7eb]"></div>
        <span className="text-[13px] text-[#9ca3af]">or</span>
        <div className="h-px flex-1 bg-[#e5e7eb]"></div>
      </div>

      {/* Create Account */}
      <button onClick={() => alert("Feature coming soon!")} className="h-[54px] w-full rounded-[10px] border border-[#e5e7eb] bg-white text-[15px] font-medium text-[#374151] transition-all hover:bg-[#f9fafb]">
        Create Account
      </button>

      {/* Footer */}
      <p className="mt-8 text-center text-[13px] leading-6 text-[#9ca3af]">
        By logging in, you agree to our{" "}
        <a href="#" className="text-[#1e40af] hover:underline font-medium">Terms of Service</a>{" "}
        and{" "}
        <a href="#" className="text-[#1e40af] hover:underline font-medium">Privacy Policy</a>.
      </p>
    </div>
  );
}