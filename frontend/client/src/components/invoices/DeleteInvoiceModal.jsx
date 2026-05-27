import React, { useState } from "react";

export default function DeleteInvoiceModal({ isOpen, onClose, invoice, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !invoice) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/invoices/${invoice.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete invoice");
      }

      onDeleted();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[450px] rounded-[18px] bg-white shadow-2xl p-6">
        <h2 className="text-[20px] font-bold text-[#111827]">Delete Invoice</h2>
        <p className="mt-3 text-[14px] text-[#6b7280]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#111827]">{invoice.invoiceNumber}</span>?
        </p>

        {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-[42px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="h-[42px] rounded-[12px] bg-red-600 px-5 text-[14px] font-semibold text-white"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}