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
    {/* Simplified navbar for the demo: always show the homepage (Donor Search), Admin, Login, and Register.
      Faculty note: this nav intentionally hides user-specific links (Dashboard/Profile/Requests) to keep the demo focused.
    */}
    <li><Link to="/">Donor Search</Link></li>
    <li><Link to="/admin-login">Admin</Link></li>
    <li><Link to="/login">Login</Link></li>
    <li><Link to="/register">Register</Link></li>
      </ul>
    </nav>
  );
}

export default NavBar;

