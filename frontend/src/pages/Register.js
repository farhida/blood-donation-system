import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/donors/register/', { username, email, password });
      setSuccess('Registration successful! You can now log in.');
    } catch (err) {
      setError('Registration failed.');
    }
  };

  return (
    <div className="login-form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
      {success && <p style={{color:'green'}}>{success}</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}

export default Register;
