import React, { useState, useEffect, useMemo } from "react";
import CustomerRow from "./CustomerRow";
import CustomersPagination from "./CustomersPagination";

export default function CustomersTable({ customers, onView, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rentals, setRentals] = useState([]);
  const [loadingRentals, setLoadingRentals] = useState(false);
  const itemsPerPage = 10;

  // Fetch rentals from API
  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoadingRentals(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/rentals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setRentals(data.data || []);
      }
    } catch (err) {
      console.error("Fetch rentals error:", err);
    } finally {
      setLoadingRentals(false);
    }
  };

  // Calculate active rentals & balance per customer
  const customerStats = useMemo(() => {
    const stats = {};

    rentals.forEach((rental) => {
      const customerId = String(rental.customerId);

      if (!stats[customerId]) {
        stats[customerId] = {
          activeRentals: 0,
          balance: 0,
        };
      }

      // Count active rentals (status: active / pending / ongoing — adjust to your API)
      const activeStatuses = ["active", "ongoing", "pending", "confirmed"];
      if (activeStatuses.includes(rental.status?.toLowerCase())) {
        stats[customerId].activeRentals += 1;
      }

      // Sum up balance (total - depositAmount or balance field directly)
      const balance =
        Number(rental.balance) ||
        Number(rental.total || 0) - Number(rental.depositAmount || 0);
      stats[customerId].balance += balance;
    });

    return stats;
  }, [rentals]);

  // Merge stats into customers
  const customersWithStats = useMemo(() => {
    return customers.map((customer) => {
      const stat = customerStats[String(customer.id)] || {
        activeRentals: 0,
        balance: 0,
      };
      return {
        ...customer,
        activeRentals: stat.activeRentals,
        balance: stat.balance,
      };
    });
  }, [customers, customerStats]);

  const totalItems = customersWithStats.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = customersWithStats.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Reset page if out of range
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [customers, currentPage, totalPages]);

  return (
    <div className="border-t border-[#d9deea]">
      <table className="w-full">
        <thead>
          <tr className="bg-[#f7f9fc] border-b border-[#d9deea]">
            <th className="text-left text-[11px] font-medium text-[#4b5563] px-4 py-3">
              Name
            </th>
            <th className="text-left text-[11px] font-medium text-[#4b5563] px-4 py-3">
              Phone
            </th>
            <th className="text-left text-[11px] font-medium text-[#4b5563] px-4 py-3">
              Active Rentals
            </th>
            <th className="text-left text-[11px] font-medium text-[#4b5563] px-4 py-3">
              Balance
            </th>
            <th className="text-left text-[11px] font-medium text-[#4b5563] px-4 py-3">
              Status
            </th>
            <th className="text-left text-[11px] font-medium text-[#4b5563] px-4 py-3">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {loadingRentals ? (
            <tr>
              <td
                colSpan="6"
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                Loading...
              </td>
            </tr>
          ) : currentCustomers.length > 0 ? (
            currentCustomers.map((customer) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                No customers found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <CustomersPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}