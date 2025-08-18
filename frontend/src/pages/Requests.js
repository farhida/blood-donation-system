import React, { useEffect, useState } from 'react';
import api from '../api';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ blood_group: '', city: '', urgency: 'urgent' });
  const [message, setMessage] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await api.get('requests/');
      setRequests(res.data);
    } catch {
      setMessage('Failed to load requests.');
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('requests/', form);
      setMessage('Request created!');
      setForm({ blood_group: '', city: '', urgency: 'urgent' });
      fetchRequests();
    } catch {
      setMessage('Failed to create request.');
    }
  };

  return (
    <div className="request-form">
      <h2>Blood Requests</h2>
      <form onSubmit={handleSubmit}>
        <input name="blood_group" value={form.blood_group} onChange={handleChange} placeholder="Blood Group" required />
        <input name="city" value={form.city} onChange={handleChange} placeholder="City" required />
        <select name="urgency" value={form.urgency} onChange={handleChange}>
          <option value="urgent">Urgent</option>
          <option value="non_urgent">Non-Urgent</option>
        </select>
        <button type="submit">Request Blood</button>
      </form>
      {message && <div>{message}</div>}
      <ul className="request-list">
        {requests.map(r => (
          <li key={r.id}>{r.blood_group} needed in {r.city} ({r.urgency})</li>
        ))}
      </ul>
    </div>
  );
}

export default Requests;
