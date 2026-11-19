import React from 'react';

const SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 28,
};

/**
 * Crisp inline SVG star rating display (1–3 stars).
 */
export default function StarRating({
  stars = 0,
  maxStars = 3,
  size = 'md',
  showLabel = false,
}) {
  const px = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className="star-rating"
      role="img"
      aria-label={`${stars} out of ${maxStars} stars`}
    >
      {Array.from({ length: maxStars }, (_, index) => {
        const filled = index < stars;
        return (
          <svg
            key={index}
            className="star-rating-icon"
            width={px}
            height={px}
            viewBox="0 0 24 24"
            fill={filled ? 'var(--star-gold)' : 'var(--star-empty)'}
            aria-hidden="true"
          >
            <path d="M12 2.4l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.3l-5.84 3.07 1.11-6.5-4.72-4.6 6.53-.95L12 2.4z" />
          </svg>
        );
      })}
      {showLabel && (
        <span className="star-rating-label">
          {stars}/{maxStars}
        </span>
      )}
    </div>
  );
}