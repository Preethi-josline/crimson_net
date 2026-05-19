import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  GitPullRequest, 
  Users, 
  Building2, 
  Activity, 
  ShieldCheck, 
  LogOut, 
  User,
  Settings,
  AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  // Mock accounts registry list
  const [users, setUsers] = useState([
    { id: 1, name: 'Dr. Sarah Jenkins', email: 'sarah@stmarys.com', role: 'hospital', status: 'Active' },
    { id: 2, name: 'Central Blood Bank Registry', email: 'contact@centralblood.org', role: 'blood bank', status: 'Active' },
    { id: 3, name: 'Alice Smith', email: 'alice@gmail.com', role: 'donor', status: 'Active' },
    { id: 4, name: 'Bob Johnson', email: 'bob@yahoo.com', role: 'donor', status: 'Pending Verification' },
  ]);

  const toggleUserStatus = (id) => {
    setUsers(
      users.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            status: u.status === 'Active' ? 'Suspended' : 'Active',
          };
        }
        return u;
      })
    );
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <GitPullRequest size={24} color="#f59e0b" />
          <h2>CrimsonNet <span className="gradient-text">Admin Panel</span></h2>
        </div>
        <div className="nav-user">
          <div className="user-badge role-admin">
            <User size={14} />
            <span>{user?.name} (Admin)</span>
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
            Configure machine learning forecasting thresholds, audit system activities, and verify accounts.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>{users.length} Users</h3>
              <p>Total Registered Accounts</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <Building2 size={24} />
            </div>
            <div className="stat-info">
              <h3>12 Units</h3>
              <p>Connected Facilities</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-info">
              <h3>{users.filter(u => u.status.startsWith('Pending')).length} Users</h3>
              <p>Pending Verifications</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow">
              <ShieldCheck size={24} />
            </div>
            <div className="stat-info">
              <h3>99.9%</h3>
              <p>System Uptime Rate</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-sections-grid">
          {/* User Accounts Registry */}
          <div className="panel-card">
            <h3>
              <Users size={18} color="#f59e0b" />
              System Accounts Directory
            </h3>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Email Address</th>
                    <th>System Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: '600' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`user-badge role-${u.role.replace(' ', '-')}`} style={{ display: 'inline-flex', padding: '0.15rem 0.5rem' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`tag-badge ${
                          u.status === 'Active' ? 'success' :
                          u.status.startsWith('Pending') ? 'warning' : 'danger'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-muted)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick AI & Forecasting Settings Panel */}
          <div className="panel-card">
            <h3>
              <Settings size={18} color="#6366f1" />
              AI Forecasting Control
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  LSTM Forecasting Model Status:
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--success)' }}>Active (Auto-learning)</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Global Emergency Demand Buffer:
                </p>
                <input 
                  type="range" 
                  min="5" 
                  max="30" 
                  defaultValue="15" 
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }} 
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <span>Min: 5%</span>
                  <span>Default: 15%</span>
                  <span>Max: 30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
