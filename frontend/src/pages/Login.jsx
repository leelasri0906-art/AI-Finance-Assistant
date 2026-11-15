import { useState } from "react";
import api from "../services/api";

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await api.login(email.trim(), password);

      // Persist auth details
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_id", String(data.user_id));
      localStorage.setItem("user_name", data.name);
      localStorage.setItem("user_email", data.email);

      if (onLogin) {
        onLogin(data);
      }
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
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
          <h2>Welcome Back</h2>
          <p>Sign in to manage your finances</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>✕</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account?</p>
          <button
            type="button"
            className="auth-link-btn"
            onClick={onSwitchToRegister}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
