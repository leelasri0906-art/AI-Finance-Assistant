import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { formatMoney } from "../utils/formatters";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const data = await api.getAnalytics();
        if (isMounted) {
          setAnalytics(data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load analytics");
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
      <div className="analytics-page">
        <div className="loading-state">Loading financial analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="error-message">
          <span>✕</span> {error}
        </div>
        <button
          type="button"
          className="primary-button"
          style={{ marginTop: "16px" }}
          onClick={() => {
            setLoading(true);
            loadAnalytics();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const categoryEntries = Object.entries(analytics.category_totals || {});
  const monthlyExpenses = analytics.monthly_expenses || [];
  const maxMonthly = Math.max(
    ...monthlyExpenses.map((m) => m.amount),
    1
  );

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Financial Analytics</h1>
          <p>Detailed breakdown of your spending behavior and monthly trends</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">₹</div>
          <div>
            <p className="stat-label">Total Recorded Income</p>
            <h2>{formatMoney(analytics.total_income)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon expense-icon">↓</div>
          <div>
            <p className="stat-label">Total Recorded Expenses</p>
            <h2>{formatMoney(analytics.total_expenses)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">~</div>
          <div>
            <p className="stat-label">Average Expense</p>
            <h2>{formatMoney(analytics.average_expense)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">#</div>
          <div>
            <p className="stat-label">Total Transactions</p>
            <h2>{analytics.transaction_count}</h2>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* MONTHLY EXPENSES BAR CHART */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Monthly Spending Trends</h2>
              <p>Historical expense totals month-over-month</p>
            </div>
          </div>

          {monthlyExpenses.length === 0 ? (
            <div className="empty-state">
              <h3>No monthly data</h3>
              <p>Recorded expenses will show monthly distribution here.</p>
            </div>
          ) : (
            <div style={{ marginTop: "24px" }}>
              {monthlyExpenses.map((m) => {
                const barWidth = Math.round((m.amount / maxMonthly) * 100);
                return (
                  <div key={m.month} style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <strong>{m.month}</strong>
                      <span style={{ color: "#a5b4fc", fontWeight: "600" }}>
                        {formatMoney(m.amount)}
                      </span>
                    </div>
                    <div className="category-bar">
                      <div
                        className="category-bar-fill"
                        style={{
                          width: `${barWidth}%`,
                          background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CATEGORY DISTRIBUTION */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Expense by Category</h2>
              <p>All-time categorized spending</p>
            </div>
          </div>

          {categoryEntries.length === 0 ? (
            <div className="empty-state">
              <h3>No category data</h3>
              <p>Categorized spending will appear here.</p>
            </div>
          ) : (
            <div className="category-list">
              {categoryEntries.map(([cat, amt]) => {
                const pct = analytics.total_expenses
                  ? Math.round((amt / analytics.total_expenses) * 100)
                  : 0;

                return (
                  <div className="category-row" key={cat}>
                    <div className="category-info">
                      <span className="category-name">{cat}</span>
                      <span className="category-amount">{formatMoney(amt)} ({pct}%)</span>
                    </div>

                    <div className="category-bar">
                      <div
                        className="category-bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
