import React, { useState } from 'react';

export default function CommitteeCard({ committee, onClick, layoutMode = 'bento' }) {
  const [isEmblemRevealed, setIsEmblemRevealed] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  const { code, name, topic, badge, photo, emblem } = committee;

  // Generate fallback monogram from acronym
  const monogram = code ? code.substring(0, 3) : 'MUN';

  const handleTouchToggle = (e) => {
    e.stopPropagation();
    setIsEmblemRevealed((prev) => !prev);
  };

  const isRevealedClass = isEmblemRevealed ? 'emblem-active' : '';

  return (
    <div
      className={`committee-card glass ${isRevealedClass} ${layoutMode === 'list' ? 'card-list-view' : ''}`}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      onClick={() => onClick && onClick(committee)}
      onMouseEnter={() => setIsEmblemRevealed(true)}
      onMouseLeave={() => setIsEmblemRevealed(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onClick) onClick(committee);
        }
      }}
    >
      {/* Top Photo Area with Emblem Overlay */}
      <div className="card-img-wrap">
        {!photoError && photo ? (
          <img
            src={photo}
            alt={`${code} committee`}
            loading="lazy"
            className="card-bg-photo"
            onError={() => setPhotoError(true)}
          />
        ) : (
          <div className="card-photo-fallback" />
        )}
        <div className="duotone-overlay" />
        <div className="scrim" />

        {/* Touch Info/Seal Toggle Button for mobile/touch fallback */}
        <button
          type="button"
          className="emblem-touch-toggle"
          aria-label={`Toggle ${code} official emblem`}
          onClick={handleTouchToggle}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </button>

        {/* Centered Emblem / Monogram Reveal Container */}
        <div className="emblem-overlay-wrap" aria-hidden="true">
          {emblem && !imgError ? (
            <img
              src={emblem}
              alt={`${code} Emblem`}
              className="emblem-img"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="emblem-fallback-monogram">
              <span>{monogram}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content (Acronym, Topic, Badge, Action) */}
      <div className="card-content-wrap">
        <div>
          <div className="acronym-row">
            <span className="acronym">{code}</span>
            {name && <span className="full-name">{name}</span>}
          </div>
          <p className="topic-preview">{topic}</p>
        </div>
        <div className="card-foot">
          {badge ? <span className="pill-badge">{badge}</span> : <span />}
          <span className="read-more">Read full agenda →</span>
        </div>
      </div>
    </div>
  );
}
