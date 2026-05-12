import React, { useState } from "react";
import CustomerRow from "./CustomerRow";
import CustomersPagination from "./CustomersPagination";

export default function CustomersTable({ customers, onView, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalItems = customers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = customers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

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
          {currentCustomers.length > 0 ? (
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
              <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
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