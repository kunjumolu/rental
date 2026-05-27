import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const tabs = ["Basic Info", "Contact", "Financial", "Remarks"];

export default function EditVendorModal({ isOpen, onClose, vendor, onUpdated }) {
  const [activeTab, setActiveTab] = useState("Basic Info");
  const [formData, setFormData] = useState({
    name: "",
    salutation: "Mr.",
    first_name: "",
    last_name: "",
    company_name: "",
    email: "",
    work_phone: "",
    mobile: "",
    phone: "",
    address: "",
    contact_person: "",
    pan: "",
    currency: "INR",
    payment_terms: "Due on Receipt",
    opening_balance: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || "",
        salutation: vendor.salutation || "Mr.",
        first_name: vendor.first_name || "",
        last_name: vendor.last_name || "",
        company_name: vendor.company_name || "",
        email: vendor.email || "",
        work_phone: vendor.work_phone || "",
        mobile: vendor.mobile || "",
        phone: vendor.phone || "",
        address: vendor.address || "",
        contact_person: vendor.contact_person || "",
        pan: vendor.pan || "",
        currency: vendor.currency || "INR",
        payment_terms: vendor.payment_terms || "Due on Receipt",
        opening_balance: vendor.opening_balance || "",
        notes: vendor.notes || "",
      });
      setActiveTab("Basic Info");
      setError("");
    }
  }, [vendor]);

  if (!isOpen || !vendor) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/vendors/${vendor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[720px] max-h-[92vh] overflow-hidden rounded-[18px] bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#e5e7eb]">
          <h2 className="text-[20px] font-bold text-[#111827]">Edit Vendor</h2>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#111827]">
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#e5e7eb] flex gap-6 px-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-[13px] font-medium transition-all ${
                activeTab === tab
                  ? "border-b-2 border-[#6B21A8] text-[#6B21A8]"
                  : "text-[#6b7280] hover:text-[#374151]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6">
          {activeTab === "Basic Info" && (
            <div className="space-y-5">
              <div>
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
                    name="first_name"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="h-[44px] flex-1 rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                  />
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="h-[44px] flex-1 rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                />
              </div>
            </div>
          )}

          {activeTab === "Contact" && (
            <div className="space-y-5">
              <div>
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

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                  Work Phone
                </label>
                <input
                  type="text"
                  name="work_phone"
                  value={formData.work_phone}
                  onChange={handleChange}
                  className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                  Mobile
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-3 outline-none text-[14px] resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === "Financial" && (
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">PAN</label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  className="h-[44px] w-full max-w-[320px] rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">Currency</label>
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
                  Payment Terms
                </label>
                <select
                  name="payment_terms"
                  value={formData.payment_terms}
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

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                  Opening Balance (₹)
                </label>
                <input
                  type="number"
                  name="opening_balance"
                  value={formData.opening_balance}
                  onChange={handleChange}
                  className="h-[44px] w-full max-w-[320px] rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                />
              </div>
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
                rows="6"
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
            {loading ? "Updating..." : "Update Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}