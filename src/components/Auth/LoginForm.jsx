import React, { useState } from 'react';
import { validateEmail } from '../../utils/validation';
import { ValidationMessage } from '../Common/ValidationMessage';

const DEMO_PRESETS = [
  {
    roleTitle: 'System Administrator',
    badgeClass: 'badge-admin',
    email: 'admin@storeratings.com',
    password: 'AdminPassword123!',
  },
  {
    roleTitle: 'Store Owner',
    badgeClass: 'badge-owner',
    email: 'alexander.sterling@techhub.com',
    password: 'OwnerPassword123!',
  },
  {
    roleTitle: 'Normal User',
    badgeClass: 'badge-user',
    email: 'chris.montgomery@example.com',
    password: 'UserPassword123!',
  },
];

export const LoginForm = ({ onLoginSuccess, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [generalError, setGeneralError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailBlur = () => {
    if (email) {
      setEmailError(validateEmail(email));
    } else {
      setEmailError(null);
    }
  };

  const handleQuickLogin = (presetEmail, presetPass) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setEmailError(null);
    setGeneralError(null);
    submitLogin(presetEmail, presetPass);
  };

  const submitLogin = async (loginEmail, loginPass) => {
    const emailErr = validateEmail(loginEmail);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }

    if (!loginPass) {
      setGeneralError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setGeneralError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setGeneralError(err.message || 'Server error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitLogin(email, password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Account Sign In</h2>
          <p>Access portal for Admins, Normal Users, and Store Owners</p>
        </div>

        <div className="auth-body">
          {generalError && <div className="alert-error">{generalError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                onBlur={handleEmailBlur}
                placeholder="name@example.com"
                className={`form-control ${emailError ? 'is-invalid' : ''}`}
              />
              <ValidationMessage error={emailError} />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="form-control"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8125rem' }}>
            <span style={{ color: '#64748b' }}>Don't have an account? </span>
            <button
              type="button"
              onClick={onNavigateToSignup}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Register as Normal User
            </button>
          </div>

          {/* Quick Demo Credentials Panel */}
          <div className="demo-login-list">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem', textAlign: 'center' }}>
              Quick Demo Logins
            </div>
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.roleTitle}
                type="button"
                onClick={() => handleQuickLogin(p.email, p.password)}
                className="demo-login-item"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${p.badgeClass}`}>{p.roleTitle}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                    {p.email}
                  </div>
                </div>
                <span className="btn btn-secondary btn-sm">Login</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
