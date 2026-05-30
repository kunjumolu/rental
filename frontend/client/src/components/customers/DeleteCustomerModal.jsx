import React, { useState } from "react";

export default function DeleteCustomerModal({ isOpen, onClose, customer, onDeleteCustomer }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !customer) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/customers/${customer.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete customer");
      onDeleteCustomer(customer.id);
      onClose();
    } catch (err) {
      console.error("Delete Customer Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-3 sm:px-4">
      <div className="w-full max-w-[460px] rounded-[12px] sm:rounded-[16px] bg-white shadow-2xl">
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900">Delete Customer</h2>
          <p className="mt-2 text-[13px] sm:text-sm text-gray-500">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{customer.name}</span>?
          </p>

          {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}

          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button onClick={onClose}
              className="h-[40px] sm:h-[42px] rounded-[10px] border border-gray-300 px-5 text-[13px] sm:text-sm font-medium text-gray-700 w-full sm:w-auto">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={loading}
              className="h-[40px] sm:h-[42px] rounded-[10px] bg-red-600 px-5 text-[13px] sm:text-sm font-semibold text-white disabled:opacity-70 w-full sm:w-auto">
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
