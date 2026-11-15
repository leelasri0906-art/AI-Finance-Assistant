import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { formatMoney } from "../utils/formatters";

function AIInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInsights = useCallback(async () => {
    try {
      const result = await api.getInsights();
      setData(result);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load AI insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const result = await api.getInsights();
        if (isMounted) {
          setData(result);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load AI insights");
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
        <div className="loading-state">
          Analyzing your financial activity and generating AI insights...
        </div>
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
            loadInsights();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || !data.has_data) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <div>
            <h1>AI Financial Insights</h1>
            <p>Smart automated recommendations and spending risk detection</p>
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "40px", textAlign: "center" }}>
          <div className="empty-state">
            <h3>No financial activity recorded yet</h3>
            <p>Record transactions to receive AI-powered spending insights and optimizations.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>AI Financial Insights</h1>
          <p>Automated heuristics, spending analysis, and financial health scores</p>
        </div>
      </div>

      {/* SUMMARY OVERVIEW */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon income-icon">↑</div>
          <div>
            <p className="stat-label">Net Income</p>
            <h2>{formatMoney(data.summary?.income)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon expense-icon">↓</div>
          <div>
            <p className="stat-label">Total Outflows</p>
            <h2>{formatMoney(data.summary?.expenses)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">₹</div>
          <div>
            <p className="stat-label">Net Surplus / Savings</p>
            <h2>{formatMoney(data.summary?.balance)}</h2>
          </div>
        </div>
      </div>

      {/* INSIGHT CARDS */}
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <h2>Detected Observations & Actions</h2>
            <p>Key highlights generated from your recent spending distribution</p>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          {data.insights.map((item, idx) => (
            <div
              key={idx}
              className="insight"
              style={{
                display: "flex",
                gap: "16px",
                padding: "16px",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "12px",
                marginBottom: "14px",
                borderLeft: `4px solid ${
                  item.type === "danger"
                    ? "#ef4444"
                    : item.type === "warning"
                    ? "#f59e0b"
                    : item.type === "success"
                    ? "#10b981"
                    : "#6366f1"
                }`,
              }}
            >
              <div
                className={`insight-icon ${item.type}`}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}
              >
                {item.type === "danger"
                  ? "⚠"
                  : item.type === "warning"
                  ? "⚡"
                  : item.type === "success"
                  ? "✓"
                  : "ℹ"}
              </div>

              <div>
                <strong style={{ fontSize: "15px", display: "block", marginBottom: "4px" }}>
                  {item.title}
                </strong>
                <p style={{ color: "#9ca3af", lineHeight: "1.5", fontSize: "14px" }}>
                  {item.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIInsights;
