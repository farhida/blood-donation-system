// DonorSearch (homepage)
// This file was moved into pages/homepage to mark it as the primary public homepage.
// Use this page as the default landing page for anonymous visitors.
//hi

import React, { useState } from 'react';
import './DonorSearch.css';
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
    <div className="search-page">
      {/* Show this prompt only when the user is NOT logged in (isLoggedIn is false). */}
      {!isLoggedIn && (
        <div className="accent-note">
          To make a profile, please
          <span style={{ marginLeft: 8 }}>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </span>
        </div>
      )}
      <h2>Search for Donors <span className="decor-heart heart-beat" title="Find donors faster">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#c62828" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7.5-4.35-9.5-7.5C-0.5 8.5 4 4 7 6.5 9 8 12 12 12 12s3-4 5-5.5C20 4 24.5 8.5 21.5 13.5 19.5 16.65 12 21 12 21z"/></svg>
      </span></h2>
      <form onSubmit={handleSearch}>
        <select className="input" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} required>
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
  <button type="submit" className="btn btn-search btn-primary">Search</button>
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
  'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura','Brahmanbaria','Chandpur','Chattogram','Chuadanga','Cox’s Bazar','Cumilla','Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur','Gopalganj','Habiganj','Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat','Khagrachari','Khulna','Kishoreganj','Kurigram','Kushtia','Lakshmipur','Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur','Moulvabazar','Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi','Natore','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh','Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur','Satkhira','Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet','Tangail','Thakurgaon'
];
