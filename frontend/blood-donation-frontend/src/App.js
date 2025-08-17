
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './NavBar';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard({ analyticsData, dashboardChartData, chartOptions }) {
  return (
    <div>
      <h2>Analytics Dashboard</h2>
      <div className="chart-container">
        <Bar data={dashboardChartData} options={chartOptions} />
      </div>
    </div>
  );
}

function ProfilePage({ profile, profileFormData, handleProfileInputChange, handleProfileSubmit }) {
  return (
    <div>
      <h2>User Profile</h2>
      <div className="profile-container">
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phone || 'Not set'}</p>
        <p><strong>Blood Group:</strong> {profile.blood_group || 'Not set'}</p>
      </div>
      <h3>Update Profile</h3>
      <form onSubmit={handleProfileSubmit} className="profile-form">
        <input type="text" name="username" value={profileFormData.username} onChange={handleProfileInputChange} placeholder="Enter username" required />
        <input type="email" name="email" value={profileFormData.email} onChange={handleProfileInputChange} placeholder="Enter email" required />
        <input type="tel" name="phone" value={profileFormData.phone} onChange={handleProfileInputChange} placeholder="Enter phone number" />
        <select name="blood_group" value={profileFormData.blood_group} onChange={handleProfileInputChange}>
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
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}

