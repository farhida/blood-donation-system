import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [nameOrEmail, setNameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { password };
      // Send as full_name if it looks like a name (has space), else send as username; backend also accepts email
      if (nameOrEmail.includes(' ')) {
        payload.full_name = nameOrEmail;
      } else {
        payload.username = nameOrEmail;
      }
      const res = await axios.post('/api/login/', payload);
      const { access, refresh } = res.data || {};
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);

      // If this user is an admin, also mirror tokens into admin keys so admin APIs work
      try {
        const me = await axios.get('/api/auth/me/', { headers: { Authorization: `Bearer ${access}` } });
        if (me.data?.is_staff || me.data?.is_superuser) {
          localStorage.setItem('admin_access', access);
          localStorage.setItem('admin_refresh', refresh || '');
          localStorage.setItem('admin', 'true');
        }
      } catch (err) {
        // ignore - failing to check/admin-sync shouldn't block normal login
      }

      onLogin();
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div>
          <h2>Welcome back</h2>
          <div className="muted">Log in to access your dashboard</div>
        </div>
        <div className="decor">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7.5-4.35-9.5-7.5C-0.5 8.5 4 4 7 6.5 9 8 12 12 12 12s3-4 5-5.5C20 4 24.5 8.5 21.5 13.5 19.5 16.65 12 21 12 21z" fill="#c62828"/></svg>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-row"><input className="input" type="text" placeholder="Full name or Email" value={nameOrEmail} onChange={e => setNameOrEmail(e.target.value)} required /></div>
        <div className="form-row"><input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></div>
        <div className="form-row"><button className="btn btn-primary" type="submit">Login</button></div>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}

export default Login;
