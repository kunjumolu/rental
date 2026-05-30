import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function EditCustomerModal({ isOpen, onClose, customer, onUpdateCustomer }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    status: "active",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (customer) {
      // Extract 10-digit number from phone (remove +91 prefix if present)
      let phoneDigits = customer.phone || "";
      if (phoneDigits.startsWith("+91")) {
        phoneDigits = phoneDigits.slice(3);
      }
      phoneDigits = phoneDigits.replace(/\D/g, "");

      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: phoneDigits,
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        country: customer.country || "",
        status: customer.status || "active",
        notes: customer.notes || "",
      });
      setError("");
      setFieldErrors({});
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 10) {
        setFormData((prev) => ({ ...prev, phone: digits }));
        if (digits.length > 0 && digits.length !== 10) {
          setFieldErrors((prev) => ({ ...prev, phone: "Phone must be exactly 10 digits" }));
        } else {
          setFieldErrors((prev) => ({ ...prev, phone: "" }));
        }
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setError("");
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }
    if (!formData.phone) {
      errors.phone = "Phone number is required";
    } else if (formData.phone.length !== 10) {
      errors.phone = "Phone must be exactly 10 digits";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(Object.values(errors)[0]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: `+91${formData.phone}`,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        status: formData.status,
        notes: formData.notes.trim(),
      };

      const res = await fetch(`http://localhost:5000/api/customers/${customer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update customer");

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-3 sm:px-4">
      <div className="w-full max-w-[720px] max-h-[90vh] rounded-[12px] sm:rounded-[16px] bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900">Edit Customer</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Customer ID (Read Only) */}
            <div>
              <label className="mb-1 block text-[12px] sm:text-[13px] font-medium text-gray-700">
                Customer ID
              </label>
              <input
                type="text"
                value={customer.customerId || customer.idNumber || "-"}
                disabled
                className="h-[40px] sm:h-[42px] w-full rounded-[10px] border border-gray-200 bg-gray-50 px-3 outline-none text-[13px] sm:text-sm text-gray-500 font-semibold"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="mb-1 block text-[12px] sm:text-[13px] font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`h-[40px] sm:h-[42px] w-full rounded-[10px] border px-3 outline-none focus:border-blue-600 text-[13px] sm:text-sm ${
                  fieldErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {fieldErrors.name && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-[12px] sm:text-[13px] font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`h-[40px] sm:h-[42px] w-full rounded-[10px] border px-3 outline-none focus:border-blue-600 text-[13px] sm:text-sm ${
                  fieldErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {fieldErrors.email && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1 block text-[12px] sm:text-[13px] font-medium text-gray-700">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-0">
                <div className="h-[40px] sm:h-[42px] flex items-center px-3 rounded-l-[10px] border border-r-0 border-gray-300 bg-gray-50 text-[13px] sm:text-sm text-gray-600 font-medium shrink-0">
                  +91
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10 digit number"
                  className={`h-[40px] sm:h-[42px] w-full rounded-r-[10px] border px-3 outline-none focus:border-blue-600 text-[13px] sm:text-sm ${
                    fieldErrors.phone ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
              </div>
              {fieldErrors.phone && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.phone}</p>}
            </div>

            {/* Address */}
            <div className="col-span-1 sm:col-span-2">
              <label className="mb-1 block text-[12px] sm:text-[13px] font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="h-[40px] sm:h-[42px] w-full rounded-[10px] border border-gray-300 px-3 outline-none focus:border-blue-600 text-[13px] sm:text-sm"
              />
            </div>

            {/* City */}
            <div>
              <label className="mb-1 block text-[12px] sm:text-[13px] font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="h-[40px] sm:h-[42px] w-full rounded-[10px] border border-gray-300 px-3 outline-none focus:border-blue-600 text-[13px] sm:text-sm"
              />
            </div>

            {/* State */}
            <div>
              <label className="mb-1 block text-[12px] sm:text-[13px] font-medium text-gray-700">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                className="h-[40px] sm:h-[42px] w-full rounded-[10px] border border-gray-300 px-3 outline-none focus:border-blue-600 text-[13px] sm:text-sm"
              />
            </div>

            {/* Country */}
            <div>
              <label className="mb-1 block text-[12px] sm:text-[13px] font-medium text-gray-700">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="h-[40px] sm:h-[42px] w-full rounded-[10px] border border-gray-300 px-3 outline-none focus:border-blue-600 text-[13px] sm:text-sm"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-[12px] sm:text-[13px] font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="h-[40px] sm:h-[42px] w-full rounded-[10px] border border-gray-300 px-3 outline-none focus:border-blue-600 text-[13px] sm:text-sm bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Notes */}
            <div className="col-span-1 sm:col-span-2">
              <label className="mb-1 block text-[12px] sm:text-[13px] font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-[10px] border border-gray-300 px-3 py-2 outline-none focus:border-blue-600 resize-none text-[13px] sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[13px] text-red-600 font-medium">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] sm:h-[42px] rounded-[10px] border border-gray-300 px-5 text-[13px] sm:text-[14px] font-medium text-gray-700 w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="h-[40px] sm:h-[42px] rounded-[10px] bg-[#0f4aa8] px-5 text-[13px] sm:text-[14px] font-semibold text-white disabled:opacity-70 w-full sm:w-auto"
          >
            {loading ? "Updating..." : "Update Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
