import React, { useEffect, useState } from "react";
import ExpensesHeader from "../components/expenses/ExpensesHeader";
import ExpensesTable from "../components/expenses/ExpensesTable";
import NewExpenseModal from "../components/expenses/NewExpenseModal";
import ViewExpenseModal from "../components/expenses/ViewExpenseModal";
import EditExpenseModal from "../components/expenses/EditExpenseModal";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch expenses");
      }

      setExpenses(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseById = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) return data.data;
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleView = async (expense) => {
    const full = await fetchExpenseById(expense.id);
    if (full) {
      setSelectedExpense(full);
      setIsViewOpen(true);
    }
  };

  const handleEdit = async (expense) => {
    const full = await fetchExpenseById(expense.id);
    if (full) {
      setSelectedExpense(full);
      setIsEditOpen(true);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/expenses/${expenseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const search = searchTerm.toLowerCase();
    return (
      expense.expense_account?.toLowerCase().includes(search) ||
      expense.vendor_name?.toLowerCase().includes(search) ||
      expense.customer_name?.toLowerCase().includes(search) ||
      expense.reference_number?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="px-6 py-6">
      <ExpensesHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onNewExpense={() => setIsNewOpen(true)}
      />

      <div className="mt-6 rounded-[16px] border border-[#e5e7eb] bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading expenses...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No expenses found.
          </div>
        ) : (
          <ExpensesTable
            expenses={filteredExpenses}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <NewExpenseModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        onCreated={() => {
          setIsNewOpen(false);
          fetchExpenses();
        }}
      />

      <ViewExpenseModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
      />

      <EditExpenseModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onUpdated={() => {
          setIsEditOpen(false);
          setSelectedExpense(null);
          fetchExpenses();
        }}
      />
    </div>
  );
}