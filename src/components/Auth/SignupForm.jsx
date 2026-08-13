import React, { useState } from 'react';
import {
  validateName,
  validateAddress,
  validatePassword,
  validateEmail,
  validateUserForm,
} from '../../utils/validation';
import { ValidationMessage } from '../Common/ValidationMessage';

export const SignupForm = ({ onSignupSuccess, onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field) => {
    let errMessage = null;
    switch (field) {
      case 'name':
        errMessage = validateName(formData.name);
        break;
      case 'email':
        errMessage = validateEmail(formData.email);
        break;
      case 'address':
        errMessage = validateAddress(formData.address);
        break;
      case 'password':
        errMessage = validatePassword(formData.password);
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: errMessage || undefined }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      let errMessage = null;
      if (field === 'name') errMessage = validateName(value);
      if (field === 'email') errMessage = validateEmail(value);
      if (field === 'address') errMessage = validateAddress(value);
      if (field === 'password') errMessage = validatePassword(value);
      setErrors((prev) => ({ ...prev, [field]: errMessage || undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    const validationRes = validateUserForm(formData);
    if (Object.keys(validationRes).length > 0) {
      setErrors(validationRes);
      setTouched({ name: true, email: true, address: true, password: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setGeneralError(data.error || 'Registration failed.');
        }
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSignupSuccess();
      }, 1500);
    } catch (err) {
      setGeneralError(err.message || 'Server connection error during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '480px' }}>
      <div className="auth-card">
        <div className="auth-header">
          <h2>Normal User Registration</h2>
          <p>Create an account to browse and submit store feedback</p>
        </div>

        <div className="auth-body">
          {isSuccess ? (
            <div className="alert-success" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                ✓ Registration Successful!
              </div>
              <div>Your account has been created. Redirecting to login page...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {generalError && <div className="alert-error">{generalError}</div>}

              {/* Name Field */}
              <div className="form-group">
                <label className="form-label">Full Name (20 - 60 chars)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="e.g. Christopher Harrison Montgomery"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                />
                <ValidationMessage
                  error={errors.name}
                  characterCount={`${formData.name.trim().length} / 60`}
                />
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="user@example.com"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                />
                <ValidationMessage error={errors.email} />
              </div>

              {/* Address Field */}
              <div className="form-group">
                <label className="form-label">Address (Max 400 chars)</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  onBlur={() => handleBlur('address')}
                  placeholder="Street address, city, state, zip code"
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                />
                <ValidationMessage
                  error={errors.address}
                  characterCount={`${formData.address.trim().length} / 400`}
                />
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">Password (8-16 chars, 1+ Uppercase, 1+ Special)</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="e.g. UserPassword123!"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                />
                <ValidationMessage error={errors.password} />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
              </button>

              <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8125rem' }}>
                <span style={{ color: '#64748b' }}>Already have an account? </span>
                <button
                  type="button"
                  onClick={onNavigateToLogin}
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
                  Log in here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
