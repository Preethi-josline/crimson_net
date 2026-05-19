import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  Activity, 
  Layers, 
  AlertOctagon, 
  Users, 
  Check, 
  X, 
  LogOut, 
  User,
  HeartPulse,
  MapPin,
  Phone,
  Mail,
  Search,
  Droplet,
  ShieldAlert,
  Sparkles,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const BloodBankDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);

  // States
  const [stock, setStock] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Donor Search State
  const [searchParams, setSearchParams] = useState({
    bloodGroup: '',
    location: '',
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [matchingDonorsByRequest, setMatchingDonorsByRequest] = useState({});
  const [donationLogs, setDonationLogs] = useState([]);
  const [activeLogTab, setActiveLogTab] = useState('requests');
  const [recoveryData, setRecoveryData] = useState([]);

  const getDonorEligibilityText = (lastDonationDate) => {
    if (!lastDonationDate) return 'Eligible';
    const lastDate = new Date(lastDonationDate);
    const diffTime = Math.abs(new Date() - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 56) return 'Eligible';
    return `Standby (${56 - diffDays} days)`;
  };

  const API_STOCK_URL = `${import.meta.env.VITE_API_URL || ''}/api/stock`;
  const API_REQUESTS_URL = `${import.meta.env.VITE_API_URL || ''}/api/requests`;
  const API_DONORS_URL = `${import.meta.env.VITE_API_URL || ''}/api/donors/search`;

  const fetchDonationLogs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/stock/donations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDonationLogs(data.donations);
      }
    } catch (err) {
      console.error('Error fetching donation logs:', err);
    }
  };

  // Fetch Inventory and Orders
  const fetchData = async () => {
    try {
      // 1. Fetch Stock
      const stockRes = await fetch(API_STOCK_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const stockData = await stockRes.json();
      let currentStock = [];
      if (stockData.success) {
        setStock(stockData.stock);
        currentStock = stockData.stock;
      }

      // 2. Fetch Requests
      const reqRes = await fetch(API_REQUESTS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reqData = await reqRes.json();
      if (reqData.success) {
        setRequests(reqData.requests);

        // Fetch matching donors automatically for pending requests with insufficient stock
        reqData.requests.filter(r => r.status === 'Pending').forEach(async (req) => {
          const groupStock = currentStock.find(s => s.bloodGroup === req.bloodGroup);
          const available = groupStock ? groupStock.units : 0;
          const isInsufficient = available < req.units;
          
          if (isInsufficient) {
            try {
              const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/donors/search?bloodGroup=${encodeURIComponent(req.bloodGroup)}&location=${encodeURIComponent(req.location)}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const dData = await res.json();
              if (dData.success) {
                setMatchingDonorsByRequest(prev => ({
                  ...prev,
                  [req._id]: dData.donors
                }));
              }
            } catch (err) {
              console.error('Error auto searching donors:', err);
            }
          }
        });
      }

      // 3. Fetch Donation Logs
      await fetchDonationLogs();

      // 4. Fetch Low Stock Recovery
      const bankCity = user?.city || user?.location || 'Hyderabad';
      const recoveryRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/stock/low-stock-recovery?city=${encodeURIComponent(bankCity)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const recoveryJson = await recoveryRes.json();
      if (recoveryJson.success) {
        setRecoveryData(recoveryJson.recoveryData);
      }

    } catch (err) {
      console.error(err);
      setError('Failed to refresh data from server');
    } finally {
      setLoading(false);
    }
  };

  // Mount and Setup Polling (Real-time updates)
  useEffect(() => {
    if (token) {
      fetchData();
      
      // Auto-refresh every 10 seconds to catch incoming hospital requests automatically
      const interval = setInterval(() => {
        fetchData();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [token]);

  // Approve request
  const handleApprove = async (id) => {
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_REQUESTS_URL}/${id}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Request approved and inventory units deducted');
        fetchData();
      } else {
        setError(data.message || 'Approval failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error approving request');
    }
  };

  // Reject request
  const handleReject = async (id) => {
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_REQUESTS_URL}/${id}/reject`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Request rejected successfully');
        fetchData();
      } else {
        setError(data.message || 'Rejection failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error rejecting request');
    }
  };

  // Receive donation workflow
  const handleReceiveDonation = async (donorName, bloodGroup, requestId) => {
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/stock/donate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          donorName,
          bloodGroup,
          hospitalRequestLinked: requestId
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Blood stock updated successfully');
        fetchData();
      } else {
        setError(data.message || 'Failed to update blood stock');
      }
    } catch (err) {
      console.error('Error receiving donation:', err);
      setError('Network error recording donation');
    }
  };

  // Donor Search Query
  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSearching(true);

    try {
      let queryStr = '?';
      if (searchParams.bloodGroup) queryStr += `bloodGroup=${encodeURIComponent(searchParams.bloodGroup)}&`;
      if (searchParams.location) queryStr += `location=${encodeURIComponent(searchParams.location)}`;

      const response = await fetch(`${API_DONORS_URL}${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.donors);
        setSearchExecuted(true);
      } else {
        setError(data.message || 'Donor search failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error during donor search');
    } finally {
      setSearching(false);
    }
  };

  // Stats calculation
  const totalUnits = stock.reduce((acc, curr) => acc + curr.units, 0);
  const lowStockCount = stock.filter(item => item.units < 5).length;
  const criticalCount = stock.filter(item => item.units < 3).length;
  const pendingRequestsCount = requests.filter(r => r.status === 'Pending').length;
  const uniqueAvailableDonorsCount = (() => {
    const ids = new Set();
    recoveryData.forEach(item => {
      item.donors.forEach(donor => {
        ids.add(donor._id);
      });
    });
    return ids.size;
  })();
  const recentlyRecoveredCount = donationLogs.length;

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <Activity size={24} color="#10b981" />
          <h2>CrimsonNet <span className="gradient-text">Blood Bank Hub</span></h2>
        </div>
        <div className="nav-user">
          <div className="user-badge role-blood-bank">
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
            Manage the blood stock registry, approve/reject distribution orders, and search local registered donors.
          </p>
        </div>

        {error && (
          <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
            <AlertOctagon size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-success" style={{ marginBottom: '1.5rem' }}>
            <Sparkles size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon green">
              <Layers size={24} />
            </div>
            <div className="stat-info">
              <h3>{loading ? '...' : `${totalUnits} Bags`}</h3>
              <p>Total Stock Level</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <AlertOctagon size={24} />
            </div>
            <div className="stat-info">
              <h3>{loading ? '...' : `${lowStockCount} Groups`}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                {criticalCount} Critical Shortage (&lt;3)
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.6 }}>
                {lowStockCount - criticalCount} Low Warnings (&lt;5)
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>{loading ? '...' : `${uniqueAvailableDonorsCount} Donors`}</h3>
              <p>Available Recovery Donors</p>
            </div>
          </div>

          <div className="stat-card font-semibold">
            <div className="stat-icon purple" style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)' }}>
              <HeartPulse size={24} />
            </div>
            <div className="stat-info">
              <h3>{loading ? '...' : `${recentlyRecoveredCount} Bags`}</h3>
              <p>Recently Recovered Stock</p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          
          {/* Blood Inventory Tracker */}
          <div className="panel-card">
            <h3>
              <HeartPulse size={18} color="#10b981" />
              Blood Stock Inventory
            </h3>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
              </div>
            ) : (
              <div className="stock-grid" style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem' }}>
                {stock.map((item) => {
                  const isCritical = item.units < 3;
                  const isLow = item.units < 5 && item.units >= 3;
                  const statusClass = isCritical ? 'critical-stock' : (isLow ? 'low-stock-alert' : '');
                  
                  return (
                    <div key={item._id} className={`stock-box ${statusClass}`} 
                      style={{ 
                        background: 'rgba(15, 23, 42, 0.4)', 
                        border: isCritical ? '1px solid #ef4444' : (isLow ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.05)'),
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center',
                        position: 'relative'
                      }}
                    >
                      <div className="stock-type" style={{ fontSize: '1.25rem', fontWeight: '800', color: isCritical ? '#ef4444' : (isLow ? '#f59e0b' : '#fff') }}>
                        {item.bloodGroup}
                      </div>
                      <div className="stock-qty" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.5rem' }}>
                        {item.units} Bags
                      </div>
                      <span className={`stock-status`} 
                        style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: '700', 
                          padding: '0.15rem 0.4rem', 
                          borderRadius: '4px',
                          background: isCritical ? 'rgba(239, 68, 68, 0.2)' : (isLow ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.15)'),
                          color: isCritical ? '#ef4444' : (isLow ? '#f59e0b' : 'var(--success)')
                        }}
                      >
                        {isCritical ? 'Critical Shortage' : (isLow ? 'Low Stock' : 'In Stock')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Hospital Requests Validation */}
          <div className="panel-card">
            <h3>
              <Layers size={18} color="#f59e0b" />
              Incoming Distribution Requests
            </h3>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', maxHeight: '330px', overflowY: 'auto' }}>
                {requests.filter(r => r.status === 'Pending').length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 1rem' }}>
                    No pending hospital distribution requests.
                  </p>
                ) : (
                  requests
                    .filter((r) => r.status === 'Pending')
                    .map((req) => {
                      const groupStock = stock.find(s => s.bloodGroup === req.bloodGroup);
                      const available = groupStock ? groupStock.units : 0;
                      const isInsufficient = available < req.units;

                      return (
                        <div
                          key={req._id}
                          style={{
                            background: 'rgba(15, 23, 42, 0.4)',
                            border: isInsufficient ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '10px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{req.hospitalName}</span>
                            <span className={`tag-badge ${
                              req.emergencyLevel === 'critical' ? 'danger' :
                              req.emergencyLevel === 'high' ? 'warning' : 'success'
                            }`} style={{ textTransform: 'capitalize' }}>
                              {req.emergencyLevel}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Demanding:{' '}
                            <strong style={{ color: 'var(--primary)' }}>
                              {req.units} Units of {req.bloodGroup}
                            </strong>{' '}
                            in <strong>{req.location}</strong>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <button
                              className="btn-primary"
                              disabled={isInsufficient}
                              style={{
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.8rem',
                                background: isInsufficient ? 'rgba(255, 255, 255, 0.05)' : 'rgba(16, 185, 129, 0.15)',
                                color: isInsufficient ? 'var(--text-muted)' : 'var(--success)',
                                border: isInsufficient ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '6px',
                                boxShadow: 'none',
                                cursor: isInsufficient ? 'not-allowed' : 'pointer'
                              }}
                              onClick={() => handleApprove(req._id)}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              className="btn-logout"
                              style={{
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.8rem',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: 'var(--primary)',
                                borderRadius: '6px',
                              }}
                              onClick={() => handleReject(req._id)}
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>

                          {/* Insufficient Stock Auto Match Display */}
                          {isInsufficient && (
                            <div style={{
                              marginTop: '0.5rem',
                              background: 'rgba(239, 68, 68, 0.04)',
                              border: '1px dashed rgba(239, 68, 68, 0.15)',
                              padding: '0.75rem',
                              borderRadius: '6px',
                            }}>
                              <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                                <AlertTriangle size={12} /> Insufficient stock ({available} available / {req.units} required)
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '600' }}>
                                Matching Donors in {req.location}:
                              </div>
                              
                              {matchingDonorsByRequest[req._id] && matchingDonorsByRequest[req._id].length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  {matchingDonorsByRequest[req._id].map(donor => (
                                    <div key={donor._id} style={{
                                      background: 'rgba(15, 23, 42, 0.5)',
                                      border: '1px solid rgba(255, 255, 255, 0.03)',
                                      borderRadius: '6px',
                                      padding: '0.5rem',
                                      fontSize: '0.75rem'
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                                        <span>{donor.name}</span>
                                        <span style={{ 
                                          color: getDonorEligibilityText(donor.lastDonationDate) === 'Eligible' ? 'var(--success)' : 'var(--warning)',
                                          fontSize: '0.65rem'
                                        }}>
                                          {getDonorEligibilityText(donor.lastDonationDate)}
                                        </span>
                                      </div>
                                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: '0.2rem 0' }}>
                                        📞 {donor.phoneNumber} | 📍 {donor.city || donor.location} ({donor.distance !== undefined && donor.distance !== 9999 ? `${donor.distance} km` : 'N/A'}) | Group: {donor.bloodGroup}
                                      </div>
                                      
                                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem' }}>
                                        <a href={`tel:${donor.phoneNumber}`} className="btn-primary" style={{
                                          padding: '0.2rem 0.4rem',
                                          fontSize: '0.65rem',
                                          background: 'rgba(99, 102, 241, 0.15)',
                                          color: '#818cf8',
                                          border: '1px solid rgba(99, 102, 241, 0.3)',
                                          borderRadius: '4px',
                                          textDecoration: 'none',
                                          textAlign: 'center'
                                        }}>Call</a>
                                        <a href={`mailto:${donor.email}`} className="btn-primary" style={{
                                          padding: '0.2rem 0.4rem',
                                          fontSize: '0.65rem',
                                          background: 'rgba(99, 102, 241, 0.15)',
                                          color: '#818cf8',
                                          border: '1px solid rgba(99, 102, 241, 0.3)',
                                          borderRadius: '4px',
                                          textDecoration: 'none',
                                          textAlign: 'center'
                                        }}>Email</a>
                                        <button 
                                          type="button"
                                          className="btn-primary"
                                          onClick={() => alert(`Donation request sent to ${donor.name}!`)}
                                          style={{
                                            padding: '0.2rem 0.4rem',
                                            fontSize: '0.65rem',
                                            background: 'rgba(245, 158, 11, 0.15)',
                                            color: 'var(--warning)',
                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                            borderRadius: '4px',
                                          }}
                                        >Request</button>
                                        <button 
                                          type="button"
                                          className="btn-primary"
                                          onClick={() => handleReceiveDonation(donor.name, donor.bloodGroup, req._id)}
                                          style={{
                                            padding: '0.2rem 0.4rem',
                                            fontSize: '0.65rem',
                                            background: 'rgba(16, 185, 129, 0.15)',
                                            color: 'var(--success)',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            borderRadius: '4px',
                                          }}
                                        >Received</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                  No matching donors available
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Automatic Low-Stock Donor Recovery System */}
        <div className="panel-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem' }}>
            <Sparkles size={18} color="#ef4444" />
            Automatic Low-Stock Donor Recovery System
          </h3>
          
          {recoveryData.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              ✓ All blood stock types are currently at safe levels (&gt;= 5 bags).
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
              {recoveryData.map((item) => (
                <div key={item.bloodGroup} style={{
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: item.isCritical ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '10px',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: '800', color: item.isCritical ? '#ef4444' : '#f59e0b' }}>
                        {item.bloodGroup}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: item.isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: item.isCritical ? '#ef4444' : '#f59e0b'
                      }}>
                        {item.isCritical ? 'Critical Shortage' : 'Low Stock'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Current Stock: <strong style={{ color: '#fff' }}>{item.units} bags</strong>
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Available Donors ({item.donors.length}):
                  </div>

                  {item.donors.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                      No matching donors available for {item.bloodGroup}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                      {item.donors.map(donor => (
                        <div key={donor._id} style={{
                          background: 'rgba(15, 23, 42, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                          borderRadius: '8px',
                          padding: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{donor.name}</span>
                            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 'bold' }}>
                              {getDonorEligibilityText(donor.lastDonationDate)}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            📞 {donor.phoneNumber} | 📍 {donor.city || donor.location} ({donor.distance !== undefined && donor.distance !== 9999 ? `${donor.distance} km` : 'N/A'})
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => {
                                alert(`Donation request sent to ${donor.name}!`);
                              }}
                              style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.7rem',
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: 'var(--warning)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                flex: 1
                              }}
                            >
                              Request Donation
                            </button>
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => handleReceiveDonation(donor.name, item.bloodGroup)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.7rem',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: 'var(--success)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                flex: 1
                              }}
                            >
                              Donation Received
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Split Section: Donor Lookup Search & Historical Logs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', marginBottom: '2rem' }}>
          
          {/* Donor Search Panel */}
          <div className="panel-card">
            <h3>
              <Search size={18} color="#6366f1" />
              Donor Search Directory
            </h3>
            
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="bloodGroup">Blood Group</label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    className="input-field"
                    style={{ cursor: 'pointer' }}
                    value={searchParams.bloodGroup}
                    onChange={handleSearchChange}
                  >
                    <option value="">All groups</option>
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

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="location">City/Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="input-field"
                    placeholder="e.g. Chicago"
                    value={searchParams.location}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ height: '38px', marginTop: '0.25rem' }}>
                {searching ? 'Searching...' : 'Lookup Registered Donors'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', maxHeight: '200px', overflowY: 'auto' }}>
              {searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {searchResults.map((donor) => (
                    <div 
                      key={donor._id}
                      style={{ 
                        background: 'rgba(15, 23, 42, 0.4)', 
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{donor.name}</span>
                        <span className="user-badge role-donor" style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem' }}>
                          <Droplet size={10} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} /> {donor.bloodGroup}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={10} /> {donor.phoneNumber}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={10} /> {donor.location}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.25rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Eligibility:</span>
                        <span style={{ 
                          fontWeight: '700', 
                          color: getDonorEligibilityText(donor.lastDonationDate) === 'Eligible' ? 'var(--success)' : 'var(--warning)' 
                        }}>
                          {getDonorEligibilityText(donor.lastDonationDate)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem' }}>
                        <a href={`tel:${donor.phoneNumber}`} className="btn-primary" style={{
                          padding: '0.2rem 0.4rem',
                          fontSize: '0.65rem',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#818cf8',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          textAlign: 'center'
                        }}>Call Donor</a>
                        <a href={`mailto:${donor.email}`} className="btn-primary" style={{
                          padding: '0.2rem 0.4rem',
                          fontSize: '0.65rem',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#818cf8',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          textAlign: 'center'
                        }}>Email Donor</a>
                        <button 
                          type="button"
                          className="btn-primary"
                          onClick={() => alert(`Donation request sent to ${donor.name}!`)}
                          style={{
                            padding: '0.2rem 0.4rem',
                            fontSize: '0.65rem',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: 'var(--warning)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '4px',
                          }}
                        >Request Donation</button>
                        <button 
                          type="button"
                          className="btn-primary"
                          onClick={() => handleReceiveDonation(donor.name, donor.bloodGroup, null)}
                          style={{
                            padding: '0.2rem 0.4rem',
                            fontSize: '0.65rem',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--success)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '4px',
                          }}
                        >Donation Received</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchExecuted ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 1rem' }}>
                  No matching donors available
                </p>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 1rem' }}>
                  {searching ? 'Loading...' : 'Enter criteria and click search.'}
                </p>
              )}
            </div>
          </div>

          {/* Historical Demand Logs Table */}
          <div className="panel-card">
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
              <button 
                onClick={() => setActiveLogTab('requests')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeLogTab === 'requests' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeLogTab === 'requests' ? '2px solid var(--primary)' : 'none',
                  paddingBottom: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Hospital Demand Logs
              </button>
              <button 
                onClick={() => setActiveLogTab('donations')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeLogTab === 'donations' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeLogTab === 'donations' ? '2px solid var(--primary)' : 'none',
                  paddingBottom: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Donation History Logs
              </button>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
              </div>
            ) : activeLogTab === 'requests' ? (
              <div className="data-table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table className="data-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Hospital</th>
                      <th>Blood Group</th>
                      <th>Qty</th>
                      <th>Urgency</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((item) => (
                      <tr key={item._id}>
                        <td style={{ fontWeight: '600' }}>{item.hospitalName}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{item.bloodGroup}</td>
                        <td>{item.units} Bags</td>
                        <td>
                          <span className={`tag-badge ${
                            item.emergencyLevel === 'critical' ? 'danger' :
                            item.emergencyLevel === 'high' ? 'warning' : 'success'
                          }`} style={{ fontSize: '0.65rem' }}>
                            {item.emergencyLevel}
                          </span>
                        </td>
                        <td>
                          <span className={`tag-badge ${
                            item.status === 'Approved' ? 'success' :
                            item.status === 'Rejected' ? 'danger' : 'warning'
                          }`} style={{ background: 'transparent', border: '1px solid currentColor', fontSize: '0.65rem' }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="data-table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table className="data-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Donor Name</th>
                      <th>Blood Group</th>
                      <th>Date</th>
                      <th>Linked Hospital Request</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donationLogs.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                          No donation records registered yet.
                        </td>
                      </tr>
                    ) : (
                      donationLogs.map((log) => (
                        <tr key={log._id}>
                          <td style={{ fontWeight: '600' }}>{log.donorName}</td>
                          <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>{log.bloodGroup}</td>
                          <td>{new Date(log.date).toLocaleString()}</td>
                          <td style={{ color: 'var(--text-muted)' }}>
                            {log.hospitalRequestLinked 
                              ? `${log.hospitalRequestLinked.hospitalName} (${log.hospitalRequestLinked.location})` 
                              : 'Walk-in / General Donation'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BloodBankDashboard;
