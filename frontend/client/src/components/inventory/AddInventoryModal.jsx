import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function AddInventoryModal({ isOpen, onClose, onCreated }) {
  const [vendors, setVendors] = useState([]);

  const initialForm = {
    sku: "",
    name: "",
    category: "Counter",
    serialNumber: "",
    dailyRate: "",
    weeklyRate: "",
    monthlyRate: "",
    totalQuantity: 0,
    condition: "New",
    location: "Warehouse A",
    description: "",
    sellingPrice: "",
    salesAccount: "Sales",
    salesDescription: "",
    costPrice: "",
    purchaseAccount: "Cost of Goods Sold",
    purchaseDescription: "",
    preferredVendorId: "",
    preferredVendorName: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showSales, setShowSales] = useState(true);
  const [showPurchase, setShowPurchase] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialForm);
      setError("");
      setLoading(false);
      fetchVendors();
    }
  }, [isOpen]);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setVendors(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "preferredVendorId") {
      const vendor = vendors.find((v) => String(v.id) === String(value));
      setFormData((prev) => ({
        ...prev,
        preferredVendorId: value,
        preferredVendorName: vendor?.name || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create item");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-[820px] max-h-[92vh] overflow-hidden rounded-[20px] bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#e5e7eb]">
          <h2 className="text-[22px] font-bold text-[#111827]">Add Inventory Item</h2>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#6b7280]"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6">

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-5">
            <Field label="SKU *" name="sku" value={formData.sku} onChange={handleChange} placeholder="ITEM-001" />
            <Field label="Name *" name="name" value={formData.name} onChange={handleChange} placeholder="Item name" />

            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={[
                "Counter","Dish","Glassware","Furniture",
                "Cooking","Cloth","Tent","Accessories",
              ]}
            />

            <Field label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="SN-XXX" />
            <Field label="Daily Rate *" name="dailyRate" type="number" value={formData.dailyRate} onChange={handleChange} placeholder="0.00" />
            <Field label="Weekly Rate" name="weeklyRate" type="number" value={formData.weeklyRate} onChange={handleChange} placeholder="0.00" />
            <Field label="Monthly Rate" name="monthlyRate" type="number" value={formData.monthlyRate} onChange={handleChange} placeholder="0.00" />
            <Field label="Total Quantity" name="totalQuantity" type="number" value={formData.totalQuantity} onChange={handleChange} placeholder="0" />

            <SelectField
              label="Condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              options={["New", "Used", "Refurbished"]}
            />

            <Field label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="Warehouse A" />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              placeholder="Item description..."
              className="w-full rounded-[12px] border border-[#d1d5db] px-4 py-3 outline-none resize-none text-[14px]"
            />
          </div>

          <div className="mt-8 border-t border-[#e5e7eb] pt-6">

            {/* Sales Information */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={showSales}
                  onChange={(e) => setShowSales(e.target.checked)}
                  className="w-4 h-4 accent-[#6B21A8]"
                />
                <span className="text-[15px] font-semibold text-[#111827]">
                  Sales Information
                </span>
              </label>

              {showSales && (
                <div className="grid grid-cols-2 gap-5 pl-2">
                  <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#374151]">
                      Selling Price <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-[#6b7280] font-medium">₹</span>
                      <input
                        type="number"
                        name="sellingPrice"
                        value={formData.sellingPrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#374151]">
                      Account
                    </label>
                    <select
                      name="salesAccount"
                      value={formData.salesAccount}
                      onChange={handleChange}
                      className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                    >
                      <option>Sales</option>
                      <option>Service Revenue</option>
                      <option>Rental Revenue</option>
                      <option>Other Income</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="mb-2 block text-[13px] font-medium text-[#374151]">
                      Description
                    </label>
                    <textarea
                      name="salesDescription"
                      value={formData.salesDescription}
                      onChange={handleChange}
                      rows="3"
                      className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-3 outline-none resize-none text-[14px]"
                      placeholder="Sales description..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Purchase Information */}
            <div className="border-t border-[#e5e7eb] pt-6">
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={showPurchase}
                  onChange={(e) => setShowPurchase(e.target.checked)}
                  className="w-4 h-4 accent-[#6B21A8]"
                />
                <span className="text-[15px] font-semibold text-[#111827]">
                  Purchase Information
                </span>
              </label>

              {showPurchase && (
                <div className="grid grid-cols-2 gap-5 pl-2">
                  <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#374151]">
                      Cost Price <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-[#6b7280] font-medium">₹</span>
                      <input
                        type="number"
                        name="costPrice"
                        value={formData.costPrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#374151]">
                      Account
                    </label>
                    <select
                      name="purchaseAccount"
                      value={formData.purchaseAccount}
                      onChange={handleChange}
                      className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                    >
                      <option>Cost of Goods Sold</option>
                      <option>Purchases</option>
                      <option>Inventory Asset</option>
                      <option>Other Expense</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="mb-2 block text-[13px] font-medium text-[#374151]">
                      Description
                    </label>
                    <textarea
                      name="purchaseDescription"
                      value={formData.purchaseDescription}
                      onChange={handleChange}
                      rows="3"
                      className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-3 outline-none resize-none text-[14px]"
                      placeholder="Purchase description..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#374151]">
                      Preferred Vendor
                    </label>
                    <select
                      name="preferredVendorId"
                      value={formData.preferredVendorId}
                      onChange={handleChange}
                      className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                    >
                      <option value="">Select vendor</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="mt-4 text-[14px] text-red-600">{error}</p>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[46px] rounded-[12px] border border-[#d1d5db] px-6 text-[14px] font-medium text-[#111827]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-[46px] rounded-[12px] bg-[#2563eb] px-6 text-[14px] font-semibold text-white disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="mb-2 block text-[14px] font-medium text-[#111827]">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none focus:border-[#2563eb] text-[14px]"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options = [] }) {
  return (
    <div>
      <label className="mb-2 block text-[14px] font-medium text-[#111827]">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none focus:border-[#2563eb] text-[14px]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}