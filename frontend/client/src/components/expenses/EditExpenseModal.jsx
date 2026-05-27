import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const EXPENSE_ACCOUNTS = [
  "Travel Expense",
  "Office Supplies",
  "Meals & Entertainment",
  "Utilities",
  "Rent",
  "Repairs & Maintenance",
  "Advertising",
  "Insurance",
  "Professional Fees",
  "Salaries & Wages",
  "Other Expenses",
];

const PAID_THROUGH = [
  "Petty Cash",
  "Bank Account",
  "Credit Card",
  "Cash",
  "UPI",
  "Cheque",
];

export default function EditExpenseModal({ isOpen, onClose, expense, onUpdated }) {
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState({
    date: "",
    expenseAccount: "",
    referenceNumber: "",
    amount: "",
    currency: "INR",
    paidThrough: "",
    vendorId: "",
    vendorName: "",
    invoiceNumber: "",
    customerId: "",
    customerName: "",
    status: "non-billable",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && expense) {
      fetchVendors();
      fetchCustomers();
      setError("");

      setFormData({
        date: expense.date
          ? new Date(expense.date).toISOString().split("T")[0]
          : "",
        expenseAccount: expense.expense_account || "",
        referenceNumber: expense.reference_number || "",
        amount: expense.amount || "",
        currency: expense.currency || "INR",
        paidThrough: expense.paid_through || "",
        vendorId: expense.vendor_id || "",
        vendorName: expense.vendor_name || "",
        invoiceNumber: expense.invoice_number || "",
        customerId: expense.customer_id || "",
        customerName: expense.customer_name || "",
        status: expense.status || "non-billable",
        notes: expense.notes || "",
      });
    }
  }, [isOpen, expense]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "vendorId") {
      const vendor = vendors.find((v) => String(v.id) === String(value));
      setFormData((prev) => ({
        ...prev,
        vendorId: value,
        vendorName: vendor?.name || "",
      }));
    } else if (name === "customerId") {
      const customer = customers.find((c) => String(c.id) === String(value));
      setFormData((prev) => ({
        ...prev,
        customerId: value,
        customerName: customer?.name || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.expenseAccount || !formData.amount) {
      setError("Date, expense account and amount are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/expenses/${expense.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update expense");
      }

      onUpdated();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[680px] max-h-[92vh] overflow-hidden rounded-[18px] bg-white shadow-2xl flex flex-col">

        <div className="flex items-center justify-between px-8 py-5 border-b border-[#e5e7eb]">
          <h2 className="text-[20px] font-bold text-[#111827]">Edit Expense</h2>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827]"
          >
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-8 py-6 space-y-5"
        >
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">
                Expense Account <span className="text-red-500">*</span>
              </label>
              <select
                name="expenseAccount"
                value={formData.expenseAccount}
                onChange={handleChange}
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
              >
                <option value="">Select an account</option>
                {EXPENSE_ACCOUNTS.map((acc) => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="h-[44px] w-[75px] rounded-[10px] border border-[#d1d5db] px-2 outline-none text-[13px]"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-[44px] flex-1 rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">
                Paid Through <span className="text-red-500">*</span>
              </label>
              <select
                name="paidThrough"
                value={formData.paidThrough}
                onChange={handleChange}
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
              >
                <option value="">Select an account</option>
                {PAID_THROUGH.map((pt) => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">
                Vendor
              </label>
              <select
                name="vendorId"
                value={formData.vendorId}
                onChange={handleChange}
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
              >
                <option value="">Select a vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">
                Invoice#
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">
                Customer Name
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
              >
                <option value="non-billable">Non-Billable</option>
                <option value="billable">Billable</option>
                <option value="invoiced">Invoiced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-2">
              Reference#
            </label>
            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-3 outline-none text-[14px]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              maxLength={500}
              placeholder="Max. 500 characters"
              className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-3 outline-none text-[14px] resize-none"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-600">{error}</p>
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
            {loading ? "Updating..." : "Update Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}