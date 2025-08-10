import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [donations, setDonations] = useState([]);
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
  const [inventoryFormData, setInventoryFormData] = useState({
    hospital: '',
    blood_group: '',
    units_available: '',
  });
  const [donationFormData, setDonationFormData] = useState({
    blood_group: '',
    hospital: '',
    units_donated: '',
  });
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });
  const [token, setToken] = useState(null);

  // Fetch data
  useEffect(() => {
    if (token) {
      console.log('Fetching data with token:', token); // Debug token
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

      axios.get('http://127.0.0.1:8000/api/inventory/', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          setInventory(response.data);
        })
        .catch(error => {
          console.error('Error fetching inventory:', error);
        });

      axios.get('http://127.0.0.1:8000/api/donations/', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          setDonations(response.data);
        })
        .catch(error => {
          console.error('Error fetching donations:', error);
        });
    }
  }, [token]);

  // Handle login form
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting login:', loginData); // Debug login
    axios.post('http://127.0.0.1:8000/api/token/', loginData)
      .then(response => {
        console.log('Login response:', response.data); // Debug response
        setToken(response.data.access);
        setLoginData({ username: '', password: '' });
      })
      .catch(error => {
        console.error('Login error:', error);
      });
  };

  // Handle donor form
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDonorSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting donor:', formData); // Debug donor
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

  // Handle request form
  const handleRequestInputChange = (e) => {
    setRequestFormData({ ...requestFormData, [e.target.name]: e.target.value });
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting request:', requestFormData); // Debug request
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

  // Handle inventory form
  const handleInventoryInputChange = (e) => {
    setInventoryFormData({ ...inventoryFormData, [e.target.name]: e.target.value });
  };

  const handleInventorySubmit = (e) => {
    e.preventDefault();
    console.log('Submitting inventory:', inventoryFormData); // Debug inventory
    axios.post('http://127.0.0.1:8000/api/inventory/', inventoryFormData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        console.log('Inventory response:', response.data); // Debug response
        setInventory([...inventory, response.data]);
        setInventoryFormData({ hospital: '', blood_group: '', units_available: '' });
      })
      .catch(error => {
        console.error('Error adding inventory:', error);
      });
  };

  // Handle donation form
  const handleDonationInputChange = (e) => {
    setDonationFormData({ ...donationFormData, [e.target.name]: e.target.value });
  };

  const handleDonationSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting donation:', donationFormData); // Debug donation
    axios.post('http://127.0.0.1:8000/api/donations/', donationFormData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        console.log('Donation response:', response.data); // Debug response
        setDonations([...donations, response.data]);
        setDonationFormData({ blood_group: '', hospital: '', units_donated: '' });
      })
      .catch(error => {
        console.error('Error adding donation:', error);
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

          <h2>Add Blood Inventory</h2>
          <form onSubmit={handleInventorySubmit} className="inventory-form">
            <input
              type="text"
              name="hospital"
              value={inventoryFormData.hospital}
              onChange={handleInventoryInputChange}
              placeholder="Enter hospital name"
              required
            />
            <select
              name="blood_group"
              value={inventoryFormData.blood_group}
              onChange={handleInventoryInputChange}
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
              type="number"
              name="units_available"
              value={inventoryFormData.units_available}
              onChange={handleInventoryInputChange}
              placeholder="Enter units available"
              required
            />
            <button type="submit">Add Inventory</button>
          </form>

          <h2>Record Donation</h2>
          <form onSubmit={handleDonationSubmit} className="donation-form">
            <select
              name="blood_group"
              value={donationFormData.blood_group}
              onChange={handleDonationInputChange}
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
              name="hospital"
              value={donationFormData.hospital}
              onChange={handleDonationInputChange}
              placeholder="Enter hospital name"
              required
            />
            <input
              type="number"
              name="units_donated"
              value={donationFormData.units_donated}
              onChange={handleDonationInputChange}
              placeholder="Enter units donated"
              required
            />
            <button type="submit">Record Donation</button>
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

          <h2>Blood Inventory</h2>
          <ul className="inventory-list">
            {inventory.map(item => (
              <li key={item.id}>
                {item.hospital} - {item.blood_group} - {item.units_available} units
              </li>
            ))}
          </ul>

          <h2>Donations</h2>
          <ul className="donation-list">
            {donations.map(donation => (
              <li key={donation.id}>
                {donation.blood_group} - {donation.hospital} - {donation.units_donated} units - {new Date(donation.donation_date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;