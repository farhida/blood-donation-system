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

  return (
    <div className="page">
      <h2>Notifications</h2>
      {loading && <div>Loading…</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      {!loading && !error && (
        <ul>
          {items.map(n => (
            <li key={n.id}>
              <div>{n.message}</div>
              <small>{new Date(n.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
