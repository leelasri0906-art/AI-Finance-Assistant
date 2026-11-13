import { useEffect, useState } from "react";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  const fetchAnalytics = async () => {
    try {
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/analytics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          throw new Error(
            "Your session has expired. Please login again."
          );
        }

        throw new Error(
          data.detail || "Failed to load analytics"
        );
      }

      setAnalytics(data);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatMoney = (amount) => {
    return `₹${Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-state">
          Loading financial analytics...
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

  if (!analytics) {
    return null;
  }

  const categoryEntries = Object.entries(
    analytics.category_totals || {}
  );

  const monthlyExpenses =
    analytics.monthly_expenses || [];

  return (
    <div className="analytics-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>Analytics</h1>

          <p>
            Understand your income and spending patterns
          </p>
        </div>
      </div>


      {/* SUMMARY CARDS */}
      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-card-icon income-icon">
            ↑
          </div>

          <div>
            <p className="stat-label">
              Total Income
            </p>

            <h2>
              {formatMoney(
                analytics.total_income
              )}
            </h2>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-card-icon expense-icon">
            ↓
          </div>

          <div>
            <p className="stat-label">
              Total Expenses
            </p>

            <h2>
              {formatMoney(
                analytics.total_expenses
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
              Average Expense
            </p>

            <h2>
              {formatMoney(
                analytics.average_expense
              )}
            </h2>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-card-icon">
            #
          </div>

          <div>
            <p className="stat-label">
              Transactions
            </p>

            <h2>
              {analytics.transaction_count}
            </h2>
          </div>

        </div>

      </div>


      {/* CATEGORY ANALYSIS */}
      <div className="analytics-card">

        <div className="card-header">

          <div>
            <h2>
              Expense by Category
            </h2>

            <p>
              See where your money is going
            </p>
          </div>

        </div>


        {categoryEntries.length === 0 ? (

          <div className="empty-state">

            <h3>
              No expense data
            </h3>

            <p>
              Add some expenses to generate
              category analytics.
            </p>

          </div>

        ) : (

          <div className="analytics-category-list">

            {categoryEntries.map(
              ([category, amount]) => {

                const percentage =
                  analytics.total_expenses > 0
                    ? (
                        (amount /
                          analytics.total_expenses) *
                        100
                      )
                    : 0;

                return (
                  <div
                    className="analytics-category"
                    key={category}
                  >

                    <div className="analytics-category-header">

                      <span>
                        {category}
                      </span>

                      <strong>
                        {formatMoney(amount)}
                      </strong>

                    </div>


                    <div className="analytics-bar">

                      <div
                        className="analytics-bar-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>


                    <div className="analytics-percentage">

                      {percentage.toFixed(1)}%
                      {" "}of total expenses

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>


      {/* MONTHLY ANALYSIS */}
      <div className="analytics-card">

        <div className="card-header">

          <div>
            <h2>
              Monthly Spending
            </h2>

            <p>
              Your expense trend by month
            </p>
          </div>

        </div>


        {monthlyExpenses.length === 0 ? (

          <div className="empty-state">

            <h3>
              No monthly data
            </h3>

            <p>
              Add transactions to see
              monthly spending.
            </p>

          </div>

        ) : (

          <div className="monthly-list">

            {monthlyExpenses.map(
              (item) => {

                const maxExpense =
                  Math.max(
                    ...monthlyExpenses.map(
                      (month) =>
                        Number(month.amount)
                    )
                  );

                const width =
                  maxExpense > 0
                    ? (
                        (Number(item.amount) /
                          maxExpense) *
                        100
                      )
                    : 0;

                return (
                  <div
                    className="monthly-row"
                    key={item.month}
                  >

                    <div className="monthly-label">

                      <span>
                        {item.month}
                      </span>

                      <strong>
                        {formatMoney(
                          item.amount
                        )}
                      </strong>

                    </div>


                    <div className="monthly-bar">

                      <div
                        className="monthly-bar-fill"
                        style={{
                          width: `${width}%`,
                        }}
                      />

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

export default Analytics;