function DonorsPage({ donors, formData, handleInputChange, handleDonorSubmit }) {
  return (
    <div>
      <h2>Add New Donor</h2>
      <form onSubmit={handleDonorSubmit} className="donor-form">
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter name" required />
        <select name="blood_group" value={formData.blood_group} onChange={handleInputChange} required>
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
        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter phone number" required />
        <button type="submit">Add Donor</button>
      </form>
      <h2>Donors</h2>
      function App() {
        // All hooks and logic must be inside the App function
        const [analytics, setAnalytics] = useState({ blood_groups: [], demand: [], inventory: [] });
        const [donors, setDonors] = useState([]);
        const [requests, setRequests] = useState([]);
        const [inventory, setInventory] = useState([]);
        const [donations, setDonations] = useState([]);
        const [profile, setProfile] = useState({ username: '', email: '', phone: '', blood_group: '' });
        const [formData, setFormData] = useState({ name: '', blood_group: '', phone: '' });
        const [requestFormData, setRequestFormData] = useState({ blood_group: '', city: '', urgency: '' });
        const [inventoryFormData, setInventoryFormData] = useState({ hospital: '', blood_group: '', units_available: '' });
        const [donationFormData, setDonationFormData] = useState({ blood_group: '', hospital: '', units_donated: '' });
        const [profileFormData, setProfileFormData] = useState({ username: '', email: '', phone: '', blood_group: '' });
        const [loginData, setLoginData] = useState({ username: '', password: '' });
        const [token, setToken] = useState(null);

        useEffect(() => {
          if (token) {
            axios.get('http://127.0.0.1:8000/api/donors/', { headers: { Authorization: `Bearer ${token}` } })
              .then(response => setDonors(response.data))
              .catch(error => console.error('Error fetching donors:', error));
            axios.get('http://127.0.0.1:8000/api/requests/', { headers: { Authorization: `Bearer ${token}` } })
              .then(response => setRequests(response.data))
              .catch(error => console.error('Error fetching requests:', error));
            axios.get('http://127.0.0.1:8000/api/inventory/', { headers: { Authorization: `Bearer ${token}` } })
              .then(response => setInventory(response.data))
              .catch(error => console.error('Error fetching inventory:', error));
            axios.get('http://127.0.0.1:8000/api/donations/', { headers: { Authorization: `Bearer ${token}` } })
              .then(response => setDonations(response.data))
              .catch(error => console.error('Error fetching donations:', error));
            axios.get('http://127.0.0.1:8000/api/profile/', { headers: { Authorization: `Bearer ${token}` } })
              .then(response => { setProfile(response.data); setProfileFormData(response.data); })
              .catch(error => console.error('Error fetching profile:', error));
            axios.get('http://127.0.0.1:8000/api/analytics/', { headers: { Authorization: `Bearer ${token}` } })
              .then(response => setAnalytics(response.data))
              .catch(error => console.error('Error fetching analytics:', error));
          }
        }, [token]);

        // Chart data
        const chartData = {
          labels: analytics.blood_groups,
          datasets: [
            {
              label: 'Blood Group Demand (Requests)',
              data: analytics.demand,
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
            {
              label: 'Blood Inventory (Units)',
              data: analytics.inventory,
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        };

        const chartOptions = {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Blood Group Demand vs Inventory' },
          },
          scales: { y: { beginAtZero: true } },
        };

        // ...existing handlers (handleLoginChange, handleLoginSubmit, handleLogout, etc.) should also be inside App

        return (
          <Router>
            <div className="App">
              <h1>Blood Donation Platform</h1>
              <NavBar token={token} handleLogout={handleLogout} />
              {!token ? (
                <Routes>
                  <Route path="*" element={
                    <>
                      <h2>Login</h2>
                      <form onSubmit={handleLoginSubmit} className="login-form">
                        <input type="text" name="username" value={loginData.username} onChange={handleLoginChange} placeholder="Username" required />
                        <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} placeholder="Password" required />
                        <button type="submit">Login</button>
                      </form>
                    </>
                  } />
                </Routes>
              ) : (
                <Routes>
                  <Route path="/" element={<Dashboard analyticsData={analytics} dashboardChartData={chartData} chartOptions={chartOptions} />} />
                  <Route path="/profile" element={<ProfilePage profile={profile} profileFormData={profileFormData} handleProfileInputChange={handleProfileInputChange} handleProfileSubmit={handleProfileSubmit} />} />
                  <Route path="/donors" element={<DonorsPage donors={donors} formData={formData} handleInputChange={handleInputChange} handleDonorSubmit={handleDonorSubmit} />} />
                  <Route path="/requests" element={<RequestsPage requests={requests} requestFormData={requestFormData} handleRequestInputChange={handleRequestInputChange} handleRequestSubmit={handleRequestSubmit} />} />
                  <Route path="/inventory" element={<InventoryPage inventory={inventory} inventoryFormData={inventoryFormData} handleInventoryInputChange={handleInventoryInputChange} handleInventorySubmit={handleInventorySubmit} />} />
                  <Route path="/donations" element={<DonationsPage donations={donations} donationFormData={donationFormData} handleDonationInputChange={handleDonationInputChange} handleDonationSubmit={handleDonationSubmit} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              )}
            </div>
          </Router>
        );
      }
    <div>
      <h2>Record Donation</h2>
      <form onSubmit={handleDonationSubmit} className="donation-form">
        <select name="blood_group" value={donationFormData.blood_group} onChange={handleDonationInputChange} required>
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
        <input type="text" name="hospital" value={donationFormData.hospital} onChange={handleDonationInputChange} placeholder="Enter hospital name" required />
        <input type="number" name="units_donated" value={donationFormData.units_donated} onChange={handleDonationInputChange} placeholder="Enter units donated" required />
        <button type="submit">Record Donation</button>
      </form>
      <h2>Donations</h2>
      <ul className="donation-list">
        {donations.map(donation => (
          <li key={donation.id}>{donation.blood_group} - {donation.hospital} - {donation.units_donated} units - {new Date(donation.donation_date).toLocaleDateString()}</li>
        ))}
      </ul>
    </div>
  );
}
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [donations, setDonations] = useState([]);
  const [analytics, setAnalytics] = useState({ blood_groups: [], demand: [], inventory: [] });
  const [profile, setProfile] = useState({ username: '', email: '', phone: '', blood_group: '' });
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
  const [profileFormData, setProfileFormData] = useState({
    username: '',
    email: '',
    phone: '',
    blood_group: '',
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

      axios.get('http://127.0.0.1:8000/api/analytics/', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          console.log('Analytics response:', response.data); // Debug analytics
          setAnalytics(response.data);
        })
        .catch(error => {
          console.error('Error fetching analytics:', error);
        });

      axios.get('http://127.0.0.1:8000/api/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          console.log('Profile response:', response.data); // Debug profile
          setProfile(response.data);
          setProfileFormData(response.data);
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
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

  // Handle logout
  const handleLogout = () => {
    console.log('Logging out'); // Debug logout
    setToken(null);
    setProfile({ username: '', email: '', phone: '', blood_group: '' });
    setDonors([]);
    setRequests([]);
    setInventory([]);
    setDonations([]);
    setAnalytics({ blood_groups: [], demand: [], inventory: [] });
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

    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

    function Dashboard({ analyticsData, dashboardChartData, chartOptions }) {
      return (
        <div>
          <h2>Analytics Dashboard</h2>
          <div className="chart-container">
            <Bar data={dashboardChartData} options={chartOptions} />
          </div>
        </div>
      );
    }

    function ProfilePage({ profile, profileFormData, handleProfileInputChange, handleProfileSubmit }) {
      return (
        <div>
          <h2>User Profile</h2>
          <div className="profile-container">
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phone || 'Not set'}</p>
            <p><strong>Blood Group:</strong> {profile.blood_group || 'Not set'}</p>
          </div>
          <h3>Update Profile</h3>
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <input type="text" name="username" value={profileFormData.username} onChange={handleProfileInputChange} placeholder="Enter username" required />
            <input type="email" name="email" value={profileFormData.email} onChange={handleProfileInputChange} placeholder="Enter email" required />
            <input type="tel" name="phone" value={profileFormData.phone} onChange={handleProfileInputChange} placeholder="Enter phone number" />
            <select name="blood_group" value={profileFormData.blood_group} onChange={handleProfileInputChange}>
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
            <button type="submit">Update Profile</button>
          </form>
        </div>
      );
    }

    function DonorsPage({ donors, formData, handleInputChange, handleDonorSubmit }) {
      return (
        <div>
          <h2>Add New Donor</h2>
          <form onSubmit={handleDonorSubmit} className="donor-form">
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter name" required />
            <select name="blood_group" value={formData.blood_group} onChange={handleInputChange} required>
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
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter phone number" required />
            <button type="submit">Add Donor</button>
          </form>
          <h2>Donors</h2>
          <ul className="donor-list">
            {donors.map(donor => (
              <li key={donor.id}>{donor.name} - {donor.blood_group} - {donor.phone}</li>
            ))}
          </ul>
        </div>
      );
    }

    function RequestsPage({ requests, requestFormData, handleRequestInputChange, handleRequestSubmit }) {
      return (
        <div>
          <h2>Request Blood</h2>
          <form onSubmit={handleRequestSubmit} className="request-form">
            <select name="blood_group" value={requestFormData.blood_group} onChange={handleRequestInputChange} required>
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
            <input type="text" name="city" value={requestFormData.city} onChange={handleRequestInputChange} placeholder="Enter city" required />
            <select name="urgency" value={requestFormData.urgency} onChange={handleRequestInputChange} required>
              <option value="">Select Urgency</option>
              <option value="urgent">Urgent</option>
              <option value="non_urgent">Non-Urgent</option>
            </select>
            <button type="submit">Request Blood</button>
          </form>
          <h2>Blood Requests</h2>
          <ul className="request-list">
            {requests.map(request => (
              <li key={request.id}>{request.blood_group} - {request.city} - {request.urgency}</li>
            ))}
          </ul>
        </div>
      );
    }

    function InventoryPage({ inventory, inventoryFormData, handleInventoryInputChange, handleInventorySubmit }) {
      return (
        <div>
          <h2>Add Blood Inventory</h2>
          <form onSubmit={handleInventorySubmit} className="inventory-form">
            <input type="text" name="hospital" value={inventoryFormData.hospital} onChange={handleInventoryInputChange} placeholder="Enter hospital name" required />
            <select name="blood_group" value={inventoryFormData.blood_group} onChange={handleInventoryInputChange} required>
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
            <input type="number" name="units_available" value={inventoryFormData.units_available} onChange={handleInventoryInputChange} placeholder="Enter units available" required />
            <button type="submit">Add Inventory</button>
          </form>
          <h2>Blood Inventory</h2>
          <ul className="inventory-list">
            {inventory.map(item => (
              <li key={item.id}>{item.hospital} - {item.blood_group} - {item.units_available} units</li>
            ))}
          </ul>
        </div>
      );
    }

    function DonationsPage({ donations, donationFormData, handleDonationInputChange, handleDonationSubmit }) {
      return (
        <div>
          <h2>Record Donation</h2>
          <form onSubmit={handleDonationSubmit} className="donation-form">
            <select name="blood_group" value={donationFormData.blood_group} onChange={handleDonationInputChange} required>
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
            <input type="text" name="hospital" value={donationFormData.hospital} onChange={handleDonationInputChange} placeholder="Enter hospital name" required />
            <input type="number" name="units_donated" value={donationFormData.units_donated} onChange={handleDonationInputChange} placeholder="Enter units donated" required />
            <button type="submit">Record Donation</button>
          </form>
          <h2>Donations</h2>
          <ul className="donation-list">
            {donations.map(donation => (
              <li key={donation.id}>{donation.blood_group} - {donation.hospital} - {donation.units_donated} units - {new Date(donation.donation_date).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      );
    }

    function App() {
      // All hooks and logic must be inside the App function
      const [analytics, setAnalytics] = useState({ blood_groups: [], demand: [], inventory: [] });
      const [donors, setDonors] = useState([]);
      const [requests, setRequests] = useState([]);
      const [inventory, setInventory] = useState([]);
      const [donations, setDonations] = useState([]);
      const [profile, setProfile] = useState({ username: '', email: '', phone: '', blood_group: '' });
      const [formData, setFormData] = useState({ name: '', blood_group: '', phone: '' });
      const [requestFormData, setRequestFormData] = useState({ blood_group: '', city: '', urgency: '' });
      const [inventoryFormData, setInventoryFormData] = useState({ hospital: '', blood_group: '', units_available: '' });
      const [donationFormData, setDonationFormData] = useState({ blood_group: '', hospital: '', units_donated: '' });
      const [profileFormData, setProfileFormData] = useState({ username: '', email: '', phone: '', blood_group: '' });
      const [loginData, setLoginData] = useState({ username: '', password: '' });
      const [token, setToken] = useState(null);

      useEffect(() => {
        if (token) {
          axios.get('http://127.0.0.1:8000/api/donors/', { headers: { Authorization: `Bearer ${token}` } })
            .then(response => setDonors(response.data))
            .catch(error => console.error('Error fetching donors:', error));
          axios.get('http://127.0.0.1:8000/api/requests/', { headers: { Authorization: `Bearer ${token}` } })
            .then(response => setRequests(response.data))
            .catch(error => console.error('Error fetching requests:', error));
          axios.get('http://127.0.0.1:8000/api/inventory/', { headers: { Authorization: `Bearer ${token}` } })
            .then(response => setInventory(response.data))
            .catch(error => console.error('Error fetching inventory:', error));
          axios.get('http://127.0.0.1:8000/api/donations/', { headers: { Authorization: `Bearer ${token}` } })
            .then(response => setDonations(response.data))
            .catch(error => console.error('Error fetching donations:', error));
          axios.get('http://127.0.0.1:8000/api/profile/', { headers: { Authorization: `Bearer ${token}` } })
            .then(response => { setProfile(response.data); setProfileFormData(response.data); })
            .catch(error => console.error('Error fetching profile:', error));
          axios.get('http://127.0.0.1:8000/api/analytics/', { headers: { Authorization: `Bearer ${token}` } })
            .then(response => setAnalytics(response.data))
            .catch(error => console.error('Error fetching analytics:', error));
        }
      }, [token]);

      // Chart data
      const chartData = {
        labels: analytics.blood_groups,
        datasets: [
          {
            label: 'Blood Group Demand (Requests)',
            data: analytics.demand,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
          {
            label: 'Blood Inventory (Units)',
            data: analytics.inventory,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      };

      const chartOptions = {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Blood Group Demand vs Inventory' },
        },
        scales: { y: { beginAtZero: true } },
      };

      // ...existing handlers (handleLoginChange, handleLoginSubmit, handleLogout, etc.) should also be inside App

      return (
        <Router>
          <div className="App">
            <h1>Blood Donation Platform</h1>
            <NavBar token={token} handleLogout={handleLogout} />
            {!token ? (
              <Routes>
                <Route path="*" element={
                  <>
                    <h2>Login</h2>
                    <form onSubmit={handleLoginSubmit} className="login-form">
                      <input type="text" name="username" value={loginData.username} onChange={handleLoginChange} placeholder="Username" required />
                      <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} placeholder="Password" required />
                      <button type="submit">Login</button>
                    </form>
                  </>
                } />
              </Routes>
            ) : (
              <Routes>
                <Route path="/" element={<Dashboard analyticsData={analytics} dashboardChartData={chartData} chartOptions={chartOptions} />} />
                <Route path="/profile" element={<ProfilePage profile={profile} profileFormData={profileFormData} handleProfileInputChange={handleProfileInputChange} handleProfileSubmit={handleProfileSubmit} />} />
                <Route path="/donors" element={<DonorsPage donors={donors} formData={formData} handleInputChange={handleInputChange} handleDonorSubmit={handleDonorSubmit} />} />
                <Route path="/requests" element={<RequestsPage requests={requests} requestFormData={requestFormData} handleRequestInputChange={handleRequestInputChange} handleRequestSubmit={handleRequestSubmit} />} />
                <Route path="/inventory" element={<InventoryPage inventory={inventory} inventoryFormData={inventoryFormData} handleInventoryInputChange={handleInventoryInputChange} handleInventorySubmit={handleInventorySubmit} />} />
                <Route path="/donations" element={<DonationsPage donations={donations} donationFormData={donationFormData} handleDonationInputChange={handleDonationInputChange} handleDonationSubmit={handleDonationSubmit} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            )}
          </div>
        </Router>
      );
}

export default App;