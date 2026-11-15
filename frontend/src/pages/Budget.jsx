import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { formatMoney } from "../utils/formatters";

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Other",
  ];

  const fetchBudgets = useCallback(async () => {
    try {
      const data = await api.getBudgets();
      setBudgets(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch budgets");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const data = await api.getBudgets();
        if (isMounted) {
          setBudgets(data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to fetch budgets");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid budget amount greater than 0.");
      return;
    }

    setLoading(true);

    try {
      await api.createBudget({
        category,
        amount: numAmount,
        month,
      });

      setMessage(`Budget for ${category} (${month}) saved successfully!`);
      setAmount("");
      await fetchBudgets();
    } catch (err) {
      setError(err.message || "Failed to set budget");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) {
      return;
    }

    try {
      await api.deleteBudget(id);
      setMessage("Budget removed successfully.");
      await fetchBudgets();
    } catch (err) {
      setError(err.message || "Failed to delete budget");
    }
  };

  return (
    <div className="budget-page">
      <div className="page-header">
        <div>
          <h1>Budget Planner</h1>
          <p>Set spending targets per category and monitor your monthly progress</p>
        </div>
      </div>

      {/* CREATE BUDGET FORM */}
      <div className="transaction-form-card">
        <h2>Set Monthly Category Budget</h2>

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
              <label htmlFor="budget-category">Category</label>
              <select
                id="budget-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="budget-amount">Monthly Limit (₹)</label>
              <input
                id="budget-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="budget-month">Target Month</label>
              <input
                id="budget-month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="add-transaction-btn"
            disabled={loading}
          >
            {loading ? "Saving Budget..." : "Save Budget"}
          </button>
        </form>
      </div>

      {/* BUDGET PROGRESS CARDS */}
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <h2>Active Budgets & Progress</h2>
            <p>Real-time spending vs. allocated limits</p>
          </div>
        </div>

        {fetching ? (
          <div className="loading-state">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="empty-state">
            <h3>No budgets set</h3>
            <p>Set a monthly budget above to prevent overspending in any category.</p>
          </div>
        ) : (
          <div className="category-list">
            {budgets.map((b) => {
              const isOverBudget = b.spent > b.amount;
              const isNearLimit = b.percentage >= 80 && !isOverBudget;

              return (
                <div
                  className="category-row"
                  key={b.id}
                  style={{
                    padding: "16px",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    className="category-info"
                    style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}
                  >
                    <div>
                      <strong style={{ fontSize: "15px" }}>{b.category}</strong>
                      <span style={{ color: "#777", fontSize: "12px", marginLeft: "10px" }}>
                        ({b.month})
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span
                        style={{
                          color: isOverBudget
                            ? "#ef4444"
                            : isNearLimit
                            ? "#f59e0b"
                            : "#10b981",
                          fontWeight: "600",
                        }}
                      >
                        {formatMoney(b.spent)} / {formatMoney(b.amount)} ({b.percentage.toFixed(0)}%)
                      </span>

                      <button
                        type="button"
                        className="secondary-button"
                        style={{
                          padding: "2px 8px",
                          fontSize: "11px",
                          marginTop: 0,
                          color: "#f87171",
                          borderColor: "rgba(248, 113, 113, 0.3)",
                        }}
                        onClick={() => handleDelete(b.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="category-bar">
                    <div
                      className="category-bar-fill"
                      style={{
                        width: `${Math.min(100, b.percentage)}%`,
                        background: isOverBudget
                          ? "#ef4444"
                          : isNearLimit
                          ? "#f59e0b"
                          : "#10b981",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "12px", color: "#888" }}>
                    <span>
                      {isOverBudget
                        ? `Over budget by ${formatMoney(Math.abs(b.remaining))}`
                        : `${formatMoney(b.remaining)} remaining`}
                    </span>
                    <span>{b.percentage.toFixed(1)}% used</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Budget;
