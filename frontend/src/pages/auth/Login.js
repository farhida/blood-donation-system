import React, { useState } from 'react';
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
    <div className="login-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Full name or Email" value={nameOrEmail} onChange={e => setNameOrEmail(e.target.value)} required />
  <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}

export default Login;
