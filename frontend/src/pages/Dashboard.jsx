import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { formatMoney } from "../utils/formatters";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const data = await api.getDashboard();
      setDashboard(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const data = await api.getDashboard();
        if (isMounted) {
          setDashboard(data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load dashboard data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-state">
          Loading your financial overview...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-message">
          <span>✕</span> {error}
        </div>
        <button
          type="button"
          className="primary-button"
          style={{ marginTop: "16px" }}
          onClick={() => {
            setLoading(true);
            loadDashboard();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const categoryEntries = Object.entries(dashboard.category_totals || {});

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Financial Dashboard</h1>
          <p>Real-time overview of your income, expenses, and savings</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">₹</div>
          <div>
            <p className="stat-label">Net Balance</p>
            <h2>{formatMoney(dashboard.balance)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon income-icon">↑</div>
          <div>
            <p className="stat-label">Total Income</p>
            <h2>{formatMoney(dashboard.total_income)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon expense-icon">↓</div>
          <div>
            <p className="stat-label">Total Expenses</p>
            <h2>{formatMoney(dashboard.total_expenses)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">#</div>
          <div>
            <p className="stat-label">Total Transactions</p>
            <h2>{dashboard.transaction_count}</h2>
          </div>
        </div>
      </div>

      {/* LOWER SECTION */}
      <div className="dashboard-grid">
        {/* SPENDING BY CATEGORY */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Spending by Category</h2>
              <p>Expense breakdown across all categories</p>
            </div>
          </div>

          {categoryEntries.length === 0 ? (
            <div className="empty-state">
              <h3>No expense data</h3>
              <p>Add your first expense transaction to view category insights.</p>
            </div>
          ) : (
            <div className="category-list">
              {categoryEntries.map(([category, amount]) => {
                const percentage = dashboard.total_expenses
                  ? Math.min(100, Math.round((amount / dashboard.total_expenses) * 100))
                  : 0;

                return (
                  <div className="category-row" key={category}>
                    <div className="category-info">
                      <span className="category-name">{category}</span>
                      <span className="category-amount">{formatMoney(amount)}</span>
                    </div>

                    <div className="category-bar">
                      <div
                        className="category-bar-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Recent Transactions</h2>
              <p>Latest financial activity</p>
            </div>
          </div>

          {dashboard.recent_transactions.length === 0 ? (
            <div className="empty-state">
              <h3>No transactions yet</h3>
              <p>Your recorded transactions will appear here.</p>
            </div>
          ) : (
            <div className="recent-transactions">
              {dashboard.recent_transactions.map((tx) => (
                <div className="recent-transaction" key={tx.id}>
                  <div>
                    <strong>{tx.description}</strong>
                    <span>{tx.category} • {tx.transaction_date}</span>
                  </div>

                  <div
                    className={
                      tx.transaction_type === "Income"
                        ? "income-amount"
                        : "expense-amount"
                    }
                  >
                    {tx.transaction_type === "Income" ? "+" : "-"} {formatMoney(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
