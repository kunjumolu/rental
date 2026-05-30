import React, { useState } from "react";

export default function DeleteRentalModal({ isOpen, onClose, rental, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !rental) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/rentals/${rental.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete rental order");
      }

      onDeleted(rental.id);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4">
      <div className="w-full max-w-[450px] rounded-[14px] sm:rounded-[18px] bg-white shadow-2xl p-4 sm:p-6">
        <h2 className="text-[17px] sm:text-[18px] md:text-[20px] font-bold text-[#111827]">Delete Rental Order</h2>
        <p className="mt-2 sm:mt-3 text-[13px] sm:text-[14px] text-[#6b7280]">
          Are you sure you want to delete <span className="font-semibold text-[#111827]">{rental.orderNumber}</span>?
        </p>

        {error && <p className="mt-3 sm:mt-4 text-[13px] text-red-600">{error}</p>}

        <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="h-[42px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium w-full sm:w-auto"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="h-[42px] rounded-[12px] bg-red-600 px-5 text-[14px] font-semibold text-white w-full sm:w-auto"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
