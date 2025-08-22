import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Dashboard.css';

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
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h2 className="title">Dashboard</h2>
        <div className="heart-beat" title="Healthy">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#c62828" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7.5-4.35-9.5-7.5C-0.5 8.5 4 4 7 6.5 9 8 12 12 12 12s3-4 5-5.5C20 4 24.5 8.5 21.5 13.5 19.5 16.65 12 21 12 21z"/></svg>
        </div>
      </div>

      <div className="card dashboard-card">
        <div className="info-grid">
          <div className="info-row"><span className="label">Name</span><span className="value">{data.full_name || data.username}</span></div>
          <div className="info-row"><span className="label">Email</span><span className="value">{data.email}</span></div>
          <div className="info-row"><span className="label">Blood Group</span><span className="value">{data.blood_group || 'N/A'}</span></div>
          <div className="info-row"><span className="label">District</span><span className="value">{data.district || 'N/A'}</span></div>
          {data.phone && (
            <div className="info-row"><span className="label">Phone</span><span className="value">{data.phone}</span></div>
          )}
          <div className="info-row"><span className="label">Last Donation</span><span className="value">{data.last_donation || 'N/A'}</span></div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
