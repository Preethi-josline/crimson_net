import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      redirectToDashboard(user.role);
    }
  }, [user]);

  // Clear global auth errors when loading this component
  useEffect(() => {
    setError(null);
  }, []);

  const redirectToDashboard = (role) => {
    switch (role) {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password) {
      return setFormError('Email and Password are required');
    }

    setIsSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      redirectToDashboard(loggedUser.role);
    } catch (err) {
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <h2 style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
          Welcome to <span className="gradient-text">AegisFlow</span>
        </h2>
        <p className="subtitle" style={{ textAlign: 'center' }}>
          Log in with your credentials to access the forecasting system
        </p>

        {(formError || error) && (
          <div className="alert-error">
            <ShieldAlert size={18} />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <Mail size={16} /> Email Address
            </label>
            <div className="input-container">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                className="input-field"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="password">
              <Lock size={16} /> Password
            </label>
            <div className="input-container">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                id="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="spinner"></div> Authenticating...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
