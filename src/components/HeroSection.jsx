import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import DepthText from './DepthText';
import SpecularButton from './SpecularButton';

const Hero3D = dynamic(() => import('./Hero3D'), {
  ssr: false,
  loading: () => null,
});

export default function HeroSection({ onRegisterClick, onExploreClick }) {
  const containerRef = useRef(null);
  const heroContentRef = useRef(null);
  const scrollCueRef = useRef(null);

  return (
    <div id="hero-cinema-wrap" ref={containerRef}>
      <section id="hero">
        {/* R3F Canvas Hero Scene */}
        <Hero3D
          containerRef={containerRef}
          heroContentRef={heroContentRef}
          scrollCueRef={scrollCueRef}
        />

        {/* Hero Content Overlay */}
        <div className="hero-content" ref={heroContentRef}>
          <span className="eyebrow">OCTOBER 10–11 • DELHI UNIVERSITY</span>
          
          <h1 className="wordmark revealed" aria-label="Vigilante MUN 4.0">
            <span className="wordmark-line" style={{ display: 'block', marginBottom: '0.15em', maxWidth: '100%' }}>
              <DepthText
                text="VIGILANTE"
                layers={14}
                depth={0.8}
                faceColor="#F8FAED"
                depthColor="#A91B18"
                tilt={4.0}
                pointerTracking
                smoothing={0.14}
                perspective={900}
                autoOrbit
                orbitSpeed={0.35}
                fontSize="clamp(2.5rem, 8vw, 5.5rem)"
                fontWeight={900}
                shadow
              />
            </span>
            <span className="wordmark-line line-mun">
              MUN 4.0
            </span>
            <span className="wordmark-underline" />
          </h1>

          <p id="hero-tagline" className="hero-tagline">
            Where diplomacy meets conviction. Join 400+ delegates in redefining debate at Delhi University North Campus.
          </p>

          <div className="hero-ctas">
            <SpecularButton
              size="lg"
              radius={24}
              tint="#A91B18"
              tintOpacity={0.35}
              blur={10}
              textColor="#F8FAED"
              lineColor="#ffffff"
              baseColor="#A91B18"
              intensity={1.2}
              shineSize={14}
              shineFade={40}
              thickness={1.5}
              speed={0.35}
              followMouse
              proximity={250}
              autoAnimate={false}
              onClick={onRegisterClick}
            >
              <span>Register as Delegate</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </SpecularButton>

            <button
              className="btn btn-ghost"
              onClick={onExploreClick}
              type="button"
            >
              <span>Explore Committees</span>
            </button>
          </div>
        </div>

        {/* Scroll Cue Indicator */}
        <div className="scroll-cue" ref={scrollCueRef}>
          <span style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Scroll to orbit
          </span>
          <div className="line" />
        </div>
      </section>
    </div>
  );
}
