import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [mine, setMine] = useState([]);
  const [matching, setMatching] = useState([]);
  const [form, setForm] = useState({ blood_group: '', hospital: '', cause: '', address: '', contact_info: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const isLoggedIn = useMemo(() => !!localStorage.getItem('access'), []);

  const fetchLists = async () => {
    setError('');
    try {
      const resAll = await api.get('/api/requests/');
      setRequests(resAll.data || []);
      if (isLoggedIn) {
        const [resMine, resMatching] = await Promise.all([
          api.get('/api/requests/mine/'),
          api.get('/api/requests/matching/'),
        ]);
        setMine(resMine.data || []);
        setMatching(resMatching.data || []);
      } else {
        setMine([]);
        setMatching([]);
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
    try {
      await api.post('/api/requests/', form);
      setMessage('Request created!');
      setForm({ blood_group: '', hospital: '', cause: '', address: '', contact_info: '' });
      fetchLists();
    } catch (e) {
      const msg = e.response?.data ? JSON.stringify(e.response.data) : 'Failed to create request.';
      setError(msg);
    }
  };

  const accept = async (id) => {
    try {
      await api.post(`/api/requests/${id}/accept/`);
      fetchLists();
    } catch (_) {}
  };

  const collected = async (id) => {
    try {
      await api.post(`/api/requests/${id}/collected/`);
      fetchLists();
    } catch (_) {}
  };

  return (
    <div className="page">
      <h2>Blood Requests</h2>
      <p>Anyone can view requests. Please login/register to submit a request.</p>
      <form onSubmit={handleSubmit} style={{display:'grid',gap:8,maxWidth:600}}>
        <input name="blood_group" value={form.blood_group} onChange={handleChange} placeholder="Blood Group (required)" required />
        <input name="hospital" value={form.hospital} onChange={handleChange} placeholder="Hospital name" />
        <input name="cause" value={form.cause} onChange={handleChange} placeholder="Cause" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
        <input name="contact_info" value={form.contact_info} onChange={handleChange} placeholder="Contact info (required)" required />
        <button type="submit">Request Blood</button>
      </form>
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

      {isLoggedIn && (
        <>
          <h3 style={{marginTop:24}}>My Requests</h3>
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

          <h3 style={{marginTop:24}}>Matching Requests (for me)</h3>
          <ul>
            {matching.map(r => (
              <li key={r.id}>
                <strong>{r.blood_group}</strong> at {r.hospital || r.city || 'N/A'} — {r.status}
                {r.status === 'open' && (
                  <button style={{marginLeft:8}} onClick={() => accept(r.id)}>Accept</button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <h3 style={{marginTop:24}}>All Requests</h3>
      <ul>
        {requests.map(r => (
          <li key={r.id}>
            <strong>{r.blood_group}</strong> at {r.hospital || r.city || 'N/A'} — {r.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Requests;
