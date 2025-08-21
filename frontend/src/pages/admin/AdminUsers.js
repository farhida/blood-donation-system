import React, { useEffect, useState, useRef } from 'react';
import adminApi from '../../services/adminApi';
import './AdminUsers.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError('');
    try {
  const res = await adminApi.get('/api/auth/admin/users/');
      // Log the fetched data so we can verify what the backend returns after updates
      // eslint-disable-next-line no-console
      console.log('AdminUsers: loaded users count=', Array.isArray(res.data) ? res.data.length : 'unknown', res.data);
      setUsers(res.data);
    } catch (e) {
      setError('Failed to load users');
    }
  };

  useEffect(() => { load(); }, []);

  const saveTimers = useRef({});

  const saveUser = async (user) => {
    const payload = {
      email: user.email ?? null,
      is_active: !!user.is_active,
      blood_group: user.blood_group ?? null,
      district: user.district ?? null,
      phone: user.phone === '' ? null : (user.phone ?? null),
      share_phone: !!user.share_phone,
      not_ready: !!user.not_ready,
      last_donation: user.last_donation === '' ? null : (user.last_donation ?? null),
    };
    try {
      const res = await adminApi.put(`/api/auth/admin/users/${user.id}/`, payload);
      let updated = res?.data;
      // If server didn't return the updated object, fetch it explicitly
      if (!updated) {
        try {
          const got = await adminApi.get(`/api/auth/admin/users/${user.id}/`);
          updated = got?.data;
        } catch (gerr) {
          // ignore; we'll at least keep optimistic payload
          // eslint-disable-next-line no-console
          console.warn('AdminUsers: failed to fetch updated user after PUT', user.id, gerr?.response?.status || gerr.message);
        }
      }
      // eslint-disable-next-line no-console
      console.log('AdminUsers: auto-saved', user.id, updated || payload);
      if (updated && updated.id) setUsers(prev => prev.map(x => (x.id === user.id ? updated : x)));
      else setUsers(prev => prev.map(x => (x.id === user.id ? {...x, ...payload} : x)));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('AdminUsers: auto-save failed for', user.id, e?.response?.data || e.message || e);
      setError('Auto-save failed for user ' + user.id);
    }
  };

  const queueSave = (user) => {
    if (saveTimers.current[user.id]) clearTimeout(saveTimers.current[user.id]);
    saveTimers.current[user.id] = setTimeout(() => {
      saveUser(user);
      delete saveTimers.current[user.id];
    }, 750);
  };

  // Update all users in one batch (single action button)
  const saveAll = async () => {
    if (saving) return; // prevent double-submit
    setSaving(true);
    setError('');
    try {
      // Send updates per-user. Build a minimal payload so we don't accidentally send read-only fields
      const errors = [];
      for (const u of users) {
        const payload = {
          email: u.email ?? null,
          is_active: !!u.is_active,
          blood_group: u.blood_group ?? null,
          district: u.district ?? null,
          phone: u.phone === '' ? null : (u.phone ?? null),
          share_phone: !!u.share_phone,
          not_ready: !!u.not_ready,
          last_donation: u.last_donation === '' ? null : (u.last_donation ?? null),
        };
        // Log payload for debugging so we can inspect what is sent
        // eslint-disable-next-line no-console
        console.log('AdminUsers: sending update for', u.id, payload);
        try {
          await adminApi.put(`/api/auth/admin/users/${u.id}/`, payload);
          // eslint-disable-next-line no-console
          console.log('AdminUsers: update OK for', u.id);
          try {
            const check = await adminApi.get(`/api/auth/admin/users/${u.id}/`);
            // eslint-disable-next-line no-console
            console.log('AdminUsers: post-PUT fetch for', u.id, check.data);
            // Replace the corresponding user in local state with the server's returned object
            setUsers(prev => prev.map(x => (x.id === u.id ? check.data : x)));
          } catch (qerr) {
            // eslint-disable-next-line no-console
            console.warn('AdminUsers: post-PUT fetch failed for', u.id, qerr?.response?.status || qerr.message);
          }
        } catch (itemErr) {
          // collect but continue
          // eslint-disable-next-line no-console
          console.error('AdminUsers: update failed for', u.id, itemErr?.response?.data || itemErr.message || itemErr);
          errors.push({ id: u.id, err: itemErr });
        }
      }
      if (errors.length) {
        throw new Error('One or more updates failed; see console for details.');
      }
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
      // reload the list after delete
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
              <td><input value={u.email || ''} onChange={e => { const val = e.target.value; setUsers(prev => prev.map((x,i)=> i===idx?{...x,email:val}:x)); queueSave({...u, email: val}); }} /></td>
              <td><input type="checkbox" checked={!!u.is_active} onChange={e => { const val = e.target.checked; setUsers(prev => prev.map((x,i)=> i===idx?{...x,is_active:val}:x)); queueSave({...u, is_active: val}); }} /></td>
              <td>
                <select value={u.blood_group || ''} onChange={e => { const val = e.target.value; setUsers(prev => prev.map((x,i)=> i===idx?{...x,blood_group:val}:x)); queueSave({...u, blood_group: val}); }}>
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
                <select value={u.district || ''} onChange={e => { const val = e.target.value; setUsers(prev => prev.map((x,i)=> i===idx?{...x,district:val}:x)); queueSave({...u, district: val}); }}>
                  <option value="">(unset)</option>
                  {[
                    'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura','Brahmanbaria','Chandpur','Chattogram','Chuadanga','Cox’s Bazar','Cumilla','Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur','Gopalganj','Habiganj','Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat','Khagrachari','Khulna','Kishoreganj','Kurigram','Kushtia','Lakshmipur','Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur','Moulvibazar','Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi','Natore','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh','Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur','Satkhira','Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet','Tangail','Thakurgaon'
                  ].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </td>
              <td><input value={u.phone || ''} onChange={e => { const val = e.target.value; setUsers(prev => prev.map((x,i)=> i===idx?{...x,phone:val}:x)); queueSave({...u, phone: val}); }} /></td>
              <td><input type="checkbox" checked={!!u.share_phone} onChange={e => { const val = e.target.checked; setUsers(prev => prev.map((x,i)=> i===idx?{...x,share_phone:val}:x)); queueSave({...u, share_phone: val}); }} /></td>
              <td><input type="checkbox" checked={!!u.not_ready} onChange={e => { const val = e.target.checked; setUsers(prev => prev.map((x,i)=> i===idx?{...x,not_ready:val}:x)); queueSave({...u, not_ready: val}); }} /></td>
              <td><input type="date" value={u.last_donation || ''} onChange={e => { const val = e.target.value; setUsers(prev => prev.map((x,i)=> i===idx?{...x,last_donation:val}:x)); queueSave({...u, last_donation: val}); }} /></td>
              <td><button onClick={() => removeUser(u.id)} style={{color:'red'}}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
  {/* Auto-save on input; Save All button removed. */}
  {/* Debug JSON removed: showing raw users in production was noisy. */}
    </div>
  );
}

export default AdminUsers;
