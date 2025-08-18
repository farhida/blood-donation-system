import React, { useEffect, useState } from 'react';
import api from '../api';

function Donations() {
  const [donations, setDonations] = useState([]);
  const [form, setForm] = useState({ blood_group: '', hospital: '', units_donated: 1 });
  const [message, setMessage] = useState('');

  const fetchDonations = async () => {
    try {
      const res = await api.get('donations/');
      setDonations(res.data);
    } catch {
      setMessage('Failed to load donations.');
    }
  };

  useEffect(() => { fetchDonations(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('donations/', form);
      setMessage('Donation recorded!');
      setForm({ blood_group: '', hospital: '', units_donated: 1 });
      fetchDonations();
    } catch {
      setMessage('Failed to record donation.');
    }
  };

  return (
    <div className="donation-form">
      <h2>My Donations</h2>
      <form onSubmit={handleSubmit}>
        <input name="blood_group" value={form.blood_group} onChange={handleChange} placeholder="Blood Group" required />
        <input name="hospital" value={form.hospital} onChange={handleChange} placeholder="Hospital" required />
        <input name="units_donated" type="number" min="1" value={form.units_donated} onChange={handleChange} placeholder="Units Donated" required />
        <button type="submit">Record Donation</button>
      </form>
      {message && <div>{message}</div>}
      <ul className="donation-list">
        {donations.map(d => (
          <li key={d.id}>{d.blood_group} at {d.hospital} ({d.units_donated} units) on {new Date(d.donation_date).toLocaleDateString()}</li>
        ))}
      </ul>
    </div>
  );
}

export default Donations;
