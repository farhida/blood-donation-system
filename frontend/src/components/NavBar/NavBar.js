import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
function NavBar({ token, handleLogout, isAdmin, handleAdminLogout }) {
  const navigate = useNavigate();

  // Admin session: show Donor Search and Admin Logout
  if (isAdmin) {
    return (
      <nav className="navbar">
        <ul>
          <li><Link to="/">Donor Search</Link></li>
          <li style={{ marginLeft: 'auto' }}>
            {/* When admin logs out, clear admin session and redirect to homepage for demonstration. */}
            <button className="logout-btn" onClick={() => { handleAdminLogout(); navigate('/'); }}>Admin Logout</button>
          </li>
        </ul>
      </nav>
    );
  }

  // Normal user or anonymous:
  return (
    <nav className="navbar">
      <ul>
        {/* Always show homepage link */}
        <li><Link to="/">Donor Search</Link></li>
        {token ? (
          // If a normal user is logged in, show Donor Search, Dashboard and a Logout button that clears the user session and returns to the homepage.
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/profile">Edit Profile</Link></li>
            <li style={{ marginLeft: 'auto' }}>
              <button className="logout-btn" onClick={() => { handleLogout(); navigate('/'); }}>Logout</button>
            </li>
          </>
        ) : (
          // Anonymous visitors see Admin, Login and Register links
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

