import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function DonorSearch() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [district, setDistrict] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');
  const isLoggedIn = !!localStorage.getItem('access');

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
  const params = new URLSearchParams();
  if (bloodGroup) params.append('blood_group', bloodGroup);
  if (district) params.append('district', district);
  const res = await axios.get(`/api/donors/search/?${params.toString()}`);
      setResults(res.data);
      if (res.data.length === 0) setMessage('No donors found.');
    } catch {
      setMessage('Search failed.');
    }
  };

  return (
    <div className="donor-search">
      {/* Show this prompt only when the user is NOT logged in (isLoggedIn is false). */}
      {!isLoggedIn && (
        <div style={{
          background: '#fff8e1',
          border: '1px solid #ffecb3',
          padding: '10px 12px',
          borderRadius: 6,
          marginBottom: 12
        }}>
          To request blood or see requests, please login or register.
          <span style={{ marginLeft: 12 }}>
            <Link to="/login" className="button-link">Login</Link>
          </span>
          <span style={{ marginLeft: 8 }}>
            <Link to="/register" className="button-link">Register</Link>
          </span>
        </div>
      )}
      <h2>Search for Donors</h2>
      <form onSubmit={handleSearch}>
        <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} required>
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>
        <select value={district} onChange={e => setDistrict(e.target.value)}>
          <option value="">All Districts</option>
          {bangladeshDistricts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button type="submit">Search</button>
      </form>
      {message && <div>{message}</div>}
      <ul className="donor-list">
        {results.map((p, idx) => {
          const displayName = p.full_name && p.full_name.trim() ? p.full_name : p.username;
          return (
            <li key={idx}>
              <b>{displayName}</b> ({p.blood_group}) - {p.email}{p.phone ? ` - ${p.phone}` : ''}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default DonorSearch;

const bangladeshDistricts = [
  'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura','Brahmanbaria','Chandpur','Chattogram','Chuadanga','Cox’s Bazar','Cumilla','Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur','Gopalganj','Habiganj','Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat','Khagrachari','Khulna','Kishoreganj','Kurigram','Kushtia','Lakshmipur','Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur','Moulvibazar','Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi','Natore','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh','Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur','Satkhira','Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet','Tangail','Thakurgaon'
];
