import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const res = await api.get('inventory/');
        setInventory(res.data || []);
      } catch (e) {
        setError('Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };
    load();
      // Also load analytics for sample names
      const loadAnalytics = async () => {
        try {
          const res = await api.get('analytics/');
          setAnalytics(res.data);
        } catch (e) {
          // ignore
        }
      };
      loadAnalytics();
  }, []);

  return (
    <div className="page">
      <h2>Available Blood (Inventory)</h2>
      {loading && <div>Loading…</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      {!loading && !error && (
        <table border="1" cellPadding="6" style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Blood Group</th>
              <th>District</th>
              <th>Last Donation</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(i => (
              <tr key={i.id}>
                <td>{i.id}</td>
                <td>{i.full_name || i.username}</td>
                <td>{i.email}</td>
                <td>{i.phone || 'Hidden'}</td>
                <td>{i.blood_group}</td>
                <td>{i.district}</td>
                <td>{i.last_donation || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
        {analytics && analytics.available_names && (
          <div style={{marginTop:16}}>
            <h3>Sample Available Donors (by blood group)</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:8}}>
              {analytics.blood_groups.map((bg, idx) => (
                <div key={bg} style={{padding:8,border:'1px solid #eee',borderRadius:6}}>
                  <strong>{bg}</strong>
                  <ul style={{marginTop:6}}>
                    {(analytics.available_names[idx] || []).slice(0,8).map((n,i) => <li key={i}>{n}</li>)}
                    {(analytics.available_names[idx] || []).length === 0 && <li style={{color:'#888'}}>None</li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}

export default AdminInventory;
