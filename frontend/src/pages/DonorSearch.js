import React, { useMemo, useState } from 'react';
import axios from 'axios';

function DonorSearch() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [district, setDistrict] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');

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

  const handleMessage = async (donorId) => {
    const contact = prompt('Enter your contact info for the donor:');
    const msg = prompt('Enter your message:');
    if (!contact || !msg) return;
    try {
      await axios.post(`/api/donors/donors/${donorId}/message/`, { contact, message: msg });
      alert('Message sent!');
    } catch {
      alert('Failed to send message.');
    }
  };

  return (
    <div className="donor-search">
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
