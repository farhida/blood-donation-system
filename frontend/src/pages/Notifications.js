import React, { useEffect, useState } from 'react';
import api from '../api';

function Notifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const res = await api.get('/api/notifications/');
        setItems(res.data || []);
      } catch {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const accept = async (reqId) => {
    try {
      await api.post(`/api/requests/${reqId}/accept/`);
      // Refresh notifications to reflect status changes or follow-up messages
      const res = await api.get('/api/notifications/');
      setItems(res.data || []);
      alert('Request accepted. Please contact using the provided info.');
    } catch {
      alert('Failed to accept the request.');
    }
  };

  return (
    <div className="page">
      <h2>Notifications</h2>
      {loading && <div>Loading…</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      {!loading && !error && (
        <ul>
          {items.map(n => {
            const info = n.request_info || {};
            return (
              <li key={n.id} style={{marginBottom:12}}>
                <div><strong>{n.message || 'Blood needed'}</strong></div>
                <div>
                  Blood Group: {info.blood_group || 'N/A'} | Location: {info.hospital || info.city || 'N/A'}
                </div>
                {info.address && <div>Address: {info.address}</div>}
                {info.contact_info && <div>Contact: {info.contact_info}</div>}
                <small>{new Date(n.created_at).toLocaleString()}</small>
                {info.id && info.status === 'open' && (
                  <div style={{marginTop:6}}>
                    <button onClick={() => accept(info.id)}>Accept</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
