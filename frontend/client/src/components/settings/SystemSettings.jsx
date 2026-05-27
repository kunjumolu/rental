import { useState, useEffect } from "react";
import { Save } from "lucide-react";

const defaultData = {
  default_tax_rate: "10",
  default_payment_terms: "15",
  late_fee_percentage: "10",
  deposit_percentage: "20",
  currency: "INR",
  date_format: "DD/MM/YYYY",
  timezone: "Asia/Kolkata",
};

export default function SystemSettings() {
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
      const res = await fetch("http://localhost:5000/api/settings/system", {
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

      const res = await fetch("http://localhost:5000/api/settings/system", {
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
      <h2 className="settings-section-title">System Preferences</h2>

      <div className="settings-grid-2">
        <div className="field-group">
          <label className="field-label">Default Tax Rate (%)</label>
          <input className="field-input" name="default_tax_rate" type="number" value={form.default_tax_rate || ""} onChange={handleChange} />
        </div>
        <div className="field-group">
          <label className="field-label">Default Payment Terms (days)</label>
          <input className="field-input" name="default_payment_terms" type="number" value={form.default_payment_terms || ""} onChange={handleChange} />
        </div>
      </div>

      <div className="settings-grid-2">
        <div className="field-group">
          <label className="field-label">Late Fee Percentage (%)</label>
          <input className="field-input" name="late_fee_percentage" type="number" value={form.late_fee_percentage || ""} onChange={handleChange} />
        </div>
        <div className="field-group">
          <label className="field-label">Deposit Percentage (%)</label>
          <input className="field-input" name="deposit_percentage" type="number" value={form.deposit_percentage || ""} onChange={handleChange} />
        </div>
      </div>

      <div className="settings-grid-2">
        <div className="field-group">
          <label className="field-label">Currency</label>
          <input className="field-input" name="currency" value={form.currency || ""} onChange={handleChange} />
        </div>
        <div className="field-group">
          <label className="field-label">Date Format</label>
          <input className="field-input" name="date_format" value={form.date_format || ""} onChange={handleChange} />
        </div>
      </div>

      <div className="field-group" style={{ maxWidth: "50%" }}>
        <label className="field-label">Time Zone</label>
        <input className="field-input" name="timezone" value={form.timezone || ""} onChange={handleChange} />
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