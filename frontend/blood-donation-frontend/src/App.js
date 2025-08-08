import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/donors/')
      .then(response => {
        setDonors(response.data);
      })
      .catch(error => {
        console.error('Error fetching donors:', error);
      });
  }, []);

  return (
    <div className="App">
      <h1>Blood Donation Platform</h1>
      <h2>Donors</h2>
      <ul>
        {donors.map(donor => (
          <li key={donor.id}>
            {donor.name} - {donor.blood_group} - {donor.phone}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;