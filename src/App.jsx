import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { StoreList } from './components/NormalUser/StoreList';
import { OwnerDashboard } from './components/StoreOwner/OwnerDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState('LOGIN');

  useEffect(() => {
    const savedToken = localStorage.getItem('srp_auth_token');
    const savedUser = localStorage.getItem('srp_auth_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        setView('DASHBOARD');
      } catch (err) {
        localStorage.removeItem('srp_auth_token');
        localStorage.removeItem('srp_auth_user');
      }
    }
  }, []);

  const handleLoginSuccess = (authToken, loggedUser) => {
    setToken(authToken);
    setUser(loggedUser);
    localStorage.setItem('srp_auth_token', authToken);
    localStorage.setItem('srp_auth_user', JSON.stringify(loggedUser));
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('srp_auth_token');
    localStorage.removeItem('srp_auth_user');
    setView('LOGIN');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar user={user} onLogout={handleLogout} />

      <main style={{ flex: 1, maxWidth: '1140px', width: '100%', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {view === 'LOGIN' && (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onNavigateToSignup={() => setView('SIGNUP')}
          />
        )}

        {view === 'SIGNUP' && (
          <SignupForm
            onSignupSuccess={() => setView('LOGIN')}
            onNavigateToLogin={() => setView('LOGIN')}
          />
        )}

        {view === 'DASHBOARD' && user && (
          <>
            {user.role === 'ADMIN' && <AdminDashboard />}
            {user.role === 'NORMAL' && <StoreList user={user} />}
            {user.role === 'STORE_OWNER' && <OwnerDashboard user={user} />}
          </>
        )}
      </main>

      <footer style={{ borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
        Store Rating Portal &copy; 2026. Built with React.js & Node.js
      </footer>
    </div>
  );
}
