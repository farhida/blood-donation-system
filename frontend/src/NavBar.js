
import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar({ token, handleLogout }) {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/donors">Donor Search</Link></li>
        {token ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/requests">Requests</Link></li>
            <li><Link to="/inventory">Inventory</Link></li>
            <li><Link to="/donations">Donations</Link></li>
            <li><Link to="/admin">Admin</Link></li>
            <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;

