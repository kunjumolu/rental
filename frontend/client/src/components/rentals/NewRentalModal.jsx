import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, X, Search, Check, Package } from "lucide-react";

const API_BASE = "http://localhost:5000";
const getToday = () => new Date().toISOString().split("T")[0];

// ─── Multi-Select Item Picker Popup ───
function ItemPickerPopup({ isOpen, onClose, items, alreadySelected, onAdd }) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIds([]);
      setCategoryFilter("All");
    }
  }, [isOpen]);

  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.category).filter(Boolean));
    return ["All", ...Array.from(cats).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(s) ||
        item.sku?.toLowerCase().includes(s);
      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const toggleItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allVisibleIds = filtered.map((i) => i.id);
    const allSelected = allVisibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...allVisibleIds])]);
    }
  };

  const handleAdd = () => {
    const selected = items.filter((i) => selectedIds.includes(i.id));
    onAdd(selected);
    onClose();
  };

  if (!isOpen) return null;

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((i) => selectedIds.includes(i.id));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-2 sm:px-4">
      <div className="w-full max-w-[600px] max-h-[80vh] rounded-[14px] sm:rounded-[18px] bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 shrink-0">
          <div>
            <h3 className="text-[16px] sm:text-[18px] font-bold text-[#111827]">Select Items</h3>
            <p className="text-[11px] sm:text-[12px] text-[#6b7280] mt-0.5">
              Choose items to add to the rental order
            </p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#6b7280]">
            <X size={20} />
          </button>
        </div>

        {/* Search + Category Filter */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 space-y-2 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or SKU..."
              className="h-[38px] sm:h-[40px] w-full rounded-[10px] border border-[#d1d5db] pl-9 pr-3 outline-none focus:border-[#2563eb] text-[13px] sm:text-[14px]"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`shrink-0 h-[28px] sm:h-[30px] px-2.5 sm:px-3 rounded-full text-[11px] sm:text-[12px] font-medium border transition ${
                  categoryFilter === cat
                    ? "bg-[#2563eb] text-white border-[#2563eb]"
                    : "bg-white text-[#374151] border-[#d1d5db] hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Select All */}
        <div className="px-4 sm:px-6 py-2 border-b border-gray-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={selectAll}
            className="flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-[#2563eb] hover:text-[#1d4ed8]"
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${
              allVisibleSelected ? "bg-[#2563eb] border-[#2563eb]" : "border-[#d1d5db]"
            }`}>
              {allVisibleSelected && <Check size={10} className="text-white" />}
            </div>
            Select all ({filtered.length})
          </button>
          {selectedIds.length > 0 && (
            <span className="text-[11px] sm:text-[12px] font-semibold text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-full">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[#9ca3af]">
              <Package size={32} className="mb-2" />
              <p className="text-[13px] sm:text-[14px] font-medium">No items found</p>
              <p className="text-[11px] sm:text-[12px]">Try a different search or category</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isAlreadyAdded = alreadySelected.includes(String(item.id));

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => !isAlreadyAdded && toggleItem(item.id)}
                    disabled={isAlreadyAdded}
                    className={`w-full flex items-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 text-left transition ${
                      isAlreadyAdded
                        ? "opacity-40 cursor-not-allowed bg-gray-50"
                        : isSelected
                        ? "bg-[#eff6ff]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                      isAlreadyAdded
                        ? "bg-gray-300 border-gray-300"
                        : isSelected
                        ? "bg-[#2563eb] border-[#2563eb]"
                        : "border-[#d1d5db]"
                    }`}>
                      {(isSelected || isAlreadyAdded) && <Check size={12} className="text-white" />}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] sm:text-[14px] font-medium text-[#111827] truncate">
                        {item.name}
                        {isAlreadyAdded && <span className="text-[10px] text-[#9ca3af] ml-2">(already added)</span>}
                      </p>
                      <p className="text-[11px] sm:text-[12px] text-[#6b7280]">
                        {item.sku} • {item.category}
                      </p>
                    </div>

                    {/* Rate & Stock */}
                    <div className="text-right shrink-0">
                      <p className="text-[12px] sm:text-[13px] font-semibold text-[#2563eb]">
                        ₹{Number(item.dailyRate).toFixed(0)}/day
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-[#6b7280]">
                        {item.availableQuantity} available
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 shrink-0">
          <button type="button" onClick={onClose}
            className="h-[38px] sm:h-[40px] rounded-[10px] border border-[#d1d5db] px-4 text-[13px] sm:text-[14px] font-medium text-[#374151] w-full sm:w-auto">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={selectedIds.length === 0}
            className="h-[38px] sm:h-[40px] rounded-[10px] bg-[#2563eb] hover:bg-[#1d4ed8] px-4 sm:px-5 text-[13px] sm:text-[14px] font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={16} />
            Add {selectedIds.length > 0 ? `${selectedIds.length} Item${selectedIds.length > 1 ? "s" : ""}` : "Selected"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Modal ───
export default function NewRentalModal({ isOpen, onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    customerId: "",
    startDate: "",
    endDate: "",
    items: [],
    taxRate: 10,
    depositAmount: 0,
    notes: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const customerDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setCustomerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetForm = () => {
    setFormData({
      customerId: "",
      startDate: "",
      endDate: "",
      items: [],
      taxRate: 10,
      depositAmount: 0,
      notes: "",
    });
    setError("");
    setFieldErrors({});
    setLoading(false);
    setCustomerSearch("");
    setCustomerDropdownOpen(false);
    setIsPickerOpen(false);
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCustomers(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setInventoryItems(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchCustomers();
    fetchInventoryItems();
    resetForm();
  }, [isOpen]);

  // Add multiple items from picker
  const handleAddItems = (selectedItems) => {
    const newItems = selectedItems.map((inv) => ({
      itemId: String(inv.id),
      itemName: inv.name || "",
      quantity: 1,
      days: 1,
      rate: Number(inv.dailyRate) || 0,
    }));
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, ...newItems],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemFieldChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === "quantity" || field === "rate" || field === "days" ? Number(value) : value,
      };
      return { ...prev, items: updatedItems };
    });
  };

  const handleSelectCustomer = (customer) => {
    setFormData((prev) => ({ ...prev, customerId: customer.id }));
    setCustomerDropdownOpen(false);
    setCustomerSearch(customer.name);
    setFieldErrors((prev) => ({ ...prev, customerId: "" }));
  };

  const filteredCustomers = useMemo(() => {
    const search = (customerSearch || "").toLowerCase();
    return customers.filter((c) =>
      c.name?.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search) ||
      c.phone?.toLowerCase().includes(search)
    );
  }, [customers, customerSearch]);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => String(c.id) === String(formData.customerId));
  }, [customers, formData.customerId]);

  const availableInventoryItems = useMemo(() => {
    return [...inventoryItems]
      .filter((item) => Number(item.availableQuantity) > 0)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [inventoryItems]);

  const alreadySelectedItemIds = useMemo(() => {
    return formData.items.map((i) => String(i.itemId));
  }, [formData.items]);

  const subtotal = useMemo(() => {
    return (formData.items || []).reduce((sum, item) => {
      return sum + Number(item.quantity || 0) * Number(item.days || 0) * Number(item.rate || 0);
    }, 0);
  }, [formData.items]);

  const taxAmount = subtotal * (Number(formData.taxRate) / 100);
  const total = subtotal + taxAmount;
  const balance = total - Number(formData.depositAmount || 0);

  const validate = () => {
    const errors = {};
    const today = getToday();
    if (!formData.customerId) errors.customerId = "Please select a customer";
    if (!formData.startDate) errors.startDate = "Start date is required";
    else if (formData.startDate < today) errors.startDate = "Start date cannot be a past date";
    if (!formData.endDate) errors.endDate = "End date is required";
    else if (formData.startDate && formData.endDate < formData.startDate) errors.endDate = "End date cannot be before start date";
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

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        taxRate: Number(formData.taxRate),
        depositAmount: Number(formData.depositAmount),
        items: (formData.items || []).map((it) => ({
          itemId: it.itemId,
          itemName: it.itemName,
          quantity: Number(it.quantity || 1),
          days: Number(it.days || 1),
          rate: Number(it.rate || 0),
        })),
      };

      const res = await fetch(`${API_BASE}/api/rentals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      onCreated?.();
      onClose?.();
    } catch (err) {
      console.error("Create rental error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-4">
        <div className="w-full max-w-[820px] h-[90vh] rounded-[14px] sm:rounded-[18px] bg-white shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-[17px] sm:text-[19px] md:text-[22px] font-bold text-[#111827]">Create New Rental Order</h2>
            <button onClick={onClose} type="button"
              className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#6b7280] transition">
              <X size={22} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

              {/* Customer */}
              <div className="relative" ref={customerDropdownRef}>
                <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">
                  Customer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                  <input
                    type="text"
                    value={customerDropdownOpen ? customerSearch : selectedCustomer ? selectedCustomer.name : customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setCustomerDropdownOpen(true);
                      if (formData.customerId) setFormData((p) => ({ ...p, customerId: "" }));
                    }}
                    onFocus={() => setCustomerDropdownOpen(true)}
                    placeholder="Search customer"
                    className={`h-[44px] sm:h-[48px] w-full rounded-[10px] sm:rounded-[12px] border pl-9 pr-4 outline-none text-[14px] ${
                      fieldErrors.customerId ? "border-red-500 bg-red-50" : "border-[#d1d5db] focus:border-[#2563eb]"
                    }`}
                  />
                </div>
                {fieldErrors.customerId && (
                  <p className="mt-1 text-[11px] text-red-500">{fieldErrors.customerId}</p>
                )}

                {customerDropdownOpen && (
                  <div className="absolute z-20 mt-2 w-full rounded-[12px] border border-[#e5e7eb] bg-white shadow-lg">
                    <div className="max-h-[220px] overflow-y-auto">
                      {filteredCustomers.length === 0 ? (
                        <p className="px-4 py-3 text-[14px] text-[#6b7280]">No customers found</p>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <button key={customer.id} type="button" onClick={() => handleSelectCustomer(customer)}
                            className={`w-full text-left px-4 py-2.5 hover:bg-[#f3f4f6] transition ${
                              String(formData.customerId) === String(customer.id) ? "bg-[#eef2ff]" : ""
                            }`}>
                            <div className="text-[14px] font-medium text-[#111827]">{customer.name}</div>
                            {customer.phone && <div className="text-[12px] text-[#6b7280]">{customer.phone}</div>}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <input type="text" value={formData.customerId} required readOnly className="sr-only" tabIndex={-1} />
              </div>

              {/* Start Date */}
              <div>
                <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input type="date" value={formData.startDate} min={getToday()}
                  onChange={(e) => {
                    const val = e.target.value;
                    const today = getToday();
                    let err = "";
                    if (!val) err = "Start date is required";
                    else if (val < today) err = "Start date cannot be a past date";
                    setFieldErrors((prev) => ({ ...prev, startDate: err, endDate: "" }));
                    setFormData((p) => ({ ...p, startDate: val, endDate: "" }));
                    setError("");
                  }}
                  className={`h-[44px] sm:h-[48px] w-full rounded-[10px] sm:rounded-[12px] border px-3 sm:px-4 outline-none text-[14px] ${
                    fieldErrors.startDate ? "border-red-500 bg-red-50" : "border-[#d1d5db]"
                  }`} />
                {fieldErrors.startDate && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.startDate}</p>}
              </div>

              {/* End Date */}
              <div>
                <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input type="date" value={formData.endDate} min={formData.startDate || getToday()}
                  onChange={(e) => {
                    const val = e.target.value;
                    let err = "";
                    if (!val) err = "End date is required";
                    else if (formData.startDate && val < formData.startDate) err = "End date cannot be before start date";
                    setFieldErrors((prev) => ({ ...prev, endDate: err }));
                    setFormData((p) => ({ ...p, endDate: val }));
                    setError("");
                  }}
                  className={`h-[44px] sm:h-[48px] w-full rounded-[10px] sm:rounded-[12px] border px-3 sm:px-4 outline-none text-[14px] ${
                    fieldErrors.endDate ? "border-red-500 bg-red-50" : "border-[#d1d5db]"
                  }`} />
                {fieldErrors.endDate && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.endDate}</p>}
              </div>
            </div>

            {/* Items Section */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] sm:text-[16px] font-medium text-[#111827]">Rental Items</h3>
                {formData.items.length > 0 && (
                  <span className="text-[11px] sm:text-[12px] font-semibold bg-[#eff6ff] text-[#2563eb] px-2 py-0.5 rounded-full">
                    {formData.items.length}
                  </span>
                )}
              </div>
              <button type="button" onClick={() => setIsPickerOpen(true)}
                className="h-[40px] sm:h-[42px] px-4 rounded-[12px] border border-[#2563eb] text-[#2563eb] bg-white text-[13px] sm:text-[14px] font-medium flex items-center gap-2 hover:bg-[#eff6ff] transition">
                <Plus size={16} /> Add Items
              </button>
            </div>

            {formData.items.length === 0 ? (
              <div className="mt-4 rounded-[12px] border-2 border-dashed border-[#d1d5db] p-6 sm:p-8 text-center">
                <Package size={28} className="text-[#9ca3af] mx-auto mb-2" />
                <p className="text-[13px] sm:text-[14px] text-[#6b7280] font-medium">No items added yet</p>
                <p className="text-[11px] sm:text-[12px] text-[#9ca3af] mt-1">Click "Add Items" to select from inventory</p>
              </div>
            ) : (
              <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                {formData.items.map((item, index) => {
                  const invItem = inventoryItems.find((inv) => String(inv.id) === String(item.itemId));
                  const maxAvailable = invItem ? Number(invItem.availableQuantity || 1) : 1;
                  const rowTotal = Number(item.quantity || 0) * Number(item.days || 0) * Number(item.rate || 0);

                  return (
                    <div key={`${item.itemId}-${index}`} className="rounded-[10px] sm:rounded-[12px] border border-[#e5e7eb] p-3 sm:p-4 bg-white">
                      {/* Item name + delete */}
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] sm:text-[14px] font-semibold text-[#111827] truncate">{item.itemName}</p>
                          <p className="text-[11px] text-[#6b7280]">
                            ₹{Number(item.rate).toFixed(0)}/day • {maxAvailable} available
                          </p>
                        </div>
                        <button type="button" onClick={() => handleRemoveItem(index)}
                          className="h-[30px] w-[30px] sm:h-[34px] sm:w-[34px] rounded-[8px] border border-[#fecaca] text-red-500 flex items-center justify-center hover:bg-red-50 transition shrink-0 ml-2">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Qty, Days, Subtotal */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div>
                          <label className="mb-0.5 sm:mb-1 block text-[10px] sm:text-[11px] font-medium text-[#6b7280] uppercase">Qty</label>
                          <input type="number" min="1" max={maxAvailable} value={item.quantity}
                            onChange={(e) => handleItemFieldChange(index, "quantity", e.target.value)}
                            className="h-[36px] sm:h-[40px] w-full rounded-[8px] sm:rounded-[10px] border border-[#d1d5db] px-2 sm:px-3 outline-none focus:border-[#2563eb] text-[13px] sm:text-[14px] text-center" />
                        </div>
                        <div>
                          <label className="mb-0.5 sm:mb-1 block text-[10px] sm:text-[11px] font-medium text-[#6b7280] uppercase">Days</label>
                          <input type="number" min="1" value={item.days}
                            onChange={(e) => handleItemFieldChange(index, "days", e.target.value)}
                            className="h-[36px] sm:h-[40px] w-full rounded-[8px] sm:rounded-[10px] border border-[#d1d5db] px-2 sm:px-3 outline-none focus:border-[#2563eb] text-[13px] sm:text-[14px] text-center" />
                        </div>
                        <div>
                          <label className="mb-0.5 sm:mb-1 block text-[10px] sm:text-[11px] font-medium text-[#6b7280] uppercase">Subtotal</label>
                          <div className="h-[36px] sm:h-[40px] rounded-[8px] sm:rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] px-2 sm:px-3 flex items-center justify-center text-[13px] sm:text-[14px] font-semibold text-[#111827]">
                            ₹{rowTotal.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Totals */}
            <div className="mt-6 sm:mt-8 rounded-[12px] sm:rounded-[16px] border border-[#e5e7eb] p-3 sm:p-4 md:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">Tax Rate (%)</label>
                  <input type="number" value={formData.taxRate}
                    onChange={(e) => setFormData((p) => ({ ...p, taxRate: e.target.value }))}
                    className="h-[42px] sm:h-[46px] w-full rounded-[10px] sm:rounded-[12px] border border-[#d1d5db] px-3 sm:px-4 outline-none text-[14px]" />
                </div>
                <div>
                  <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">Deposit Amount</label>
                  <input type="number" value={formData.depositAmount}
                    onChange={(e) => setFormData((p) => ({ ...p, depositAmount: e.target.value }))}
                    className="h-[42px] sm:h-[46px] w-full rounded-[10px] sm:rounded-[12px] border border-[#d1d5db] px-3 sm:px-4 outline-none text-[14px]" />
                </div>
              </div>

              <div className="mt-4 sm:mt-5 space-y-1.5 sm:space-y-2 text-[14px] sm:text-[16px] text-[#111827]">
                <div className="flex justify-between"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax ({Number(formData.taxRate) || 0}%):</span><span>₹{taxAmount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Balance:</span><span>₹{balance.toFixed(2)}</span></div>
                <div className="flex justify-between pt-2 sm:pt-3 text-[16px] sm:text-[18px] md:text-[20px] font-bold border-t border-[#e5e7eb]">
                  <span>Total:</span><span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6 sm:mt-8">
              <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">Notes</label>
              <input type="text" value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Additional notes..."
                className="h-[42px] sm:h-[46px] w-full rounded-[10px] sm:rounded-[12px] border border-[#d1d5db] px-3 sm:px-4 outline-none text-[14px]" />
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 sm:px-4 py-2 sm:py-3">
                <p className="text-[12px] sm:text-[13px] text-red-600 font-medium">{error}</p>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-t border-gray-200 flex-shrink-0">
            <button type="button" onClick={onClose}
              className="h-[42px] sm:h-[44px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium w-full sm:w-auto">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="h-[42px] sm:h-[44px] rounded-[12px] bg-[#2563eb] hover:bg-[#1d4ed8] px-5 text-[14px] font-semibold text-white disabled:opacity-60 w-full sm:w-auto">
              {loading ? "Creating..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>

      {/* Item Picker Popup */}
      <ItemPickerPopup
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        items={availableInventoryItems}
        alreadySelected={alreadySelectedItemIds}
        onAdd={handleAddItems}
      />
    </>
  );
}
