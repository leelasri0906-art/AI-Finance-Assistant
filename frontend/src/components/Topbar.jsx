import { useState } from "react";

function Topbar({ user, onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");

  const displayName = user?.name || localStorage.getItem("user_name") || "User";
  const displayEmail = user?.email || localStorage.getItem("user_email") || "Finance Account";
  const initial = displayName.charAt(0).toUpperCase() || "U";

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <header className="topbar">
      <div className="search-box">
        <span>⌕</span>
        <input
          type="text"
          placeholder="Search transactions, insights..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="topbar-right">
        <button className="icon-button" type="button" title="Live status">
          🔔
        </button>

        <div className="profile">
          <div className="profile-avatar">
            {initial}
          </div>
          <div className="profile-info">
            <strong>{displayName}</strong>
            <span>{displayEmail}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
