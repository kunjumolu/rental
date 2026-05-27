import React, { useState } from "react";
import { X } from "lucide-react";

const tabs = ["Other Details", "Address", "Remarks"];

export default function NewVendorModal({ isOpen, onClose, onCreated }) {
  const [activeTab, setActiveTab] = useState("Other Details");
  const [formData, setFormData] = useState({
    salutation: "Mr.",
    firstName: "",
    lastName: "",
    companyName: "",
    displayName: "",
    email: "",
    workPhone: "",
    mobile: "",
    pan: "",
    currency: "INR",
    paymentTerms: "Due on Receipt",
    openingBalance: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "firstName" || name === "lastName" || name === "salutation") {
        const fn = name === "firstName" ? value : prev.firstName;
        const ln = name === "lastName" ? value : prev.lastName;
        const sal = name === "salutation" ? value : prev.salutation;
        updated.displayName = `${sal} ${fn} ${ln}`.trim();
      }

      return updated;
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const vendorName =
      formData.displayName ||
      `${formData.firstName} ${formData.lastName}`.trim() ||
      formData.companyName;

    if (!vendorName) {
      setError("Please enter vendor name or first/last name");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const payload = {
        salutation: formData.salutation,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName,
        displayName: vendorName,
        email: formData.email,
        workPhone: formData.workPhone,
        mobile: formData.mobile,
        pan: formData.pan,
        currency: formData.currency,
        paymentTerms: formData.paymentTerms,
        openingBalance: formData.openingBalance,
        address: formData.address,
        contact_person: `${formData.salutation} ${formData.firstName} ${formData.lastName}`.trim(),
        notes: formData.notes,
      };

      const res = await fetch("http://localhost:5000/api/vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create vendor");
      }

      setFormData({
        salutation: "Mr.",
        firstName: "",
        lastName: "",
        companyName: "",
        displayName: "",
        email: "",
        workPhone: "",
        mobile: "",
        pan: "",
        currency: "INR",
        paymentTerms: "Due on Receipt",
        openingBalance: "",
        address: "",
        notes: "",
      });

      onCreated();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[860px] max-h-[92vh] overflow-hidden rounded-[18px] bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#e5e7eb]">
          <h2 className="text-[20px] font-bold text-[#111827]">New Vendor</h2>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827]"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6">

          {/* Primary Contact */}
          <div className="mb-5">
            <label className="block text-[13px] font-medium text-[#374151] mb-2">
              Primary Contact
            </label>
            <div className="flex gap-3">
              <select
                name="salutation"
                value={formData.salutation}
                onChange={handleChange}
                className="h-[44px] w-[100px] rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
              >
                <option>Mr.</option>
                <option>Mrs.</option>
                <option>Ms.</option>
                <option>Dr.</option>
              </select>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="h-[44px] flex-1 rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="h-[44px] flex-1 rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="mb-5">
            <label className="block text-[13px] font-medium text-[#374151] mb-2">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
            />
          </div>

          {/* Display Name - auto filled */}
          <div className="mb-5">
            <label className="block text-[13px] font-medium text-[#374151] mb-2">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Auto filled from name"
              className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-[13px] font-medium text-[#374151] mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
            />
          </div>

          {/* Phone */}
          <div className="mb-5">
            <label className="block text-[13px] font-medium text-[#374151] mb-2">
              Phone
            </label>
            <div className="flex gap-3">
              <div className="flex gap-2 flex-1">
                <select className="h-[44px] w-[75px] rounded-[10px] border border-[#d1d5db] px-2 outline-none text-[13px]">
                  <option>+91</option>
                  <option>+1</option>
                  <option>+44</option>
                </select>
                <input
                  type="text"
                  name="workPhone"
                  placeholder="Work Phone"
                  value={formData.workPhone}
                  onChange={handleChange}
                  className="h-[44px] flex-1 rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                />
              </div>
              <div className="flex gap-2 flex-1">
                <select className="h-[44px] w-[75px] rounded-[10px] border border-[#d1d5db] px-2 outline-none text-[13px]">
                  <option>+91</option>
                  <option>+1</option>
                  <option>+44</option>
                </select>
                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="h-[44px] flex-1 rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-[#e5e7eb] flex gap-6 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[13px] font-medium transition-all ${
                  activeTab === tab
                    ? "border-b-2 border-[#6B21A8] text-[#6B21A8]"
                    : "text-[#6b7280] hover:text-[#374151]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Other Details" && (
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                  PAN
                </label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  className="h-[44px] w-full max-w-[320px] rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="h-[44px] w-full max-w-[320px] rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                  Opening Balance
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-[#374151]">₹</span>
                  <input
                    type="number"
                    name="openingBalance"
                    value={formData.openingBalance}
                    onChange={handleChange}
                    className="h-[44px] w-full max-w-[280px] rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                  Payment Terms
                </label>
                <select
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  className="h-[44px] w-full max-w-[320px] rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                >
                  <option>Due on Receipt</option>
                  <option>Net 15</option>
                  <option>Net 30</option>
                  <option>Net 45</option>
                  <option>Net 60</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "Address" && (
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="5"
                placeholder="Enter full address"
                className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-3 outline-none text-[14px] resize-none"
              />
            </div>
          )}

          {activeTab === "Remarks" && (
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">
                Notes / Remarks
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="5"
                placeholder="Enter notes or remarks"
                className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-3 outline-none text-[14px] resize-none"
              />
            </div>
          )}

          {error && (
            <p className="mt-4 text-[13px] text-red-600">{error}</p>
          )}
        </form>

        <div className="flex justify-end gap-3 px-8 py-4 border-t border-[#e5e7eb]">
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium text-[#374151]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="h-[42px] rounded-[12px] bg-[#6B21A8] px-5 text-[14px] font-semibold text-white disabled:opacity-70 hover:bg-[#581c87] transition"
          >
            {loading ? "Saving..." : "Save Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}