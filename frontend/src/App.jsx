import { useState, useEffect, useCallback } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Analytics from "./pages/Analytics";
import Prediction from "./pages/Prediction";
import AIInsights from "./pages/AIInsights";
import Chatbot from "./pages/Chatbot";

import "./App.css";
import "./styles/dashboard.css";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [authView, setAuthView] = useState(() => {
    return window.location.pathname === "/register" ? "register" : "login";
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem("access_token"));
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return {
      name: localStorage.getItem("user_name") || "User",
      email: localStorage.getItem("user_email") || "",
      id: localStorage.getItem("user_id") || "",
    };
  });

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");

    setIsLoggedIn(false);
    setCurrentUser({ name: "User", email: "", id: "" });
    setAuthView("login");
    setCurrentPage("dashboard");
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      handleLogout();
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, [handleLogout]);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser({
      name: userData.name || "User",
      email: userData.email || "",
      id: String(userData.user_id || ""),
    });
    setCurrentPage("dashboard");
  };

  // Render Authentication Views if not logged in
  if (!isLoggedIn) {
    if (authView === "register") {
      return (
        <Register
          onSwitchToLogin={() => setAuthView("login")}
        />
      );
    }

    return (
      <Login
        onLogin={handleLoginSuccess}
        onSwitchToRegister={() => setAuthView("register")}
      />
    );
  }

  // Router for Authenticated Dashboard Views
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return <Transactions />;
      case "budget":
        return <Budget />;
      case "analytics":
        return <Analytics />;
      case "prediction":
        return <Prediction />;
      case "insights":
        return <AIInsights />;
      case "chatbot":
        return <Chatbot />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <Topbar user={currentUser} />
        <div className="page-content">{renderPage()}</div>
      </main>
    </div>
  );
}

export default App;
