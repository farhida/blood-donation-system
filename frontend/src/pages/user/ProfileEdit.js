import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './ProfileEdit.css';

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
      // AdminUserSerializer maps fields to userprofile via `source='userprofile.xxx'`
      // but expects the input as top-level keys (phone, blood_group, etc.).
      const payload = {
        email: user.email ?? null,
        phone: user.phone === '' ? null : (user.phone ?? null),
        blood_group: user.blood_group ?? null,
        district: user.district ?? null,
        share_phone: !!user.share_phone,
        // availability is driven solely by last_donation: if checkbox is unchecked we clear it
        last_donation: user.last_donation === '' ? null : (user.last_donation ?? null),
      };
      // eslint-disable-next-line no-console
      console.log('ProfileEdit: sending payload', payload);
      const res = await api.put('/api/auth/me/', payload);
      // eslint-disable-next-line no-console
      console.log('ProfileEdit: save response', res?.data);
      setUser(res.data || user);
    } catch (e) {
      // Show backend validation messages when present
      // eslint-disable-next-line no-console
      console.error('ProfileEdit: save error', e);
      const detail = e?.response?.data || e?.message || 'Save failed';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
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
              <input
                type="checkbox"
                checked={(() => {
                  try {
                    if (!user.last_donation) return false;
                    const cutoff = new Date();
                    cutoff.setDate(cutoff.getDate() - 90);
                    return new Date(user.last_donation) >= cutoff;
                  } catch (err) { return false; }
                })()}
                onChange={e => {
                  const checked = e.target.checked;
                  if (checked) {
                    // If checking, set a sensible default (today) if no date present so calendar appears
                    const today = new Date().toISOString().slice(0,10);
                    setUser({ ...user, last_donation: user.last_donation || today });
                  } else {
                    // Unchecking clears last_donation and makes donor available immediately
                    setUser({ ...user, last_donation: '' });
                  }
                }}
              /> Donated within last 3 months
            </label>
          </div>
          {(() => {
            const hasDate = !!user.last_donation;
            return hasDate ? (
              <div style={{marginBottom:8}}><label> Last Donation </label><br /><input type="date" value={user.last_donation || ''} onChange={e => setUser({...user, last_donation: e.target.value})} /></div>
            ) : null;
          })()}
          <div style={{marginTop:12}}>
            <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileEdit;
