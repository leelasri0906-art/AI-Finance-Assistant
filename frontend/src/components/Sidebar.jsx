function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "transactions", label: "Transactions", icon: "↔" },
    { id: "budget", label: "Budget", icon: "◫" },
    { id: "analytics", label: "Analytics", icon: "◒" },
    { id: "prediction", label: "Prediction", icon: "↗" },
    { id: "insights", label: "AI Insights", icon: "✦" },
    { id: "chatbot", label: "Finance Chatbot", icon: "◉" },
  ];

  return (
    <aside className="sidebar">
      {/* BRAND LOGO */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">₹</div>
        <div>
          <h2>AI Finance</h2>
          <span>Assistant</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-title">MAIN MENU</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              currentPage === item.id ? "sidebar-item active" : "sidebar-item"
            }
            onClick={() => setCurrentPage(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-logout"
          onClick={onLogout}
        >
          <span className="sidebar-item-icon">⇥</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
