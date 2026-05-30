import React, { useEffect, useMemo, useState } from "react";
import { FilePlus2 } from "lucide-react";

export default function GenerateFromRentals({ onGenerated }) {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingId, setGeneratingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/rentals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch rentals");
      }

      setRentals(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRentals = useMemo(() => {
    return rentals.filter((rental) => {
      const search = searchTerm.toLowerCase();
      return (
        rental.orderNumber?.toLowerCase().includes(search) ||
        rental.customerName?.toLowerCase().includes(search)
      );
    });
  }, [rentals, searchTerm]);

  const handleGenerateInvoice = async (rentalId) => {
    try {
      setGeneratingId(rentalId);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/invoices/generate-from-rental/${rentalId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to generate invoice");
      }

      if (onGenerated) {
        onGenerated();
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="mt-6 sm:mt-8 md:mt-10 rounded-[12px] sm:rounded-[16px] border border-[#e5e7eb] bg-white overflow-hidden">
      <div className="p-3 sm:p-4 md:p-5 border-b border-[#e5e7eb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-[15px] sm:text-[16px] md:text-[18px] font-semibold text-[#111827]">
          Generate Invoices from Rentals
        </h3>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search rentals..."
          className="h-[40px] sm:h-[42px] w-full sm:w-[200px] md:w-[240px] rounded-[12px] border border-[#d1d5db] px-3 sm:px-4 outline-none text-[14px]"
        />
      </div>

      {loading ? (
        <div className="p-4 sm:p-6 text-sm text-gray-500">Loading rentals...</div>
      ) : error ? (
        <div className="p-4 sm:p-6 text-sm text-red-600">{error}</div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="block lg:hidden divide-y divide-[#e5e7eb]">
            {filteredRentals.map((rental) => (
              <div key={rental.id} className="p-3 sm:p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-[#111827] truncate">{rental.orderNumber}</p>
                    <p className="text-[13px] text-[#6b7280]">{rental.customerName}</p>
                  </div>
                  <span className="text-[14px] font-medium text-[#111827] shrink-0">
                    ${Number(rental.total).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px] sm:text-[13px] text-[#6b7280]">
                  <span>{rental.startDate} → {rental.endDate}</span>
                  <span className="capitalize">{rental.status}</span>
                </div>
                <button
                  onClick={() => handleGenerateInvoice(rental.id)}
                  disabled={generatingId === rental.id}
                  className="h-[36px] sm:h-[38px] px-3 sm:px-4 rounded-[10px] bg-[#2563eb] text-white text-[12px] sm:text-[13px] font-medium flex items-center gap-2 w-full justify-center sm:w-auto"
                >
                  <FilePlus2 size={14} />
                  {generatingId === rental.id ? "Generating..." : "Generate Invoice"}
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#e5e7eb]">
                  <th className="px-3 xl:px-4 py-3 xl:py-4 text-[13px] xl:text-[14px] font-semibold text-[#111827]">Order #</th>
                  <th className="px-3 xl:px-4 py-3 xl:py-4 text-[13px] xl:text-[14px] font-semibold text-[#111827]">Customer</th>
                  <th className="px-3 xl:px-4 py-3 xl:py-4 text-[13px] xl:text-[14px] font-semibold text-[#111827]">Start Date</th>
                  <th className="px-3 xl:px-4 py-3 xl:py-4 text-[13px] xl:text-[14px] font-semibold text-[#111827]">End Date</th>
                  <th className="px-3 xl:px-4 py-3 xl:py-4 text-[13px] xl:text-[14px] font-semibold text-[#111827]">Total</th>
                  <th className="px-3 xl:px-4 py-3 xl:py-4 text-[13px] xl:text-[14px] font-semibold text-[#111827]">Status</th>
                  <th className="px-3 xl:px-4 py-3 xl:py-4 text-[13px] xl:text-[14px] font-semibold text-[#111827]">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRentals.map((rental) => (
                  <tr key={rental.id} className="border-t border-[#e5e7eb]">
                    <td className="px-3 xl:px-4 py-3 xl:py-4 text-[13px] xl:text-[14px] font-medium text-[#111827]">
                      {rental.orderNumber}
                    </td>
                    <td className="px-3 xl:px-4 py-3 xl:py-4 text-[13px] xl:text-[14px] text-[#111827]">
                      {rental.customerName}
                    </td>
                    <td className="px-3 xl:px-4 py-3 xl:py-4 text-[13px] xl:text-[14px] text-[#111827]">
                      {rental.startDate}
                    </td>
                    <td className="px-3 xl:px-4 py-3 xl:py-4 text-[13px] xl:text-[14px] text-[#111827]">
                      {rental.endDate}
                    </td>
                    <td className="px-3 xl:px-4 py-3 xl:py-4 text-[13px] xl:text-[14px] font-medium text-[#111827]">
                      ${Number(rental.total).toFixed(2)}
                    </td>
                    <td className="px-3 xl:px-4 py-3 xl:py-4 text-[13px] xl:text-[14px] text-[#111827] capitalize">
                      {rental.status}
                    </td>
                    <td className="px-3 xl:px-4 py-3 xl:py-4">
                      <button
                        onClick={() => handleGenerateInvoice(rental.id)}
                        disabled={generatingId === rental.id}
                        className="h-[36px] xl:h-[38px] px-3 xl:px-4 rounded-[10px] bg-[#2563eb] text-white text-[12px] xl:text-[13px] font-medium flex items-center gap-2 whitespace-nowrap"
                      >
                        <FilePlus2 size={16} />
                        {generatingId === rental.id ? "Generating..." : "Generate Invoice"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
