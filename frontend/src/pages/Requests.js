import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [mine, setMine] = useState([]);
  const [form, setForm] = useState({ blood_group: '', hospital: '', cause: '', address: '', contact_info: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [view, setView] = useState('create'); // 'create' | 'mine'
  const isLoggedIn = useMemo(() => !!localStorage.getItem('access'), []);

  const fetchLists = async () => {
    setError('');
    try {
      if (isLoggedIn) {
        const resMine = await api.get('/api/requests/mine/');
        setMine(resMine.data || []);
      } else {
        setMine([]);
      }
    } catch (_) {
      setError('Failed to load requests.');
    }
  };

  useEffect(() => { fetchLists(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!isLoggedIn) {
      setError('');
      setShowAuthPrompt(true);
      return;
    }
    // Client-side validation for required fields
    if (!form.blood_group || !String(form.blood_group).trim()) {
      setError('Blood group is required.');
      return;
    }
    if (!form.contact_info || !String(form.contact_info).trim()) {
      setError('Contact info is required.');
      return;
    }
    try {
      await api.post('/api/requests/', form);
      setMessage('Request created!');
      setForm({ blood_group: '', hospital: '', cause: '', address: '', contact_info: '' });
      fetchLists();
    } catch (e) {
      const data = e.response?.data;
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' ');
        setError(msg || 'Failed to create request.');
      } else {
        setError('Failed to create request.');
      }
    }
  };

  // No matching requests list in this view; acceptance can be done from Notifications page.
  const accept = async (_id) => {};

  const collected = async (id) => {
    try {
      await api.post(`/api/requests/${id}/collected/`);
      fetchLists();
    } catch (_) {}
  };

  return (
    <div className="page">
      <h2>Blood Requests</h2>
      <div style={{display:'flex', gap:8, marginBottom:12}}>
        <button onClick={() => setView('create')} disabled={view==='create'}>New Request</button>
        <button onClick={() => setView('mine')} disabled={view==='mine'}>My Requests</button>
      </div>
      {view === 'create' && (
        <form onSubmit={handleSubmit} style={{display:'grid',gap:8,maxWidth:600}}>
          <input name="blood_group" value={form.blood_group} onChange={handleChange} placeholder="Blood Group (required)" required />
          <input name="hospital" value={form.hospital} onChange={handleChange} placeholder="Hospital name" />
          <input name="cause" value={form.cause} onChange={handleChange} placeholder="Cause" />
          <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
          <input name="contact_info" value={form.contact_info} onChange={handleChange} placeholder="Contact info (required)" required />
          <button type="submit">Request Blood</button>
        </form>
      )}
      {message && <div style={{color:'green'}}>{message}</div>}
      {error && <div style={{color:'red'}}>{error}</div>}

  {showAuthPrompt && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:20,borderRadius:8,minWidth:300}}>
            <h3>Login required</h3>
            <p>Please login or register to place a blood request.</p>
            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button onClick={()=>setShowAuthPrompt(false)}>Close</button>
              <Link className="btn" to="/login">Login</Link>
              <Link className="btn" to="/register">Register</Link>
            </div>
          </div>
        </div>
      )}

      {isLoggedIn && view === 'mine' && (
        <>
          <h3 style={{marginTop:8}}>My Requests</h3>
          <ul>
            {mine.map(r => (
              <li key={r.id}>
                <strong>{r.blood_group}</strong> at {r.hospital || r.city || 'N/A'} — {r.status}
                {r.status === 'accepted' && (
                  <button style={{marginLeft:8}} onClick={() => collected(r.id)}>Mark as Collected</button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Requests;
