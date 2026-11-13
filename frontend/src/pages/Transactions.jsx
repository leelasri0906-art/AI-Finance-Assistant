import { useEffect, useState } from "react";

function Transactions() {
  const [transactions, setTransactions] = useState([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("Expense");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  // =====================================================
  // GET JWT TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("access_token");
  };


  // =====================================================
  // FETCH TRANSACTIONS
  // =====================================================

  const fetchTransactions = async () => {
    try {
      setError("");

      const token = getToken();

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/transactions`,
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
          throw new Error("Your session has expired. Please login again.");
        }

        throw new Error(
          data.detail || "Failed to fetch transactions"
        );
      }

      setTransactions(data);

    } catch (err) {

      console.error(err);

      setError(err.message);
    }
  };


  // =====================================================
  // LOAD TRANSACTIONS
  // =====================================================

  useEffect(() => {
    fetchTransactions();
  }, []);


  // =====================================================
  // CLEAR FORM
  // =====================================================

  const clearForm = () => {

    setDescription("");
    setAmount("");
    setTransactionType("Expense");

    setTransactionDate(
      new Date().toISOString().split("T")[0]
    );

    setEditingId(null);
  };


  // =====================================================
  // ADD / UPDATE TRANSACTION
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    if (!description.trim()) {
      setError("Please enter a transaction description.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    setLoading(true);

    try {

      const url = editingId
        ? `${API_URL}/api/transactions/${editingId}`
        : `${API_URL}/api/transactions`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {

        method: method,

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          description: description,
          amount: Number(amount),
          transaction_type: transactionType,
          transaction_date: transactionDate,
        }),

      });

      const data = await response.json();

      if (!response.ok) {

        if (response.status === 401) {
          localStorage.removeItem("access_token");
        }

        throw new Error(
          data.detail || "Failed to save transaction"
        );
      }


      // =================================================
      // SUCCESS MESSAGE
      // =================================================

      if (editingId) {

        setMessage(
          `Transaction updated successfully. AI Category: ${data.transaction.category}`
        );

      } else {

        setMessage(
          `Transaction added successfully. AI Category: ${data.transaction.category}`
        );

      }


      clearForm();

      await fetchTransactions();

    } catch (err) {

      console.error(err);

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (transaction) => {

    setEditingId(transaction.id);

    setDescription(transaction.description);

    setAmount(transaction.amount);

    setTransactionType(
      transaction.transaction_type
    );

    setTransactionDate(
      transaction.transaction_date
    );

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (transactionId) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/api/transactions/${transactionId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {

        if (response.status === 401) {
          localStorage.removeItem("access_token");
        }

        throw new Error(
          data.detail || "Failed to delete transaction"
        );
      }

      setMessage(
        "Transaction deleted successfully."
      );

      await fetchTransactions();

    } catch (err) {

      console.error(err);

      setError(err.message);
    }
  };


  // =====================================================
  // FORMAT AMOUNT
  // =====================================================

  const formatAmount = (amount) => {

    return `₹${Number(amount).toLocaleString("en-IN")}`;

  };


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="transactions-page">

      {/* PAGE HEADER */}

      <div className="page-header">

        <div>

          <h1>Transactions</h1>

          <p>
            Manage your income and expenses
          </p>

        </div>

      </div>


      {/* ADD / EDIT FORM */}

      <div className="transaction-form-card">

        <h2>
          {editingId
            ? "Edit Transaction"
            : "Add Transaction"}
        </h2>


        <form onSubmit={handleSubmit}>

          {/* ROW 1 */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Description
              </label>

              <input
                type="text"
                placeholder="Example: swiggy dinner"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label>
                Amount
              </label>

              <input
                type="number"
                placeholder="450"
                min="1"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />

            </div>

          </div>


          {/* ROW 2 */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Transaction Type
              </label>

              <select
                value={transactionType}
                onChange={(e) =>
                  setTransactionType(
                    e.target.value
                  )
                }
              >

                <option value="Expense">
                  Expense
                </option>

                <option value="Income">
                  Income
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Date
              </label>

              <input
                type="date"
                value={transactionDate}
                onChange={(e) =>
                  setTransactionDate(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          {/* BUTTONS */}

          <div className="form-buttons">

            <button
              type="submit"
              disabled={loading}
              className="add-transaction-btn"
            >

              {loading
                ? "Saving..."
                : editingId
                ? "Update Transaction"
                : "Add Transaction"}

            </button>


            {editingId && (

              <button
                type="button"
                className="cancel-edit-btn"
                onClick={clearForm}
              >
                Cancel
              </button>

            )}

          </div>

        </form>


        {/* SUCCESS */}

        {message && (

          <div className="success-message">
            ✓ {message}
          </div>

        )}


        {/* ERROR */}

        {error && (

          <div className="error-message">
            ✕ {error}
          </div>

        )}

      </div>


      {/* TRANSACTION HISTORY */}

      <div className="transaction-history">

        <div className="section-header">

          <div>

            <h2>
              Transaction History
            </h2>

            <p>
              {transactions.length} transaction
              {transactions.length !== 1
                ? "s"
                : ""}
            </p>

          </div>

        </div>


        {/* EMPTY */}

        {transactions.length === 0 ? (

          <div className="empty-state">

            <h3>
              No transactions yet
            </h3>

            <p>
              Add your first transaction
              using the form above.
            </p>

          </div>

        ) : (

          <div className="transaction-table-wrapper">

            <table className="transaction-table">

              <thead>

                <tr>

                  <th>
                    Description
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {transactions.map(
                  (transaction) => (

                    <tr key={transaction.id}>

                      <td>
                        <strong>
                          {transaction.description}
                        </strong>
                      </td>


                      <td>

                        <span className="category-badge">
                          {transaction.category}
                        </span>

                      </td>


                      <td>

                        <span
                          className={
                            transaction.transaction_type ===
                            "Income"
                              ? "income-badge"
                              : "expense-badge"
                          }
                        >

                          {
                            transaction.transaction_type
                          }

                        </span>

                      </td>


                      <td
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

                        {formatAmount(
                          transaction.amount
                        )}

                      </td>


                      <td>
                        {transaction.transaction_date}
                      </td>


                      <td>

                        <div className="transaction-actions">

                          <button
                            className="edit-btn"
                            onClick={() =>
                              handleEdit(
                                transaction
                              )
                            }
                          >
                            Edit
                          </button>


                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(
                                transaction.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Transactions;