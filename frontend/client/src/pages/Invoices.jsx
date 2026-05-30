import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import InvoicesHeader from "../components/invoices/InvoicesHeader";
import InvoiceStatsCards from "../components/invoices/InvoiceStatsCards";
import InvoiceTabs from "../components/invoices/InvoiceTabs";
import InvoicesTable from "../components/invoices/InvoicesTable";
import NewInvoiceModal from "../components/invoices/NewInvoiceModal";
import ViewInvoiceModal from "../components/invoices/ViewInvoiceModal";
import EditInvoiceModal from "../components/invoices/EditInvoiceModal";
import DeleteInvoiceModal from "../components/invoices/DeleteInvoiceModal";
import GenerateFromRentals from "../components/invoices/GenerateFromRentals";
import { printInvoice } from "../utils/printInvoice";

export default function Invoices() {
  const location = useLocation();

  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    all: 0,
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Invoices");
  const [cardFilter, setCardFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
    fetchInvoiceStats();
  }, []);

  // Read navigation state (from AlertsWarnings or Topbar Create New)
  useEffect(() => {
    if (location.state?.activeFilter) {
      setCardFilter(location.state.activeFilter);
      setActiveTab("Invoices");
      setSearchTerm("");
    }
    if (location.state?.openAddModal) {
      setIsNewOpen(true);
    }
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/invoices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch invoices");
      }
      setInvoices(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/invoices/stats", {
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

  const fetchInvoiceById = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch invoice");
      }
      return data.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleView = async (invoice) => {
    const fullInvoice = await fetchInvoiceById(invoice.id);
    if (fullInvoice) {
      setSelectedInvoice(fullInvoice);
      setIsViewOpen(true);
    }
  };

  const handleEdit = async (invoice) => {
    const fullInvoice = await fetchInvoiceById(invoice.id);
    if (fullInvoice) {
      setSelectedInvoice(fullInvoice);
      setIsEditOpen(true);
    }
  };

  const handleDelete = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteOpen(true);
  };

  const handlePrint = async (invoice) => {
    const fullInvoice = await fetchInvoiceById(invoice.id);
    if (fullInvoice) {
      printInvoice(fullInvoice);
    }
  };

  const handleMarkPaid = async (invoice) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/invoices/${invoice.id}/pay`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to mark invoice paid");
      }
      fetchInvoices();
      fetchInvoiceStats();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleCardFilterChange = (filter) => {
    setCardFilter(filter);
    setSearchTerm("");
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        invoice.invoiceNumber?.toLowerCase().includes(search) ||
        invoice.customerName?.toLowerCase().includes(search) ||
        invoice.customerEmail?.toLowerCase().includes(search);

      const matchesCard =
        cardFilter === "all" || invoice.status === cardFilter;

      return matchesSearch && matchesCard;
    });
  }, [invoices, searchTerm, cardFilter]);

  return (
    <div className="px-6 py-6">
      <InvoicesHeader
        searchTerm={searchTerm}
        setSearchTerm={(val) => {
          setSearchTerm(val);
          setCardFilter("all");
        }}
        onNewInvoice={() => setIsNewOpen(true)}
      />

      <InvoiceStatsCards
        stats={stats}
        activeFilter={cardFilter}
        onFilterChange={handleCardFilterChange}
      />

      <InvoiceTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "Invoices" ? (
        <div className="mt-10 rounded-[16px] border border-[#e5e7eb] bg-white overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading invoices...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              No {cardFilter !== "all" ? cardFilter : ""} invoices found.
            </div>
          ) : (
            <InvoicesTable
              invoices={filteredInvoices}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMarkPaid={handleMarkPaid}
              onPrint={handlePrint}
            />
          )}
        </div>
      ) : (
        <GenerateFromRentals
          onGenerated={() => {
            fetchInvoices();
            fetchInvoiceStats();
            setActiveTab("Invoices");
          }}
        />
      )}

      <NewInvoiceModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        onCreated={() => {
          setIsNewOpen(false);
          fetchInvoices();
          fetchInvoiceStats();
        }}
      />

      <ViewInvoiceModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        invoice={selectedInvoice}
      />

      <EditInvoiceModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        invoice={selectedInvoice}
        onUpdated={() => {
          setIsEditOpen(false);
          setSelectedInvoice(null);
          fetchInvoices();
          fetchInvoiceStats();
        }}
      />

      <DeleteInvoiceModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        invoice={selectedInvoice}
        onDeleted={() => {
          setIsDeleteOpen(false);
          setSelectedInvoice(null);
          fetchInvoices();
          fetchInvoiceStats();
        }}
      />
    </div>
  );
}
