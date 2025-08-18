import React, { useEffect, useState } from 'react';
import api from '../api';

function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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
              <th>Hospital</th>
              <th>Blood Group</th>
              <th>Units Available</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(i => (
              <tr key={i.id}>
                <td>{i.id}</td>
                <td>{i.hospital}</td>
                <td>{i.blood_group}</td>
                <td>{i.units_available}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminInventory;
