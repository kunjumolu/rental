import React, { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

export default function EditInvoiceModal({ isOpen, onClose, invoice, onUpdated }) {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customerId: "",
    issueDate: "",
    dueDate: "",
    customerAddress: "",
    status: "draft",
    items: [],
    taxRate: 10,
    discount: 0,
    notes: "",
    paidAmount: 0,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && invoice) {
      fetchCustomers();
      setFormData({
        customerId: invoice.customerId || "",
        issueDate: invoice.issueDate || "",
        dueDate: invoice.dueDate || "",
        customerAddress: invoice.customerAddress || "",
        status: invoice.status || "draft",
        items: invoice.items || [],
        taxRate: invoice.taxRate || 10,
        discount: invoice.discount || 0,
        notes: invoice.notes || "",
        paidAmount: invoice.paidAmount || 0,
      });
      setError("");
    }
  }, [isOpen, invoice]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCustomers(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0 }],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] =
      field === "quantity" || field === "unitPrice" ? Number(value) : value;

    setFormData((prev) => ({
      ...prev,
      items: updated,
    }));
  };

  const subtotal = formData.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  );
  const taxAmount = subtotal * (Number(formData.taxRate) / 100);
  const discountAmount = Number(formData.discount || 0);
  const total = subtotal + taxAmount - discountAmount;

  const handleCustomerChange = (customerId) => {
    const customer = customers.find((c) => String(c.id) === String(customerId));
    setFormData((prev) => ({
      ...prev,
      customerId,
      customerAddress: customer?.address || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update invoice");
      }

      onUpdated();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-4">
      <div className="w-full max-w-[760px] max-h-[90vh] overflow-y-auto rounded-[14px] sm:rounded-[18px] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
          <h2 className="text-[17px] sm:text-[19px] md:text-[22px] font-bold text-[#111827]">Edit Invoice</h2>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#111827]">
            <X size={22} className="sm:hidden" />
            <X size={24} className="hidden sm:block" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">Customer *</label>
              <select
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="h-[44px] sm:h-[48px] w-full rounded-[10px] sm:rounded-[12px] border border-[#d1d5db] px-3 sm:px-4 outline-none text-[14px]"
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="h-[44px] sm:h-[48px] w-full rounded-[10px] sm:rounded-[12px] border border-[#d1d5db] px-3 sm:px-4 outline-none text-[14px]"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">Issue Date</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="h-[44px] sm:h-[48px] w-full rounded-[10px] sm:rounded-[12px] border border-[#d1d5db] px-3 sm:px-4 outline-none text-[14px]"
              />
            </div>

            <div>
              <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="h-[44px] sm:h-[48px] w-full rounded-[10px] sm:rounded-[12px] border border-[#d1d5db] px-3 sm:px-4 outline-none text-[14px]"
              />
            </div>
          </div>

          <div className="mt-4 sm:mt-5">
            <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">Customer Address</label>
            <input
              type="text"
              value={formData.customerAddress}
              onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
              className="h-[42px] sm:h-[46px] w-full rounded-[10px] sm:rounded-[12px] border border-[#d1d5db] px-3 sm:px-4 outline-none text-[14px]"
            />
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-[15px] sm:text-[16px] font-medium text-[#111827]">Line Items</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="h-[40px] sm:h-[42px] px-4 rounded-[12px] border border-[#d1d5db] bg-white text-[13px] sm:text-[14px] font-medium flex items-center gap-2"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          <div className="mt-4 space-y-3 sm:space-y-4">
            {formData.items.map((item, index) => {
              const amount = Number(item.quantity || 0) * Number(item.unitPrice || 0);

              return (
                <div key={index} className="rounded-[12px] sm:rounded-[14px] border border-[#e5e7eb] p-3 sm:p-4">
                  {/* Mobile: stacked layout */}
                  <div className="block sm:hidden space-y-3">
                    <div>
                      <label className="mb-1 block text-[12px] font-medium text-[#111827]">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        className="h-[40px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-[12px] font-medium text-[#111827]">Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="h-[40px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[12px] font-medium text-[#111827]">Unit Price</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                          className="h-[40px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-medium text-[#111827]">₹{amount.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="h-[38px] w-[38px] rounded-[10px] border border-[#fecaca] text-red-500 flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Desktop: grid layout */}
                  <div className="hidden sm:grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-6">
                      <label className="mb-2 block text-[13px] font-medium text-[#111827]">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-2 block text-[13px] font-medium text-[#111827]">Qty</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-2 block text-[13px] font-medium text-[#111827]">Unit Price</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                      />
                    </div>
                    <div className="col-span-1 text-[14px] font-medium">₹{amount.toFixed(2)}</div>
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
                </div>
              );
            })}
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">Tax Rate (%)</label>
              <input
                type="number"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                className="h-[42px] sm:h-[46px] w-full rounded-[10px] sm:rounded-[12px] border border-[#d1d5db] px-3 sm:px-4 outline-none text-[14px]"
              />
            </div>
            <div>
              <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">Discount</label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="h-[42px] sm:h-[46px] w-full rounded-[10px] sm:rounded-[12px] border border-[#d1d5db] px-3 sm:px-4 outline-none text-[14px]"
              />
            </div>
          </div>

          <div className="mt-4 sm:mt-5">
            <label className="mb-1.5 sm:mb-2 block text-[13px] sm:text-[14px] font-medium text-[#111827]">Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="h-[42px] sm:h-[46px] w-full rounded-[10px] sm:rounded-[12px] border border-[#d1d5db] px-3 sm:px-4 outline-none text-[14px]"
            />
          </div>

          <div className="mt-5 sm:mt-6 text-right space-y-1 sm:space-y-2 text-[13px] sm:text-[14px]">
            <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
            <div>Tax ({formData.taxRate}%): ₹{(subtotal * (Number(formData.taxRate) / 100)).toFixed(2)}</div>
            <div>Discount: ₹{Number(formData.discount).toFixed(2)}</div>
            <div className="text-[18px] sm:text-[20px] md:text-[22px] font-bold">Total: ₹{total.toFixed(2)}</div>
          </div>

          {error && <p className="mt-4 text-[13px] sm:text-[14px] text-red-600">{error}</p>}

          <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[42px] sm:h-[44px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-[42px] sm:h-[44px] rounded-[12px] bg-[#2563eb] px-5 text-[14px] font-semibold text-white disabled:opacity-70 w-full sm:w-auto"
            >
              {loading ? "Updating..." : "Update Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
