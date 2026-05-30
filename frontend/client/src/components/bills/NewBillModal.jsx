import React, { useEffect, useState, useMemo } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const API_BASE = "http://localhost:5000";

/** Today as YYYY-MM-DD in LOCAL time (not UTC — fixes the "off by 1 day" bug) */
const todayStr = () => {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().split("T")[0];
};

const emptyForm = {
  vendorId: "",
  vendorName: "",
  billNumber: "",
  orderNumber: "",
  billDate: "",
  dueDate: "",
  paymentTerms: "Due on Receipt",
  accountsPayable: "Accounts Payable",
  subject: "",
  items: [],
  discount: 0,
  notes: "",
};

export default function NewBillModal({ isOpen, onClose, onCreated }) {
  const [vendors, setVendors] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* min for the date inputs — today */
  const TODAY = useMemo(() => todayStr(), []);

  useEffect(() => {
    if (isOpen) {
      fetchVendors();
      fetchInventoryItems();
      setFormData({ ...emptyForm, billDate: TODAY });
      setError("");
    }
  }, [isOpen, TODAY]);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setVendors(data.data || []);
    } catch (e) {
      console.error(e);
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
    } catch (e) {
      console.error(e);
    }
  };

  /* ----------------- vendor ----------------- */
  const selectedVendor = vendors.find(
    (v) => String(v.id) === String(formData.vendorId)
  );

  const handleVendorChange = (vendorId) => {
    const v = vendors.find((x) => String(x.id) === String(vendorId));
    setFormData((p) => ({ ...p, vendorId, vendorName: v?.name || "" }));
  };

  /* ----------------- date validation helpers ----------------- */
  const validateAndPatchDates = (field, value) => {
    setError("");

    if (field === "billDate") {
      if (value && value < TODAY) {
        setError("Bill date cannot be in the past");
        return { billDate: TODAY };
      }
      if (formData.dueDate && value && formData.dueDate < value) {
        return { billDate: value, dueDate: "" };
      }
      return { billDate: value };
    }

    if (field === "dueDate") {
      if (value && value < TODAY) {
        setError("Due date cannot be in the past");
        return { dueDate: TODAY };
      }
      if (value && formData.billDate && value < formData.billDate) {
        setError("Due date cannot be before bill date");
        return { dueDate: formData.billDate };
      }
      return { dueDate: value };
    }
    return {};
  };

  const handleDateChange = (field, value) => {
    const patch = validateAndPatchDates(field, value);
    setFormData((p) => ({ ...p, ...patch }));
  };

  /* ----------------- items ----------------- */
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: "",
          itemName: "",
          itemSku: "",
          account: "Cost of Goods Sold",
          quantity: 1,
          rate: 0,
          amount: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemSelect = (index, inventoryItemId) => {
    const inv = inventoryItems.find(
      (x) => String(x.id) === String(inventoryItemId)
    );
    const cost = Number(
      inv?.costPrice ?? inv?.cost_price ?? inv?.dailyRate ?? inv?.daily_rate ?? 0
    );
    const qty = Number(formData.items[index]?.quantity || 1);

    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = {
        ...items[index],
        itemId: inventoryItemId,
        itemName: inv?.name || "",
        itemSku: inv?.sku || "",
        rate: cost,
        account: items[index].account || "Cost of Goods Sold",
        amount: qty * cost,
      };
      return { ...prev, items };
    });
  };

  const handleItemFieldChange = (index, field, value) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = {
        ...items[index],
        [field]:
          field === "quantity" || field === "rate"
            ? Number(value) || 0
            : value,
      };
      items[index].amount =
        Number(items[index].quantity) * Number(items[index].rate);
      return { ...prev, items };
    });
  };

  /* ----------------- totals ----------------- */
  const subtotal = formData.items.reduce(
    (s, it) => s + Number(it.amount || 0),
    0
  );
  const discountAmount = Number(formData.discount || 0);
  const total = Math.max(subtotal - discountAmount, 0);

  const formatCurrency = (v) =>
    `₹${Number(v || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  /* ----------------- submit ----------------- */
  const handleSubmit = async (saveType) => {
    if (!formData.vendorId) {
      setError("Please select a vendor");
      return;
    }
    if (!formData.billDate) {
      setError("Please enter bill date");
      return;
    }
    if (formData.billDate < TODAY) {
      setError("Bill date cannot be in the past");
      return;
    }
    if (formData.dueDate && formData.dueDate < TODAY) {
      setError("Due date cannot be in the past");
      return;
    }
    if (formData.dueDate && formData.dueDate < formData.billDate) {
      setError("Due date cannot be before bill date");
      return;
    }
    if (formData.items.length === 0) {
      setError("Add at least one item");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const payload = {
        vendorId: formData.vendorId,
        vendorName: formData.vendorName,
        vendorEmail: selectedVendor?.email || "",
        billNumber: formData.billNumber,
        orderNumber: formData.orderNumber,
        billDate: formData.billDate,
        dueDate: formData.dueDate || null,
        paymentTerms: formData.paymentTerms,
        accountsPayable: formData.accountsPayable,
        subject: formData.subject,
        items: formData.items,
        discount: discountAmount,
        notes: formData.notes,
        status: saveType === "open" ? "pending" : "draft",
      };

      console.log("[NewBill] payload:", payload);

      const res = await fetch(`${API_BASE}/api/bills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("[NewBill] response:", data);

      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to create bill");
      onCreated();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const sortedInventoryItems = [...inventoryItems].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4">
      <div className="w-full max-w-[1000px] max-h-[92vh] overflow-hidden rounded-[14px] sm:rounded-[18px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-[#e5e7eb]">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[#111827]">
            New Bill
          </h2>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827]"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">
          {/* Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
            <div>
              <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] mb-2">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.vendorId}
                onChange={(e) => handleVendorChange(e.target.value)}
                className="h-[40px] sm:h-[46px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[13px] sm:text-[14px]"
              >
                <option value="">Select vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedVendor ? (
              <div className="rounded-[10px] border border-[#e5e7eb] bg-[#f0f9ff] p-3 sm:p-4">
                <p className="text-[13px] sm:text-[14px] font-bold text-[#111827]">
                  {selectedVendor.name}
                </p>
                {selectedVendor.company_name && (
                  <p className="text-[11px] sm:text-[12px] text-[#6b7280] mt-1">
                    {selectedVendor.company_name}
                  </p>
                )}
                {selectedVendor.email && (
                  <p className="text-[11px] sm:text-[12px] text-[#6b7280]">
                    {selectedVendor.email}
                  </p>
                )}
                {(selectedVendor.work_phone || selectedVendor.phone) && (
                  <p className="text-[11px] sm:text-[12px] text-[#6b7280]">
                    {selectedVendor.work_phone || selectedVendor.phone}
                  </p>
                )}
                {selectedVendor.address && (
                  <p className="text-[11px] sm:text-[12px] text-[#9ca3af] mt-1">
                    {selectedVendor.address}
                  </p>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex rounded-[10px] border border-dashed border-[#d1d5db] items-center justify-center text-[12px] sm:text-[13px] text-[#9ca3af]">
                Select a vendor to see details
              </div>
            )}
          </div>

          {/* Bill Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <div>
              <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] mb-2">
                Bill# <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.billNumber}
                onChange={(e) =>
                  setFormData({ ...formData, billNumber: e.target.value })
                }
                placeholder="Auto-generated if blank"
                className="h-[40px] sm:h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[13px] sm:text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] mb-2">
                Order Number
              </label>
              <input
                type="text"
                value={formData.orderNumber}
                onChange={(e) =>
                  setFormData({ ...formData, orderNumber: e.target.value })
                }
                className="h-[40px] sm:h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[13px] sm:text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] mb-2">
                Bill Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.billDate}
                min={TODAY}
                onChange={(e) => handleDateChange("billDate", e.target.value)}
                className="h-[40px] sm:h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[13px] sm:text-[14px]"
              />
              <p className="text-[10px] sm:text-[11px] text-[#9ca3af] mt-1">
                Must be today or later
              </p>
            </div>

            <div>
              <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                min={formData.billDate || TODAY}
                onChange={(e) => handleDateChange("dueDate", e.target.value)}
                className="h-[40px] sm:h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[13px] sm:text-[14px]"
              />
              <p className="text-[10px] sm:text-[11px] text-[#9ca3af] mt-1">
                Must be on or after bill date
              </p>
            </div>

            <div>
              <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] mb-2">
                Payment Terms
              </label>
              <select
                value={formData.paymentTerms}
                onChange={(e) =>
                  setFormData({ ...formData, paymentTerms: e.target.value })
                }
                className="h-[40px] sm:h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[13px] sm:text-[14px]"
              >
                <option>Due on Receipt</option>
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Net 45</option>
                <option>Net 60</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] mb-2">
                Accounts Payable
              </label>
              <select
                value={formData.accountsPayable}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accountsPayable: e.target.value,
                  })
                }
                className="h-[40px] sm:h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[13px] sm:text-[14px]"
              >
                <option>Accounts Payable</option>
                <option>Bills Payable</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] mb-2">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="Enter a subject within 250 characters"
              className="h-[40px] sm:h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[13px] sm:text-[14px]"
            />
          </div>

          {/* Item Table */}
          <div className="mb-6">
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#111827] mb-4">
              Item Table
            </h3>

            <div className="rounded-[12px] border border-[#e5e7eb] overflow-x-auto">
              <table className="w-full min-w-[540px] sm:min-w-0">
                <thead>
                  <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                    <th className="px-3 sm:px-4 py-3 text-left text-[11px] sm:text-[12px] font-semibold text-[#6b7280] w-[32%]">
                      Item Details
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-[11px] sm:text-[12px] font-semibold text-[#6b7280] w-[20%] hidden sm:table-cell">
                      Account
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-center text-[11px] sm:text-[12px] font-semibold text-[#6b7280] w-[10%]">
                      Qty
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-right text-[11px] sm:text-[12px] font-semibold text-[#6b7280] w-[15%]">
                      Purchase Price (₹)
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-right text-[11px] sm:text-[12px] font-semibold text-[#6b7280] w-[18%]">
                      Amount (₹)
                    </th>
                    <th className="px-3 sm:px-4 py-3 w-[5%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => {
                    const inv = inventoryItems.find(
                      (x) => String(x.id) === String(item.itemId)
                    );
                    return (
                      <tr key={index} className="border-b border-[#f3f4f6]">
                        <td className="px-3 sm:px-4 py-3 align-top">
                          <select
                            value={item.itemId}
                            onChange={(e) =>
                              handleItemSelect(index, e.target.value)
                            }
                            className="w-full h-[40px] rounded-[8px] border border-[#d1d5db] px-2 outline-none text-[12px] sm:text-[13px]"
                          >
                            <option value="">Select an item</option>
                            {sortedInventoryItems.map((iv) => (
                              <option key={iv.id} value={iv.id}>
                                {iv.name} ({iv.sku})
                              </option>
                            ))}
                          </select>
                          {inv && (
                            <div className="mt-1 px-1">
                              <p className="text-[10px] sm:text-[11px] text-[#6b7280]">
                                SKU: {inv.sku}
                              </p>
                              {inv.availableQuantity != null && (
                                <p className="text-[10px] sm:text-[11px] text-[#10b981]">
                                  Available: {inv.availableQuantity}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 py-3 align-top hidden sm:table-cell">
                          <select
                            value={item.account}
                            onChange={(e) =>
                              handleItemFieldChange(index, "account", e.target.value)
                            }
                            className="w-full h-[40px] rounded-[8px] border border-[#d1d5db] px-2 outline-none text-[12px] sm:text-[13px]"
                          >
                            <option>Cost of Goods Sold</option>
                            <option>Purchases</option>
                            <option>Inventory Asset</option>
                            <option>Other Expense</option>
                          </select>
                        </td>
                        <td className="px-3 sm:px-4 py-3 align-top">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemFieldChange(index, "quantity", e.target.value)
                            }
                            className="w-full h-[40px] rounded-[8px] border border-[#d1d5db] px-2 outline-none text-[12px] sm:text-[13px] text-center"
                          />
                        </td>
                        <td className="px-3 sm:px-4 py-3 align-top">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              handleItemFieldChange(index, "rate", e.target.value)
                            }
                            className="w-full h-[40px] rounded-[8px] border border-[#d1d5db] px-2 outline-none text-[12px] sm:text-[13px] text-right"
                          />
                          {inv &&
                            Number(inv.costPrice ?? inv.cost_price ?? 0) > 0 && (
                              <p className="text-[10px] text-[#9ca3af] text-right mt-1">
                                Cost: ₹
                                {Number(inv.costPrice ?? inv.cost_price).toFixed(2)}
                              </p>
                            )}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-right text-[12px] sm:text-[13px] font-semibold text-[#111827] align-top">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-center align-top">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-[#ef4444] hover:text-[#b91c1c] transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {formData.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-[12px] sm:text-[13px] text-[#9ca3af]"
                      >
                        No items added. Click "Add New Row" to add items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-3 flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-[#6B21A8] hover:text-[#581c87] transition"
            >
              <Plus size={16} /> Add New Row
            </button>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-[320px] space-y-3">
              <div className="flex justify-between text-[13px] sm:text-[14px] text-[#374151]">
                <span>Sub Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] sm:text-[14px] text-[#374151]">
                <span>Discount</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] sm:text-[12px] text-[#6b7280]">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    className="w-[80px] sm:w-[100px] h-[32px] rounded-[8px] border border-[#d1d5db] px-2 outline-none text-[12px] sm:text-[13px] text-right"
                  />
                </div>
              </div>
              <div className="flex justify-between text-[16px] sm:text-[18px] font-bold text-[#111827] pt-3 border-t-2 border-[#e5e7eb]">
                <span>Total (₹)</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows="3"
              placeholder="Additional notes..."
              className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-3 outline-none text-[13px] sm:text-[14px] resize-none"
            />
          </div>

          {error && (
            <div className="rounded-[10px] bg-red-50 border border-red-200 px-3 py-2 text-[12px] sm:text-[13px] text-red-700 mt-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-8 py-4 border-t border-[#e5e7eb] bg-[#f9fafb]">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] sm:h-[42px] rounded-[12px] border border-[#d1d5db] px-5 text-[13px] sm:text-[14px] font-medium text-[#374151] bg-white"
          >
            Cancel
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={loading}
              className="h-[40px] sm:h-[42px] rounded-[12px] border border-[#6B21A8] text-[#6B21A8] px-5 text-[13px] sm:text-[14px] font-semibold disabled:opacity-70 hover:bg-[#f5f3ff] transition"
            >
              {loading ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("open")}
              disabled={loading}
              className="h-[40px] sm:h-[42px] rounded-[12px] bg-[#6B21A8] text-white px-5 text-[13px] sm:text-[14px] font-semibold disabled:opacity-70 hover:bg-[#581c87] transition"
            >
              {loading ? "Saving..." : "Save as Open"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
