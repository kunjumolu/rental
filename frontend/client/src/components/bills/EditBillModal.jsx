import React, { useEffect, useState, useMemo } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const API_BASE = "http://localhost:5000";

/** Today as YYYY-MM-DD in LOCAL time */
const todayStr = () => {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().split("T")[0];
};

const toDateInput = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export default function EditBillModal({ isOpen, onClose, bill, onUpdated }) {
  const [vendors, setVendors] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const TODAY = useMemo(() => todayStr(), []);

  useEffect(() => {
    if (isOpen && bill) {
      fetchVendors();
      fetchInventoryItems();
      setError("");
      setFormData({
        vendorId: bill.vendor_id || "",
        vendorName: bill.vendor_name || "",
        vendorEmail: bill.vendor_email || "",
        billNumber: bill.bill_number || "",
        orderNumber: bill.order_number || "",
        billDate: toDateInput(bill.bill_date),
        dueDate: toDateInput(bill.due_date),
        paymentTerms: bill.payment_terms || "Due on Receipt",
        accountsPayable: bill.accounts_payable || "Accounts Payable",
        subject: bill.subject || "",
        items: (Array.isArray(bill.items) ? bill.items : []).map((it) => ({
          itemId: it.item_id || "",
          itemName: it.item_name || "",
          itemSku: it.item_sku || "",
          account: it.account || "Cost of Goods Sold",
          quantity: Number(it.quantity) || 1,
          rate: Number(it.rate) || 0,
          amount: Number(it.amount) || 0,
        })),
        discount: Number(bill.discount) || 0,
        paidAmount: Number(bill.paid_amount) || 0,
        notes: bill.notes || "",
        status: bill.status || "draft",
      });
    }
  }, [isOpen, bill]);

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

  if (!isOpen || !bill || !formData) return null;

  const selectedVendor = vendors.find(
    (v) => String(v.id) === String(formData.vendorId)
  );

  const handleVendorChange = (vendorId) => {
    const v = vendors.find((x) => String(x.id) === String(vendorId));
    setFormData((p) => ({
      ...p,
      vendorId,
      vendorName: v?.name || "",
      vendorEmail: v?.email || "",
    }));
  };

  const handleDateChange = (field, value) => {
    setError("");
    if (field === "billDate") {
      if (value && value < TODAY && value !== formData.billDate) {
        setError("Bill date cannot be in the past");
        return setFormData((p) => ({ ...p, billDate: p.billDate }));
      }
      if (formData.dueDate && value && formData.dueDate < value) {
        return setFormData((p) => ({ ...p, billDate: value, dueDate: "" }));
      }
      return setFormData((p) => ({ ...p, billDate: value }));
    }
    if (field === "dueDate") {
      if (value && formData.billDate && value < formData.billDate) {
        setError("Due date cannot be before bill date");
        return setFormData((p) => ({ ...p, dueDate: p.billDate }));
      }
      return setFormData((p) => ({ ...p, dueDate: value }));
    }
  };

  const addRow = () =>
    setFormData((p) => ({
      ...p,
      items: [
        ...p.items,
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

  const removeRow = (idx) =>
    setFormData((p) => ({
      ...p,
      items: p.items.filter((_, i) => i !== idx),
    }));

  const updateRow = (idx, field, value) => {
    setFormData((p) => {
      const items = [...p.items];
      const row = { ...items[idx] };
      if (field === "itemId") {
        const inv = inventoryItems.find(
          (x) => String(x.id) === String(value)
        );
        const cost = Number(
          inv?.costPrice ?? inv?.cost_price ?? inv?.dailyRate ?? inv?.daily_rate ?? 0
        );
        row.itemId = value;
        row.itemName = inv?.name || "";
        row.itemSku = inv?.sku || "";
        row.rate = cost;
        row.amount = Number(row.quantity || 1) * cost;
      } else if (field === "quantity" || field === "rate") {
        row[field] = Number(value) || 0;
        row.amount = Number(row.quantity || 0) * Number(row.rate || 0);
      } else {
        row[field] = value;
      }
      items[idx] = row;
      return { ...p, items };
    });
  };

  /* totals */
  const subtotal = formData.items.reduce(
    (s, it) => s + Number(it.amount || 0),
    0
  );
  const discountAmt = Number(formData.discount) || 0;
  const paidAmount = Number(formData.paidAmount) || 0;
  const total = Math.max(subtotal - discountAmt, 0);
  const balanceDue = Math.max(total - paidAmount, 0);
  const fmt = (v) =>
    `₹${Number(v || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleSubmit = async () => {
    if (!formData.vendorId) {
      setError("Please select a vendor");
      return;
    }
    if (!formData.billDate) {
      setError("Please enter bill date");
      return;
    }
    if (formData.dueDate && formData.dueDate < formData.billDate) {
      setError("Due date cannot be before bill date");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const payload = {
        vendorId: formData.vendorId,
        vendorName: formData.vendorName,
        vendorEmail: formData.vendorEmail,
        orderNumber: formData.orderNumber,
        billDate: formData.billDate,
        dueDate: formData.dueDate || null,
        paymentTerms: formData.paymentTerms,
        accountsPayable: formData.accountsPayable,
        subject: formData.subject,
        items: formData.items,
        discount: discountAmt,
        paidAmount,
        notes: formData.notes,
        status: formData.status,
      };

      console.log("[EditBill] payload:", payload);

      const res = await fetch(`${API_BASE}/api/bills/${bill.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("[EditBill] response:", data);

      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to update bill");
      onUpdated();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortedItems = [...inventoryItems].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4">
      <div className="w-full max-w-[1000px] max-h-[92vh] overflow-hidden rounded-[14px] sm:rounded-[18px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-[#e5e7eb]">
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#111827]">
              Edit Bill
            </h2>
            <p className="text-[12px] sm:text-[13px] text-[#6b7280] mt-1">
              {bill.bill_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827]"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">
          {/* Vendor + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
            <Field label="Vendor Name" required>
              <select
                value={formData.vendorId}
                onChange={(e) => handleVendorChange(e.target.value)}
                className={inputCls}
              >
                <option value="">Select vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status">
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className={inputCls}
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </Field>
          </div>

          {/* Bill Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <Field label="Bill #">
              <input
                type="text"
                value={formData.billNumber}
                disabled
                className={`${inputCls} bg-[#f9fafb] text-[#6b7280]`}
                title="Bill number cannot be changed"
              />
            </Field>
            <Field label="Order Number">
              <input
                type="text"
                value={formData.orderNumber}
                onChange={(e) =>
                  setFormData({ ...formData, orderNumber: e.target.value })
                }
                className={inputCls}
              />
            </Field>
            <Field label="Bill Date" required>
              <input
                type="date"
                value={formData.billDate}
                onChange={(e) => handleDateChange("billDate", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Due Date">
              <input
                type="date"
                value={formData.dueDate}
                min={formData.billDate}
                onChange={(e) => handleDateChange("dueDate", e.target.value)}
                className={inputCls}
              />
              <p className="text-[11px] text-[#9ca3af] mt-1">
                Must be on or after bill date
              </p>
            </Field>
            <Field label="Payment Terms">
              <select
                value={formData.paymentTerms}
                onChange={(e) =>
                  setFormData({ ...formData, paymentTerms: e.target.value })
                }
                className={inputCls}
              >
                <option>Due on Receipt</option>
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Net 45</option>
                <option>Net 60</option>
              </select>
            </Field>
            <Field label="Accounts Payable">
              <select
                value={formData.accountsPayable}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accountsPayable: e.target.value,
                  })
                }
                className={inputCls}
              >
                <option>Accounts Payable</option>
                <option>Bills Payable</option>
              </select>
            </Field>
          </div>

          {/* Subject */}
          <Field label="Subject">
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className={inputCls}
            />
          </Field>

          {/* Items */}
          <div className="mt-6 mb-6">
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
                      Rate (₹)
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-right text-[11px] sm:text-[12px] font-semibold text-[#6b7280] w-[18%]">
                      Amount (₹)
                    </th>
                    <th className="px-3 sm:px-4 py-3 w-[5%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => {
                    const inv = inventoryItems.find(
                      (x) => String(x.id) === String(item.itemId)
                    );
                    return (
                      <tr key={idx} className="border-b border-[#f3f4f6]">
                        <td className="px-3 sm:px-4 py-3 align-top">
                          <select
                            value={item.itemId || ""}
                            onChange={(e) =>
                              updateRow(idx, "itemId", e.target.value)
                            }
                            className="w-full h-[40px] rounded-[8px] border border-[#d1d5db] px-2 outline-none text-[12px] sm:text-[13px]"
                          >
                            <option value="">
                              {item.itemName || "Select an item"}
                            </option>
                            {sortedItems.map((iv) => (
                              <option key={iv.id} value={iv.id}>
                                {iv.name} ({iv.sku})
                              </option>
                            ))}
                          </select>
                          {(item.itemSku || inv?.sku) && (
                            <p className="text-[10px] sm:text-[11px] text-[#6b7280] mt-1 px-1">
                              SKU: {item.itemSku || inv?.sku}
                            </p>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 py-3 align-top hidden sm:table-cell">
                          <select
                            value={item.account}
                            onChange={(e) =>
                              updateRow(idx, "account", e.target.value)
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
                              updateRow(idx, "quantity", e.target.value)
                            }
                            className="w-full h-[40px] rounded-[8px] border border-[#d1d5db] px-2 outline-none text-[12px] sm:text-[13px] text-center"
                          />
                        </td>
                        <td className="px-3 sm:px-4 py-3 align-top">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              updateRow(idx, "rate", e.target.value)
                            }
                            className="w-full h-[40px] rounded-[8px] border border-[#d1d5db] px-2 outline-none text-[12px] sm:text-[13px] text-right"
                          />
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-right text-[12px] sm:text-[13px] font-semibold text-[#111827] align-top">
                          {fmt(item.amount)}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-center align-top">
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
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
                        No items. Click "Add New Row".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addRow}
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
                <span>{fmt(subtotal)}</span>
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
                      setFormData({
                        ...formData,
                        discount: e.target.value,
                      })
                    }
                    className="w-[80px] sm:w-[100px] h-[32px] rounded-[8px] border border-[#d1d5db] px-2 outline-none text-[12px] sm:text-[13px] text-right"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-[13px] sm:text-[14px] text-[#10b981]">
                <span>Paid</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] sm:text-[12px] text-[#6b7280]">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paidAmount: e.target.value,
                      })
                    }
                    className="w-[80px] sm:w-[100px] h-[32px] rounded-[8px] border border-[#d1d5db] px-2 outline-none text-[12px] sm:text-[13px] text-right"
                  />
                </div>
              </div>
              <div className="flex justify-between text-[16px] sm:text-[18px] font-bold text-[#111827] pt-3 border-t-2 border-[#e5e7eb]">
                <span>Total (₹)</span>
                <span>{fmt(total)}</span>
              </div>
              <div
                className={`flex justify-between text-[14px] sm:text-[15px] font-bold ${
                  balanceDue > 0 ? "text-[#ef4444]" : "text-[#10b981]"
                }`}
              >
                <span>Balance Due</span>
                <span>{fmt(balanceDue)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows="3"
              className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-3 outline-none text-[13px] sm:text-[14px] resize-none"
            />
          </Field>

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
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="h-[40px] sm:h-[42px] rounded-[12px] bg-[#6B21A8] text-white px-5 text-[13px] sm:text-[14px] font-semibold disabled:opacity-70 hover:bg-[#581c87] transition"
          >
            {loading ? "Updating..." : "Update Bill"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "h-[40px] sm:h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[13px] sm:text-[14px]";

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
