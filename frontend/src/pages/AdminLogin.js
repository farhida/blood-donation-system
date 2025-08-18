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
    try {
      // Login via backend
      const res = await axios.post('/api/login/', { username, password });
      const { access, refresh } = res.data || {};
      if (!access) {
        setError('Invalid admin credentials');
        return;
      }
      // Check admin status
      const me = await axios.get('/api/auth/me/', { headers: { Authorization: `Bearer ${access}` } });
      if (me.data.is_staff || me.data.is_superuser) {
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh || '');
        localStorage.setItem('admin', 'true');
        onAdminLogin();
        navigate('/admin');
      } else {
        setError('You do not have admin access');
      }
    } catch (err) {
      setError('Invalid admin credentials');
    }
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
