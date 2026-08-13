import React, { useState } from 'react';

export const StarRating = ({
  rating,
  maxStars = 5,
  interactive = false,
  onRatingChange,
  size = 'md',
}) => {
  const [hoverRating, setHoverRating] = useState(null);

  const displayRating = hoverRating !== null ? hoverRating : Math.round(rating || 0);

  const sizeStyles = {
    sm: { fontSize: '0.9rem' },
    md: { fontSize: '1.15rem' },
    lg: { fontSize: '1.6rem' },
  };

  const handleStarClick = (index) => {
    if (interactive && typeof onRatingChange === 'function') {
      onRatingChange(index);
    }
  };

  return (
    <div className="star-rating" role="group" aria-label="Star Rating">
      {Array.from({ length: maxStars }, (_, i) => {
        const starIndex = i + 1;
        const isFilled = starIndex <= displayRating;

        return (
          <button
            key={starIndex}
            type="button"
            disabled={!interactive}
            onClick={() => handleStarClick(starIndex)}
            onMouseEnter={() => interactive && setHoverRating(starIndex)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            className="star-btn"
            style={{
              ...sizeStyles[size],
              cursor: interactive ? 'pointer' : 'default',
            }}
            aria-label={`Rate ${starIndex} out of ${maxStars} stars`}
          >
            <span className={isFilled ? 'star-filled' : 'star-empty'}>
              {isFilled ? '★' : '☆'}
            </span>
          </button>
        );
      })}
    </div>
  );
};
