import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
function NavBar({ token, handleLogout, isAdmin, handleAdminLogout }) {
  const navigate = useNavigate();
  // When admin is logged in, keep the nav minimal: only show Admin Logout (doesn't affect user session)
  if (isAdmin) {
    return (
      <nav className="navbar">
        <ul>
          <li style={{ marginLeft: 'auto' }}>
            <button className="logout-btn" onClick={handleAdminLogout}>Admin Logout</button>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/donors">Donor Search</Link></li>
    {token ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/notifications">Notifications</Link></li>
            <li><Link to="/requests">Requests</Link></li>
            {/* Inventory and Donations hidden from top nav per request */}
            <li>
              <button
                className="logout-btn"
                onClick={() => {
                  handleLogout();
                  navigate('/donors');
                }}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
      <li><Link to="/admin-login">Admin</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;

