import React, { useEffect, useState } from 'react';
import adminApi from '../adminApi';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const access = localStorage.getItem('admin_access');
  const auth = access ? { Authorization: `Bearer ${access}` } : {};

  const load = async () => {
    setError('');
    try {
  const res = await adminApi.get('/api/auth/admin/users/', { headers: auth });
      setUsers(res.data);
    } catch (e) {
      setError('Failed to load users');
    }
  };

  useEffect(() => { load(); }, []);

  const updateUser = async (idx) => {
    const u = users[idx];
    setSaving(true);
    try {
  await adminApi.put(`/api/auth/admin/users/${u.id}/`, u, { headers: auth });
      await load();
    } catch (e) {
      setError('Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h2>Admin: Users</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      {saving && <div>Saving…</div>}
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>ID</th><th>Username</th><th>Email</th><th>Active</th>
            <th>Blood</th><th>District</th><th>Phone</th><th>Share</th>
            <th>Donated Recently</th><th>Not Ready</th><th>Last Donation</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td><input value={u.email || ''} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,email:e.target.value}:x))} /></td>
              <td><input type="checkbox" checked={!!u.is_active} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,is_active:e.target.checked}:x))} /></td>
              <td><input value={u.blood_group || ''} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,blood_group:e.target.value}:x))} /></td>
              <td><input value={u.district || ''} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,district:e.target.value}:x))} /></td>
              <td><input value={u.phone || ''} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,phone:e.target.value}:x))} /></td>
              <td><input type="checkbox" checked={!!u.share_phone} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,share_phone:e.target.checked}:x))} /></td>
              <td><input type="checkbox" checked={!!u.donated_recently} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,donated_recently:e.target.checked}:x))} /></td>
              <td><input type="checkbox" checked={!!u.not_ready} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,not_ready:e.target.checked}:x))} /></td>
              <td><input type="date" value={u.last_donation || ''} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,last_donation:e.target.value}:x))} /></td>
              <td><button onClick={() => updateUser(idx)}>Save</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
