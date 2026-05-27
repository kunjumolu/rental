import React, { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";

export default function TaxRates() {
  const [taxRates, setTaxRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedTaxRate, setSelectedTaxRate] = useState(null);

  useEffect(() => {
    fetchTaxRates();
  }, []);

  const fetchTaxRates = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/tax-rates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch tax rates");
      }

      setTaxRates(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxRateById = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/tax-rates/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch tax rate");
      }

      return data.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const filteredTaxRates = useMemo(() => {
    return taxRates.filter((tax) => {
      const search = searchTerm.toLowerCase();
      return (
        tax.name?.toLowerCase().includes(search) ||
        tax.description?.toLowerCase().includes(search)
      );
    });
  }, [taxRates, searchTerm]);

  const handleView = async (tax) => {
    const fullTax = await fetchTaxRateById(tax.id);
    if (fullTax) {
      setSelectedTaxRate(fullTax);
      setIsViewOpen(true);
    }
  };

  const handleEdit = async (tax) => {
    const fullTax = await fetchTaxRateById(tax.id);
    if (fullTax) {
      setSelectedTaxRate(fullTax);
      setIsEditOpen(true);
    }
  };

  const handleDelete = (tax) => {
    setSelectedTaxRate(tax);
    setIsDeleteOpen(true);
  };

  return (
    <>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 }}>
              Tax Rates
            </h3>
            <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
              Manage tax configurations and active rates
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              type="text"
              placeholder="Search tax rates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                height: "40px",
                width: "240px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                padding: "0 14px",
                fontSize: "14px",
                outline: "none",
              }}
            />

            <button
              onClick={() => setIsNewOpen(true)}
              style={{
                height: "40px",
                padding: "0 14px",
                borderRadius: "10px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <Plus size={16} />
              New Tax Rate
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "24px", color: "#6b7280", fontSize: "14px" }}>
            Loading tax rates...
          </div>
        ) : error ? (
          <div style={{ padding: "24px", color: "red", fontSize: "14px" }}>
            {error}
          </div>
        ) : filteredTaxRates.length === 0 ? (
          <div style={{ padding: "24px", color: "#6b7280", fontSize: "14px" }}>
            No tax rates found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={headerCell}>Tax Name</th>
                  <th style={headerCell}>Rate</th>
                  <th style={headerCell}>Description</th>
                  <th style={headerCell}>Status</th>
                  <th style={headerCell}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTaxRates.map((tax, index) => (
                  <tr
                    key={tax.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      background: index % 2 === 0 ? "#fff" : "#fafafa",
                    }}
                  >
                    <td style={{ ...bodyCell, fontWeight: 600, color: "#111827" }}>
                      {tax.name}
                    </td>
                    <td style={{ ...bodyCell, fontWeight: 600, color: "#2563eb" }}>
                      {Number(tax.rate).toFixed(2)}%
                    </td>
                    <td style={bodyCell}>{tax.description || "-"}</td>
                    <td style={bodyCell}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: tax.is_active ? "#d1fae5" : "#f3f4f6",
                          color: tax.is_active ? "#065f46" : "#6b7280",
                        }}
                      >
                        {tax.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={bodyCell}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button onClick={() => handleView(tax)} style={iconBtn}>
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEdit(tax)} style={iconBtn}>
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(tax)} style={{ ...iconBtn, color: "#ef4444" }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewTaxRateModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        onCreated={() => {
          setIsNewOpen(false);
          fetchTaxRates();
        }}
      />

      <ViewTaxRateModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        taxRate={selectedTaxRate}
      />

      <EditTaxRateModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        taxRate={selectedTaxRate}
        onUpdated={() => {
          setIsEditOpen(false);
          setSelectedTaxRate(null);
          fetchTaxRates();
        }}
      />

      <DeleteTaxRateModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        taxRate={selectedTaxRate}
        onDeleted={() => {
          setIsDeleteOpen(false);
          setSelectedTaxRate(null);
          fetchTaxRates();
        }}
      />
    </>
  );
}

function NewTaxRateModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    rate: "",
    description: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/tax-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create tax rate");
      }

      onCreated();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper title="Create New Tax Rate" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalField label="Tax Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        <ModalField label="Rate (%)" type="number" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: e.target.value })} />
        <ModalField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>Status</label>
          <select
            value={formData.is_active ? "active" : "inactive"}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "active" })}
            style={inputStyle}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
        <ModalActions onClose={onClose} loading={loading} submitText="Create Tax Rate" />
      </form>
    </ModalWrapper>
  );
}

function ViewTaxRateModal({ isOpen, onClose, taxRate }) {
  if (!isOpen || !taxRate) return null;

  return (
    <ModalWrapper title="Tax Rate Details" onClose={onClose}>
      <div style={detailsBox}><strong>Name:</strong> {taxRate.name}</div>
      <div style={detailsBox}><strong>Rate:</strong> {Number(taxRate.rate).toFixed(2)}%</div>
      <div style={detailsBox}><strong>Description:</strong> {taxRate.description || "-"}</div>
      <div style={detailsBox}><strong>Status:</strong> {taxRate.is_active ? "Active" : "Inactive"}</div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
        <button onClick={onClose} style={secondaryBtn}>Close</button>
      </div>
    </ModalWrapper>
  );
}

function EditTaxRateModal({ isOpen, onClose, taxRate, onUpdated }) {
  const [formData, setFormData] = useState({
    name: "",
    rate: "",
    description: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (taxRate) {
      setFormData({
        name: taxRate.name || "",
        rate: taxRate.rate || "",
        description: taxRate.description || "",
        is_active: taxRate.is_active ?? true,
      });
    }
  }, [taxRate]);

  if (!isOpen || !taxRate) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/tax-rates/${taxRate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update tax rate");
      }

      onUpdated();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper title="Edit Tax Rate" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalField label="Tax Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        <ModalField label="Rate (%)" type="number" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: e.target.value })} />
        <ModalField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>Status</label>
          <select
            value={formData.is_active ? "active" : "inactive"}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "active" })}
            style={inputStyle}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
        <ModalActions onClose={onClose} loading={loading} submitText="Update Tax Rate" />
      </form>
    </ModalWrapper>
  );
}

function DeleteTaxRateModal({ isOpen, onClose, taxRate, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !taxRate) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/tax-rates/${taxRate.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete tax rate");
      }

      onDeleted();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper title="Delete Tax Rate" onClose={onClose}>
      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
        Are you sure you want to delete <strong>{taxRate.name}</strong>?
      </p>

      {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button onClick={onClose} style={secondaryBtn}>Cancel</button>
        <button
          onClick={handleDelete}
          style={{ ...primaryBtn, background: "#dc2626" }}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </ModalWrapper>
  );
}

function ModalWrapper({ title, onClose, children }) {
  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#6b7280" }}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalField({ label, value, onChange, type = "text" }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={onChange} style={inputStyle} />
    </div>
  );
}

function ModalActions({ onClose, loading, submitText }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
      <button type="button" onClick={onClose} style={secondaryBtn}>
        Cancel
      </button>
      <button type="submit" style={primaryBtn} disabled={loading}>
        {loading ? "Saving..." : submitText}
      </button>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  padding: "16px",
};

const modal = {
  width: "100%",
  maxWidth: "520px",
  background: "#fff",
  borderRadius: "14px",
  padding: "24px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  height: "42px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  padding: "0 12px",
  fontSize: "14px",
  outline: "none",
};

const primaryBtn = {
  height: "40px",
  padding: "0 16px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtn = {
  height: "40px",
  padding: "0 16px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#111827",
  fontWeight: 500,
  cursor: "pointer",
};

const detailsBox = {
  padding: "12px 14px",
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  marginBottom: "10px",
  fontSize: "14px",
  color: "#374151",
};

const headerCell = {
  textAlign: "left",
  padding: "14px 16px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#6b7280",
  background: "#fff",
};

const bodyCell = {
  padding: "14px 16px",
  fontSize: "14px",
  color: "#374151",
};

const iconBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#111827",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};