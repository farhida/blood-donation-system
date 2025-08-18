import React, { useState } from 'react';
import axios from 'axios';

function DonorSearch() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.get(`/api/donors/donors/search/?blood_group=${bloodGroup}`);
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
        <input value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} placeholder="Blood Group (e.g. A+)" required />
        <button type="submit">Search</button>
      </form>
      {message && <div>{message}</div>}
      <ul className="donor-list">
        {results.map(donor => (
          <li key={donor.id}>
            <b>{donor.name}</b> ({donor.blood_group}) - {donor.phone}
            <button onClick={() => handleMessage(donor.id)}>Message</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DonorSearch;
