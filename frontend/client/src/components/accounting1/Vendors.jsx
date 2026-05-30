import React, { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  X,
} from "lucide-react";
import useWindowSize from "../hooks/useWindowSize";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const { isSm, isMd, isLg, isXl } = useWindowSize();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/vendors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch vendors");
      }
      setVendors(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorById = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/vendors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch vendor");
      }
      return data.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const search = searchTerm.toLowerCase();
      return (
        vendor.name?.toLowerCase().includes(search) ||
        vendor.email?.toLowerCase().includes(search) ||
        vendor.phone?.toLowerCase().includes(search) ||
        vendor.contact_person?.toLowerCase().includes(search)
      );
    });
  }, [vendors, searchTerm]);

  const handleView = async (vendor) => {
    const fullVendor = await fetchVendorById(vendor.id);
    if (fullVendor) {
      setSelectedVendor(fullVendor);
      setIsViewOpen(true);
    }
  };

  const handleEdit = async (vendor) => {
    const fullVendor = await fetchVendorById(vendor.id);
    if (fullVendor) {
      setSelectedVendor(fullVendor);
      setIsEditOpen(true);
    }
  };

  const handleDelete = (vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteOpen(true);
  };

  return (
    <>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: isMd ? "24px" : "16px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: isSm ? "center" : "stretch",
            gap: "16px",
            flexWrap: "wrap",
            flexDirection: isSm ? "row" : "column",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: isSm ? "20px" : "17px",
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              Vendors
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                marginTop: "6px",
              }}
            >
              Manage supplier and vendor records
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              flexDirection: isSm ? "row" : "column",
              width: isSm ? "auto" : "100%",
            }}
          >
            {/* Search */}
            <div
              style={{
                position: "relative",
                width: isSm ? "260px" : "100%",
              }}
            >
              <Search
                size={16}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "14px",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  height: "42px",
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "12px",
                  padding: "0 14px 0 40px",
                  fontSize: "14px",
                  outline: "none",
                  background: "#fff",
                  boxSizing: "border-box",
                }}
              />
            </div>
            {/* Add Button */}
            <button
              onClick={() => setIsNewOpen(true)}
              style={{
                height: "42px",
                padding: "0 16px",
                borderRadius: "12px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(37,99,235,0.25)",
                width: isSm ? "auto" : "100%",
                justifyContent: "center",
              }}
            >
              <Plus size={16} />
              New Vendor
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div
            style={{
              padding: "32px",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            Loading vendors...
          </div>
        ) : error ? (
          <div
            style={{
              padding: "32px",
              color: "#ef4444",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        ) : filteredVendors.length === 0 ? (
          <div
            style={{
              padding: "32px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            No vendors found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: isLg ? "900px" : isMd ? "700px" : "500px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th style={headerCell}>Vendor</th>
                  <th style={{ ...headerCell, display: isMd ? "table-cell" : "none" }}>Contact</th>
                  <th style={headerCell}>Email</th>
                  <th style={{ ...headerCell, display: isLg ? "table-cell" : "none" }}>Phone</th>
                  <th style={{ ...headerCell, display: isXl ? "table-cell" : "none" }}>Address</th>
                  <th style={headerCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor, index) => (
                  <tr
                    key={vendor.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      background: index % 2 === 0 ? "#fff" : "#fcfcfd",
                      transition: "0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fbff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        index % 2 === 0 ? "#fff" : "#fcfcfd";
                    }}
                  >
                    {/* Vendor */}
                    <td style={bodyCell}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "12px",
                            background: "#eff6ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Building2 size={18} color="#2563eb" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: isSm ? "14px" : "13px",
                              fontWeight: 600,
                              color: "#111827",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {vendor.name}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#9ca3af",
                              marginTop: "2px",
                            }}
                          >
                            Vendor ID #{vendor.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td style={{ ...bodyCell, display: isMd ? "table-cell" : "none" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <User size={14} color="#9ca3af" />
                        <span>{vendor.contact_person || "-"}</span>
                      </div>
                    </td>
                    {/* Email */}
                    <td style={bodyCell}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          maxWidth: isMd ? "none" : "160px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Mail size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
                        <span>{vendor.email || "-"}</span>
                      </div>
                    </td>
                    {/* Phone */}
                    <td style={{ ...bodyCell, display: isLg ? "table-cell" : "none" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Phone size={14} color="#9ca3af" />
                        <span>{vendor.phone || "-"}</span>
                      </div>
                    </td>
                    {/* Address */}
                    <td style={{ ...bodyCell, display: isXl ? "table-cell" : "none" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          maxWidth: "240px",
                        }}
                      >
                        <MapPin
                          size={14}
                          color="#9ca3af"
                          style={{ marginTop: "2px", flexShrink: 0 }}
                        />
                        <span
                          style={{
                            lineHeight: 1.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {vendor.address || "-"}
                        </span>
                      </div>
                    </td>
                    {/* Actions */}
                    <td style={bodyCell}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <button
                          onClick={() => handleView(vendor)}
                          style={iconBtn}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(vendor)}
                          style={iconBtn}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor)}
                          style={{
                            ...iconBtn,
                            color: "#ef4444",
                            background: "#fef2f2",
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
      <NewVendorModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        onCreated={() => {
          setIsNewOpen(false);
          fetchVendors();
        }}
      />
      <ViewVendorModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        vendor={selectedVendor}
      />
      <EditVendorModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        vendor={selectedVendor}
        onUpdated={() => {
          setIsEditOpen(false);
          setSelectedVendor(null);
          fetchVendors();
        }}
      />
      <DeleteVendorModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        vendor={selectedVendor}
        onDeleted={() => {
          setIsDeleteOpen(false);
          setSelectedVendor(null);
          fetchVendors();
        }}
      />
    </>
  );
}

/* ===========================
   CREATE MODAL
=========================== */

function NewVendorModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contact_person: "",
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
      const res = await fetch("http://localhost:5000/api/vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create vendor");
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
    <ModalWrapper title="Create Vendor" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalField
          label="Vendor Name"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
        />
        <ModalField
          label="Contact Person"
          value={formData.contact_person}
          onChange={(e) =>
            setFormData({
              ...formData,
              contact_person: e.target.value,
            })
          }
        />
        <ModalField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
        />
        <ModalField
          label="Phone"
          value={formData.phone}
          onChange={(e) =>
            setFormData({
              ...formData,
              phone: e.target.value,
            })
          }
        />
        <ModalField
          label="Address"
          value={formData.address}
          onChange={(e) =>
            setFormData({
              ...formData,
              address: e.target.value,
            })
          }
        />
        {error && (
          <p
            style={{
              color: "#ef4444",
              fontSize: "13px",
            }}
          >
            {error}
          </p>
        )}
        <ModalActions
          onClose={onClose}
          loading={loading}
          submitText="Create Vendor"
        />
      </form>
    </ModalWrapper>
  );
}

/* ===========================
   VIEW MODAL
=========================== */

function ViewVendorModal({ isOpen, onClose, vendor }) {
  if (!isOpen || !vendor) return null;

  return (
    <ModalWrapper title="Vendor Details" onClose={onClose}>
      <div style={detailsBox}>
        <strong>Name:</strong> {vendor.name}
      </div>
      <div style={detailsBox}>
        <strong>Contact Person:</strong>{" "}
        {vendor.contact_person || "-"}
      </div>
      <div style={detailsBox}>
        <strong>Email:</strong> {vendor.email || "-"}
      </div>
      <div style={detailsBox}>
        <strong>Phone:</strong> {vendor.phone || "-"}
      </div>
      <div style={detailsBox}>
        <strong>Address:</strong> {vendor.address || "-"}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "24px",
        }}
      >
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

function EditVendorModal({
  isOpen,
  onClose,
  vendor,
  onUpdated,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contact_person: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        address: vendor.address || "",
        contact_person: vendor.contact_person || "",
      });
    }
  }, [vendor]);

  if (!isOpen || !vendor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/vendors/${vendor.id}`,
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
        throw new Error(data.message || "Failed to update vendor");
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
    <ModalWrapper title="Edit Vendor" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalField
          label="Vendor Name"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
        />
        <ModalField
          label="Contact Person"
          value={formData.contact_person}
          onChange={(e) =>
            setFormData({
              ...formData,
              contact_person: e.target.value,
            })
          }
        />
        <ModalField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
        />
        <ModalField
          label="Phone"
          value={formData.phone}
          onChange={(e) =>
            setFormData({
              ...formData,
              phone: e.target.value,
            })
          }
        />
        <ModalField
          label="Address"
          value={formData.address}
          onChange={(e) =>
            setFormData({
              ...formData,
              address: e.target.value,
            })
          }
        />
        {error && (
          <p
            style={{
              color: "#ef4444",
              fontSize: "13px",
            }}
          >
            {error}
          </p>
        )}
        <ModalActions
          onClose={onClose}
          loading={loading}
          submitText="Update Vendor"
        />
      </form>
    </ModalWrapper>
  );
}

/* ===========================
   DELETE MODAL
=========================== */

function DeleteVendorModal({
  isOpen,
  onClose,
  vendor,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !vendor) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/vendors/${vendor.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete vendor");
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
    <ModalWrapper title="Delete Vendor" onClose={onClose}>
      <p
        style={{
          fontSize: "14px",
          color: "#6b7280",
          lineHeight: 1.6,
        }}
      >
        Are you sure you want to delete{" "}
        <strong>{vendor.name}</strong>?
      </p>
      {error && (
        <p
          style={{
            color: "#ef4444",
            fontSize: "13px",
            marginTop: "12px",
          }}
        >
          {error}
        </p>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginTop: "24px",
          flexWrap: "wrap",
        }}
      >
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
   SHARED COMPONENTS
=========================== */

function ModalWrapper({ title, onClose, children }) {
  return (
    <div style={overlay}>
      <div
        style={{
          ...modal,
          width: "calc(100% - 40px)",
          maxWidth: "560px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              paddingRight: "12px",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "none",
              background: "#f3f4f6",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X size={18} color="#6b7280" />
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
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        marginTop: "24px",
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

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  padding: "20px",
  backdropFilter: "blur(4px)",
};

const modal = {
  background: "#ffffff",
  borderRadius: "22px",
  padding: "24px",
  boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
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
  height: "42px",
  padding: "0 18px",
  borderRadius: "12px",
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtn = {
  height: "42px",
  padding: "0 18px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
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

const headerCell = {
  textAlign: "left",
  padding: "16px 18px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const bodyCell = {
  padding: "18px",
  fontSize: "14px",
  color: "#374151",
  verticalAlign: "middle",
};

const iconBtn = {
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  border: "none",
  background: "#f3f4f6",
  cursor: "pointer",
  color: "#374151",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
