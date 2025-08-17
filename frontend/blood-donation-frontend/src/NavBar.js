import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar({ token, handleLogout }) {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        {token ? (
          <>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/donors">Donors</Link></li>
            <li><Link to="/requests">Requests</Link></li>
            <li><Link to="/inventory">Inventory</Link></li>
            <li><Link to="/donations">Donations</Link></li>
            <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
          </>
        ) : null}
      </ul>
    </nav>
  );
}

export default NavBar;
