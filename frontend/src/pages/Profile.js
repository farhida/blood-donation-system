import React, { useEffect, useState } from 'react';
import api from '../api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ phone: '', blood_group: '', last_donation: '', district: '', share_phone: false, donated_recently: false, not_ready: false });
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
          donated_recently: !!res.data.donated_recently,
          not_ready: !!res.data.not_ready,
        });
      } catch (e) {
        setError('Unauthorized. Please login again.');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setMessage('');
    setError('');
    // Client-side validation to match backend rules
    if (!form.district || !String(form.district).trim()) {
      setError('District is required.');
      return;
    }
    if (form.share_phone && (!form.phone || !String(form.phone).trim())) {
      setError('Phone number is required when sharing phone publicly.');
      return;
    }
    // Normalize last_donation: send null if not provided
    const payload = {
      ...form,
      last_donation: form.donated_recently && form.last_donation ? form.last_donation : null,
    };
    try {
      await api.put('/api/profile/', payload);
      setMessage('Profile updated!');
      setEdit(false);
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' ');
        setError(msg || 'Update failed.');
      } else {
        setError('Update failed.');
      }
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
          {form.share_phone && (
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />
          )}
          <input name="blood_group" value={form.blood_group} onChange={handleChange} placeholder="Blood Group" />
          {form.donated_recently && (
            <input
              type="date"
              name="last_donation"
              value={form.last_donation || ''}
              onChange={handleChange}
              placeholder="Last Donation Date"
            />
          )}
          <select name="district" value={form.district} onChange={handleChange} required>
            <option value="">Select District</option>
            {bangladeshDistricts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <label>
            <input type="checkbox" name="share_phone" checked={form.share_phone} onChange={e => setForm({ ...form, share_phone: e.target.checked })} /> Share phone publicly
          </label>
          <label>
            <input
              type="checkbox"
              name="donated_recently"
              checked={form.donated_recently}
              onChange={e => {
                const checked = e.target.checked;
                setForm({ ...form, donated_recently: checked, last_donation: checked ? form.last_donation : '' });
              }}
            />{' '}
            Donated within last 3 months
          </label>
          <label>
            <input type="checkbox" name="not_ready" checked={form.not_ready} onChange={e => setForm({ ...form, not_ready: e.target.checked })} /> Not ready to donate now
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
const bangladeshDistricts = [
  'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura','Brahmanbaria','Chandpur','Chattogram','Chuadanga','Cox’s Bazar','Cumilla','Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur','Gopalganj','Habiganj','Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat','Khagrachari','Khulna','Kishoreganj','Kurigram','Kushtia','Lakshmipur','Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur','Moulvibazar','Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi','Natore','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh','Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur','Satkhira','Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet','Tangail','Thakurgaon'
];
