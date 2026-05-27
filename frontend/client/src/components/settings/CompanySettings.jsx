import { useState, useEffect } from "react";
import { Save } from "lucide-react";

const defaultData = {
  name: "White Legacy",
  email: "operations@whitelegacy.com",
  address: "1000 Production Blvd, Building C",
  city: "Los Angeles",
  country: "India",
  phone: "+91-555-0001",
  website: "www.whitelegacy.com",
  tax_id: "TAX-IN-7843291",
  currency: "INR",
};

export default function CompanySettings() {
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
      const res = await fetch("http://localhost:5000/api/settings/company", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setForm((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/settings/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card">
      <h2 className="settings-section-title">Company Information</h2>

      <div className="settings-grid-2">
        <div className="field-group">
          <label className="field-label">Company Name</label>
          <input className="field-input" name="name" value={form.name || ""} onChange={handleChange} />
        </div>
        <div className="field-group">
          <label className="field-label">Email</label>
          <input className="field-input" name="email" type="email" value={form.email || ""} onChange={handleChange} />
        </div>
      </div>

      <div className="field-group full-width">
        <label className="field-label">Address</label>
        <input className="field-input" name="address" value={form.address || ""} onChange={handleChange} />
      </div>

      <div className="settings-grid-2">
        <div className="field-group">
          <label className="field-label">City</label>
          <input className="field-input" name="city" value={form.city || ""} onChange={handleChange} />
        </div>
        <div className="field-group">
          <label className="field-label">Country</label>
          <input className="field-input" name="country" value={form.country || ""} onChange={handleChange} />
        </div>
      </div>

      <div className="settings-grid-2">
        <div className="field-group">
          <label className="field-label">Phone</label>
          <input className="field-input" name="phone" value={form.phone || ""} onChange={handleChange} />
        </div>
        <div className="field-group">
          <label className="field-label">Website</label>
          <input className="field-input" name="website" value={form.website || ""} onChange={handleChange} />
        </div>
      </div>

      <div className="settings-grid-2">
        <div className="field-group">
          <label className="field-label">Tax ID</label>
          <input className="field-input" name="tax_id" value={form.tax_id || ""} onChange={handleChange} />
        </div>
        <div className="field-group">
          <label className="field-label">Currency</label>
          <input className="field-input" name="currency" value={form.currency || ""} onChange={handleChange} />
        </div>
      </div>

      {error && <p style={{ color: "red", fontSize: "13px", marginBottom: "8px" }}>{error}</p>}

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