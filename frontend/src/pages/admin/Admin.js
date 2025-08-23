import React, { useEffect, useState } from 'react';
import './Admin.css';
import AdminDecor from './AdminDecor';
import { Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';
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
        label: 'Inventory',
  data: analytics.inventory,
  backgroundColor: 'rgba(198, 40, 40, 0.9)',
  borderColor: 'rgba(139, 0, 0, 0.9)',
      },
    ],
  } : null;

  return (
    <div className="page" style={{position:'relative'}}>
      <AdminDecor />
      <div className="admin-hero hero-drops">
        <div>
          <h2 className="title">Admin Control Panel <span className="muted" style={{fontSize:12,fontWeight:600}}>— manage donors & inventory</span></h2>
          <div className="subtitle muted">Real-time inventory and donor availability</div>
        </div>
        <div className="actions">
          <span className="heart-beat" title="Heartbeat">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21s-7.5-4.35-9.5-7.5C-0.5 8.5 4 4 7 6.5 9 8 12 12 12 12s3-4 5-5.5C20 4 24.5 8.5 21.5 13.5 19.5 16.65 12 21 12 21z" fill="#c62828"/>
            </svg>
          </span>
        </div>
      </div>

  <h2>Analytics</h2>
  {loading && <div>Loading analytics...</div>}
  {data && <div className="card chart-container"><Bar data={data} options={{plugins:{legend:{display:false}}}} /></div>}
    </div>
  );
}

export default Admin;
