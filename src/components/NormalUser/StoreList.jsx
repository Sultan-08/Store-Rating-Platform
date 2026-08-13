import React, { useState, useEffect } from 'react';
import { DataTable } from '../Common/DataTable';
import { StarRating } from '../Common/StarRating';

export const StoreList = ({ user }) => {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Rating modal state
  const [activeStoreForRating, setActiveStoreForRating] = useState(null);
  const [selectedScore, setSelectedScore] = useState(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState(null);

  useEffect(() => {
    fetchStores();
  }, [searchTerm]);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('userId', user.id);

      const res = await fetch(`/api/stores?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setStores(data);
      }
    } catch (err) {
      console.error('Error fetching stores for normal user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRatingModal = (store) => {
    setActiveStoreForRating(store);
    setSelectedScore(store.userRating || 5);
    setRatingMessage(null);
  };

  const handleRatingSubmit = async () => {
    if (!activeStoreForRating) return;

    setIsSubmittingRating(true);
    setRatingMessage(null);

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: activeStoreForRating.id,
          userId: user.id,
          rating: selectedScore,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit rating.');
      }

      setRatingMessage(data.message || 'Rating saved successfully!');

      setTimeout(() => {
        setActiveStoreForRating(null);
        fetchStores();
      }, 1000);
    } catch (err) {
      setRatingMessage(err.message || 'Error submitting rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Store Name',
      sortable: true,
      render: (s) => (
        <div>
          <strong style={{ color: '#0f172a' }}>{s.name}</strong>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
            {s.email}
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      render: (s) => <span>{s.address}</span>,
    },
    {
      key: 'averageRating',
      header: 'Overall Rating',
      sortable: true,
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StarRating rating={s.averageRating} size="sm" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
            {s.averageRating > 0 ? `${s.averageRating} / 5` : 'No ratings'}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            ({s.ratingCount})
          </span>
        </div>
      ),
    },
    {
      key: 'userRating',
      header: 'My Rating',
      sortable: true,
      render: (s) => {
        if (s.userRating && s.userRating > 0) {
          return (
            <span className="badge badge-owner">
              ★ {s.userRating} / 5
            </span>
          );
        }
        return <span style={{ fontSize: '0.75rem', color: '#94a3b8', italic: 'true' }}>Not rated yet</span>;
      },
    },
    {
      key: 'actions',
      header: 'Action',
      sortable: false,
      render: (s) => {
        const hasRated = Boolean(s.userRating && s.userRating > 0);
        return (
          <button
            type="button"
            onClick={() => handleOpenRatingModal(s)}
            className={`btn btn-sm ${hasRated ? 'btn-warning' : 'btn-primary'}`}
          >
            {hasRated ? 'Modify Rating' : 'Submit Rating'}
          </button>
        );
      },
    },
  ];

  return (
    <div>
      {/* Search Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Explore & Rate Stores</h2>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Browse registered stores and submit 1 to 5 star ratings
          </span>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by store name or address..."
          className="form-control"
          style={{ width: '280px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
        />
      </div>

      {/* Stores Table */}
      <div className="card">
        <DataTable
          columns={columns}
          data={stores}
          keyExtractor={(s) => s.id}
          emptyMessage="No stores found matching your search term."
        />
      </div>

      {/* RATING MODAL */}
      {activeStoreForRating && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {activeStoreForRating.userRating ? 'Modify Store Rating' : 'Submit Store Rating'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveStoreForRating(null)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                {activeStoreForRating.name}
              </h4>
              <p style={{ margin: '0.25rem 0 1rem 0', fontSize: '0.8125rem', color: '#64748b' }}>
                {activeStoreForRating.address}
              </p>

              {ratingMessage && (
                <div className="alert-success" style={{ marginBottom: '1rem' }}>
                  {ratingMessage}
                </div>
              )}

              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '0.5rem' }}>
                  Select Rating (1 to 5 Stars)
                </div>
                <StarRating
                  rating={selectedScore}
                  interactive={true}
                  onRatingChange={(score) => setSelectedScore(score)}
                  size="lg"
                />
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#b45309', marginTop: '0.5rem' }}>
                  {selectedScore} out of 5 Stars
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setActiveStoreForRating(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingRating}
                onClick={handleRatingSubmit}
                className="btn btn-primary"
              >
                {isSubmittingRating ? 'Saving...' : 'Confirm Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
