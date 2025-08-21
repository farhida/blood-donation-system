import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function ProfileEdit() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const res = await api.get('/api/auth/me/');
        setUser(res.data);
      } catch (e) {
        setError('Failed to load profile');
      }
    };
    load();
  }, []);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        email: user.email ?? null,
        blood_group: user.blood_group ?? null,
        district: user.district ?? null,
        phone: user.phone === '' ? null : (user.phone ?? null),
        share_phone: !!user.share_phone,
        last_donation: user.last_donation === '' ? null : (user.last_donation ?? null),
      };
      const res = await api.put('/api/auth/me/', payload);
      setUser(res.data || user);
    } catch (e) {
      setError('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!user) return <div>Loading…</div>;

  return (
    <div className="page">
      <h2>Edit Profile</h2>
      <div className="card">
        <div style={{maxWidth:600}}>
          <div style={{marginBottom:8}}><label> Email </label><br /><input value={user.email || ''} onChange={e => setUser({...user, email: e.target.value})} /></div>
          <div style={{marginBottom:8}}><label> Blood Group </label><br />
            <select value={user.blood_group || ''} onChange={e => setUser({...user, blood_group: e.target.value})}>
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
          </div>
          <div style={{marginBottom:8}}><label> District </label><br />
            <select value={user.district || ''} onChange={e => setUser({...user, district: e.target.value})}>
              <option value="">(unset)</option>
              {[
                'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura','Brahmanbaria','Chandpur','Chattogram','Chuadanga','Cox’s Bazar','Cumilla','Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur','Gopalganj','Habiganj','Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat','Khagrachari','Khulna','Kishoreganj','Kurigram','Kushtia','Lakshmipur','Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur','Moulvibazar','Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi','Natore','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh','Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur','Satkhira','Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet','Tangail','Thakurgaon'
              ].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{marginBottom:8}}><label> Phone </label><br /><input value={user.phone || ''} onChange={e => setUser({...user, phone: e.target.value})} /></div>
          <div style={{marginBottom:8}}><label> Share Phone </label>
            <input type="checkbox" checked={!!user.share_phone} onChange={e => setUser({...user, share_phone: e.target.checked})} />
          </div>
          <div style={{marginBottom:8}}>
            <label>
              <input type="checkbox" checked={!!user.donated_recently} onChange={e => setUser({...user, donated_recently: e.target.checked})} /> Donated within last 3 months
            </label>
          </div>
          {user.donated_recently && (
            <div style={{marginBottom:8}}><label> Last Donation </label><br /><input type="date" value={user.last_donation || ''} onChange={e => setUser({...user, last_donation: e.target.value})} /></div>
          )}
          <div style={{marginTop:12}}>
            <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileEdit;
