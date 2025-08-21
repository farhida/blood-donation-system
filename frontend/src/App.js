
import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import './App.css';
import Login from './pages/auth/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
// Homepage DonorSearch moved to pages/homepage to mark it as the app's default public homepage.
import DonorSearch from './pages/homepage/DonorSearch';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import NotFound from './pages/NotFound';
// Inventory page removed for users; admin inventory remains
import Donations from './pages/Donations';
import Admin from './pages/Admin';
import AdminUsers from './pages/AdminUsers';
import AdminRequests from './pages/AdminRequests';
import AdminInventory from './pages/AdminInventory';
import AdminLogin from './pages/auth/AdminLogin';
import Notifications from './pages/Notifications';

function App() {
  const location = useLocation();
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
  localStorage.removeItem('admin_access');
  localStorage.removeItem('admin_refresh');
    setIsAdmin(false);
  };

  const getPageClass = (pathname) => {
    if (pathname.startsWith('/donors') || pathname === '/') return 'bg-donorsearch';
    if (pathname.startsWith('/login')) return 'bg-login';
    if (pathname.startsWith('/register')) return 'bg-register';
    if (pathname.startsWith('/profile')) return 'bg-profile';
    if (pathname.startsWith('/dashboard')) return 'bg-dashboard';
    if (pathname.startsWith('/requests')) return 'bg-requests';
    if (pathname.startsWith('/notifications')) return 'bg-notifications';
  if (pathname.startsWith('/donations')) return 'bg-donations';
    if (pathname.startsWith('/admin-login')) return 'bg-admin-login';
    if (pathname === '/admin') return 'bg-admin';
    if (pathname.startsWith('/admin/users')) return 'bg-admin-users';
    if (pathname.startsWith('/admin/requests')) return 'bg-admin-requests';
    if (pathname.startsWith('/admin/inventory')) return 'bg-admin-inventory';
    return 'bg-generic';
  };
  const pageClass = getPageClass(location.pathname || '/');

  return (
    <div className={`App ${pageClass}`}>
      <NavBar token={isLoggedIn} handleLogout={handleLogout} isAdmin={isAdmin} handleAdminLogout={handleAdminLogout} />
    <Routes>
  {/* Default route for anonymous users: show Donor Search as the homepage. */}
  <Route path="/" element={<DonorSearch />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
  {/* '/donors' kept for compatibility but '/' is primary homepage. */}
  <Route path="/donors" element={<DonorSearch />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
  <Route path="/requests" element={<Requests />} />
  <Route path="/donations" element={isLoggedIn ? <Donations /> : <Navigate to="/login" />} />
  <Route path="/notifications" element={isLoggedIn ? <Notifications /> : <Navigate to="/login" />} />
        <Route path="/admin-login" element={<AdminLogin onAdminLogin={handleAdminLogin} />} />
  <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/admin-login" />} />
  <Route path="/admin/users" element={isAdmin ? <AdminUsers /> : <Navigate to="/admin-login" />} />
  <Route path="/admin/requests" element={isAdmin ? <AdminRequests /> : <Navigate to="/admin-login" />} />
  <Route path="/admin/inventory" element={isAdmin ? <AdminInventory /> : <Navigate to="/admin-login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
