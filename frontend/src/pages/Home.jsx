import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Heart, 
  Activity, 
  ShieldAlert, 
  Users, 
  Building2, 
  Flame, 
  ArrowRight,
  Database,
  MapPin
} from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const dashboardRedirect = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'donor': return '/donor-dashboard';
      case 'hospital': return '/hospital-dashboard';
      case 'blood bank': return '/blood-bank-dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/login';
    }
  };

  const handleCTA = () => {
    if (user) {
      navigate(dashboardRedirect());
    } else {
      navigate('/register');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', overflowX: 'hidden' }}>
      
      {/* Navbar */}
      <nav className="dashboard-nav" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="nav-brand">
          <Heart size={26} color="#ef4444" fill="#ef4444" style={{ filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            Crimson<span style={{ color: '#ef4444' }}>Net</span>
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>Home</Link>
          <a href="#about" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', transition: 'var(--transition)' }}
             onMouseEnter={(e) => e.target.style.color = 'var(--text-main)'}
             onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>About</a>
          
          {user ? (
            <Link to={dashboardRedirect()} className="btn-primary" style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem', textDecoration: 'none', borderRadius: '6px', width: 'auto' }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', transition: 'var(--transition)' }}
                 onMouseEnter={(e) => e.target.style.color = 'var(--text-main)'}
                 onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem', textDecoration: 'none', borderRadius: '6px', width: 'auto' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '6rem 2rem 5rem 2rem', maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '0.35rem 0.75rem', borderRadius: '30px', width: 'fit-content' }}>
            <Flame size={14} color="#ef4444" fill="#ef4444" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', tracking: '0.05em', color: '#f87171' }}>Emergency Response Network</span>
          </div>
          <h1 style={{ fontSize: '3.2rem', lineHeight: '1.15', fontWeight: 800, margin: 0 }}>
            Crimson<span className="gradient-text">Net</span> Healthcare
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
            Smart Blood Donation & Emergency Management System. Utilizing real-time proximity-based GPS matching, automatic stock shortage alerts, and dynamic forecasting to connect matching donors with critical hospital requests.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={handleCTA} className="btn-primary" style={{ width: 'auto', padding: '0.85rem 2.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Get Started <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Brand Illustration (SVG) */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '50%', filter: 'blur(60px)', zIndex: -1 }}></div>
          <svg viewBox="0 0 400 400" width="100%" height="340" style={{ maxWidth: '380px' }}>
            <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="2" />
            <circle cx="200" cy="200" r="110" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="2" />
            
            <line x1="80" y1="120" x2="200" y2="200" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="2" strokeDasharray="5 5" />
            <line x1="320" y1="120" x2="200" y2="200" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="2" strokeDasharray="5 5" />
            <line x1="100" y1="280" x2="200" y2="200" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="2" />
            <line x1="300" y1="280" x2="200" y2="200" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
            
            <circle cx="200" cy="200" r="45" fill="rgba(239, 68, 68, 0.15)" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.4))' }} />
            <path d="M200 215 C190 205, 178 195, 178 185 C178 178, 184 172, 191 172 C195 172, 198 174, 200 176 C202 174, 205 172, 209 172 C216 172, 222 178, 222 185 C222 195, 210 205, 200 215 Z" fill="#ef4444" />
            
            <circle cx="80" cy="120" r="16" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
            <path d="M76 116 H84 V124 H76 Z" fill="none" stroke="#6366f1" strokeWidth="2" />
            
            <circle cx="320" cy="120" r="14" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
            <circle cx="100" cy="280" r="14" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
            
            <circle cx="300" cy="280" r="18" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <line x1="294" y1="280" x2="306" y2="280" stroke="#10b981" strokeWidth="2" />
            <line x1="300" y1="274" x2="300" y2="286" stroke="#10b981" strokeWidth="2" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ backgroundColor: 'rgba(20, 27, 45, 0.3)', borderY: '1px solid rgba(255,255,255,0.05)', padding: '3.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <div className="stats-grid" style={{ marginBottom: 0 }}>
            
            <div className="stat-card" style={{ background: 'rgba(20, 27, 45, 0.6)' }}>
              <div className="stat-icon red">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>15,240+</h3>
                <p>Registered Blood Donors</p>
              </div>
            </div>

            <div className="stat-card" style={{ background: 'rgba(20, 27, 45, 0.6)' }}>
              <div className="stat-icon blue">
                <Building2 size={24} />
              </div>
              <div className="stat-info">
                <h3>420+</h3>
                <p>Partner Hospitals & Units</p>
              </div>
            </div>

            <div className="stat-card" style={{ background: 'rgba(20, 27, 45, 0.6)' }}>
              <div className="stat-icon green">
                <Activity size={24} />
              </div>
              <div className="stat-info">
                <h3>85,600+</h3>
                <p>Blood Bags Managed & Logged</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About Section / Features */}
      <section id="about" style={{ padding: '6rem 2rem', maxWidth: '1200px', width: '100%', margin: '0 auto', scrollMarginTop: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
            About <span className="gradient-text">CrimsonNet</span>
          </h2>
          <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Built specifically to solve logistical delays in hospital supply chains, using automated smart matching logic and direct donation logs.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          
          <div className="glass-card" style={{ animation: 'none', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', maxWidth: 'none' }}>
            <div className="stat-icon blue" style={{ width: '40px', height: '40px' }}>
              <Database size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>AI Demand Forecasting</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              Anticipates future demand based on local historical data, giving operators warning triggers for low stock before it compromises patient care.
            </p>
          </div>

          <div className="glass-card" style={{ animation: 'none', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', maxWidth: 'none' }}>
            <div className="stat-icon red" style={{ width: '40px', height: '40px' }}>
              <MapPin size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>GPS Proximity Matching</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              Calculates precise distances using Haversine formulas. When shortages arise, eligible nearby donors are prioritized first.
            </p>
          </div>

          <div className="glass-card" style={{ animation: 'none', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', maxWidth: 'none' }}>
            <div className="stat-icon green" style={{ width: '40px', height: '40px' }}>
              <ShieldAlert size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Critical Alerts</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              Flags low-stock situations (under 3 bags) instantly, opening matching queues for donation updates and sending direct alerts to matched donors.
            </p>
          </div>

          <div className="glass-card" style={{ animation: 'none', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', maxWidth: 'none' }}>
            <div className="stat-icon yellow" style={{ width: '40px', height: '40px' }}>
              <Activity size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Integrated Stock Hub</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              Operators can log new donations instantly, syncing current units immediately to keep hospital emergency approvals responsive.
            </p>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ backgroundColor: 'rgba(20, 27, 45, 0.2)', padding: '6rem 2rem', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>How It Works</h2>
            <p className="subtitle" style={{ maxWidth: '500px', margin: '0 auto', marginTop: '0.5rem' }}>
              Four simple integrated phases connecting supply to emergency demand.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', position: 'relative' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 800, fontSize: '1.3rem' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Register</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                Donors sign up with location, age, and blood group. Hospitals register their units.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', border: '2px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontWeight: 800, fontSize: '1.3rem' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Request Blood</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                Hospitals enter the urgency level and required units from their dashboards.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 800, fontSize: '1.3rem' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Find Donors</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                System processes active inventory levels and coordinates nearest available donors.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontWeight: 800, fontSize: '1.3rem' }}>
                4
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Save Lives</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                Operator approves request, deducting matching inventory, and registers the logs.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '6rem 2rem 8rem 2rem', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
        <div className="glass-card" style={{ animation: 'none', maxWidth: 'none', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(20, 27, 45, 0.9) 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <Heart size={48} color="#ef4444" fill="#ef4444" style={{ filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))' }} />
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0 }}>Ready to get started?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '600px', margin: 0 }}>
            Join the CrimsonNet network today to access AI forecasting registries, manage stock catalogs, and submit secure blood requests.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button onClick={handleCTA} className="btn-primary" style={{ width: 'auto', padding: '0.85rem 2.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Get Started <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={20} color="#ef4444" fill="#ef4444" />
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>CrimsonNet</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', maxWidth: '600px', lineHeight: '1.5', margin: 0 }}>
            This is a secure medical blood stock forecasting system. All donor details, GPS parameters, and logs are handled according to healthcare confidentiality guidelines.
          </p>
          <div style={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            &copy; {new Date().getFullYear()} CrimsonNet emergency network. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
