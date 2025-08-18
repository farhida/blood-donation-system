import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminLogin({ onAdminLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // For demo: hardcoded admin username/password check
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('admin', 'true');
      onAdminLogin();
      navigate('/admin');
    } else {
      setError('Invalid admin credentials');
    }
    // For real app: use a backend endpoint for admin auth
    // try {
    //   const res = await axios.post('/api/admin/login/', { username, password });
    //   localStorage.setItem('admin', res.data.token);
    //   onAdminLogin();
    //   navigate('/admin');
    // } catch (err) {
    //   setError('Invalid admin credentials');
    // }
  };

  return (
    <div className="login-form">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Admin Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}

export default AdminLogin;
