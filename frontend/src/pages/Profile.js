import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ phone: '', blood_group: '', last_donation: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access');
      const res = await axios.get('/api/donors/profile/', { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data);
      setForm({
        phone: res.data.phone || '',
        blood_group: res.data.blood_group || '',
        last_donation: res.data.last_donation || ''
      });
    };
    fetchProfile();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const token = localStorage.getItem('access');
    try {
      await axios.put('/api/donors/profile/', form, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Profile updated!');
      setEdit(false);
    } catch {
      setMessage('Update failed.');
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div><b>Username:</b> {profile.username}</div>
      <div><b>Email:</b> {profile.email}</div>
      {edit ? (
        <>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
          <input name="blood_group" value={form.blood_group} onChange={handleChange} placeholder="Blood Group" />
          <input type="date" name="last_donation" value={form.last_donation || ''} onChange={handleChange} placeholder="Last Donation Date" />
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          <div><b>Phone:</b> {profile.phone}</div>
          <div><b>Blood Group:</b> {profile.blood_group}</div>
          <div><b>Last Donation:</b> {profile.last_donation || 'N/A'}</div>
          <button onClick={() => setEdit(true)}>Edit</button>
        </>
      )}
      {message && <div>{message}</div>}
    </div>
  );
}

export default Profile;
