import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, X, Search } from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function EditRentalModal({ isOpen, rental, onClose, onUpdated }) {
  const [customers, setCustomers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  const [formData, setFormData] = useState({
    customerId: "",
    startDate: "",
    endDate: "",
    items: [],
    taxRate: 10,
    depositAmount: 0,
    notes: "",
    status: "active",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const customerDropdownRef = useRef(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
    // yyyy-mm-dd for input[type="date"]
  };

  useEffect(() => {
    if (isOpen && rental) {
      fetchCustomers();
      fetchInventoryItems();

      setFormData({
        customerId: rental.customerId || "",
        startDate: formatDate(rental.startDate),
        endDate: formatDate(rental.endDate),
        items:
          Array.isArray(rental.items) && rental.items.length > 0
            ? rental.items.map((item) => ({
                id: item.id,
                itemId: item.itemId || "",
                itemName: item.itemName || "",
                quantity: Number(item.quantity || 1),
                days: Number(item.days || 1),
                rate: Number(item.rate || 0),
                subtotal: Number(item.subtotal || 0),
              }))
            : [],
        taxRate: Number(rental.taxRate || 10),
        depositAmount: Number(rental.depositAmount || 0),
        notes: rental.notes || "",
        status: rental.status || "active",
      });

      setCustomerSearch(rental.customerName || "");
      setError("");
      setLoading(false);
    }
  }, [isOpen, rental]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target)
      ) {
        setCustomerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCustomers(data.data || []);
    } catch (err) {
      console.error("Fetch customers error:", err);
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
      console.error("Fetch inventory items error:", err);
    }
  };

  const availableInventoryItems = useMemo(() => {
    return [...inventoryItems].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [inventoryItems]);

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { itemId: "", itemName: "", quantity: 1, days: 1, rate: 0, subtotal: 0 },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSelectInventoryItem = (index, selectedId) => {
    const selectedItem = inventoryItems.find(
      (inv) => String(inv.id) === String(selectedId)
    );

    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        itemId: selectedId,
        itemName: selectedItem?.name || "",
        rate: Number(selectedItem?.dailyRate) || 0,
        quantity: 1,
      };
      return { ...prev, items: updatedItems };
    });
  };

  const handleItemFieldChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]:
          field === "quantity" || field === "rate" || field === "days"
            ? Number(value)
            : value,
      };
      return { ...prev, items: updatedItems };
    });
  };

  const handleSelectCustomer = (customer) => {
    setFormData((prev) => ({ ...prev, customerId: customer.id }));
    setCustomerDropdownOpen(false);
    setCustomerSearch(customer.name);
  };

  const filteredCustomers = useMemo(() => {
    const search = (customerSearch || "").toLowerCase();
    return customers.filter((c) => {
      return (
        c.name?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.phone?.toLowerCase().includes(search)
      );
    });
  }, [customers, customerSearch]);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => String(c.id) === String(formData.customerId));
  }, [customers, formData.customerId]);

  const subtotal = useMemo(() => {
    return (formData.items || []).reduce((sum, item) => {
      return (
        sum +
        Number(item.quantity || 0) *
          Number(item.days || 0) *
          Number(item.rate || 0)
      );
    }, 0);
  }, [formData.items]);

  const taxAmount = subtotal * (Number(formData.taxRate) / 100);
  const total = subtotal + taxAmount;
  const balance = total - Number(formData.depositAmount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      const res = await fetch(`${API_BASE}/api/rentals/${rental.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update order");
      }

      onUpdated?.();
    } catch (err) {
      console.error("Update rental error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !rental) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[820px] h-[90vh] rounded-[18px] bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-[22px] font-bold text-[#111827]">
            Edit Rental Order
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#6b7280] transition"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-3 gap-5">
            <div className="relative" ref={customerDropdownRef}>
              <label className="mb-2 block text-[14px] font-medium text-[#111827]">
                Customer *
              </label>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                />
                <input
                  type="text"
                  value={
                    customerDropdownOpen
                      ? customerSearch
                      : selectedCustomer
                      ? selectedCustomer.name
                      : customerSearch
                  }
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setCustomerDropdownOpen(true);
                    if (formData.customerId) {
                      setFormData((p) => ({ ...p, customerId: "" }));
                    }
                  }}
                  onFocus={() => setCustomerDropdownOpen(true)}
                  placeholder="Search customer"
                  className="h-[48px] w-full rounded-[12px] border border-[#d1d5db] pl-9 pr-4 outline-none focus:border-[#8fb1f8]"
                />
              </div>

              {customerDropdownOpen && (
                <div className="absolute z-20 mt-2 w-full rounded-[12px] border border-[#e5e7eb] bg-white shadow-lg">
                  <div className="max-h-[220px] overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <p className="px-4 py-3 text-[14px] text-[#6b7280]">
                        No customers found
                      </p>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => handleSelectCustomer(customer)}
                          className={`w-full text-left px-4 py-2.5 hover:bg-[#f3f4f6] transition ${
                            String(formData.customerId) === String(customer.id)
                              ? "bg-[#eef2ff]"
                              : ""
                          }`}
                        >
                          <div className="text-[14px] font-medium text-[#111827]">
                            {customer.name}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              <input
                type="text"
                value={formData.customerId}
                required
                readOnly
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#111827]">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, startDate: e.target.value }))
                }
                className="h-[48px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#111827]">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, endDate: e.target.value }))
                }
                className="h-[48px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none"
                required
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((p) => ({ ...p, status: e.target.value }))
              }
              className="h-[48px] w-full max-w-[280px] rounded-[12px] border border-[#d1d5db] px-4 outline-none"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h3 className="text-[16px] font-medium text-[#111827]">
              Rental Items
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="h-[42px] px-4 rounded-[12px] border border-[#d1d5db] bg-white text-[14px] font-medium flex items-center gap-2"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          {formData.items.length === 0 ? (
            <p className="mt-4 text-[16px] text-[#6b7280]">
              No items added yet
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {formData.items.map((item, index) => {
                const selectedInventoryItem = inventoryItems.find(
                  (inv) => String(inv.id) === String(item.itemId)
                );

                const maxAvailable = selectedInventoryItem
                  ? Number(selectedInventoryItem.availableQuantity || 1)
                  : 1;

                const rowTotal =
                  Number(item.quantity || 0) *
                  Number(item.days || 0) *
                  Number(item.rate || 0);

                return (
                  <div
                    key={`${item.itemId}-${index}`}
                    className="grid grid-cols-12 gap-3 items-end rounded-[14px] border border-[#e5e7eb] p-4"
                  >
                    <div className="col-span-5">
                      <label className="mb-2 block text-[13px] font-medium text-[#111827]">
                        Item
                      </label>
                      <select
                        value={item.itemId}
                        onChange={(e) =>
                          handleSelectInventoryItem(index, e.target.value)
                        }
                        className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none"
                      >
                        <option value="">Select item</option>
                        {availableInventoryItems.map((invItem) => (
                          <option key={invItem.id} value={invItem.id}>
                            {invItem.name} ({invItem.sku}) - $
                            {Number(invItem.dailyRate).toFixed(2)}/day -{" "}
                            {invItem.availableQuantity} available
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="mb-2 block text-[13px] font-medium text-[#111827]">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={maxAvailable}
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemFieldChange(index, "quantity", e.target.value)
                        }
                        className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="mb-2 block text-[13px] font-medium text-[#111827]">
                        Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.days}
                        onChange={(e) =>
                          handleItemFieldChange(index, "days", e.target.value)
                        }
                        className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="mb-2 block text-[13px] font-medium text-[#111827]">
                        Subtotal
                      </label>
                      <div className="h-[42px] rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] px-3 flex items-center text-[14px] font-medium">
                        ${rowTotal.toFixed(2)}
                      </div>
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="h-[42px] w-[42px] rounded-[10px] border border-[#fecaca] text-red-500 flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 rounded-[16px] border border-[#e5e7eb] p-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#111827]">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, taxRate: e.target.value }))
                  }
                  className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#111827]">
                  Deposit Amount
                </label>
                <input
                  type="number"
                  value={formData.depositAmount}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, depositAmount: e.target.value }))
                  }
                  className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none"
                />
              </div>
            </div>

            <div className="mt-5 space-y-2 text-[16px] text-[#111827]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({Number(formData.taxRate) || 0}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Balance:</span>
                <span>${balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 text-[20px] font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">
              Notes
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) =>
                setFormData((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Additional notes..."
              className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none"
            />
          </div>

          {error && <p className="mt-4 text-[14px] text-red-600">{error}</p>}
        </form>

        <div className="flex justify-end gap-3 px-8 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-[44px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="h-[44px] rounded-[12px] bg-[#8fb1f8] px-5 text-[14px] font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Order"}
          </button>
        </div>
      </div>
    </div>
  );
}