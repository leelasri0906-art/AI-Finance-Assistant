import { useEffect, useState } from "react";

function Prediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPrediction();
  }, []);

  const fetchPrediction = async () => {
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
        `${API_URL}/api/prediction`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to load prediction"
        );
      }

      setPrediction(data);

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
          Analyzing your spending history...
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

  if (!prediction) {
    return null;
  }

  if (!prediction.has_data) {
    return (
      <div className="analytics-page">

        <div className="page-header">
          <div>
            <h1>Spending Prediction</h1>

            <p>
              Predict your future spending
              using your transaction history
            </p>
          </div>
        </div>

        <div className="analytics-card">

          <div className="empty-state">

            <h3>
              Not enough data
            </h3>

            <p>
              {prediction.message}
            </p>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="analytics-page">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <h1>
            Spending Prediction
          </h1>

          <p>
            Estimate your future monthly
            spending from your actual
            transaction history
          </p>

        </div>

      </div>


      {/* MAIN PREDICTION */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-card-icon">
            ₹
          </div>

          <div>

            <p className="stat-label">
              Predicted Monthly Spending
            </p>

            <h2>
              {formatMoney(
                prediction
                  .predicted_monthly_expense
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
              Average Monthly Spending
            </p>

            <h2>
              {formatMoney(
                prediction
                  .average_monthly_expense
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
              Months Analyzed
            </p>

            <h2>
              {prediction.months_analyzed}
            </h2>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-card-icon">
            ₹
          </div>

          <div>

            <p className="stat-label">
              Total Spending
            </p>

            <h2>
              {formatMoney(
                prediction.total_spending
              )}
            </h2>

          </div>

        </div>

      </div>


      {/* SPENDING HISTORY */}

      <div className="analytics-card">

        <div className="card-header">

          <div>

            <h2>
              Monthly Spending History
            </h2>

            <p>
              Data used for the prediction
            </p>

          </div>

        </div>


        <div className="monthly-list">

          {prediction.monthly_expenses.map(
            (item) => {

              const maxExpense =
                Math.max(
                  ...prediction.monthly_expenses.map(
                    (month) =>
                      Number(month.amount)
                  )
                );

              const width =
                maxExpense > 0
                  ? (
                      Number(item.amount) /
                      maxExpense
                    ) * 100
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
                        width:
                          `${width}%`,
                      }}
                    />

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* INSIGHTS */}

      <div className="analytics-card">

        <div className="card-header">

          <div>

            <h2>
              Prediction Insights
            </h2>

            <p>
              Summary of your spending pattern
            </p>

          </div>

        </div>


        <div className="analytics-category-list">

          <div className="analytics-category">

            <div className="analytics-category-header">

              <span>
                Highest Spending Month
              </span>

              <strong>
                {
                  prediction
                    .highest_spending_month
                    .month
                }
                {" — "}
                {formatMoney(
                  prediction
                    .highest_spending_month
                    .amount
                )}
              </strong>

            </div>

          </div>


          <div className="analytics-category">

            <div className="analytics-category-header">

              <span>
                Lowest Spending Month
              </span>

              <strong>
                {
                  prediction
                    .lowest_spending_month
                    .month
                }
                {" — "}
                {formatMoney(
                  prediction
                    .lowest_spending_month
                    .amount
                )}
              </strong>

            </div>

          </div>


          <div className="analytics-category">

            <div className="analytics-category-header">

              <span>
                Latest Month
              </span>

              <strong>
                {prediction.latest_month}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Prediction;