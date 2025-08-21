import React, { useEffect, useState } from 'react';
import api from '../../services/api';

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
      <div className="card dashboard-card">
        <div className="info-grid">
          <div className="info-row"><span className="label">Name</span><span className="value">{data.full_name || data.username}</span></div>
          <div className="info-row"><span className="label">Email</span><span className="value">{data.email}</span></div>
          <div className="info-row"><span className="label">Blood Group</span><span className="value">{data.blood_group || 'N/A'}</span></div>
          <div className="info-row"><span className="label">District</span><span className="value">{data.district || 'N/A'}</span></div>
          <div className="info-row"><span className="label">Last Donation</span><span className="value">{data.last_donation || 'N/A'}</span></div>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat-number">{data.donation_count}</div>
            <div className="stat-label">Total Donations</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
