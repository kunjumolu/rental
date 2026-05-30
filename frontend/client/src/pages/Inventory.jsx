import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import InventoryHeader from "../components/inventory/InventoryHeader";
import InventoryStatsCards from "../components/inventory/InventoryStatsCards";
import InventoryCategoryTabs from "../components/inventory/InventoryCategoryTabs";
import InventoryTable from "../components/inventory/InventoryTable";
import AddInventoryModal from "../components/inventory/AddInventoryModal";
import ViewInventoryModal from "../components/inventory/ViewInventoryModal";
import EditInventoryModal from "../components/inventory/EditInventoryModal";
import DeleteInventoryModal from "../components/inventory/DeleteInventoryModal";

export default function Inventory() {
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    available: 0,
    lowOutStock: 0,
    maintenance: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchInventory();
    fetchStats();
  }, []);

  // Read navigation state (from AlertsWarnings or Topbar Create New)
  useEffect(() => {
    if (location.state?.activeFilter) {
      setStatusFilter(location.state.activeFilter);
      setActiveCategory("All");
      setSearchTerm("");
    }
    if (location.state?.openAddModal) {
      setIsAddOpen(true);
    }
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch inventory");
      }
      setItems(data.data || []);
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
      const res = await fetch("http://localhost:5000/api/inventory/stats", {
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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        item.name?.toLowerCase().includes(search) ||
        item.sku?.toLowerCase().includes(search);

      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter ||
        (statusFilter === "low_stock" && (item.status === "low_stock" || item.status === "out_of_stock"));

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchTerm, activeCategory, statusFilter]);

  const handleCreated = () => {
    fetchInventory();
    fetchStats();
    setIsAddOpen(false);
  };

  const handleUpdated = () => {
    fetchInventory();
    fetchStats();
    setIsEditOpen(false);
    setSelectedItem(null);
  };

  const handleDeleted = () => {
    fetchInventory();
    fetchStats();
    setIsDeleteOpen(false);
    setSelectedItem(null);
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/inventory/${itemId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update inventory status");
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
      fetchStats();
    } catch (error) {
      console.error("Inventory status update error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="px-6 py-6">
      <InventoryHeader
        searchTerm={searchTerm}
        setSearchTerm={(val) => {
          setSearchTerm(val);
          setStatusFilter("all");
        }}
        onAddItem={() => setIsAddOpen(true)}
      />

      <InventoryStatsCards stats={stats} />

      <InventoryCategoryTabs
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          setActiveCategory(cat);
          setStatusFilter("all");
        }}
      />

      {statusFilter !== "all" && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[13px] text-[#6b7280]">Filtered by:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#fef3c7] text-[#92400e]">
            {statusFilter === "low_stock" ? "Low / Out of Stock" : statusFilter.replaceAll("_", " ")}
            <button
              onClick={() => setStatusFilter("all")}
              className="ml-1 text-[#92400e] hover:text-[#78350f] font-bold"
            >
              ×
            </button>
          </span>
        </div>
      )}

      <div className="mt-6 rounded-[16px] border border-[#e5e7eb] bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading inventory...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <InventoryTable
            items={filteredItems}
            onView={(item) => {
              setSelectedItem(item);
              setIsViewOpen(true);
            }}
            onEdit={(item) => {
              setSelectedItem(item);
              setIsEditOpen(true);
            }}
            onDelete={(item) => {
              setSelectedItem(item);
              setIsDeleteOpen(true);
            }}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      <AddInventoryModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={handleCreated}
      />

      <ViewInventoryModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        item={selectedItem}
      />

      <EditInventoryModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        item={selectedItem}
        onUpdated={handleUpdated}
      />

      <DeleteInventoryModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        item={selectedItem}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
