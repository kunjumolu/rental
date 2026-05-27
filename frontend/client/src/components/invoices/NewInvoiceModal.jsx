import React, { useEffect, useState } from "react";
import { Plus, Trash2, X, ShoppingCart, Printer } from "lucide-react";
import { printInvoice } from "../../utils/printInvoice";

export default function NewInvoiceModal({ isOpen, onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [rentalDetail, setRentalDetail] = useState(null);

  const [formData, setFormData] = useState({
    customerId: "",
    issueDate: "",
    dueDate: "",
    customerAddress: "",
    status: "draft",
    items: [],
    taxRate: 10,
    discount: 0,
    paidAmount: 0,
    notes: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchRentals();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      customerId: "",
      issueDate: "",
      dueDate: "",
      customerAddress: "",
      status: "draft",
      items: [],
      taxRate: 10,
      discount: 0,
      paidAmount: 0,
      notes: "",
    });
    setSelectedRental(null);
    setRentalDetail(null);
    setError("");
  };

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

  const fetchRentals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/rentals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRentals(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRentalById = async (rentalId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/rentals/${rentalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) return data.data;
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleRentalSelect = async (rentalId) => {
    if (!rentalId) {
      setSelectedRental(null);
      setRentalDetail(null);
      setFormData((prev) => ({
        ...prev,
        items: [],
        customerId: "",
        notes: "",
        customerAddress: "",
        issueDate: "",
        dueDate: "",
        paidAmount: 0,
      }));
      return;
    }

    const rentalBasic = rentals.find((r) => String(r.id) === String(rentalId));
    setSelectedRental(rentalBasic);

    const rentalFull = await fetchRentalById(rentalId);
    if (!rentalFull) return;

    setRentalDetail(rentalFull);

    const customer = customers.find(
      (c) => String(c.id) === String(rentalFull.customerId)
    );

    const rentalItems =
      Array.isArray(rentalFull.items) && rentalFull.items.length > 0
        ? rentalFull.items.map((item) => ({
            description: `${item.itemName} (${item.days || 1} day${
              Number(item.days) > 1 ? "s" : ""
            })`,
            quantity: Number(item.quantity || 1),
            unitPrice: Number(item.rate || 0) * Number(item.days || 1),
          }))
        : [
            {
              description: `Rental Order ${rentalFull.orderNumber}`,
              quantity: 1,
              unitPrice: Number(rentalFull.total || 0),
            },
          ];

    const today = new Date().toISOString().split("T")[0];

    const endDate = rentalFull.endDate
      ? new Date(rentalFull.endDate).toISOString().split("T")[0]
      : "";

    const depositPaid = Number(rentalFull.depositAmount || 0);

    setFormData((prev) => ({
      ...prev,
      customerId: String(rentalFull.customerId || ""),
      customerAddress: customer?.address || "",
      items: rentalItems,
      issueDate: today,
      dueDate: endDate,
      paidAmount: depositPaid,
      notes: `Generated from rental order ${rentalFull.orderNumber}`,
    }));
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
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const subtotal = formData.items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  );
  const taxAmount = subtotal * (Number(formData.taxRate) / 100);
  const discountAmount = Number(formData.discount || 0);
  const paidAmount = Number(formData.paidAmount || 0);
  const total = subtotal + taxAmount - discountAmount;
  const balanceDue = Math.max(total - paidAmount, 0);

  const createInvoiceApi = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to create invoice");
    }

    return data.data;
  };

  const fetchInvoiceById = async (invoiceId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/invoices/${invoiceId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (data.success) return data.data;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await createInvoiceApi();
      onCreated();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintAndCreate = async () => {
    try {
      setLoading(true);
      setError("");

      const invoice = await createInvoiceApi();

      const fullInvoice = await fetchInvoiceById(invoice.id);

      if (fullInvoice) {
        printInvoice(fullInvoice);
      }

      onCreated();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const customerRentals = rentals.filter(
    (r) =>
      !formData.customerId ||
      String(r.customerId) === String(formData.customerId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[820px] max-h-[92vh] overflow-y-auto rounded-[18px] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#e5e7eb]">
          <h2 className="text-[22px] font-bold text-[#111827]">
            Create New Invoice
          </h2>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827]"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#111827]">
                Customer *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => {
                  const cid = e.target.value;
                  const customer = customers.find(
                    (c) => String(c.id) === String(cid)
                  );
                  setSelectedRental(null);
                  setRentalDetail(null);
                  setFormData((prev) => ({
                    ...prev,
                    customerId: cid,
                    customerAddress: customer?.address || "",
                    items: [],
                    paidAmount: 0,
                  }));
                }}
                className="h-[48px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none"
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
              <label className="mb-2 block text-[14px] font-medium text-[#111827]">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="h-[48px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">
              Customer Address
            </label>
            <input
              type="text"
              value={formData.customerAddress}
              onChange={(e) =>
                setFormData({ ...formData, customerAddress: e.target.value })
              }
              className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none"
            />
          </div>

          {/* Rental Order Selector */}
          <div className="mt-6 rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb] p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart size={16} className="text-[#2563eb]" />
              <h3 className="text-[15px] font-semibold text-[#111827]">
                Import from Rental Order
              </h3>
              <span className="text-[12px] text-[#6b7280]">(optional)</span>
            </div>

            <select
              value={selectedRental?.id || ""}
              onChange={(e) => handleRentalSelect(e.target.value)}
              className="h-[48px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none bg-white"
            >
              <option value="">
                Select a rental order to import items...
              </option>
              {customerRentals.map((rental) => (
                <option key={rental.id} value={rental.id}>
                  {rental.orderNumber} — {rental.customerName} — ₹
                  {Number(rental.total).toFixed(2)}
                </option>
              ))}
            </select>

            {rentalDetail && (
              <div className="mt-4 rounded-[12px] bg-white border border-[#e5e7eb] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#f0f9ff] border-b border-[#e5e7eb]">
                  <div>
                    <p className="text-[14px] font-bold text-[#111827]">
                      {rentalDetail.orderNumber}
                    </p>
                    <p className="text-[12px] text-[#6b7280]">
                      {rentalDetail.customerName} • {rentalDetail.startDate} →{" "}
                      {rentalDetail.endDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-[#2563eb]">
                      ₹{Number(rentalDetail.total).toFixed(2)}
                    </p>
                    {Number(rentalDetail.depositAmount) > 0 && (
                      <p className="text-[12px] text-[#10b981]">
                        Deposit: ₹
                        {Number(rentalDetail.depositAmount).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {Array.isArray(rentalDetail.items) &&
                  rentalDetail.items.length > 0 && (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                          <th className="px-4 py-2 text-left text-[12px] font-semibold text-[#6b7280]">
                            Item Name
                          </th>
                          <th className="px-4 py-2 text-center text-[12px] font-semibold text-[#6b7280]">
                            Qty
                          </th>
                          <th className="px-4 py-2 text-center text-[12px] font-semibold text-[#6b7280]">
                            Days
                          </th>
                          <th className="px-4 py-2 text-right text-[12px] font-semibold text-[#6b7280]">
                            Rate/Day
                          </th>
                          <th className="px-4 py-2 text-right text-[12px] font-semibold text-[#6b7280]">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rentalDetail.items.map((item, i) => {
                          const itemSubtotal =
                            Number(item.quantity || 0) *
                            Number(item.days || 1) *
                            Number(item.rate || 0);

                          return (
                            <tr
                              key={i}
                              className="border-b border-[#f3f4f6] last:border-0"
                            >
                              <td className="px-4 py-3 text-[13px] text-[#111827] font-medium">
                                {item.itemName}
                              </td>
                              <td className="px-4 py-3 text-[13px] text-[#6b7280] text-center">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-[13px] text-[#6b7280] text-center">
                                {item.days}
                              </td>
                              <td className="px-4 py-3 text-[13px] text-[#6b7280] text-right">
                                ₹{Number(item.rate).toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-[13px] font-semibold text-[#111827] text-right">
                                ₹{itemSubtotal.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-[#e5e7eb] bg-[#f9fafb]">
                          <td
                            colSpan={4}
                            className="px-4 py-3 text-[13px] font-semibold text-[#374151] text-right"
                          >
                            Rental Total:
                          </td>
                          <td className="px-4 py-3 text-[14px] font-bold text-[#2563eb] text-right">
                            ₹{Number(rentalDetail.total).toFixed(2)}
                          </td>
                        </tr>
                        {Number(rentalDetail.depositAmount) > 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-2 text-[13px] font-semibold text-[#10b981] text-right"
                            >
                              Deposit Paid:
                            </td>
                            <td className="px-4 py-2 text-[13px] font-bold text-[#10b981] text-right">
                              ₹{Number(rentalDetail.depositAmount).toFixed(2)}
                            </td>
                          </tr>
                        )}
                      </tfoot>
                    </table>
                  )}
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="mt-8 flex items-center justify-between">
            <h3 className="text-[16px] font-medium text-[#111827]">
              Line Items
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="h-[42px] px-4 rounded-[12px] border border-[#d1d5db] bg-white text-[14px] font-medium flex items-center gap-2"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {formData.items.length === 0 ? (
              <p className="text-[14px] text-[#6b7280]">
                No items added yet. Select a rental order above or click Add
                Item.
              </p>
            ) : (
              formData.items.map((item, index) => {
                const amount =
                  Number(item.quantity || 0) * Number(item.unitPrice || 0);

                return (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 items-end rounded-[14px] border border-[#e5e7eb] p-4"
                  >
                    <div className="col-span-6">
                      <label className="mb-2 block text-[13px] font-medium text-[#111827]">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-2 block text-[13px] font-medium text-[#111827]">
                        Qty
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-2 block text-[13px] font-medium text-[#111827]">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(index, "unitPrice", e.target.value)
                        }
                        className="h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none"
                      />
                    </div>
                    <div className="col-span-1 text-[14px] font-medium text-[#111827]">
                      ₹{amount.toFixed(2)}
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
              })
            )}
          </div>

          {/* Tax Rate, Discount, Paid Amount */}
          <div className="mt-8 grid grid-cols-3 gap-5">
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#111827]">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData({ ...formData, taxRate: e.target.value })
                }
                className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#111827]">
                Discount (₹)
              </label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: e.target.value })
                }
                className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#111827]">
                Deposit / Amount Paid (₹)
              </label>
              <input
                type="number"
                value={formData.paidAmount}
                onChange={(e) =>
                  setFormData({ ...formData, paidAmount: e.target.value })
                }
                className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none"
              />
            </div>
          </div>

          {/* Totals Summary */}
          <div className="mt-6 rounded-[14px] border border-[#e5e7eb] p-5 bg-[#f9fafb]">
            <div className="flex justify-between text-[14px] text-[#6b7280] py-1">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[14px] text-[#6b7280] py-1">
              <span>Tax ({formData.taxRate}%):</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[14px] text-[#6b7280] py-1">
              <span>Discount:</span>
              <span>₹{discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[20px] font-bold text-[#111827] pt-3 border-t border-[#e5e7eb] mt-2">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            {paidAmount > 0 && (
              <div className="flex justify-between text-[14px] text-[#10b981] py-1 mt-1">
                <span>Deposit / Paid:</span>
                <span>₹{paidAmount.toFixed(2)}</span>
              </div>
            )}
            {paidAmount > 0 && (
              <div className="flex justify-between text-[16px] font-bold text-[#ef4444] py-1">
                <span>Balance Due:</span>
                <span>₹{balanceDue.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mt-5">
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">
              Notes
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="h-[46px] w-full rounded-[12px] border border-[#d1d5db] px-4 outline-none"
            />
          </div>

          {error && (
            <p className="mt-4 text-[14px] text-red-600">{error}</p>
          )}

          {/* Buttons: Cancel | Print | Create Invoice */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[44px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium text-[#374151]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePrintAndCreate}
              disabled={loading}
              className="h-[44px] rounded-[12px] border border-[#6B21A8] text-[#6B21A8] px-5 text-[14px] font-semibold flex items-center gap-2 disabled:opacity-70 hover:bg-[#f5f3ff] transition"
            >
              <Printer size={16} />
              {loading ? "Processing..." : "Print"}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-[44px] rounded-[12px] bg-[#2563eb] px-5 text-[14px] font-semibold text-white disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}