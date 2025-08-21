import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import adminApi from '../../services/adminApi';

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
        // Use adminApi (sends admin token) for admin-only data
        // Use absolute paths to avoid resolving against the current page URL
        const res = await adminApi.get('/api/inventory/');
        // If the server returns HTML (SPA index or admin login page), surface authentication message
        if (typeof res.data === 'string' && res.data.trim().startsWith('<')) {
          setInventory([]);
          setError('Authentication required: please log in as admin.');
        } else if (Array.isArray(res.data)) {
          setInventory(res.data);
        } else {
          setInventory([]);
          setError(typeof res.data === 'string' ? res.data : JSON.stringify(res.data));
        }
      } catch (e) {
        // If backend returns 401, show explicit auth message
        const status = e?.response?.status;
        const data = e?.response?.data;
        if (status === 401) {
          setError('Authentication required: please log in as admin.');
        } else if (typeof data === 'string' && data.trim().startsWith('<')) {
          // HTML response (unlikely for API) — show auth message to be safe
          setError('Authentication required: please log in as admin.');
        } else {
          const msg = data?.detail || e?.message || 'Failed to load inventory';
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    // Also load analytics for sample names (public endpoint)
    const loadAnalytics = async () => {
      try {
        const res = await api.get('/api/analytics/');
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
      {/* compute visible donors client-side as a safety net */}
      
      
      {loading && <div>Loading…</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      {!loading && !error && (
        (() => {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 90);
          const visible = (inventory || []).filter(i => {
            if (!i) return false;
            if (!i.last_donation) return true;
            const d = new Date(i.last_donation);
            return d < cutoff;
          });
          return (
            <div>
              <div style={{marginBottom:8,fontSize:14}}>Available donors: <strong>{visible.length}</strong></div>
              <table border="1" cellPadding="6" style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Phone Shared</th>
              <th>Blood Group</th>
              <th>District</th>
              <th>Last Donation</th>
            </tr>
          </thead>
          <tbody>
                {visible.map(i => (
                  <tr key={i.id}>
                    <td>{i.id}</td>
                    <td>{i.full_name || i.username}</td>
                    <td>{i.email}</td>
                    <td>{i.phone || 'Hidden'}</td>
                    <td style={{textAlign:'center'}}>{i.phone ? 'Yes' : 'No'}</td>
                    <td>{i.blood_group}</td>
                    <td>{i.district}</td>
                    <td>{i.last_donation ? new Date(i.last_donation).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
          </tbody>
              </table>
            </div>
          );
        })()
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
