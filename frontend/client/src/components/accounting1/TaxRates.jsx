import React, { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
  Percent,
} from "lucide-react";
import useWindowSize from "../hooks/useWindowSize";

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
  const { isSm, isMd, isLg } = useWindowSize();

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
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerWrapper}>
          <div>
            <div style={titleRow}>
              <div style={titleIcon}>
                <Percent size={16} />
              </div>
              <div>
                <h2 style={titleStyle}>Tax Rates</h2>
                <p style={subtitleStyle}>
                  Manage tax configurations and active rates
                </p>
              </div>
            </div>
          </div>
          <div
            style={{
              ...actionsWrapper,
              flexDirection: isSm ? "row" : "column",
              width: isSm ? "auto" : "100%",
            }}
          >
            {/* Search */}
            <div
              style={{
                ...searchWrapper,
                width: isSm ? "260px" : "100%",
              }}
            >
              <Search size={16} color="#9ca3af" />
              <input
                type="text"
                placeholder="Search tax rates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInput}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={clearSearchBtn}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {/* Button */}
            <button
              onClick={() => setIsNewOpen(true)}
              style={{
                ...primaryButton,
                width: isSm ? "auto" : "100%",
              }}
            >
              <Plus size={16} />
              New Tax Rate
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={loadingWrapper}>
            <div style={spinner} />
            <span>Loading tax rates...</span>
          </div>
        ) : error ? (
          <div style={errorBox}>{error}</div>
        ) : filteredTaxRates.length === 0 ? (
          <div style={emptyState}>
            <Percent size={34} color="#9ca3af" />
            <h3 style={emptyTitle}>No tax rates found</h3>
            <p style={emptyText}>
              Try adjusting your search or create a new tax rate.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerCell}>Tax Name</th>
                  <th style={headerCell}>Rate</th>
                  <th style={{ ...headerCell, display: isMd ? "table-cell" : "none" }}>Description</th>
                  <th style={headerCell}>Status</th>
                  <th style={{ ...headerCell, textAlign: "center" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTaxRates.map((tax, index) => (
                  <tr
                    key={tax.id}
                    style={{
                      background:
                        index % 2 === 0 ? "#ffffff" : "#fbfcfe",
                      transition: "0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fbff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        index % 2 === 0 ? "#ffffff" : "#fbfcfe";
                    }}
                  >
                    <td style={bodyCell}>
                      <div style={{ fontWeight: 700, color: "#111827" }}>
                        {tax.name}
                      </div>
                    </td>
                    <td style={bodyCell}>
                      <div style={rateBadge}>
                        {Number(tax.rate).toFixed(2)}%
                      </div>
                    </td>
                    <td style={{ ...bodyCell, display: isMd ? "table-cell" : "none" }}>
                      <span style={{ color: "#4b5563" }}>
                        {tax.description || "-"}
                      </span>
                    </td>
                    <td style={bodyCell}>
                      <span
                        style={{
                          ...statusBadge,
                          background: tax.is_active
                            ? "#dcfce7"
                            : "#f3f4f6",
                          color: tax.is_active
                            ? "#166534"
                            : "#6b7280",
                        }}
                      >
                        {tax.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <div style={actionBtns}>
                        <button
                          onClick={() => handleView(tax)}
                          style={iconBtn}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(tax)}
                          style={iconBtn}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(tax)}
                          style={{
                            ...iconBtn,
                            color: "#ef4444",
                          }}
                        >
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

      {/* Modals */}
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

/* ===========================
   CREATE MODAL
=========================== */

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
    <ModalWrapper title="Create Tax Rate" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalField
          label="Tax Name"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
        />
        <ModalField
          label="Rate (%)"
          type="number"
          value={formData.rate}
          onChange={(e) =>
            setFormData({
              ...formData,
              rate: e.target.value,
            })
          }
        />
        <ModalField
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
        />
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Status</label>
          <select
            value={formData.is_active ? "active" : "inactive"}
            onChange={(e) =>
              setFormData({
                ...formData,
                is_active: e.target.value === "active",
              })
            }
            style={inputStyle}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {error && <p style={errorText}>{error}</p>}
        <ModalActions
          onClose={onClose}
          loading={loading}
          submitText="Create Tax Rate"
        />
      </form>
    </ModalWrapper>
  );
}

/* ===========================
   VIEW MODAL
=========================== */

function ViewTaxRateModal({ isOpen, onClose, taxRate }) {
  if (!isOpen || !taxRate) return null;

  return (
    <ModalWrapper title="Tax Rate Details" onClose={onClose}>
      <div style={detailsBox}>
        <strong>Name:</strong> {taxRate.name}
      </div>
      <div style={detailsBox}>
        <strong>Rate:</strong>{" "}
        {Number(taxRate.rate).toFixed(2)}%
      </div>
      <div style={detailsBox}>
        <strong>Description:</strong>{" "}
        {taxRate.description || "-"}
      </div>
      <div style={detailsBox}>
        <strong>Status:</strong>{" "}
        {taxRate.is_active ? "Active" : "Inactive"}
      </div>
      <div style={modalFooter}>
        <button onClick={onClose} style={secondaryBtn}>
          Close
        </button>
      </div>
    </ModalWrapper>
  );
}

/* ===========================
   EDIT MODAL
=========================== */

function EditTaxRateModal({
  isOpen,
  onClose,
  taxRate,
  onUpdated,
}) {
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
      const res = await fetch(
        `http://localhost:5000/api/tax-rates/${taxRate.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
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
        <ModalField
          label="Tax Name"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
        />
        <ModalField
          label="Rate (%)"
          type="number"
          value={formData.rate}
          onChange={(e) =>
            setFormData({
              ...formData,
              rate: e.target.value,
            })
          }
        />
        <ModalField
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
        />
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Status</label>
          <select
            value={formData.is_active ? "active" : "inactive"}
            onChange={(e) =>
              setFormData({
                ...formData,
                is_active: e.target.value === "active",
              })
            }
            style={inputStyle}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {error && <p style={errorText}>{error}</p>}
        <ModalActions
          onClose={onClose}
          loading={loading}
          submitText="Update Tax Rate"
        />
      </form>
    </ModalWrapper>
  );
}

/* ===========================
   DELETE MODAL
=========================== */

function DeleteTaxRateModal({
  isOpen,
  onClose,
  taxRate,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !taxRate) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/tax-rates/${taxRate.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
      <p style={deleteText}>
        Are you sure you want to delete{" "}
        <strong>{taxRate.name}</strong>?
      </p>
      {error && <p style={errorText}>{error}</p>}
      <div style={modalFooter}>
        <button onClick={onClose} style={secondaryBtn}>
          Cancel
        </button>
        <button
          onClick={handleDelete}
          style={{
            ...primaryBtn,
            background: "#dc2626",
          }}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </ModalWrapper>
  );
}

/* ===========================
   COMMON COMPONENTS
=========================== */

function ModalWrapper({ title, onClose, children }) {
  return (
    <div style={overlay}>
      <div
        style={{
          ...modal,
          maxWidth: "520px",
          width: "calc(100% - 40px)",
          margin: "0 auto",
        }}
      >
        <div style={modalHeader}>
          <h2 style={modalTitle}>{title}</h2>
          <button onClick={onClose} style={closeBtn}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalField({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        style={inputStyle}
      />
    </div>
  );
}

function ModalActions({
  onClose,
  loading,
  submitText,
}) {
  return (
    <div
      style={{
        ...modalFooter,
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          ...secondaryBtn,
          flex: "1 1 auto",
          minWidth: "100px",
        }}
      >
        Cancel
      </button>
      <button
        type="submit"
        style={{
          ...primaryBtn,
          flex: "1 1 auto",
          minWidth: "100px",
        }}
        disabled={loading}
      >
        {loading ? "Saving..." : submitText}
      </button>
    </div>
  );
}

/* ===========================
   STYLES
=========================== */

const containerStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  overflow: "hidden",
};

const headerWrapper = {
  padding: "24px",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "18px",
  flexWrap: "wrap",
};

const titleRow = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const titleIcon = {
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const titleStyle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 700,
  color: "#111827",
};

const subtitleStyle = {
  margin: "4px 0 0",
  fontSize: "13px",
  color: "#6b7280",
};

const actionsWrapper = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const searchWrapper = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  height: "44px",
  padding: "0 14px",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  background: "#fff",
};

const searchInput = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: "14px",
  background: "transparent",
  minWidth: 0,
};

const clearSearchBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#9ca3af",
  display: "flex",
  alignItems: "center",
};

const primaryButton = {
  height: "44px",
  padding: "0 16px",
  borderRadius: "12px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  justifyContent: "center",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const headerCell = {
  textAlign: "left",
  padding: "16px 18px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  borderBottom: "1px solid #e5e7eb",
};

const bodyCell = {
  padding: "18px",
  fontSize: "14px",
  color: "#374151",
  borderBottom: "1px solid #f3f4f6",
};

const rateBadge = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 12px",
  borderRadius: "999px",
  background: "#eff6ff",
  color: "#2563eb",
  fontSize: "12px",
  fontWeight: 700,
};

const statusBadge = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
};

const actionBtns = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
};

const iconBtn = {
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  color: "#374151",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const loadingWrapper = {
  padding: "60px 24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  color: "#6b7280",
  fontSize: "14px",
};

const spinner = {
  width: "28px",
  height: "28px",
  border: "3px solid #dbeafe",
  borderTop: "3px solid #2563eb",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const errorBox = {
  padding: "18px 20px",
  margin: "20px",
  borderRadius: "12px",
  background: "#fef2f2",
  color: "#dc2626",
  fontSize: "14px",
  border: "1px solid #fecaca",
};

const emptyState = {
  padding: "70px 20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
};

const emptyTitle = {
  margin: "14px 0 6px",
  fontSize: "18px",
  fontWeight: 700,
  color: "#111827",
};

const emptyText = {
  margin: 0,
  fontSize: "14px",
  color: "#6b7280",
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  padding: "20px",
};

const modal = {
  background: "#fff",
  borderRadius: "22px",
  padding: "24px",
  boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
};

const modalHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "24px",
};

const modalTitle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 700,
  color: "#111827",
};

const closeBtn = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  color: "#6b7280",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  height: "46px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  padding: "0 14px",
  fontSize: "14px",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
};

const primaryBtn = {
  height: "44px",
  padding: "0 18px",
  borderRadius: "12px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryBtn = {
  height: "44px",
  padding: "0 18px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#111827",
  fontWeight: 600,
  cursor: "pointer",
};

const detailsBox = {
  padding: "14px 16px",
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  marginBottom: "12px",
  fontSize: "14px",
  color: "#374151",
  wordBreak: "break-word",
};

const modalFooter = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "24px",
};

const deleteText = {
  fontSize: "14px",
  color: "#6b7280",
  lineHeight: 1.6,
};

const errorText = {
  color: "#dc2626",
  fontSize: "13px",
  marginTop: "4px",
};
