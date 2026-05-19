import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  Building2, 
  Plus, 
  Activity, 
  Clock, 
  CheckSquare, 
  AlertTriangle, 
  LogOut, 
  User,
  Send,
  Users,
  MapPin,
  Phone,
  Mail,
  Droplet
} from 'lucide-react';

const HospitalDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected request for showing matching donors
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const getDonorEligibilityText = (lastDonationDate) => {
    if (!lastDonationDate) return 'Eligible';
    const lastDate = new Date(lastDonationDate);
    const diffTime = Math.abs(new Date() - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 56) return 'Eligible';
    return `Standby (${56 - diffDays} days)`;
  };

  const [newRequest, setNewRequest] = useState({
    hospitalName: '',
    bloodGroup: 'A+',
    units: 1,
    location: '',
    emergencyLevel: 'medium',
  });

  const API_URL = `${import.meta.env.VITE_API_URL || ''}/api/requests`;

  // Sync hospital name from user profile
  useEffect(() => {
    if (user) {
      setNewRequest(prev => ({
        ...prev,
        hospitalName: user.name || '',
      }));
    }
  }, [user]);

  // Fetch hospital's requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/hospital`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests);
        // Pre-select first request if available
        if (data.requests.length > 0 && !selectedRequestId) {
          setSelectedRequestId(data.requests[0]._id);
        }
      } else {
        setError(data.message || 'Failed to fetch requests');
      }
    } catch (err) {
      console.error(err);
      setError('Network error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
    }
  }, [token]);

  const handleInputChange = (e) => {
    setNewRequest({
      ...newRequest,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newRequest.hospitalName.trim()) {
      return setError('Hospital Name is required');
    }
    if (!newRequest.location.trim()) {
      return setError('Location is required');
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hospitalName: newRequest.hospitalName,
          bloodGroup: newRequest.bloodGroup,
          units: parseInt(newRequest.units),
          location: newRequest.location,
          emergencyLevel: newRequest.emergencyLevel,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh requests from server to ensure fresh lists
        fetchRequests();
        setSelectedRequestId(data.request._id);
        
        // Reset form except location and hospitalName
        setNewRequest(prev => ({
          ...prev,
          bloodGroup: 'A+',
          units: 1,
          emergencyLevel: 'medium'
        }));
      } else {
        setError(data.message || 'Failed to create request');
      }
    } catch (err) {
      console.error(err);
      setError('Network error creating request');
    }
  };

  const selectedRequest = requests.find(r => r._id === selectedRequestId);

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <Building2 size={24} color="#6366f1" />
          <h2>AegisFlow <span className="gradient-text">Hospital Portal</span></h2>
        </div>
        <div className="nav-user">
          <div className="user-badge role-hospital">
            <User size={14} />
            <span>{user?.name}</span>
          </div>
          <button className="btn-logout" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome Back, <span className="gradient-text">{user?.name}</span></h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Submit emergency blood demands and match local registered donors instantly based on blood group and location.
          </p>
        </div>

        {error && (
          <div className="alert-error" style={{ marginBottom: '2rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon yellow">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{requests.filter(r => r.status === 'Pending').length}</h3>
              <p>Pending Approvals</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Activity size={24} />
            </div>
            <div className="stat-info">
              <h3>{requests.filter(r => r.status === 'Approved').length}</h3>
              <p>Approved Demands</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <CheckSquare size={24} />
            </div>
            <div className="stat-info">
              <h3>{requests.filter(r => r.status === 'Fulfilled').length}</h3>
              <p>Fulfilled Requests</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-info">
              <h3>{requests.filter(r => r.emergencyLevel === 'critical').length}</h3>
              <p>Critical Demands</p>
            </div>
          </div>
        </div>

        {/* Form and Main Listings split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Create Request Form */}
          <div className="panel-card">
            <h3>
              <Plus size={18} color="#10b981" />
              Request Blood Units
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              
              {/* Hospital Name Form Field */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="hospitalName">Hospital Name</label>
                <div className="input-container">
                  <Building2 className="input-icon" size={18} />
                  <input
                    type="text"
                    id="hospitalName"
                    name="hospitalName"
                    className="input-field"
                    placeholder="Enter hospital name"
                    value={newRequest.hospitalName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="bloodGroup">Blood Group needed</label>
                  <div className="input-container">
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      className="input-field"
                      style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                      value={newRequest.bloodGroup}
                      onChange={handleInputChange}
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="units">Units Required</label>
                  <div className="input-container">
                    <input
                      type="number"
                      id="units"
                      name="units"
                      min="1"
                      className="input-field"
                      style={{ paddingLeft: '1rem' }}
                      value={newRequest.units}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="location">Hospital Location (City/Area)</label>
                  <div className="input-container">
                    <input
                      type="text"
                      id="location"
                      name="location"
                      className="input-field"
                      style={{ paddingLeft: '1rem' }}
                      placeholder="Chicago"
                      value={newRequest.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="emergencyLevel">Emergency Level</label>
                  <div className="input-container">
                    <select
                      id="emergencyLevel"
                      name="emergencyLevel"
                      className="input-field"
                      style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                      value={newRequest.emergencyLevel}
                      onChange={handleInputChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ background: 'var(--secondary-gradient)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)', marginTop: '0.5rem' }}>
                <Send size={16} /> Submit Demands & Find Donors
              </button>
            </form>
          </div>

          {/* Dynamic Matching Donors Display Panel */}
          <div className="panel-card">
            <h3>
              <Users size={18} color="#ef4444" />
              Nearby Donors
            </h3>
            
            {selectedRequest ? (
              <div style={{ marginTop: '1rem' }}>
                <div 
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.05)', 
                    border: '1px dashed var(--primary-glow)', 
                    padding: '0.75rem 1rem', 
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.85rem' }}>
                    Matching for <strong>{selectedRequest.units} Units</strong> of{' '}
                    <strong style={{ color: 'var(--primary)' }}>{selectedRequest.bloodGroup}</strong> in{' '}
                    <strong>{selectedRequest.location}</strong>
                  </span>
                  <span className="tag-badge danger" style={{ textTransform: 'capitalize' }}>
                    {selectedRequest.emergencyLevel}
                  </span>
                </div>

                {selectedRequest.matchingDonors && selectedRequest.matchingDonors.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {selectedRequest.matchingDonors.map((donor) => (
                      <div 
                        key={donor._id}
                        style={{ 
                          background: 'rgba(15, 23, 42, 0.5)', 
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                          borderRadius: '8px',
                          padding: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{donor.name}</span>
                          <span className="user-badge role-donor" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>
                            <Droplet size={10} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} /> {donor.bloodGroup}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Phone size={12} /> {donor.phoneNumber}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={12} /> {donor.email}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '0.35rem', marginTop: '0.25rem' }}>
                          <span>City: {donor.city || donor.location}</span>
                          <span>Distance: {donor.distance !== undefined && donor.distance !== 9999 ? `${donor.distance} km` : 'N/A'}</span>
                          <span style={{ 
                            fontWeight: '700', 
                            color: getDonorEligibilityText(donor.lastDonationDate) === 'Eligible' ? 'var(--success)' : 'var(--warning)' 
                          }}>
                            Status: {getDonorEligibilityText(donor.lastDonationDate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Users size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                    <p>No matching donors available</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Users size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>Select a request from the list to search matching donors.</p>
              </div>
            )}
          </div>
        </div>

        {/* Requests Table panel - Demand History */}
        <div className="panel-card">
          <h3>
            <Activity size={18} color="#6366f1" />
            Demand History & Search Logs
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading request records...</p>
            </div>
          ) : requests.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No requests submitted yet. Use the form above to add your first blood request.
            </p>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Hospital Name</th>
                    <th>Blood Group</th>
                    <th>Required Units</th>
                    <th>Location</th>
                    <th>Urgency</th>
                    <th>Matching Donors</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((item) => (
                    <tr 
                      key={item._id} 
                      onClick={() => setSelectedRequestId(item._id)}
                      style={{ 
                        cursor: 'pointer',
                        background: selectedRequestId === item._id ? 'rgba(99, 102, 241, 0.05)' : 'transparent' 
                      }}
                    >
                      <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td style={{ fontWeight: '600' }}>{item.hospitalName}</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{item.bloodGroup}</td>
                      <td>{item.units} Units</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} color="var(--text-muted)" /> {item.location}
                        </span>
                      </td>
                      <td>
                        <span className={`tag-badge ${
                          item.emergencyLevel === 'critical' ? 'danger' :
                          item.emergencyLevel === 'high' ? 'warning' : 'success'
                        }`}>
                          {item.emergencyLevel}
                        </span>
                      </td>
                      <td>
                        <span className="user-badge" style={{ padding: '0.15rem 0.5rem', display: 'inline-flex', background: 'rgba(239, 68, 68, 0.1)' }}>
                          {item.matchingDonors ? item.matchingDonors.length : 0} Matching Donors
                        </span>
                      </td>
                      <td>
                        <span className={`tag-badge ${
                          item.status === 'Fulfilled' ? 'success' :
                          item.status === 'Approved' ? 'warning' : 'danger'
                        }`} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid currentColor' }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HospitalDashboard;
