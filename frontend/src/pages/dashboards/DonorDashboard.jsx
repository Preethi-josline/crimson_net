import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  Heart, 
  Award, 
  Calendar, 
  Droplet, 
  LogOut, 
  User, 
  CheckCircle,
  Activity,
  Phone,
  MapPin
} from 'lucide-react';

const DonorDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  // Simple eligibility calculation
  const getEligibilityStatus = () => {
    if (!user?.lastDonationDate) return { eligible: true, text: 'Eligible (Immediate)' };
    
    const lastDate = new Date(user.lastDonationDate);
    const diffTime = Math.abs(new Date() - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 56) {
      return { eligible: true, text: 'Eligible (Immediate)' };
    } else {
      const remainingDays = 56 - diffDays;
      return { eligible: false, text: `Eligible in ${remainingDays} days` };
    }
  };

  const eligibility = getEligibilityStatus();

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <Heart size={24} color="#ef4444" fill="#ef4444" />
          <h2>AegisFlow <span className="gradient-text">Donor Portal</span></h2>
        </div>
        <div className="nav-user">
          <div className="user-badge role-donor">
            <User size={14} />
            <span>{user?.name} (Donor)</span>
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
            Thank you for saving lives. Below are your profile details and donation eligibility records.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon red">
              <Droplet size={24} />
            </div>
            <div className="stat-info">
              <h3>{user?.bloodGroup || 'N/A'}</h3>
              <p>Blood Group</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Award size={24} />
            </div>
            <div className="stat-info">
              <h3>{user?.age ? `${user.age} Yrs` : 'N/A'}</h3>
              <p>Donor Age</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <MapPin size={24} />
            </div>
            <div className="stat-info">
              <h3>{user?.location || 'N/A'}</h3>
              <p>Registered Location</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '1.2rem' }}>{eligibility.text}</h3>
              <p>Eligibility Status</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout split */}
        <div className="dashboard-sections-grid">
          {/* Profile Details Card */}
          <div className="panel-card">
            <h3>
              <User size={18} color="#ef4444" />
              Donor Contact Card
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
                <span style={{ fontWeight: '600' }}>{user?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email Address:</span>
                <span style={{ fontWeight: '600' }}>{user?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phone Number:</span>
                <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>{user?.phoneNumber || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Last Whole Blood Donation:</span>
                <span style={{ fontWeight: '600' }}>
                  {user?.lastDonationDate ? new Date(user.lastDonationDate).toLocaleDateString() : 'None Recorded'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info & Card */}
          <div className="panel-card">
            <h3>
              <Award size={18} color="#6366f1" />
              Blood Compatibility Guide
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Donor Uptime Status
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: eligibility.eligible ? 'var(--success)' : 'var(--warning)' }}></span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: eligibility.eligible ? 'var(--success)' : 'var(--warning)' }}>
                    {eligibility.eligible ? 'Ready for Donation Drive' : 'In Standby Period'}
                  </span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Compatible Recipients</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {user?.bloodGroup === 'O-' && 'As an O- donor (Universal Donor), you can donate to all blood groups! Your blood is highly requested for emergencies.'}
                  {user?.bloodGroup === 'O+' && 'As an O+ donor, you can donate to O+, A+, B+, and AB+ recipients. Your donations are vital and widely used!'}
                  {user?.bloodGroup === 'A+' && 'As an A+ donor, you can donate to A+ and AB+ recipients.'}
                  {user?.bloodGroup === 'A-' && 'As an A- donor, you can donate to A-, A+, AB-, and AB+ recipients.'}
                  {user?.bloodGroup === 'B+' && 'As an B+ donor, you can donate to B+ and AB+ recipients.'}
                  {user?.bloodGroup === 'B-' && 'As an B- donor, you can donate to B-, B+, AB-, and AB+ recipients.'}
                  {user?.bloodGroup === 'AB+' && 'As an AB+ donor (Universal Recipient), you can donate to AB+ recipients.'}
                  {user?.bloodGroup === 'AB-' && 'As an AB- donor, you can donate to AB- and AB+ recipients.'}
                  {!user?.bloodGroup && 'Please complete your donor profile details.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonorDashboard;
