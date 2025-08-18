import React, { useEffect, useState } from 'react';
import api from '../api';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({ hospital: '', blood_group: '', units_available: 1 });
  const [message, setMessage] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await api.get('inventory/');
      setInventory(res.data);
    } catch {
      setMessage('Failed to load inventory.');
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('inventory/', form);
      setMessage('Inventory updated!');
      setForm({ hospital: '', blood_group: '', units_available: 1 });
      fetchInventory();
    } catch {
      setMessage('Failed to update inventory.');
    }
  };

  return (
    <div className="inventory-form">
      <h2>Blood Inventory</h2>
      <form onSubmit={handleSubmit}>
        <input name="hospital" value={form.hospital} onChange={handleChange} placeholder="Hospital" required />
        <input name="blood_group" value={form.blood_group} onChange={handleChange} placeholder="Blood Group" required />
        <input name="units_available" type="number" min="1" value={form.units_available} onChange={handleChange} placeholder="Units Available" required />
        <button type="submit">Add/Update Inventory</button>
      </form>
      {message && <div>{message}</div>}
      <ul className="inventory-list">
        {inventory.map(i => (
          <li key={i.id}>{i.hospital} - {i.blood_group}: {i.units_available} units</li>
        ))}
      </ul>
    </div>
  );
}

export default Inventory;
