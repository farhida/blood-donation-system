import React, { useEffect, useState } from 'react';
import api from '../api';

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const res = await api.get('/api/dashboard-summary/');
        setData(res.data);
      } catch (_) {
        setError('Failed to load dashboard');
      }
    };
    load();
  }, []);

  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!data) return <div>Loading…</div>;

  return (
    <div className="page">
      <h2>Dashboard</h2>
      <div style={{display:'grid',gap:8,maxWidth:520}}>
        <div><b>Name:</b> {data.full_name || data.username}</div>
        <div><b>Email:</b> {data.email}</div>
        <div><b>Blood group:</b> {data.blood_group || 'N/A'}</div>
        <div><b>District:</b> {data.district || 'N/A'}</div>
        <div><b>Last donation:</b> {data.last_donation || 'N/A'}</div>
        <div><b>Total donations:</b> {data.donation_count}</div>
      </div>
    </div>
  );
}

export default Dashboard;
