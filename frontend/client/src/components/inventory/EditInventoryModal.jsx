import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

export default function EditInventoryModal({ isOpen, onClose, item, onUpdated }) {
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    serialNumber: "",
    dailyRate: "",
    weeklyRate: "",
    monthlyRate: "",
    totalQuantity: 0,
    availableQuantity: 0,
    rentedQuantity: 0,
    maintenanceQuantity: 0,
    condition: "",
    location: "",
    description: "",
    status: "available",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku || "",
        name: item.name || "",
        category: item.category || "",
        serialNumber: item.serialNumber || "",
        dailyRate: item.dailyRate || "",
        weeklyRate: item.weeklyRate || "",
        monthlyRate: item.monthlyRate || "",
        totalQuantity: item.totalQuantity || 0,
        availableQuantity: item.availableQuantity || 0,
        rentedQuantity: item.rentedQuantity || 0,
        maintenanceQuantity: item.maintenanceQuantity || 0,
        condition: item.condition || "New",
        location: item.location || "",
        description: item.description || "",
        status: item.status || "available",
      });
    }
  }, [item]);

  const computedValues = useMemo(() => {
    const total = Number(formData.totalQuantity) || 0;
    const rented = Number(formData.rentedQuantity) || 0;
    const maintenance = Number(formData.maintenanceQuantity) || 0;

    const available = Math.max(total - rented - maintenance, 0);

    let status = "available";
    if (maintenance > 0) status = "maintenance";
    else if (available <= 0) status = "out_of_stock";
    else if (available <= 1) status = "low_stock";
    else status = "available";

    return { available, status };
  }, [
    formData.totalQuantity,
    formData.rentedQuantity,
    formData.maintenanceQuantity,
  ]);

  if (!isOpen || !item) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "dailyRate" ||
        name === "weeklyRate" ||
        name === "monthlyRate" ||
        name === "totalQuantity" ||
        name === "rentedQuantity" ||
        name === "maintenanceQuantity"
          ? Number(value)
          : value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const payload = {
        ...formData,
        availableQuantity: computedValues.available,
        status: computedValues.status,
      };

      const res = await fetch(`http://localhost:5000/api/inventory/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update item");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-[920px] max-h-[92vh] overflow-hidden rounded-[20px] bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#e5e7eb]">
          <h2 className="text-[24px] font-bold text-[#111827]">Edit Inventory Item</h2>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#6b7280]"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-2 gap-5">
            <Field label="SKU" name="sku" value={formData.sku} onChange={handleChange} />
            <Field label="Name" name="name" value={formData.name} onChange={handleChange} />

          <SelectField
  label="Category"
  name="category"
  value={formData.category}
  onChange={handleChange}
  options={[
    "Counter",
    "Dish",
    "Glassware",
    "Furniture",
    "Cooking",
    "Cloth",
    "Tent",
    "Accessories",
  ]}
/>

            <Field label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleChange} />

            <Field label="Daily Rate" name="dailyRate" type="number" value={formData.dailyRate} onChange={handleChange} />
            <Field label="Weekly Rate" name="weeklyRate" type="number" value={formData.weeklyRate} onChange={handleChange} />

            <Field label="Monthly Rate" name="monthlyRate" type="number" value={formData.monthlyRate} onChange={handleChange} />
            <Field label="Total Quantity" name="totalQuantity" type="number" value={formData.totalQuantity} onChange={handleChange} />

            <Field
              label="Available Quantity"
              name="availableQuantity"
              value={computedValues.available}
              onChange={() => {}}
              disabled
            />

            <Field label="Rented Quantity" name="rentedQuantity" type="number" value={formData.rentedQuantity} onChange={handleChange} />

            <Field label="Maintenance Quantity" name="maintenanceQuantity" type="number" value={formData.maintenanceQuantity} onChange={handleChange} />

            <SelectField
              label="Condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              options={["New", "Used", "Refurbished"]}
            />

            <Field label="Location" name="location" value={formData.location} onChange={handleChange} />

            <Field
              label="Status"
              name="status"
              value={computedValues.status.replaceAll("_", " ")}
              onChange={() => {}}
              disabled
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-[12px] border border-[#d1d5db] px-4 py-3 outline-none resize-none"
            />
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
              className="h-[46px] rounded-[12px] bg-[#2563eb] px-6 text-[14px] font-semibold text-white"
            >
              {loading ? "Updating..." : "Update Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", disabled = false }) {
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
        disabled={disabled}
        className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none disabled:bg-gray-100"
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
        className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </div>
  );
}