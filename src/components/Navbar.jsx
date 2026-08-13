import React, { useState } from 'react';
import { UpdatePasswordModal } from './Auth/UpdatePasswordModal';

export const Navbar = ({ user, onLogout }) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-admin">System Administrator</span>;
      case 'STORE_OWNER':
        return <span className="badge badge-owner">Store Owner</span>;
      case 'NORMAL':
      default:
        return <span className="badge badge-user">Normal User</span>;
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <div>
            <a href="#" className="navbar-brand">
              <span>🏪 Store Rating Portal</span>
            </a>
            <span className="navbar-subtitle">Store Management & Customer Feedback System</span>
          </div>

          {user && (
            <div className="user-info">
              <div className="user-details">
                <div>
                  <span className="user-name">{user.name}</span>
                  {getRoleBadge(user.role)}
                </div>
                <div className="user-email">{user.email}</div>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="btn btn-secondary btn-sm"
              >
                Update Password
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="btn btn-danger btn-sm"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      {user && (
        <UpdatePasswordModal
          user={user}
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </>
  );
};
