import { useState } from "react";

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

  const [currentPage, setCurrentPage] =
    useState("dashboard");

  const [isLoggedIn, setIsLoggedIn] =
    useState(
      !!localStorage.getItem(
        "access_token"
      )
    );


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = () => {

    setIsLoggedIn(true);

    setCurrentPage("dashboard");
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "user_id"
    );

    localStorage.removeItem(
      "user_name"
    );

    localStorage.removeItem(
      "user_email"
    );

    setIsLoggedIn(false);

    setCurrentPage("dashboard");
  };


  // =====================================================
  // REGISTER PAGE
  // =====================================================

  if (
    window.location.pathname ===
    "/register"
  ) {

    if (isLoggedIn) {

      window.location.href = "/";

      return null;
    }

    return <Register />;
  }


  // =====================================================
  // LOGIN PAGE
  // =====================================================

  if (!isLoggedIn) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }


  // =====================================================
  // PAGE ROUTER
  // =====================================================

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


  // =====================================================
  // MAIN APP
  // =====================================================

  return (
    <div className="app-container">

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />

      <main className="main-content">

        <Topbar />

        <div className="page-content">

          {renderPage()}

        </div>

      </main>

    </div>
  );
}

export default App;