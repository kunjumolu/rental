import React, { useEffect, useState } from "react";
import VendorsHeader from "../components/vendors/VendorsHeader";
import VendorsTable from "../components/vendors/VendorsTable";
import NewVendorModal from "../components/vendors/NewVendorModal";
import ViewVendorModal from "../components/vendors/ViewVendorModal";
import EditVendorModal from "../components/vendors/EditVendorModal";
import DeleteVendorModal from "../components/vendors/DeleteVendorModal";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch vendors");
      }

      setVendors(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorById = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/vendors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch vendor");
      }

      return data.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleView = async (vendor) => {
    const full = await fetchVendorById(vendor.id);
    if (full) {
      setSelectedVendor(full);
      setIsViewOpen(true);
    }
  };

  const handleEdit = async (vendor) => {
    const full = await fetchVendorById(vendor.id);
    if (full) {
      setSelectedVendor(full);
      setIsEditOpen(true);
    }
  };

  const handleDelete = (vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteOpen(true);
  };

  const filteredVendors = vendors.filter((vendor) => {
    const search = searchTerm.toLowerCase();
    return (
      vendor.name?.toLowerCase().includes(search) ||
      vendor.email?.toLowerCase().includes(search) ||
      vendor.phone?.toLowerCase().includes(search) ||
      vendor.contact_person?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="px-6 py-6">
      <VendorsHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onNewVendor={() => setIsNewOpen(true)}
      />

      <div className="mt-6 rounded-[16px] border border-[#e5e7eb] bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading vendors...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <VendorsTable
            vendors={filteredVendors}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <NewVendorModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        onCreated={() => {
          setIsNewOpen(false);
          fetchVendors();
        }}
      />

      <ViewVendorModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedVendor(null);
        }}
        vendor={selectedVendor}
      />

      <EditVendorModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedVendor(null);
        }}
        vendor={selectedVendor}
        onUpdated={() => {
          setIsEditOpen(false);
          setSelectedVendor(null);
          fetchVendors();
        }}
      />

      <DeleteVendorModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedVendor(null);
        }}
        vendor={selectedVendor}
        onDeleted={() => {
          setIsDeleteOpen(false);
          setSelectedVendor(null);
          fetchVendors();
        }}
      />
    </div>
  );
}