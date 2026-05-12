import React, { useEffect, useState } from "react";

export default function EditCustomerModal({ isOpen, onClose, customer, onUpdateCustomer }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    idNumber: "",
    status: "active",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
        country: customer.country || "",
        idNumber: customer.idNumber || "",
        status: customer.status || "active",
        notes: customer.notes || "",
      });
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/customers/${customer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update customer");
      }

      onUpdateCustomer(data.data);
      onClose();
    } catch (err) {
      console.error("Edit Customer Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[720px] rounded-[16px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">
          <h2 className="text-[20px] font-bold text-[#111827]">Edit Customer</h2>
          <button onClick={onClose} className="text-[22px] text-[#6b7280]">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
            <Field label="Email" name="email" value={formData.email} onChange={handleChange} required />
            <Field label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />
            <Field label="ID Number" name="idNumber" value={formData.idNumber} onChange={handleChange} />
            <Field label="Address" name="address" value={formData.address} onChange={handleChange} className="col-span-2" />
            <Field label="City" name="city" value={formData.city} onChange={handleChange} />
            <Field label="Country" name="country" value={formData.country} onChange={handleChange} />

            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-2 outline-none resize-none"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[42px] rounded-[10px] border border-[#d1d5db] px-5 text-[14px] font-medium text-[#374151]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-[42px] rounded-[10px] bg-[#0f4aa8] px-5 text-[14px] font-semibold text-white"
            >
              {loading ? "Updating..." : "Update Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, required = false, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[13px] font-medium text-[#374151]">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none"
      />
    </div>
  );
}