import React, { useState, useEffect } from 'react';
import { DataTable } from '../Common/DataTable';
import { StarRating } from '../Common/StarRating';

export const OwnerDashboard = ({ user }) => {
  const [storeData, setStoreData] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [ratingsList, setRatingsList] = useState([]);
  const [hasStore, setHasStore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOwnerDashboard();
  }, [user.id]);

  const fetchOwnerDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/owner/dashboard?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();

        if (data && data.hasStore) {
          setHasStore(true);
          setStoreData(data.store);
          setAverageRating(data.averageRating);
          setRatingCount(data.ratingCount);
          setRatingsList(data.ratingsList || []);
        } else {
          setHasStore(false);
        }
      }
    } catch (err) {
      console.error('Error loading Store Owner dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'userName',
      header: 'User Name',
      sortable: true,
      render: (r) => <strong style={{ color: '#0f172a' }}>{r.userName}</strong>,
    },
    {
      key: 'userEmail',
      header: 'User Email',
      sortable: true,
      render: (r) => <span style={{ fontFamily: 'monospace' }}>{r.userEmail}</span>,
    },
    {
      key: 'userAddress',
      header: 'User Address',
      sortable: true,
      render: (r) => <span>{r.userAddress}</span>,
    },
    {
      key: 'rating',
      header: 'Submitted Rating',
      sortable: true,
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StarRating rating={r.rating} size="sm" />
          <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{r.rating} / 5 ★</span>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Date & Time',
      sortable: true,
      render: (r) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
          {new Date(r.updatedAt).toLocaleDateString()} {new Date(r.updatedAt).toLocaleTimeString()}
        </span>
      ),
    },
  ];

  if (!hasStore) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
          No Linked Store Found
        </h3>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: '#64748b' }}>
          Your Store Owner account is currently not assigned to a registered store.
          Please contact the System Administrator to link your account to your store.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Card */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            {storeData ? storeData.name : 'Store Owner Dashboard'}
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {storeData?.address}
          </span>
        </div>

        <button
          type="button"
          onClick={fetchOwnerDashboard}
          className="btn btn-secondary btn-sm"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Metric Stat Boxes */}
      <div className="stat-grid">
        <div className="stat-box" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-label">Average Store Rating</div>
          <div className="stat-value" style={{ color: '#b45309' }}>
            {averageRating.toFixed(1)} / 5.0 ★
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Based on {ratingCount} total customer {ratingCount === 1 ? 'rating' : 'ratings'}
          </div>
        </div>

        <div className="stat-box" style={{ borderLeft: '4px solid #2563eb' }}>
          <div className="stat-label">Total Customer Reviews</div>
          <div className="stat-value" style={{ color: '#1d4ed8' }}>
            {ratingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Submitted by registered portal users
          </div>
        </div>
      </div>

      {/* Ratings Feedback Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Customer Submitted Ratings</h3>
        </div>

        <DataTable
          columns={columns}
          data={ratingsList}
          keyExtractor={(r) => r.ratingId}
          emptyMessage="No customer ratings have been submitted for your store yet."
        />
      </div>
    </div>
  );
};
