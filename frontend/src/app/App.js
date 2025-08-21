import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar';
import '../styles/base.css';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import DonorSearch from '../pages/homepage/DonorSearch';
import Dashboard from '../pages/user/Dashboard';
import ProfileEdit from '../pages/user/ProfileEdit';
import Admin from '../pages/admin/Admin';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminInventory from '../pages/admin/AdminInventory';
import AdminLogin from '../pages/auth/AdminLogin';

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
    if (pathname.startsWith('/dashboard')) return 'bg-dashboard';
    if (pathname.startsWith('/profile')) return 'bg-dashboard';
    if (pathname.startsWith('/admin-login')) return 'bg-admin-login';
    if (pathname === '/admin') return 'bg-admin';
    if (pathname.startsWith('/admin/users')) return 'bg-admin-users';
    if (pathname.startsWith('/admin/inventory')) return 'bg-admin-inventory';
    return 'bg-generic';
  };
  const pageClass = getPageClass(location.pathname || '/');

  return (
    <div className={`App ${pageClass}`}>
      <NavBar token={isLoggedIn} handleLogout={handleLogout} isAdmin={isAdmin} handleAdminLogout={handleAdminLogout} />
      <Routes>
        <Route path="/" element={<DonorSearch />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/donors" element={<DonorSearch />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isLoggedIn ? <ProfileEdit /> : <Navigate to="/login" />} />
        <Route path="/admin-login" element={<AdminLogin onAdminLogin={handleAdminLogin} />} />
        <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/admin-login" />} />
        <Route path="/admin/users" element={isAdmin ? <AdminUsers /> : <Navigate to="/admin-login" />} />
        <Route path="/admin/inventory" element={isAdmin ? <AdminInventory /> : <Navigate to="/admin-login" />} />
      </Routes>
    </div>
  );
}

export default App;
