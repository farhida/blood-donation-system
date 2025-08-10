import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    blood_group: '',
    phone: '',
  });
  const [requestFormData, setRequestFormData] = useState({
    blood_group: '',
    city: '',
    urgency: '',
  });
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });
  const [token, setToken] = useState(null);

  // Fetch donors and requests
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

      axios.get('http://127.0.0.1:8000/api/requests/', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          setRequests(response.data);
        })
        .catch(error => {
          console.error('Error fetching requests:', error);
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
  const handleDonorSubmit = (e) => {
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

  // Handle request form input changes
  const handleRequestInputChange = (e) => {
    setRequestFormData({ ...requestFormData, [e.target.name]: e.target.value });
  };

  // Handle request form submission
  const handleRequestSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/api/requests/', requestFormData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setRequests([...requests, response.data]);
        setRequestFormData({ blood_group: '', city: '', urgency: '' });
      })
      .catch(error => {
        console.error('Error adding request:', error);
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
          <form onSubmit={handleDonorSubmit} className="donor-form">
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

          <h2>Request Blood</h2>
          <form onSubmit={handleRequestSubmit} className="request-form">
            <select
              name="blood_group"
              value={requestFormData.blood_group}
              onChange={handleRequestInputChange}
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
              type="text"
              name="city"
              value={requestFormData.city}
              onChange={handleRequestInputChange}
              placeholder="Enter city"
              required
            />
            <select
              name="urgency"
              value={requestFormData.urgency}
              onChange={handleRequestInputChange}
              required
            >
              <option value="">Select Urgency</option>
              <option value="urgent">Urgent</option>
              <option value="non_urgent">Non-Urgent</option>
            </select>
            <button type="submit">Request Blood</button>
          </form>

          <h2>Donors</h2>
          <ul className="donor-list">
            {donors.map(donor => (
              <li key={donor.id}>
                {donor.name} - {donor.blood_group} - {donor.phone}
              </li>
            ))}
          </ul>

          <h2>Blood Requests</h2>
          <ul className="request-list">
            {requests.map(request => (
              <li key={request.id}>
                {request.blood_group} - {request.city} - {request.urgency}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;