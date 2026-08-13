import React, { useState, useEffect } from 'react';
import { DataTable } from '../Common/DataTable';
import { ValidationMessage } from '../Common/ValidationMessage';
import {
  validateName,
  validateAddress,
  validatePassword,
  validateEmail,
  validateUserForm,
  validateStoreForm,
} from '../../utils/validation';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [storeSearch, setStoreSearch] = useState('');

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);

  // Form states
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'NORMAL',
  });
  const [userFormErrors, setUserFormErrors] = useState({});
  const [userFormGeneralError, setUserFormGeneralError] = useState(null);

  const [storeFormData, setStoreFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });
  const [storeFormErrors, setStoreFormErrors] = useState({});
  const [storeFormGeneralError, setStoreFormGeneralError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [userSearch, roleFilter, storeSearch]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData) setStats(statsData);
      }

      const userParams = new URLSearchParams();
      if (userSearch) userParams.append('search', userSearch);
      if (roleFilter) userParams.append('role', roleFilter);
      const usersRes = await fetch(`/api/admin/users?${userParams.toString()}`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (Array.isArray(usersData)) setUsers(usersData);
      }

      const storeParams = new URLSearchParams();
      if (storeSearch) storeParams.append('search', storeSearch);
      const storesRes = await fetch(`/api/admin/stores?${storeParams.toString()}`);
      if (storesRes.ok) {
        const storesData = await storesRes.json();
        if (Array.isArray(storesData)) setStores(storesData);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserFormGeneralError(null);

    const validationRes = validateUserForm(userFormData);
    if (Object.keys(validationRes).length > 0) {
      setUserFormErrors(validationRes);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setUserFormErrors(data.errors);
        else setUserFormGeneralError(data.error || 'Failed to create user.');
        return;
      }

      setIsAddUserModalOpen(false);
      setUserFormData({ name: '', email: '', address: '', password: '', role: 'NORMAL' });
      setUserFormErrors({});
      fetchDashboardData();
    } catch (err) {
      setUserFormGeneralError('Error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setStoreFormGeneralError(null);

    const validationRes = validateStoreForm(storeFormData);
    if (Object.keys(validationRes).length > 0) {
      setStoreFormErrors(validationRes);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...storeFormData,
          ownerId: storeFormData.ownerId ? Number(storeFormData.ownerId) : null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setStoreFormErrors(data.errors);
        else setStoreFormGeneralError(data.error || 'Failed to create store.');
        return;
      }

      setIsAddStoreModalOpen(false);
      setStoreFormData({ name: '', email: '', address: '', ownerId: '' });
      setStoreFormErrors({});
      fetchDashboardData();
    } catch (err) {
      setStoreFormGeneralError('Error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table Columns
  const userColumns = [
    { key: 'id', header: 'User ID', sortable: true },
    {
      key: 'name',
      header: 'Full Name',
      sortable: true,
      render: (u) => <strong style={{ color: '#0f172a' }}>{u.name}</strong>,
    },
    {
      key: 'email',
      header: 'Email Address',
      sortable: true,
      render: (u) => <span style={{ fontFamily: 'monospace' }}>{u.email}</span>,
    },
    { key: 'address', header: 'Address', sortable: true },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (u) => {
        if (u.role === 'ADMIN') return <span className="badge badge-admin">System Admin</span>;
        if (u.role === 'STORE_OWNER') return <span className="badge badge-owner">Store Owner</span>;
        return <span className="badge badge-user">Normal User</span>;
      },
    },
  ];

  const storeColumns = [
    { key: 'id', header: 'Store ID', sortable: true },
    {
      key: 'name',
      header: 'Store Name',
      sortable: true,
      render: (s) => <strong style={{ color: '#0f172a' }}>{s.name}</strong>,
    },
    {
      key: 'email',
      header: 'Store Email',
      sortable: true,
      render: (s) => <span style={{ fontFamily: 'monospace' }}>{s.email}</span>,
    },
    { key: 'address', header: 'Address', sortable: true },
    {
      key: 'averageRating',
      header: 'Avg Rating',
      sortable: true,
      render: (s) => (
        <span>
          <strong>{s.averageRating > 0 ? `${s.averageRating} ★` : 'No ratings'}</strong>
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.35rem' }}>
            ({s.ratingCount})
          </span>
        </span>
      ),
    },
    {
      key: 'ownerName',
      header: 'Assigned Owner',
      sortable: true,
      render: (s) => (
        <span>
          {s.ownerName ? (
            <span style={{ fontWeight: 600 }}>{s.ownerName}</span>
          ) : (
            <span style={{ color: '#94a3b8', italic: 'true' }}>Unassigned</span>
          )}
        </span>
      ),
    },
  ];

  const storeOwnerOptions = users.filter((u) => u.role === 'STORE_OWNER');

  return (
    <div>
      {/* Page Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>System Administration</h2>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Manage platform users, registered store listings, and store owners
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={() => setIsAddUserModalOpen(true)} className="btn btn-primary">
            + Add New User
          </button>
          <button type="button" onClick={() => setIsAddStoreModalOpen(true)} className="btn btn-dark">
            + Add New Store
          </button>
        </div>
      </div>

      {/* Summary Stat Boxes */}
      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Registered Stores</div>
          <div className="stat-value">{stats.totalStores}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Submitted Ratings</div>
          <div className="stat-value">{stats.totalRatings}</div>
        </div>
      </div>

      {/* Users Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">User Directory</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Search by name, email or address..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="form-control"
              style={{ width: '240px', padding: '0.35rem 0.6rem', fontSize: '0.8125rem' }}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-control"
              style={{ width: '150px', padding: '0.35rem 0.6rem', fontSize: '0.8125rem' }}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">System Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="NORMAL">Normal User</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={userColumns}
          data={users}
          keyExtractor={(u) => u.id}
          emptyMessage="No users found matching current filters."
        />
      </div>

      {/* Stores Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Stores Directory</h3>
          <input
            type="text"
            placeholder="Search stores by name, email or address..."
            value={storeSearch}
            onChange={(e) => setStoreSearch(e.target.value)}
            className="form-control"
            style={{ width: '280px', padding: '0.35rem 0.6rem', fontSize: '0.8125rem' }}
          />
        </div>

        <DataTable
          columns={storeColumns}
          data={stores}
          keyExtractor={(s) => s.id}
          emptyMessage="No stores found matching current filters."
        />
      </div>

      {/* ADD USER MODAL */}
      {isAddUserModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create New User Account</h3>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                {userFormGeneralError && <div className="alert-error">{userFormGeneralError}</div>}

                <div className="form-group">
                  <label className="form-label">Full Name (20 - 60 chars)</label>
                  <input
                    type="text"
                    required
                    value={userFormData.name}
                    onChange={(e) =>
                      setUserFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Johnathan Alexander Vance"
                    className={`form-control ${userFormErrors.name ? 'is-invalid' : ''}`}
                  />
                  <ValidationMessage
                    error={userFormErrors.name}
                    characterCount={`${userFormData.name.trim().length} / 60`}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) =>
                      setUserFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="user@example.com"
                    className={`form-control ${userFormErrors.email ? 'is-invalid' : ''}`}
                  />
                  <ValidationMessage error={userFormErrors.email} />
                </div>

                <div className="form-group">
                  <label className="form-label">Address (Max 400 chars)</label>
                  <textarea
                    rows={2}
                    required
                    value={userFormData.address}
                    onChange={(e) =>
                      setUserFormData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Street address, city, state"
                    className={`form-control ${userFormErrors.address ? 'is-invalid' : ''}`}
                  />
                  <ValidationMessage
                    error={userFormErrors.address}
                    characterCount={`${userFormData.address.trim().length} / 400`}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password (8-16 chars, 1+ Uppercase, 1+ Special)</label>
                  <input
                    type="password"
                    required
                    value={userFormData.password}
                    onChange={(e) =>
                      setUserFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="e.g. UserPassword123!"
                    className={`form-control ${userFormErrors.password ? 'is-invalid' : ''}`}
                  />
                  <ValidationMessage error={userFormErrors.password} />
                </div>

                <div className="form-group">
                  <label className="form-label">User Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) =>
                      setUserFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="form-control"
                  >
                    <option value="NORMAL">Normal User</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STORE MODAL */}
      {isAddStoreModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create New Store Entry</h3>
              <button
                type="button"
                onClick={() => setIsAddStoreModalOpen(false)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateStore}>
              <div className="modal-body">
                {storeFormGeneralError && <div className="alert-error">{storeFormGeneralError}</div>}

                <div className="form-group">
                  <label className="form-label">Store Name (Max 60 chars)</label>
                  <input
                    type="text"
                    required
                    value={storeFormData.name}
                    onChange={(e) =>
                      setStoreFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Apex Tech Emporium"
                    className={`form-control ${storeFormErrors.name ? 'is-invalid' : ''}`}
                  />
                  <ValidationMessage
                    error={storeFormErrors.name}
                    characterCount={`${storeFormData.name.trim().length} / 60`}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Store Contact Email</label>
                  <input
                    type="email"
                    required
                    value={storeFormData.email}
                    onChange={(e) =>
                      setStoreFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="contact@store.com"
                    className={`form-control ${storeFormErrors.email ? 'is-invalid' : ''}`}
                  />
                  <ValidationMessage error={storeFormErrors.email} />
                </div>

                <div className="form-group">
                  <label className="form-label">Store Address (Max 400 chars)</label>
                  <textarea
                    rows={2}
                    required
                    value={storeFormData.address}
                    onChange={(e) =>
                      setStoreFormData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Physical store address"
                    className={`form-control ${storeFormErrors.address ? 'is-invalid' : ''}`}
                  />
                  <ValidationMessage
                    error={storeFormErrors.address}
                    characterCount={`${storeFormData.address.trim().length} / 400`}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Store Owner (Optional)</label>
                  <select
                    value={storeFormData.ownerId}
                    onChange={(e) =>
                      setStoreFormData((prev) => ({ ...prev, ownerId: e.target.value }))
                    }
                    className="form-control"
                  >
                    <option value="">-- Select Store Owner --</option>
                    {storeOwnerOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddStoreModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Creating...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
