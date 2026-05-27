import React, { useEffect, useState } from "react";
import BillsHeader     from "../components/bills/BillsHeader";
import BillsTable      from "../components/bills/BillsTable";
import NewBillModal    from "../components/bills/NewBillModal";
import ViewBillModal   from "../components/bills/ViewBillModal";
import EditBillModal   from "../components/bills/EditBillModal";

const API_BASE = "http://localhost:5000";

export default function Bills() {
  const [bills, setBills]         = useState([]);
  const [stats, setStats]         = useState({
    all: 0, pending: 0, paid: 0, overdue: 0, draft: 0, outstandingPayables: 0,
  });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [searchTerm, setSearchTerm]     = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [isNewOpen, setIsNewOpen]   = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => { fetchBills(); fetchStats(); }, []);

  const fetchBills = async () => {
    try {
      setLoading(true); setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch bills");
      setBills(data.data || []);
    } catch (err) {
      console.error(err); setError(err.message);
    } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/bills/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) { console.error(err); }
  };

  const fetchBillById = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/bills/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) { console.error(err); return null; }
  };

  /* ---------- handlers ---------- */
  const handleView = async (bill) => {
    const full = await fetchBillById(bill.id);
    if (full) { setSelectedBill(full); setIsViewOpen(true); }
  };

  const handleEdit = async (bill) => {
    const full = await fetchBillById(bill.id);
    if (full) { setSelectedBill(full); setIsEditOpen(true); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/bills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) { fetchBills(); fetchStats(); }
    } catch (err) { console.error(err); }
  };

  const handleMarkPaid = async (bill) => {
    if (!window.confirm(`Mark ${bill.bill_number} as paid?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/bills/${bill.id}/pay`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { fetchBills(); fetchStats(); }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (bill) => {
    if (!window.confirm(`Delete ${bill.bill_number}? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/bills/${bill.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { fetchBills(); fetchStats(); }
    } catch (err) { console.error(err); }
  };

  /* ---------- filter ---------- */
  const filteredBills = bills
    .filter((b) => statusFilter === "all" ? true : b.status === statusFilter)
    .filter((b) => {
      const s = searchTerm.toLowerCase();
      if (!s) return true;
      return (
        b.bill_number?.toLowerCase().includes(s) ||
        b.vendor_name?.toLowerCase().includes(s) ||
        b.subject?.toLowerCase().includes(s)
      );
    });

  return (
    <div className="px-6 py-6">
      <BillsHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onNewBill={() => setIsNewOpen(true)}
        stats={stats}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <div className="mt-6 rounded-[16px] border border-[#e5e7eb] bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading bills...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <BillsTable
            bills={filteredBills}
            onStatusChange={handleStatusChange}
            onMarkPaid={handleMarkPaid}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <NewBillModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        onCreated={() => { setIsNewOpen(false); fetchBills(); fetchStats(); }}
      />

      <ViewBillModal
        isOpen={isViewOpen}
        onClose={() => { setIsViewOpen(false); setSelectedBill(null); }}
        bill={selectedBill}
        onEdit={() => { setIsViewOpen(false); setIsEditOpen(true); }}
      />

      <EditBillModal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedBill(null); }}
        bill={selectedBill}
        onUpdated={() => { setIsEditOpen(false); setSelectedBill(null); fetchBills(); fetchStats(); }}
      />
    </div>
  );
}
