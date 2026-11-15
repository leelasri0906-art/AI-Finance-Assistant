import { useState } from "react";
import api from "../services/api";

function Register({ onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.register(name.trim(), email.trim(), password);
      setSuccess("Account created successfully! You can now sign in.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || "Unable to complete registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">₹</div>
          <div>
            <h1>AI Finance Assistant</h1>
            <p>Smart financial management</p>
          </div>
        </div>

        <div className="auth-heading">
          <h2>Create Account</h2>
          <p>Start managing your finances intelligently</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>✕</span> {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            <span>✓</span> {success}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="auth-form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <button
            type="button"
            className="auth-link-btn"
            onClick={onSwitchToLogin}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
