import { useState, useEffect } from "react";
import { Save } from "lucide-react";

const roles = ["Admin", "Manager", "Staff", "Viewer"];
const themes = ["Light", "Dark", "System"];

const defaultData = {
  full_name: "Admin User",
  email: "admin@whitelegacy.com",
  role: "Admin",
  language: "en",
  theme: "Light",
};

export default function UserProfileSettings() {
  const [form, setForm] = useState(defaultData);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/settings/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Fetched profile settings:", data);

      if (data.success && data.data) {
        setForm({
          full_name: data.data.full_name || defaultData.full_name,
          email: data.data.email || defaultData.email,
          role: data.data.role || defaultData.role,
          language: data.data.language || defaultData.language,
          theme: data.data.theme || defaultData.theme,
        });
      }
    } catch (err) {
      console.error("Fetch settings error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      console.log("Saving profile settings:", form);

      const res = await fetch("http://localhost:5000/api/settings/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("Save response:", data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card">
      <h2 className="settings-section-title">User Profile</h2>

      <div className="settings-grid-2">
        <div className="field-group">
          <label className="field-label">Full Name</label>
          <input
            className="field-input"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Enter full name"
          />
        </div>
        <div className="field-group">
          <label className="field-label">Email</label>
          <input
            className="field-input"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
          />
        </div>
      </div>

      <div className="settings-grid-2">
        <div className="field-group">
          <label className="field-label">Role</label>
          <select
            className="field-input field-select"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label className="field-label">Language</label>
          <input
            className="field-input"
            name="language"
            value={form.language}
            onChange={handleChange}
            placeholder="e.g. en"
          />
        </div>
      </div>

      <div className="field-group" style={{ maxWidth: "50%" }}>
        <label className="field-label">Theme</label>
        <select
          className="field-input field-select"
          name="theme"
          value={form.theme}
          onChange={handleChange}
        >
          {themes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {error && (
        <p style={{ color: "red", fontSize: "13px", marginBottom: "8px" }}>
          {error}
        </p>
      )}

      {saved && (
        <p style={{ color: "green", fontSize: "13px", marginBottom: "8px" }}>
          Settings saved successfully!
        </p>
      )}

      <div className="settings-footer">
        <button
          className={`save-btn${saved ? " saved" : ""}`}
          onClick={handleSave}
          disabled={loading}
        >
          <Save size={15} />
          {loading ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}