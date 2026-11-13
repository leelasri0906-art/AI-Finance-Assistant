import { useEffect, useState } from "react";

function Dashboard() {

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:8000";


  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  const fetchDashboard = async () => {

    try {

      setError("");

      const token =
        localStorage.getItem("access_token");

      if (!token) {

        setError("You are not logged in.");

        return;
      }


      const response = await fetch(
        `${API_URL}/api/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {

        if (response.status === 401) {

          localStorage.removeItem(
            "access_token"
          );

          throw new Error(
            "Your session has expired."
          );
        }

        throw new Error(
          data.detail ||
          "Failed to load dashboard"
        );
      }


      setDashboard(data);

    } catch (err) {

      console.error(err);

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {

    fetchDashboard();

  }, []);


  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (amount) => {

    return `₹${Number(amount).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="dashboard-page">

        <div className="loading-state">
          Loading your financial data...
        </div>

      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (
      <div className="dashboard-page">

        <div className="error-message">
          ✕ {error}
        </div>

      </div>
    );
  }


  if (!dashboard) {
    return null;
  }


  // =====================================================
  // DATA
  // =====================================================

  const categoryEntries =
    Object.entries(
      dashboard.category_totals || {}
    );


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="dashboard-page">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <h1>
            Financial Dashboard
          </h1>

          <p>
            Here's your current financial overview
          </p>

        </div>

      </div>


      {/* STAT CARDS */}

      <div className="stats-grid">

        {/* BALANCE */}

        <div className="stat-card">

          <div className="stat-card-icon">
            ₹
          </div>

          <div>

            <p className="stat-label">
              Total Balance
            </p>

            <h2>
              {formatMoney(
                dashboard.balance
              )}
            </h2>

          </div>

        </div>


        {/* INCOME */}

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
                dashboard.total_income
              )}
            </h2>

          </div>

        </div>


        {/* EXPENSES */}

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
                dashboard.total_expenses
              )}
            </h2>

          </div>

        </div>


        {/* TRANSACTIONS */}

        <div className="stat-card">

          <div className="stat-card-icon">
            #
          </div>

          <div>

            <p className="stat-label">
              Transactions
            </p>

            <h2>
              {dashboard.transaction_count}
            </h2>

          </div>

        </div>

      </div>


      {/* LOWER SECTION */}

      <div className="dashboard-grid">


        {/* SPENDING BY CATEGORY */}

        <div className="dashboard-card">

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


          {categoryEntries.length === 0 ? (

            <div className="empty-state">

              <h3>
                No expense data
              </h3>

              <p>
                Add an expense to see
                category analysis.
              </p>

            </div>

          ) : (

            <div className="category-list">

              {categoryEntries.map(
                ([category, amount]) => (

                  <div
                    className="category-row"
                    key={category}
                  >

                    <div className="category-info">

                      <span className="category-name">
                        {category}
                      </span>

                      <span className="category-amount">
                        {formatMoney(amount)}
                      </span>

                    </div>


                    <div className="category-bar">

                      <div
                        className="category-bar-fill"
                        style={{
                          width: `${
                            dashboard.total_expenses
                              ? (
                                  (amount /
                                    dashboard.total_expenses) *
                                  100
                                )
                              : 0
                          }%`,
                        }}
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* RECENT TRANSACTIONS */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h2>
                Recent Transactions
              </h2>

              <p>
                Latest financial activity
              </p>

            </div>

          </div>


          {dashboard.recent_transactions
            .length === 0 ? (

            <div className="empty-state">

              <h3>
                No transactions
              </h3>

              <p>
                Your recent transactions
                will appear here.
              </p>

            </div>

          ) : (

            <div className="recent-transactions">

              {dashboard.recent_transactions.map(
                (transaction) => (

                  <div
                    className="recent-transaction"
                    key={transaction.id}
                  >

                    <div>

                      <strong>
                        {transaction.description}
                      </strong>

                      <span>
                        {transaction.category}
                      </span>

                    </div>


                    <div
                      className={
                        transaction.transaction_type ===
                        "Income"
                          ? "income-amount"
                          : "expense-amount"
                      }
                    >

                      {transaction.transaction_type ===
                      "Income"
                        ? "+"
                        : "-"}{" "}

                      {formatMoney(
                        transaction.amount
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;