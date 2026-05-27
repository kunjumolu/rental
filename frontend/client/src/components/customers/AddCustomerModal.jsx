import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+1", country: "US/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
];

const LENGTH_RULES = {
  "+1": { min: 10, max: 10 },
  "+44": { min: 10, max: 11 },
  "+91": { min: 10, max: 10 },
  "+971": { min: 9, max: 9 },
  "+966": { min: 9, max: 9 },
  "+974": { min: 8, max: 8 },
  "+965": { min: 8, max: 8 },
  "+973": { min: 8, max: 8 },
  "+968": { min: 8, max: 8 },
  "+61": { min: 9, max: 9 },
  "+86": { min: 11, max: 11 },
  "+81": { min: 10, max: 11 },
  "+49": { min: 10, max: 12 },
  "+33": { min: 9, max: 9 },
  "+92": { min: 10, max: 10 },
  "+880": { min: 10, max: 10 },
  "+94": { min: 9, max: 9 },
  "+60": { min: 9, max: 10 },
  "+65": { min: 8, max: 8 },
  "+66": { min: 9, max: 9 },
  "+62": { min: 9, max: 12 },
  "+63": { min: 10, max: 10 },
};

const validatePhone = (countryCode, phone) => {
  if (!phone) return "Phone number is required";
  const clean = phone.replace(/[\s-]/g, "");
  if (!/^\d+$/.test(clean)) return "Phone number can only contain digits";
  const rule = LENGTH_RULES[countryCode] || { min: 7, max: 15 };
  if (clean.length < rule.min || clean.length > rule.max) {
    if (rule.min === rule.max) {
      return `Phone must be exactly ${rule.min} digits for ${countryCode}`;
    }
    return `Phone must be ${rule.min}–${rule.max} digits for ${countryCode}`;
  }
  return "";
};

export default function AddCustomerModal({ isOpen, onClose, onAddCustomer }) {
  const initialForm = {
    name: "",
    email: "",
    countryCode: "+91",
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
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialForm);
      setError("");
      setFieldErrors({});
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      const rule = LENGTH_RULES[formData.countryCode] || { min: 7, max: 15 };
      if (digits.length <= rule.max) {
        setFormData((prev) => ({ ...prev, phone: digits }));
        const err = validatePhone(formData.countryCode, digits);
        setFieldErrors((prev) => ({ ...prev, phone: err }));
      }
      return;
    }

    if (name === "countryCode") {
      setFormData((prev) => ({ ...prev, countryCode: value }));
      const err = validatePhone(value, formData.phone);
      setFieldErrors((prev) => ({ ...prev, phone: err }));
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

    const phoneErr = validatePhone(formData.countryCode, formData.phone);
    if (phoneErr) errors.phone = phoneErr;

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

    const fullPhone = `${formData.countryCode}${formData.phone}`;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: fullPhone,
      address: formData.address.trim(),
      city: formData.city.trim(),
      country: formData.country.trim(),
      idNumber: formData.idNumber.trim(),
      status: formData.status,
      notes: formData.notes.trim(),
    };

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) throw new Error("Please login again");

      const res = await fetch("http://localhost:5000/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

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

  const rule = LENGTH_RULES[formData.countryCode] || { min: 7, max: 15 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[720px] h-[90vh] rounded-[16px] bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4 flex-shrink-0">
          <h2 className="text-[20px] font-bold text-[#111827]">Add Customer</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#6b7280] transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-4">

            {/* Full Name */}
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className={`h-[42px] w-full rounded-[10px] border px-3 outline-none focus:border-[#2563eb] ${
                  fieldErrors.name ? "border-red-500 bg-red-50" : "border-[#d1d5db]"
                }`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className={`h-[42px] w-full rounded-[10px] border px-3 outline-none focus:border-[#2563eb] ${
                  fieldErrors.email ? "border-red-500 bg-red-50" : "border-[#d1d5db]"
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Phone with country code */}
            <div className="col-span-2">
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className={`h-[42px] w-[150px] rounded-[10px] border px-2 outline-none focus:border-[#2563eb] ${
                    fieldErrors.phone ? "border-red-500" : "border-[#d1d5db]"
                  }`}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} {c.country}
                    </option>
                  ))}
                </select>
                <div className="flex-1 relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={`Enter ${rule.min === rule.max ? rule.min : rule.min + "–" + rule.max} digit number`}
                    className={`h-[42px] w-full rounded-[10px] border px-3 outline-none focus:border-[#2563eb] ${
                      fieldErrors.phone ? "border-red-500 bg-red-50" : "border-[#d1d5db]"
                    }`}
                  />
                  <span
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold ${
                      formData.phone.length === rule.min && rule.min === rule.max
                        ? "text-green-500"
                        : formData.phone.length > 0
                        ? "text-[#f59e0b]"
                        : "text-[#9ca3af]"
                    }`}
                  >
                    {formData.phone.length}/{rule.max}
                  </span>
                </div>
              </div>
              {fieldErrors.phone ? (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.phone}</p>
              ) : !fieldErrors.phone && formData.phone ? (
                <p className="mt-1 text-[11px] text-gray-500">
                  Full number: {formData.countryCode}{formData.phone}
                </p>
              ) : null}
            </div>

            {/* Address */}
            <div className="col-span-2">
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none focus:border-[#2563eb]"
              />
            </div>

            {/* City */}
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none focus:border-[#2563eb]"
              />
            </div>

            {/* Country */}
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter country"
                className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none focus:border-[#2563eb]"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">Status</label>
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

            {/* Notes */}
            <div className="col-span-2">
              <label className="mb-1 block text-[13px] font-medium text-[#374151]">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Enter notes"
                className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-2 outline-none focus:border-[#2563eb] resize-none"
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
        <div className="flex justify-end gap-3 border-t border-[#e5e7eb] px-6 py-4 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] rounded-[10px] border border-[#d1d5db] px-5 text-[14px] font-medium text-[#374151]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !!fieldErrors.phone}
            className="h-[42px] rounded-[10px] bg-[#0f4aa8] px-5 text-[14px] font-semibold text-white disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}