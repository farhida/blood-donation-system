import React, { useState } from 'react';
import './Register.css';
import axios from 'axios';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [lastDonation, setLastDonation] = useState('');
  const [district, setDistrict] = useState('');
  const [sharePhone, setSharePhone] = useState(false);
  const [phone, setPhone] = useState('');
  const [donatedRecently, setDonatedRecently] = useState(false);
  // username is auto-generated from full name on the server
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
  // Keep date optional; donatedRecently flag controls visibility in search

      await axios.post('/api/auth/register/', {
        full_name: fullName,
        email,
        password,
        blood_group: bloodGroup,
        last_donation: donatedRecently ? (lastDonation || null) : null,
        district,
        share_phone: sharePhone,
        phone: sharePhone ? phone : '',
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

  const checkUsername = async () => {};

  return (
    <div className="register-page">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <h2>Register</h2>
        <div className="register-cta heart-beat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#c62828" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7.5-4.35-9.5-7.5C-0.5 8.5 4 4 7 6.5 9 8 12 12 12 12s3-4 5-5.5C20 4 24.5 8.5 21.5 13.5 19.5 16.65 12 21 12 21z"/></svg>
        </div>
      </div>
    <form onSubmit={handleSubmit}>
  <input className="input" type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
        <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
        <select className="input" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} required>
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
          <input
            type="checkbox"
            checked={donatedRecently}
            onChange={e => {
              const val = e.target.checked;
              setDonatedRecently(val);
              if (!val) setLastDonation('');
              else if (!lastDonation) setLastDonation(new Date().toISOString().slice(0,10));
            }}
          />{' '}I donated within the last 3 months (optional)
        </label>
        {donatedRecently && (
          <input
            type="date"
            placeholder="Last Donation Date (optional)"
            value={lastDonation}
            onChange={e => setLastDonation(e.target.value)}
          />
        )}
        <select value={district} onChange={e => setDistrict(e.target.value)} required>
          <option value="">Select District</option>
          {bangladeshDistricts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <label style={{ display: 'block', marginTop: '8px' }}>
          <input type="checkbox" checked={sharePhone} onChange={e => setSharePhone(e.target.checked)} />
          {' '}Share my phone number publicly
        </label>
        {sharePhone && (
          <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
        )}
  {/* 'Not ready to donate now' is not shown on registration per requirement */}
  <div style={{marginTop:12}}><button className="btn btn-primary" type="submit">Register</button></div>
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
