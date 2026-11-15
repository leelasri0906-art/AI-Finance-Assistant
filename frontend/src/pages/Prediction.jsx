import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { formatMoney } from "../utils/formatters";

function Prediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPrediction = useCallback(async () => {
    try {
      const data = await api.getPrediction();
      setPrediction(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load prediction");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const data = await api.getPrediction();
        if (isMounted) {
          setPrediction(data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load prediction");
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
          Analyzing your spending history with ML forecasting...
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
            loadPrediction();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!prediction || !prediction.has_data) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <div>
            <h1>Spending Prediction</h1>
            <p>AI-driven monthly expenditure forecast based on past trends</p>
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "40px", textAlign: "center" }}>
          <div className="empty-state">
            <h3>No predictive data available yet</h3>
            <p>{prediction?.message || "Record expense transactions over at least one month to view forecasts."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Spending Prediction</h1>
          <p>AI-driven monthly expenditure forecast based on past patterns</p>
        </div>
      </div>

      {/* PREDICTION HERO CARD */}
      <div
        className="dashboard-card prediction-card"
        style={{
          padding: "32px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.05))",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          marginBottom: "24px",
        }}
      >
        <span className="ai-badge">AI FORECAST</span>
        <h2 style={{ fontSize: "16px", marginTop: "12px", color: "#a5b4fc" }}>
          Predicted Next Month Spending
        </h2>
        <div className="prediction-value" style={{ fontSize: "38px", color: "#ffffff", margin: "14px 0" }}>
          {formatMoney(prediction.predicted_monthly_expense)}
        </div>
        <p style={{ color: "#9ca3af", maxWidth: "600px" }}>
          Based on <strong>{prediction.months_analyzed}</strong> month(s) of historical activity,
          your average monthly expenditure is <strong>{formatMoney(prediction.average_monthly_expense)}</strong>.
        </p>
      </div>

      {/* STATS HIGHLIGHT */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">#</div>
          <div>
            <p className="stat-label">Months Analyzed</p>
            <h2>{prediction.months_analyzed}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">~</div>
          <div>
            <p className="stat-label">Average Monthly</p>
            <h2>{formatMoney(prediction.average_monthly_expense)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon expense-icon">↑</div>
          <div>
            <p className="stat-label">Highest Month ({prediction.highest_spending_month?.month})</p>
            <h2>{formatMoney(prediction.highest_spending_month?.amount)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon income-icon">↓</div>
          <div>
            <p className="stat-label">Lowest Month ({prediction.lowest_spending_month?.month})</p>
            <h2>{formatMoney(prediction.lowest_spending_month?.amount)}</h2>
          </div>
        </div>
      </div>

      {/* MONTHLY HISTORY USED FOR MODEL */}
      {prediction.monthly_expenses?.length > 0 && (
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Model Training Inputs</h2>
              <p>Historical monthly aggregates used to calibrate predictions</p>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            {prediction.monthly_expenses.map((m) => (
              <div
                key={m.month}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                <span>{m.month}</span>
                <strong>{formatMoney(m.amount)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Prediction;
