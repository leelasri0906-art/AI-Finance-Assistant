import { useEffect, useState } from "react";

function AIInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/insights`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            "Failed to load AI insights"
        );
      }

      setData(result);

    } catch (err) {
      console.error(err);
      setError(err.message);

    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return `₹${Number(amount).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-state">
          Analyzing your financial activity...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="error-message">
          ✕ {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  if (!data.has_data) {
    return (
      <div className="analytics-page">

        <div className="page-header">
          <div>

            <h1>
              AI Financial Insights
            </h1>

            <p>
              Personalized observations based
              on your financial activity
            </p>

          </div>
        </div>

        <div className="analytics-card">

          <div className="empty-state">

            <h3>
              No financial data yet
            </h3>

            <p>
              Add some income and expenses
              to generate financial insights.
            </p>

          </div>

        </div>

      </div>
    );
  }

  const insights = data.insights || [];

  const categories =
    data.category_totals || {};

  return (
    <div className="analytics-page">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <h1>
            AI Financial Insights
          </h1>

          <p>
            Personalized observations from
            your real financial data
          </p>

        </div>

      </div>


      {/* SUMMARY */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-card-icon">
            ↑
          </div>

          <div>

            <p className="stat-label">
              Total Income
            </p>

            <h2>
              {formatMoney(
                data.summary.income
              )}
            </h2>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-card-icon">
            ↓
          </div>

          <div>

            <p className="stat-label">
              Total Expenses
            </p>

            <h2>
              {formatMoney(
                data.summary.expenses
              )}
            </h2>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-card-icon">
            ₹
          </div>

          <div>

            <p className="stat-label">
              Current Balance
            </p>

            <h2>
              {formatMoney(
                data.summary.balance
              )}
            </h2>

          </div>

        </div>

      </div>


      {/* AI INSIGHTS */}

      <div className="analytics-card">

        <div className="card-header">

          <div>

            <h2>
              AI Insights
            </h2>

            <p>
              Important observations about
              your finances
            </p>

          </div>

        </div>


        <div className="analytics-category-list">

          {insights.map(
            (insight, index) => {

              let icon = "ℹ";

              if (
                insight.type === "success"
              ) {
                icon = "✓";
              }

              if (
                insight.type === "warning"
              ) {
                icon = "⚠";
              }

              if (
                insight.type === "danger"
              ) {
                icon = "✕";
              }

              return (
                <div
                  className="analytics-category"
                  key={index}
                >

                  <div
                    className="analytics-category-header"
                  >

                    <span>
                      {icon}{" "}
                      {insight.title}
                    </span>

                  </div>


                  <p
                    style={{
                      marginTop: "8px",
                      marginBottom: "0",
                      color: "#667085",
                      fontSize: "14px",
                      lineHeight: "1.6",
                    }}
                  >
                    {insight.message}
                  </p>

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* CATEGORY ANALYSIS */}

      <div className="analytics-card">

        <div className="card-header">

          <div>

            <h2>
              Spending by Category
            </h2>

            <p>
              Your expense distribution
            </p>

          </div>

        </div>


        {Object.keys(categories).length === 0 ? (

          <div className="empty-state">

            <p>
              No expense categories
              available.
            </p>

          </div>

        ) : (

          <div className="analytics-category-list">

            {Object.entries(
              categories
            ).map(
              ([category, amount]) => {

                const total =
                  Number(
                    data.summary.expenses
                  );

                const percentage =
                  total > 0
                    ? (
                        Number(amount) /
                        total
                      ) * 100
                    : 0;

                return (
                  <div
                    className="analytics-category"
                    key={category}
                  >

                    <div
                      className="analytics-category-header"
                    >

                      <span>
                        {category}
                      </span>

                      <strong>
                        {formatMoney(
                          amount
                        )}
                      </strong>

                    </div>


                    <div className="analytics-bar">

                      <div
                        className="analytics-bar-fill"
                        style={{
                          width:
                            `${percentage}%`,
                        }}
                      />

                    </div>


                    <div
                      className="analytics-percentage"
                    >
                      {percentage.toFixed(1)}
                      % of total expenses
                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default AIInsights;