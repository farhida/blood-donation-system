import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [lastDonation, setLastDonation] = useState('');
  const [district, setDistrict] = useState('');
  const [sharePhone, setSharePhone] = useState(false);
  const [donatedRecently, setDonatedRecently] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!usernameAvailable) {
      setError('Username is not available.');
      return;
    }
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
        last_donation: donatedRecently ? lastDonation : null,
        district,
        share_phone: sharePhone
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

  const checkUsername = async () => {
    const name = username.trim();
    if (!name) return;
    setCheckingUsername(true);
    try {
      const res = await axios.get('/api/auth/username-available/', { params: { username: name } });
      setUsernameAvailable(res.data.available);
    } catch (_) {
      setUsernameAvailable(true);
    } finally {
      setCheckingUsername(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
  <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} onBlur={checkUsername} required />
  {!usernameAvailable && <div style={{color:'red'}}>Username is taken.</div>}
  {checkingUsername && <div>Checking username...</div>}
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
        <select value={district} onChange={e => setDistrict(e.target.value)}>
          <option value="">District (optional)</option>
          {bangladeshDistricts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <label style={{ display: 'block', marginTop: '8px' }}>
          <input type="checkbox" checked={sharePhone} onChange={e => setSharePhone(e.target.checked)} />
          {' '}Share my phone number publicly
        </label>
        <button type="submit">Register</button>
      </form>
      {success && <p style={{color:'green'}}>{success}</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}

const bangladeshDistricts = [
  'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura','Brahmanbaria','Chandpur','Chattogram','Chuadanga','Cox’s Bazar','Cumilla','Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur','Gopalganj','Habiganj','Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat','Khagrachari','Khulna','Kishoreganj','Kurigram','Kushtia','Lakshmipur','Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur','Moulvibazar','Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi','Natore','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh','Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur','Satkhira','Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet','Tangail','Thakurgaon'
];

export default Register;
