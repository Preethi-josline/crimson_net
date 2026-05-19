import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldAlert, 
  Activity, 
  Heart, 
  GitPullRequest, 
  Building2,
  Phone,
  MapPin,
  Calendar,
  Droplet
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    bloodGroup: 'O+',
    location: '',
    age: '',
    lastDonationDate: '',
  });
  const [role, setRole] = useState('donor'); // Default role
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [city, setCity] = useState('Hyderabad');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAutoDetectGPS = () => {
    setGpsLoading(true);
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGpsLoading(false);
      },
      (error) => {
        console.error('GPS detection error:', error);
        setGpsError('Unable to retrieve your location. Using default city coordinates.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Basic Validations
    if (!formData.name.trim()) return setFormError('Name is required');
    if (!formData.email.trim()) return setFormError('Email is required');
    if (formData.password.length < 6) return setFormError('Password must be at least 6 characters');

    // Donor Validations
    if (role === 'donor') {
      if (!formData.phoneNumber.trim()) return setFormError('Phone number is required');
      if (!formData.location.trim()) return setFormError('Location is required');
      if (!formData.age) return setFormError('Age is required');
      if (parseInt(formData.age) < 18 || parseInt(formData.age) > 65) {
        return setFormError('Donor age must be between 18 and 65 years');
      }
    }

    setIsSubmitting(true);

    try {
      const extraDonorData = role === 'donor' ? {
        phoneNumber: formData.phoneNumber,
        bloodGroup: formData.bloodGroup,
        location: formData.location,
        age: parseInt(formData.age),
        lastDonationDate: formData.lastDonationDate || undefined
      } : {};

      const user = await register(
        formData.name,
        formData.email,
        formData.password,
        role,
        extraDonorData.phoneNumber,
        extraDonorData.bloodGroup,
        extraDonorData.location || city,
        extraDonorData.age,
        extraDonorData.lastDonationDate,
        city,
        latitude,
        longitude
      );
      
      // Redirect based on role
      switch (user.role) {
        case 'donor':
          navigate('/donor-dashboard');
          break;
        case 'hospital':
          navigate('/hospital-dashboard');
          break;
        case 'blood bank':
          navigate('/blood-bank-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/login');
      }
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    {
      id: 'donor',
      title: 'Blood Donor',
      desc: 'Donate blood, schedule slots & view records',
      icon: Heart,
    },
    {
      id: 'hospital',
      title: 'Hospital',
      desc: 'Request blood units & track request status',
      icon: Building2,
    },
    {
      id: 'blood bank',
      title: 'Blood Bank',
      desc: 'Manage blood stock inventory & details',
      icon: Activity,
    },
    {
      id: 'admin',
      title: 'Administrator',
      desc: 'Control system accounts & configurations',
      icon: GitPullRequest,
    },
  ];

  return (
    <div className="auth-container">
      <div className="glass-card register-card">
        <h2 style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
          Join <span className="gradient-text">AegisFlow</span>
        </h2>
        <p className="subtitle" style={{ textAlign: 'center' }}>
          Create an account to start managing & request blood inventories
        </p>

        {formError && (
          <div className="alert-error">
            <ShieldAlert size={18} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Grid (First Step) */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ marginBottom: '0.5rem' }}>Select Your Role</label>
            <div className="role-grid">
              {roles.map((r) => {
                const IconComponent = r.icon;
                return (
                  <div
                    key={r.id}
                    className={`role-card ${role === r.id ? 'selected' : ''}`}
                    onClick={() => selectRole(r.id)}
                  >
                    <IconComponent size={22} />
                    <span>{r.title}</span>
                    <p>{r.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Credentials */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="name">
                <User size={16} /> Name / Org Name
              </label>
              <div className="input-container">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input-field"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={16} /> Email Address
              </label>
              <div className="input-container">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input-field"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={16} /> Password
            </label>
            <div className="input-container">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                id="password"
                name="password"
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Donor-Specific Fields Grid */}
          {role === 'donor' && (
            <div 
              style={{ 
                borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                paddingTop: '1.5rem',
                marginTop: '1rem',
                animation: 'cardEntrance 0.4s ease-out'
              }}
            >
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                Donor Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="phoneNumber">
                    <Phone size={16} /> Phone Number
                  </label>
                  <div className="input-container">
                    <Phone className="input-icon" size={18} />
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      className="input-field"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required={role === 'donor'}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bloodGroup">
                    <Droplet size={16} /> Blood Group
                  </label>
                  <div className="input-container">
                    <Droplet className="input-icon" size={18} />
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      className="input-field"
                      style={{ cursor: 'pointer' }}
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      required={role === 'donor'}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="city">
                    <MapPin size={16} /> Select City
                  </label>
                  <div className="input-container">
                    <MapPin className="input-icon" size={18} />
                    <select
                      id="city"
                      name="city"
                      className="input-field"
                      style={{ cursor: 'pointer' }}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required={role === 'donor'}
                    >
                      <option value="Guntur">Guntur</option>
                      <option value="Vijayawada">Vijayawada</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">
                    <MapPin size={16} /> Area / Street (Optional)
                  </label>
                  <div className="input-container">
                    <MapPin className="input-icon" size={18} />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      className="input-field"
                      placeholder="e.g. Gachibowli"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* GPS Detection */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {latitude && longitude ? (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ✓ GPS Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                      </span>
                    ) : gpsError ? (
                      <span style={{ color: '#f59e0b' }}>⚠️ {gpsError}</span>
                    ) : (
                      'Auto-detect GPS coordinates for distance-sorting'
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoDetectGPS}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: 'auto', marginTop: 0 }}
                    disabled={gpsLoading}
                  >
                    {gpsLoading ? 'Detecting...' : 'Detect GPS'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="age">
                    <User size={16} /> Age
                  </label>
                  <div className="input-container">
                    <User className="input-icon" size={18} />
                    <input
                      type="number"
                      id="age"
                      name="age"
                      min="18"
                      max="65"
                      className="input-field"
                      placeholder="25"
                      value={formData.age}
                      onChange={handleInputChange}
                      required={role === 'donor'}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lastDonationDate">
                  <Calendar size={16} /> Last Donation Date (Optional)
                </label>
                <div className="input-container">
                  <Calendar className="input-icon" size={18} />
                  <input
                    type="date"
                    id="lastDonationDate"
                    name="lastDonationDate"
                    className="input-field"
                    style={{ paddingRight: '1rem' }}
                    value={formData.lastDonationDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '1rem' }}>
            {isSubmitting ? (
              <>
                <div className="spinner"></div> Registering Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Log In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
