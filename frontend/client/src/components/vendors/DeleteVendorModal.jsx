import React, { useState } from "react";

export default function DeleteVendorModal({ isOpen, onClose, vendor, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !vendor) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/vendors/${vendor.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete vendor");
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
        <h2 className="text-[20px] font-bold text-[#111827]">Delete Vendor</h2>
        <p className="mt-3 text-[14px] text-[#6b7280]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#111827]">{vendor.name}</span>?
          This action cannot be undone.
        </p>

        {error && (
          <p className="mt-4 text-[13px] text-red-600">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-[42px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium text-[#374151]"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="h-[42px] rounded-[12px] bg-red-600 px-5 text-[14px] font-semibold text-white disabled:opacity-70 hover:bg-red-700 transition"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}