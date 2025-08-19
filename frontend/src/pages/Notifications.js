import React, { useEffect, useState } from 'react';
import api from '../api';

function Notifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // id -> boolean

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

  const collected = async (reqId) => {
    try {
      await api.post(`/api/requests/${reqId}/collected/`);
      const res = await api.get('/api/notifications/');
      setItems(res.data || []);
      alert('Marked as collected.');
    } catch {
      alert('Failed to mark as collected.');
    }
  };

  const toggle = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="page">
      <h2>Notifications</h2>
      {loading && <div>Loading…</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      {!loading && !error && (
        <ul style={{listStyle:'none', padding:0}}>
          {items.map(n => {
            const info = n.request_info || {};
            const isOpen = info.status === 'open';
            const isAccepted = info.status === 'accepted';
            const isExpanded = !!expanded[n.id];
            const created = new Date(n.created_at).toLocaleString();
            return (
              <li key={n.id} style={{marginBottom:8, border:'1px solid #eee', borderRadius:6}}>
                <div
                  onClick={() => toggle(n.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(n.id); }}
                  style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', cursor:'pointer', background:'#fafafa', borderRadius:'6px 6px 0 0'}}
                >
                  <div><strong>{n.message || 'Blood needed'}</strong></div>
                  <small>{created}</small>
                </div>
                {isExpanded && (
                  <div style={{padding:'8px 12px'}}>
                    <div>
                      Blood Group: {info.blood_group || 'N/A'} | Location: {info.hospital || info.city || 'N/A'}
                    </div>
                    {info.address && <div>Address: {info.address}</div>}
                    {info.contact_info && <div>Contact: {info.contact_info}</div>}
                    {/* If it's open, show Accept for potential donors */}
                    {isOpen && info.id && (
                      <div style={{marginTop:8}}>
                        <button onClick={() => accept(info.id)}>Accept</button>
                      </div>
                    )}
                    {/* If it's accepted and the current user owns the request, show Mark as Collected */}
                    {isAccepted && info.is_owner && (
                      <div style={{marginTop:8}}>
                        <button onClick={() => collected(info.id)}>Mark as Collected</button>
                      </div>
                    )}
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
