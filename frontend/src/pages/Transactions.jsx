import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { formatMoney } from "../utils/formatters";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("Expense");
  const [category, setCategory] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("All");

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Income",
    "Other",
  ];

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await api.getTransactions();
      setTransactions(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch transactions");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const data = await api.getTransactions();
        if (isMounted) {
          setTransactions(data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to fetch transactions");
        }
      } finally {
        if (isMounted) {
          setFetching(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const clearForm = () => {
    setDescription("");
    setAmount("");
    setTransactionType("Expense");
    setCategory("");
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setEditingId(null);
  };

  const handleStartEdit = (tx) => {
    setEditingId(tx.id);
    setDescription(tx.description);
    setAmount(String(tx.amount));
    setTransactionType(tx.transaction_type);
    setCategory(tx.category || "");
    setTransactionDate(tx.transaction_date);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!description.trim()) {
      setError("Please enter a transaction description.");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        description: description.trim(),
        amount: numAmount,
        transaction_type: transactionType,
        transaction_date: transactionDate,
        category: category.trim() || undefined,
      };

      if (editingId) {
        await api.updateTransaction(editingId, payload);
        setMessage("Transaction updated successfully!");
      } else {
        await api.createTransaction(payload);
        setMessage("Transaction added successfully (AI auto-categorized if empty)!");
      }

      clearForm();
      await fetchTransactions();
    } catch (err) {
      setError(err.message || "Failed to save transaction.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await api.deleteTransaction(id);
      setMessage("Transaction deleted successfully.");
      await fetchTransactions();
    } catch (err) {
      setError(err.message || "Failed to delete transaction.");
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "All") return true;
    return tx.transaction_type === filterType;
  });

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p>Add, edit, and track your financial transactions with AI auto-categorization</p>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="transaction-form-card">
        <h2>{editingId ? "Edit Transaction" : "Add New Transaction"}</h2>

        {error && (
          <div className="error-message" style={{ marginBottom: "16px" }}>
            <span>✕</span> {error}
          </div>
        )}

        {message && (
          <div className="success-message" style={{ marginBottom: "16px" }}>
            <span>✓</span> {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tx-desc">Description</label>
              <input
                id="tx-desc"
                type="text"
                placeholder="e.g. Swiggy dinner, Uber cab, Monthly salary..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tx-amt">Amount (₹)</label>
              <input
                id="tx-amt"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tx-type">Transaction Type</label>
              <select
                id="tx-type"
                value={transactionType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setTransactionType(newType);
                  if (newType === "Income" && !category) {
                    setCategory("Income");
                  }
                }}
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tx-cat">Category (Leave blank for AI auto-detection)</label>
              <select
                id="tx-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Auto-Detect via AI</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tx-date">Date</label>
              <input
                id="tx-date"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ justifyContent: "flex-end", flexDirection: "row", gap: "10px", alignItems: "flex-end" }}>
              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={clearForm}
                  style={{ height: "44px" }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="add-transaction-btn"
                disabled={loading}
                style={{ height: "44px", flex: 1 }}
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Transaction"
                  : "Add Transaction"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* TRANSACTION LIST */}
      <div className="dashboard-card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>Transaction History</h2>
            <p>{filteredTransactions.length} transaction(s) recorded</p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {["All", "Income", "Expense"].map((type) => (
              <button
                key={type}
                type="button"
                className={
                  filterType === type ? "primary-button" : "secondary-button"
                }
                style={{ padding: "6px 14px", fontSize: "12px", marginTop: 0 }}
                onClick={() => setFilterType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {fetching ? (
          <div className="loading-state">Loading transactions...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <h3>No transactions found</h3>
            <p>Add your income and expenses using the form above.</p>
          </div>
        ) : (
          <div className="transaction-list">
            {filteredTransactions.map((tx) => (
              <div className="transaction-row" key={tx.id}>
                <div>
                  <strong>{tx.description}</strong>
                  <span style={{ color: "#777", fontSize: "12px" }}>
                    {tx.category} • {tx.transaction_date}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span
                    className={
                      tx.transaction_type === "Income"
                        ? "income-amount"
                        : "expense-amount"
                    }
                    style={{ fontWeight: "600", fontSize: "15px" }}
                  >
                    {tx.transaction_type === "Income" ? "+" : "-"} {formatMoney(tx.amount)}
                  </span>

                  <button
                    type="button"
                    className="secondary-button"
                    style={{ padding: "4px 8px", fontSize: "11px", marginTop: 0 }}
                    onClick={() => handleStartEdit(tx)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    style={{
                      padding: "4px 8px",
                      fontSize: "11px",
                      marginTop: 0,
                      color: "#f87171",
                      borderColor: "rgba(248, 113, 113, 0.3)",
                    }}
                    onClick={() => handleDelete(tx.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;
