import React, { useState, useEffect } from 'react';

export default function CinematicIntro({ onComplete }) {
  const [opened, setOpened] = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);

  useEffect(() => {
    // Lock body scroll during intro
    document.body.style.overflow = 'hidden';

    // Show skip button after 500ms
    const skipTimer = setTimeout(() => {
      setSkipVisible(true);
    }, 500);

    // Auto open curtain at 2400ms (2.4s) matching exact reference html
    const autoOpenTimer = setTimeout(() => {
      handleOpenCurtain();
    }, 2400);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(autoOpenTimer);
      document.body.style.overflow = '';
    };
  }, []);

  const handleOpenCurtain = () => {
    setOpened(true);
    document.body.style.overflow = '';
    document.body.style.cursor = '';
    if (onComplete) {
      setTimeout(onComplete, 900); // 900ms transition time
    }
  };

  return (
    <div
      id="intro-overlay"
      className={opened ? 'opened' : ''}
      role="dialog"
      aria-label="Intro animation"
    >
      <div className="curtain" />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="vmark">
          <svg viewBox="0 0 120 120">
            <path d="M15 20 L60 100 L105 20 M40 20 L60 58 L80 20" />
          </svg>
        </div>
        <div className="intro-label">The Vigilante MUN</div>
      </div>

      <button
        id="skip-intro"
        className={skipVisible ? 'visible' : ''}
        onClick={handleOpenCurtain}
        aria-label="Skip intro animation"
        type="button"
      >
        Skip Intro
      </button>
    </div>
  );
}
