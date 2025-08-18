import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [lastDonation, setLastDonation] = useState('');
  const [donatedRecently, setDonatedRecently] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Validate last donation conditionally
      if (donatedRecently) {
        if (!lastDonation) {
          setError('Please provide the last donation date.');
          return;
        }
        const selected = new Date(lastDonation);
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        if (selected < threeMonthsAgo || selected > today) {
          setError('Last donation must be within the last 3 months and not in the future.');
          return;
        }
      }

      await axios.post('/api/auth/register/', {
        username,
        email,
        password,
        blood_group: bloodGroup,
        last_donation: donatedRecently ? lastDonation : null
      });
      setSuccess('Registration successful! You can now log in.');
    } catch (err) {
      const data = err.response && err.response.data;
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' ');
        setError(msg || 'Registration failed.');
      } else {
        setError('Registration failed.');
      }
    }
  };

  return (
    <div className="login-form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
        <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} required>
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>
        <label style={{ display: 'block', marginTop: '8px' }}>
          <input type="checkbox" checked={donatedRecently} onChange={e => setDonatedRecently(e.target.checked)} />
          {' '}I donated blood within the last 3 months
        </label>
        {donatedRecently && (
          <input
            type="date"
            placeholder="Last Donation Date"
            value={lastDonation}
            onChange={e => setLastDonation(e.target.value)}
          />
        )}
        <button type="submit">Register</button>
      </form>
      {success && <p style={{color:'green'}}>{success}</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}

export default Register;
