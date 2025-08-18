import React, { useEffect, useState } from 'react';
import api from '../api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ phone: '', blood_group: '', last_donation: '', district: '', share_phone: false });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/profile/');
        setProfile(res.data);
        setForm({
          phone: res.data.phone || '',
          blood_group: res.data.blood_group || '',
          last_donation: res.data.last_donation || '',
          district: res.data.district || '',
          share_phone: !!res.data.share_phone,
        });
      } catch (e) {
        setError('Unauthorized. Please login again.');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const token = localStorage.getItem('access');
    try {
  await api.put('/api/profile/', form);
      setMessage('Profile updated!');
      setEdit(false);
    } catch {
      setMessage('Update failed.');
    }
  };

  if (error) return <div style={{color:'red'}}>{error}</div>;
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
          <input name="district" value={form.district} onChange={handleChange} placeholder="District" />
          <label>
            <input type="checkbox" name="share_phone" checked={form.share_phone} onChange={e => setForm({ ...form, share_phone: e.target.checked })} /> Share phone publicly
          </label>
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          <div><b>Phone:</b> {profile.phone}</div>
          <div><b>Blood Group:</b> {profile.blood_group}</div>
          <div><b>Last Donation:</b> {profile.last_donation || 'N/A'}</div>
          <div><b>District:</b> {profile.district || 'N/A'}</div>
          <div><b>Share Phone:</b> {profile.share_phone ? 'Yes' : 'No'}</div>
          <button onClick={() => setEdit(true)}>Edit</button>
        </>
      )}
      {message && <div>{message}</div>}
    </div>
  );
}

export default Profile;
