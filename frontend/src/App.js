
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './NavBar';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import DonorSearch from './pages/DonorSearch';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import NotFound from './pages/NotFound';
import Inventory from './pages/Inventory';
import Donations from './pages/Donations';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

function Home() {
  return <div className="page"><h2>Home</h2><p>Welcome to the Blood Donation System!</p></div>;
}



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access'));
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('admin'));

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setIsLoggedIn(false);
  };
  const handleAdminLogin = () => setIsAdmin(true);
  const handleAdminLogout = () => {
    localStorage.removeItem('admin');
    setIsAdmin(false);
  };

  return (
    <div className="App">
      <NavBar token={isLoggedIn} handleLogout={handleLogout} isAdmin={isAdmin} handleAdminLogout={handleAdminLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/donors" element={<DonorSearch />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/requests" element={isLoggedIn ? <Requests /> : <Navigate to="/login" />} />
        <Route path="/inventory" element={isLoggedIn ? <Inventory /> : <Navigate to="/login" />} />
        <Route path="/donations" element={isLoggedIn ? <Donations /> : <Navigate to="/login" />} />
        <Route path="/admin-login" element={<AdminLogin onAdminLogin={handleAdminLogin} />} />
        <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/admin-login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
