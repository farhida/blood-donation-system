import React, { useEffect, useState } from 'react';
import api from '../api';
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
        const token = localStorage.getItem('access');
        const res = await api.get('analytics/', { headers: { Authorization: `Bearer ${token}` } });
        setAnalytics(res.data);
      } catch {
        setError('Failed to load analytics.');
      }
    };
    fetchAnalytics();
  }, []);

  if (error) return <div>{error}</div>;
  if (!analytics) return <div>Loading analytics...</div>;

  const data = {
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
  };

  return (
    <div className="chart-container">
      <h2>Admin Analytics</h2>
      <Bar data={data} />
      <p>Use Django admin for full management.</p>
    </div>
  );
}

export default Admin;
