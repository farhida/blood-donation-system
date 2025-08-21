import React, { useState } from 'react';
import './AdminLogin.css';
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
        // Store admin tokens separately so admin session doesn't imply user session
        localStorage.setItem('admin_access', access);
        localStorage.setItem('admin_refresh', refresh || '');
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
    <div className="auth-page admin-login-page">
      <div className="auth-hero">
        <div>
          <h2>Admin Login</h2>
          <div className="muted">Staff access only</div>
        </div>
        <div className="decor logo-float">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7.5-4.35-9.5-7.5C-0.5 8.5 4 4 7 6.5 9 8 12 12 12 12s3-4 5-5.5C20 4 24.5 8.5 21.5 13.5 19.5 16.65 12 21 12 21z" fill="#c62828"/></svg>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row"><input className="input" type="text" placeholder="Admin Username" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username" /></div>
        <div className="form-row"><input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></div>
        <div className="form-row"><button className="btn btn-primary" type="submit">Login</button></div>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}

export default AdminLogin;
