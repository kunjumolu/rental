import React, { useState, useEffect } from "react";

export default function AddCustomerModal({ isOpen, onClose, onAddCustomer }) {
  const initialForm = {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    idNumber: "",
    status: "active",
    notes: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData(initialForm);
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      country: formData.country.trim(),
      idNumber: formData.idNumber.trim(),
      status: formData.status,
      notes: formData.notes.trim(),
    };

    console.log("Submitting payload:", payload);

    if (!payload.name || !payload.email || !payload.phone) {
      setError("Full name, email, and phone are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again");
      }

      const res = await fetch("http://localhost:5000/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Add customer response:", data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add customer");
      }

      onAddCustomer(data.data);
      onClose();
    } catch (err) {
      console.error("Add Customer Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[720px] rounded-[16px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">
          <h2 className="text-[20px] font-bold text-[#111827]">Add Customer</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[22px] leading-none text-[#6b7280] hover:text-[#111827]"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none focus:border-[#2563eb]"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none focus:border-[#2563eb]"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none focus:border-[#2563eb]"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">
                ID Number
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none focus:border-[#2563eb]"
                placeholder="Enter ID number"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none focus:border-[#2563eb]"
                placeholder="Enter address"
              />
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none focus:border-[#2563eb]"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none focus:border-[#2563eb]"
                placeholder="Enter country"
              />
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none focus:border-[#2563eb]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-2 outline-none focus:border-[#2563eb] resize-none"
                placeholder="Enter notes"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-[13px] text-red-600">{error}</p>
          )}

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
              className="h-[42px] rounded-[10px] bg-[#0f4aa8] px-5 text-[14px] font-semibold text-white disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}