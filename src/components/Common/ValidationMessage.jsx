import React from 'react';

export const ValidationMessage = ({ error, characterCount }) => {
  if (!error && !characterCount) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
      {error ? (
        <span className="error-text">{error}</span>
      ) : (
        <span />
      )}
      {characterCount && (
        <span className="form-text" style={{ marginLeft: 'auto', fontFamily: 'monospace' }}>
          {characterCount}
        </span>
      )}
    </div>
  );
};
