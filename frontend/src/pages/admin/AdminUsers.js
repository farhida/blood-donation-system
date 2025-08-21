import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError('');
    try {
  const res = await adminApi.get('/api/auth/admin/users/');
      setUsers(res.data);
    } catch (e) {
      setError('Failed to load users');
    }
  };

  useEffect(() => { load(); }, []);

  // Update all users in one batch (single action button)
  const saveAll = async () => {
    if (saving) return; // prevent double-submit
    setSaving(true);
    setError('');
    try {
      for (const u of users) {
        // send each update; backend will ignore unchanged fields
        const payload = { ...u };
        // normalize empty strings to null to allow clearing fields
        if (payload.phone === '') payload.phone = null;
        if (payload.last_donation === '') payload.last_donation = null;
        await adminApi.put(`/api/auth/admin/users/${u.id}/`, payload);
      }
      await load();
    } catch (e) {
      // Detect common proxy/connection errors and show a helpful message
      const isConnRefused = (e && (e.code === 'ECONNREFUSED' || (e.message && e.message.includes('ECONNREFUSED'))));
      if (isConnRefused) {
        setError('Update failed: cannot reach backend (is the Django server running at http://localhost:8000?).');
      } else {
        const detail = e?.response?.data?.detail || e?.response?.data || e?.message;
        setError('Update failed: ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)));
      }
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (userId) => {
    if (!window.confirm('Remove user ID ' + userId + '? This cannot be undone.')) return;
    setError('');
    try {
      setSaving(true);
      await adminApi.delete(`/api/auth/admin/users/${userId}/`);
      await load();
    } catch (e) {
      const isConnRefused = (e && (e.code === 'ECONNREFUSED' || (e.message && e.message.includes('ECONNREFUSED'))));
      if (isConnRefused) {
        setError('Delete failed: cannot reach backend (is the Django server running at http://localhost:8000?).');
      } else {
        const detail = e?.response?.data?.detail || e?.response?.data || e?.message;
        setError('Delete failed: ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)));
      }
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
            <th>Not Ready</th><th>Last Donation</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td><input value={u.email || ''} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,email:e.target.value}:x))} /></td>
              <td><input type="checkbox" checked={!!u.is_active} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,is_active:e.target.checked}:x))} /></td>
              <td>
                <select value={u.blood_group || ''} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,blood_group:e.target.value}:x))}>
                  <option value="">(unset)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </td>
              <td>
                <select value={u.district || ''} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,district:e.target.value}:x))}>
                  <option value="">(unset)</option>
                  {[
                    'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura','Brahmanbaria','Chandpur','Chattogram','Chuadanga','Cox’s Bazar','Cumilla','Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur','Gopalganj','Habiganj','Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat','Khagrachari','Khulna','Kishoreganj','Kurigram','Kushtia','Lakshmipur','Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur','Moulvibazar','Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi','Natore','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh','Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur','Satkhira','Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet','Tangail','Thakurgaon'
                  ].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </td>
              <td><input value={u.phone || ''} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,phone:e.target.value}:x))} /></td>
              <td><input type="checkbox" checked={!!u.share_phone} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,share_phone:e.target.checked}:x))} /></td>
              <td><input type="checkbox" checked={!!u.not_ready} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,not_ready:e.target.checked}:x))} /></td>
              <td><input type="date" value={u.last_donation || ''} onChange={e => setUsers(prev => prev.map((x,i)=> i===idx?{...x,last_donation:e.target.value}:x))} /></td>
              <td><button onClick={() => removeUser(u.id)} style={{color:'red'}}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{marginTop:12}}>
        <button className="btn" onClick={saveAll} disabled={saving}>{saving ? 'Saving…' : 'Save All'}</button>
      </div>
    </div>
  );
}

export default AdminUsers;
