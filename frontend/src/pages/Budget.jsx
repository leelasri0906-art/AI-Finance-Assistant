import { useEffect, useState } from "react";

function Budget() {

  const [budgets, setBudgets] = useState([]);

  const [category, setCategory] = useState("Food");

  const [amount, setAmount] = useState("");

  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;


  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health"
  ];


  // =====================================================
  // FETCH BUDGETS
  // =====================================================

  const fetchBudgets = async () => {

    try {

      setError("");

      const token =
        localStorage.getItem("access_token");

      if (!token) {

        setError("You are not logged in.");

        return;
      }


      const response = await fetch(
        `${API_URL}/api/budgets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to fetch budgets"
        );
      }


      setBudgets(data);

    } catch (err) {

      console.error(err);

      setError(err.message);

    }
  };


  useEffect(() => {

    fetchBudgets();

  }, []);


  // =====================================================
  // CREATE BUDGET
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");

    if (!amount || Number(amount) <= 0) {

      setError(
        "Please enter a valid budget amount."
      );

      return;
    }


    setLoading(true);


    try {

      const token =
        localStorage.getItem("access_token");


      const response = await fetch(
        `${API_URL}/api/budgets`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            category,
            amount: Number(amount),
            month,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to create budget"
        );
      }


      setMessage(
        "Budget created successfully."
      );

      setAmount("");

      await fetchBudgets();

    } catch (err) {

      console.error(err);

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // DELETE BUDGET
  // =====================================================

  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Delete this budget?"
    );

    if (!confirmed) {
      return;
    }


    try {

      const token =
        localStorage.getItem("access_token");


      const response = await fetch(
        `${API_URL}/api/budgets/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to delete budget"
        );
      }


      setMessage(
        "Budget deleted successfully."
      );

      await fetchBudgets();

    } catch (err) {

      console.error(err);

      setError(err.message);

    }
  };


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


  return (

    <div className="budget-page">

      <div className="page-header">

        <div>

          <h1>
            Budget Management
          </h1>

          <p>
            Set spending limits and track
            your progress
          </p>

        </div>

      </div>


      {/* CREATE BUDGET */}

      <div className="budget-form-card">

        <h2>
          Create Budget
        </h2>


        <form onSubmit={handleSubmit}>

          <div className="form-row">

            <div className="form-group">

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >

                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

            </div>


            <div className="form-group">

              <label>
                Monthly Budget
              </label>

              <input
                type="number"
                min="1"
                placeholder="5000"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label>
                Month
              </label>

              <input
                type="month"
                value={month}
                onChange={(e) =>
                  setMonth(e.target.value)
                }
              />

            </div>

          </div>


          <button
            type="submit"
            className="add-transaction-btn"
            disabled={loading}
          >

            {loading
              ? "Creating..."
              : "Create Budget"}

          </button>

        </form>


        {message && (
          <div className="success-message">
            ✓ {message}
          </div>
        )}


        {error && (
          <div className="error-message">
            ✕ {error}
          </div>
        )}

      </div>


      {/* BUDGET LIST */}

      <div className="budget-list">

        <div className="section-header">

          <div>

            <h2>
              Your Budgets
            </h2>

            <p>
              Track your spending against
              your limits
            </p>

          </div>

        </div>


        {budgets.length === 0 ? (

          <div className="empty-state">

            <h3>
              No budgets yet
            </h3>

            <p>
              Create your first monthly
              budget above.
            </p>

          </div>

        ) : (

          <div className="budget-grid">

            {budgets.map((budget) => (

              <div
                className="budget-card"
                key={budget.id}
              >

                <div className="budget-card-top">

                  <div>

                    <h3>
                      {budget.category}
                    </h3>

                    <p>
                      {budget.month}
                    </p>

                  </div>


                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(
                        budget.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>


                <div className="budget-money">

                  <div>

                    <span>
                      Budget
                    </span>

                    <strong>
                      {formatMoney(
                        budget.amount
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Spent
                    </span>

                    <strong>
                      {formatMoney(
                        budget.spent
                      )}
                    </strong>

                  </div>

                </div>


                <div className="budget-progress">

                  <div className="budget-progress-header">

                    <span>
                      {budget.percentage}%
                    </span>

                    <span>
                      {formatMoney(
                        budget.remaining
                      )} remaining
                    </span>

                  </div>


                  <div className="budget-progress-bar">

                    <div
                      className={
                        budget.percentage >= 100
                          ? "budget-progress-fill danger"
                          : budget.percentage >= 80
                          ? "budget-progress-fill warning"
                          : "budget-progress-fill"
                      }
                      style={{
                        width: `${Math.min(
                          budget.percentage,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>


                {budget.percentage >= 100 && (

                  <div className="budget-warning">

                    ⚠ Budget exceeded

                  </div>

                )}

                {budget.percentage >= 80 &&
                  budget.percentage < 100 && (

                    <div className="budget-warning">

                      ⚠ You are approaching
                      your budget limit

                    </div>

                  )}

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Budget;