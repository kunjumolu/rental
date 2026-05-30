import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile edit
  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password change
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/me/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setFullName(data.data.full_name || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/me/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      setProfile(data.data);
      setProfileMsg({ type: "success", text: "Profile updated successfully" });

      // Update localStorage user too
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      stored.full_name = data.data.full_name;
      localStorage.setItem("user", JSON.stringify(stored));
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwMsg(null);

    if (pwForm.newPassword.length < 6) {
      return setPwMsg({ type: "error", text: "New password must be at least 6 characters" });
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwMsg({ type: "error", text: "Passwords do not match" });
    }

    setChangingPw(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/me/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      setPwMsg({ type: "success", text: "Password changed successfully" });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwMsg({ type: "error", text: err.message });
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#6B21A8]" />
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6 text-red-600">Failed to load profile</div>;
  }

  return (
    <div className="px-6 py-6 max-w-4xl">
      <h1 className="text-[26px] font-bold text-[#111827]">My Profile</h1>
      <p className="text-[14px] text-gray-500 mt-1 mb-6">
        Manage your account information and password
      </p>

      {/* Profile Card */}
      <div className="rounded-[16px] border border-[#e5e7eb] bg-white overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-[#6B21A8] to-[#9333ea] px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
              {(profile.full_name || profile.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {profile.full_name || "(No name set)"}
              </h2>
              <p className="text-white/80 text-sm mt-1">{profile.email}</p>
              <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 bg-white/20 backdrop-blur rounded-full uppercase tracking-wide">
                {profile.role}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-4 text-sm">
          <InfoRow icon={Mail} label="Email" value={profile.email} />
          <InfoRow icon={Shield} label="Role" value={profile.role} />
          <InfoRow icon={User} label="Account Status"
            value={profile.is_active ? "Active" : "Inactive"} />
          <InfoRow icon={Calendar} label="Member Since"
            value={new Date(profile.created_at).toLocaleDateString()} />
        </div>
      </div>

      {/* Update Profile Form */}
      <div className="rounded-[16px] border border-[#e5e7eb] bg-white p-6 mb-6">
        <h3 className="text-lg font-bold text-[#111827] mb-4">Edit Profile</h3>
        <form onSubmit={handleSaveProfile}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px] focus:border-[#6B21A8] focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">
                Email <span className="text-gray-400 text-xs">(cannot change)</span>
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="h-[44px] w-full rounded-[10px] border border-[#e5e7eb] bg-gray-50 px-3 outline-none text-[14px] text-gray-500"
              />
            </div>
          </div>

          {profileMsg && (
            <div className={`mt-4 flex items-center gap-2 text-[13px] ${
              profileMsg.type === "success" ? "text-green-600" : "text-red-600"
            }`}>
              {profileMsg.type === "success"
                ? <CheckCircle2 size={15} />
                : <AlertCircle size={15} />}
              {profileMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="mt-5 inline-flex items-center gap-2 h-[42px] px-5 rounded-[10px] bg-[#6B21A8] text-white text-[14px] font-semibold hover:bg-[#581c87] disabled:opacity-60 transition"
          >
            {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="rounded-[16px] border border-[#e5e7eb] bg-white p-6">
        <h3 className="text-lg font-bold text-[#111827] mb-1">Change Password</h3>
        <p className="text-[13px] text-gray-500 mb-4">
          Update your password to keep your account secure
        </p>

        <form onSubmit={handleChangePw}>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "currentPassword", label: "Current Password" },
              { name: "newPassword", label: "New Password" },
              { name: "confirmPassword", label: "Confirm Password" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <Lock size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={pwForm[field.name]}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, [field.name]: e.target.value })
                    }
                    className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] pl-9 pr-3 outline-none text-[14px] focus:border-[#6B21A8] focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="mt-3 text-[12px] text-gray-500 hover:text-[#6B21A8] inline-flex items-center gap-1"
          >
            {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPw ? "Hide passwords" : "Show passwords"}
          </button>

          {pwMsg && (
            <div className={`mt-3 flex items-center gap-2 text-[13px] ${
              pwMsg.type === "success" ? "text-green-600" : "text-red-600"
            }`}>
              {pwMsg.type === "success"
                ? <CheckCircle2 size={15} />
                : <AlertCircle size={15} />}
              {pwMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={changingPw}
            className="mt-5 inline-flex items-center gap-2 h-[42px] px-5 rounded-[10px] bg-[#1e3a8a] text-white text-[14px] font-semibold hover:bg-blue-800 disabled:opacity-60 transition"
          >
            {changingPw ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            {changingPw ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-lg">
      <div className="h-9 w-9 rounded-lg bg-purple-100 text-[#6B21A8] flex items-center justify-center">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[11px] text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-[14px] font-semibold text-[#111827]">{value}</p>
      </div>
    </div>
  );
}
