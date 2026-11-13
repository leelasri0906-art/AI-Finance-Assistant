function Topbar() {
  return (
    <header className="topbar">

      <div className="search-box">

        <span>⌕</span>

        <input
          type="text"
          placeholder="Search transactions, insights..."
        />

      </div>


      <div className="topbar-right">

        <button className="icon-button">
          🔔
        </button>

        <div className="profile">

          <div className="profile-avatar">
            U
          </div>

          <div className="profile-info">
            <strong>User</strong>
            <span>Finance Account</span>
          </div>

        </div>

      </div>

    </header>
  );
}

export default Topbar;