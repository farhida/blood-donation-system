import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/httpClient';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Admin() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
    try {
  const res = await adminApi.get('/api/analytics/');
        setAnalytics(res.data);
      } catch {
        setError('Failed to load analytics.');
      }
    };
    fetchAnalytics();
  }, []);

  if (error) return <div>{error}</div>;
  const loading = !analytics && !error;

  const data = analytics ? {
    labels: analytics.blood_groups,
    datasets: [
      {
        label: 'Demand',
        data: analytics.demand,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Inventory',
        data: analytics.inventory,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  } : null;

  return (
    <div className="page">
      <h2>Admin Control Panel</h2>
      <div className="admin-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'16px',marginBottom:'24px'}}>
        <div className="card" style={{padding:'16px',border:'1px solid #eee',borderRadius:8}}>
          <h3>Users</h3>
          <p>View and update user accounts and donor profiles.</p>
          <Link className="btn" to="/admin/users">Manage Users</Link>
        </div>
        <div className="card" style={{padding:'16px',border:'1px solid #eee',borderRadius:8}}>
          <h3>Requests</h3>
          <p>View all requests (read-only list).</p>
          <Link className="btn" to="/admin/requests">All Requests</Link>
        </div>
        <div className="card" style={{padding:'16px',border:'1px solid #eee',borderRadius:8}}>
          <h3>Inventory</h3>
          <p>View available blood (read-only list).</p>
          <Link className="btn" to="/admin/inventory">Available Blood</Link>
        </div>
      </div>

      <h2>Analytics</h2>
      {loading && <div>Loading analytics...</div>}
      {data && <div className="chart-container"><Bar data={data} /></div>}
      <p style={{marginTop:12}}>For deeper configuration, use Django Admin.</p>
    </div>
  );
}

export default Admin;
