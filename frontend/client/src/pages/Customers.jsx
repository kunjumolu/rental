import React, { useEffect, useState } from "react";
import CustomersHeader from "../components/customers/CustomersHeader";
import CustomersFilters from "../components/customers/CustomersFilters";
import CustomersTable from "../components/customers/CustomersTable";
import AddCustomerModal from "../components/customers/AddCustomerModal";
import ViewCustomerModal from "../components/customers/ViewCustomerModal";
import EditCustomerModal from "../components/customers/EditCustomerModal";
import DeleteCustomerModal from "../components/customers/DeleteCustomerModal";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const res = await fetch("http://localhost:5000/api/customers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch customers");
      }

      setCustomers(data.data || []);
    } catch (err) {
      console.error("Customers Fetch Error:", err);
      setError(err.message || "Something went wrong while loading customers.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = (newCustomer) => {
    setCustomers((prev) => [...prev, newCustomer]);
    setIsAddOpen(false);
  };

  const handleUpdateCustomer = (updatedCustomer) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
    setIsEditOpen(false);
    setSelectedCustomer(null);
  };

  const handleDeleteCustomer = (customerId) => {
    setCustomers((prev) =>
      prev.filter((customer) => customer.id !== customerId)
    );
    setIsDeleteOpen(false);
    setSelectedCustomer(null);
  };

  const openViewModal = (customer) => {
    setSelectedCustomer(customer);
    setIsViewOpen(true);
  };

  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setIsEditOpen(true);
  };

  const openDeleteModal = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
    setSelectedCustomer(null);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setSelectedCustomer(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="px-6 py-6">
      <CustomersHeader onAddClick={() => setIsAddOpen(true)} />

      <div className="mt-5 rounded-[10px] border border-[#d9deea] bg-white shadow-sm">
        <CustomersFilters />

        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading customers...</div>
        ) : error ? (
          <div className="p-6">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">{error}</p>
              <button
                onClick={fetchCustomers}
                className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <CustomersTable
            customers={customers}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        )}
      </div>

      <AddCustomerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddCustomer={handleAddCustomer}
      />

      <ViewCustomerModal
        isOpen={isViewOpen}
        onClose={closeViewModal}
        customer={selectedCustomer}
      />

      <EditCustomerModal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        customer={selectedCustomer}
        onUpdateCustomer={handleUpdateCustomer}
      />

      <DeleteCustomerModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        customer={selectedCustomer}
        onDeleteCustomer={handleDeleteCustomer}
      />
    </div>
  );
}