import React, { useEffect, useState } from "react";
import RentalsHeader from "../components/rentals/RentalsHeader";
import RentalsStatsCards from "../components/rentals/RentalsStatsCards";
import RentalsTable from "../components/rentals/RentalsTable";
import NewRentalModal from "../components/rentals/NewRentalModal";
import ViewRentalModal from "../components/rentals/ViewRentalModal";
import EditRentalModal from "../components/rentals/EditRentalModal";
import DeleteRentalModal from "../components/rentals/DeleteRentalModal";

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [stats, setStats] = useState({
    all: 0,
    pending: 0,
    active: 0,
    overdue: 0,
    returned: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [cardFilter, setCardFilter] = useState("all");

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedRental, setSelectedRental] = useState(null);

  useEffect(() => {
    fetchRentals();
    fetchStats();
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

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/rentals/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreated = () => {
    fetchRentals();
    fetchStats();
    setIsNewOpen(false);
  };

  const handleDelete = (id) => {
    setRentals((prev) => prev.filter((item) => item.id !== id));
    setIsDeleteOpen(false);
    setSelectedRental(null);
    fetchStats();
  };

  const handleUpdated = () => {
    fetchRentals();
    fetchStats();
    setIsEditOpen(false);
    setSelectedRental(null);
  };

  const handleCardFilterChange = (filter) => {
    setCardFilter(filter);
    setSearchTerm("");
  };

  const filteredRentals = rentals.filter((rental) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      rental.orderNumber?.toLowerCase().includes(search) ||
      rental.customerName?.toLowerCase().includes(search);

    const matchesCard =
      cardFilter === "all" || rental.status === cardFilter;

    return matchesSearch && matchesCard;
  });

  return (
    <div className="px-6 py-6">
      <RentalsHeader
        searchTerm={searchTerm}
        setSearchTerm={(val) => {
          setSearchTerm(val);
          setCardFilter("all");
        }}
        onNewOrder={() => setIsNewOpen(true)}
      />

      <RentalsStatsCards
        stats={stats}
        activeFilter={cardFilter}
        onFilterChange={handleCardFilterChange}
      />

      <div className="mt-6 rounded-[16px] border border-[#e5e7eb] bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading rental orders...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : filteredRentals.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No {cardFilter !== "all" ? cardFilter : ""} rentals found.
          </div>
        ) : (
          <RentalsTable
            rentals={filteredRentals}
            onView={(rental) => {
              setSelectedRental(rental);
              setIsViewOpen(true);
            }}
            onEdit={(rental) => {
              setSelectedRental(rental);
              setIsEditOpen(true);
            }}
            onDelete={(rental) => {
              setSelectedRental(rental);
              setIsDeleteOpen(true);
            }}
            onStatusChange={(id, status) => {
              setRentals((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status } : r))
              );
              fetchStats();
            }}
          />
        )}
      </div>

      <NewRentalModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        onCreated={handleCreated}
      />

      <ViewRentalModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedRental(null);
        }}
        rental={selectedRental}
      />

      <EditRentalModal
        isOpen={isEditOpen}
        rental={selectedRental}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedRental(null);
        }}
        onUpdated={handleUpdated}
      />

      <DeleteRentalModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedRental(null);
        }}
        rental={selectedRental}
        onDeleted={handleDelete}
      />
    </div>
  );
}