import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [donors, setDonors] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    blood_group: '',
    phone: '',
  });
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });
  const [token, setToken] = useState(null);

  // Fetch donors (only if logged in)
  useEffect(() => {
    if (token) {
      axios.get('http://127.0.0.1:8000/api/donors/', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          setDonors(response.data);
        })
        .catch(error => {
          console.error('Error fetching donors:', error);
        });
    }
  }, [token]);

  // Handle login form input changes
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Handle login form submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/api/token/', loginData)
      .then(response => {
        setToken(response.data.access);
        setLoginData({ username: '', password: '' });
      })
      .catch(error => {
        console.error('Login error:', error);
      });
  };

  // Handle donor form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle donor form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/api/donors/', formData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setDonors([...donors, response.data]);
        setFormData({ name: '', blood_group: '', phone: '' });
      })
      .catch(error => {
        console.error('Error adding donor:', error);
      });
  };

  return (
    <div className="App">
      <h1>Blood Donation Platform</h1>

      {!token ? (
        <>
          <h2>Login</h2>
          <form onSubmit={handleLoginSubmit} className="login-form">
            <input
              type="text"
              name="username"
              value={loginData.username}
              onChange={handleLoginChange}
              placeholder="Username"
              required
            />
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              placeholder="Password"
              required
            />
            <button type="submit">Login</button>
          </form>
        </>
      ) : (
        <>
          <h2>Add New Donor</h2>
          <form onSubmit={handleSubmit} className="donor-form">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter name"
              required
            />
            <select
              name="blood_group"
              value={formData.blood_group}
              onChange={handleInputChange}
              required
            >
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
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              required
            />
            <button type="submit">Add Donor</button>
          </form>

          <h2>Donors</h2>
          <ul className="donor-list">
            {donors.map(donor => (
              <li key={donor.id}>
                {donor.name} - {donor.blood_group} - {donor.phone}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;