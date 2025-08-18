


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './NavBar';
import './App.css';

// Placeholder page components (replace with real content as needed)
function Home() {
  return <div className="page"><h2>Home</h2><p>Welcome to the Blood Donation System!</p></div>;
}
function Donors() {
  return <div className="page"><h2>Donors</h2><p>CRUD for donors here.</p></div>;
}
function Requests() {
  return <div className="page"><h2>Requests</h2><p>CRUD for blood requests here.</p></div>;
}
function Inventory() {
  return <div className="page"><h2>Inventory</h2><p>CRUD for blood inventory here.</p></div>;
}
function Donations() {
  return <div className="page"><h2>Donations</h2><p>CRUD for donations here.</p></div>;
}
function Profile() {
  return <div className="page"><h2>Profile</h2><p>User profile and update form here.</p></div>;
}
function Login() {
  return <div className="page"><h2>Login</h2><p>Login form here.</p></div>;
}
function Register() {
  return <div className="page"><h2>Register</h2><p>Registration form here.</p></div>;
}
function Admin() {
  return <div className="page"><h2>Admin</h2><p>Admin dashboard here.</p></div>;
}


function App() {
  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donors" element={<Donors />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
