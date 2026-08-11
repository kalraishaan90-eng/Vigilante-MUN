import React, { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import LetterMaskHeading from './components/LetterMaskHeading';
import CommitteeCard from './components/CommitteeCard';
import CheckoutFlow from './components/CheckoutFlow';
import CinematicIntro from './components/CinematicIntro';
import GradientWaves from './components/GradientWaves';
import SpecularButton from './components/SpecularButton';
import DriftWall from './components/DriftWall';
import ProfileCard from './components/ProfileCard';
import DomeGallery from './components/DomeGallery';



const FOUNDERS_ROSTER = [
  {
    name: 'Pulkit Nagpal',
    displayTitle: 'Founder & Executive Secretariat',
    role: 'FOUNDER',
    handle: 'pulkitnagpal',
    status: 'Exec. Secretariat',
    photo: '/pulkit%20nagpal.jpeg',
    phone: '+91 87662 69585',
    whatsapp: 'https://wa.me/918766269585',
    bio: 'Founder & Executive Secretariat, managing technical infrastructure and overall conference direction.',
    behindGlowColor: 'rgba(169, 27, 24, 0.75)',
    innerGradient: 'linear-gradient(145deg, rgba(169,27,24,0.65) 0%, rgba(110,18,15,0.9) 55%, rgba(122,44,41,0.75) 100%)'
  },
  {
    name: 'Ahana Chhabra',
    displayTitle: 'Co-Founder & Executive Leadership',
    role: 'CO-FOUNDER',
    handle: 'ahanachhabra',
    status: 'Exec. Leadership',
    photo: '/ahana%20chhabra.jpeg',
    phone: '+91 96257 01349',
    whatsapp: 'https://wa.me/919625701349',
    bio: 'Co-Founder & Executive Leadership, steering delegate affairs, strategic partnerships, and conference execution.',
    behindGlowColor: 'rgba(227, 183, 180, 0.65)',
    innerGradient: 'linear-gradient(145deg, rgba(110,18,15,0.75) 0%, rgba(169,27,24,0.85) 55%, rgba(122,44,41,0.7) 100%)'
  },
];

const SECRETARIAT_ROSTER = [
  { name: 'Aditya Bharti', photo: '/aditya%20bharti.jpeg' },
  { name: 'Charvi Gupta', photo: '/charvi%20gupta.jpeg' },
  { name: 'Himanshi Khullar', photo: '/himanshi%20khullar.jpeg' },
  { name: 'Jaskeerat Singh Malhotra', photo: '/jaskeerat%20singh%20malohtra.jpeg' },
  { name: 'Kashvi Saini', photo: '/kashvi%20saini.jpeg' },
  { name: 'Khushmeet Chawla', photo: '/khushmeet%20chawla.jpeg' },
  { name: 'Naisha Kaur', photo: '/naisha%20kaur.jpeg' },
  { name: 'Pranavi Seth', photo: '/pranavi%20seth.jpeg' },
  { name: 'Rani Rajpurohit', photo: '/rani%20rajpurohit.jpeg' },
  { name: 'Rhythm Pahuja', photo: '/rhythm%20pahuja.jpeg' },
  { name: 'Santosh Sahni', photo: '/santosh%20sahni.jpeg' },
  { name: 'Tanvi Mittal', photo: '/tanvi%20mittal.jpeg' },
];

const SECRETARIAT_DOME_IMAGES = [
  ...FOUNDERS_ROSTER.map(f => ({ src: f.photo, alt: `${f.name} - ${f.role}` })),
  ...SECRETARIAT_ROSTER.map(m => ({ src: m.photo, alt: m.name }))
];

const COMMITTEES_DATA = [
  {
    code: 'UNGA',
    name: 'General Assembly',
    topic: 'Deliberation on the International Governance of Strategic Chokepoints and Maritime Trade Routes.',
    badge: 'UN Committee • ₹2,200',
    photo: 'https://images.unsplash.com/photo-1529107328405-f938923a1a4f?auto=format&fit=crop&q=80&w=800',
    emblem: '/emblems/unga.svg',
  },
  {
    code: 'UNCSW',
    name: 'Commission on the Status of Women',
    topic: 'Protecting the rights and safety of sex workers and survivors of forced pregnancies with special emphasis on legal reforms and social protection measures.',
    badge: 'UN Committee • ₹2,200',
    photo: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80&w=800',
    emblem: '/emblems/uncsw.svg',
  },
  {
    code: 'IPL',
    name: 'IPL Auction House',
    topic: 'Auction House - Strategic Player Auctions, Franchise Management, and Financial Allocation Strategies.',
    badge: 'Auction House • ₹2,200',
    photo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800',
    emblem: '/emblems/ipl.svg',
  },
  {
    code: 'AIPPM',
    name: "All India Party People's Meet",
    topic: 'Deliberation upon anti-defection law - 10th schedule of the Indian constitution with special emphasis on its impact on electoral integrity.',
    badge: 'Indian Committee • ₹2,200',
    photo: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800',
    emblem: '/emblems/aippm.svg',
  },
  {
    code: 'DISNEYVERSE FEUD',
    name: 'Disneyverse Feud',
    topic: 'Classified',
    badge: 'Specialized Crisis • ₹2,200',
    photo: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    emblem: '/emblems/df.svg',
  },
  {
    code: 'IP',
    name: 'International Press',
    topic: 'Journalism, Photography, Videography (Reel Making : Edits)',
    badge: 'Media & Press • ₹2,000',
    photo: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800',
    emblem: '/emblems/ip.svg',
  },
];

const DRIFT_WALL_COMMITTEE_ITEMS = Array.from({ length: 18 }, (_, i) => {
  const c = COMMITTEES_DATA[i % COMMITTEES_DATA.length];
  return {
    ...c,
    image: c.photo,
    title: c.name,
    code: c.code,
  };
});

const HISTORY_EVENTS = [
  {
    title: 'Maiden Online Edition',
    caption: 'Where it began — 100+ delegates, fully online.',
    body: 'Vigilante\'s first digital conference hosted over 100 participants across multiple virtual chambers during unprecedented times.',
  },
  {
    title: 'MUN 2.0 — Satyawati College, North Campus',
    caption: '300+ delegates, a university stage.',
    body: 'Organised at Satyawati College, University of Delhi (North Campus), this edition hosted over 300 participants within a central university setting with disciplined large-scale crowd management.',
  },
  {
    title: 'MUN 3.0 — Prudence School, Ashok Vihar',
    caption: 'Our biggest edition yet — 400+ delegates.',
    body: 'Hosted at Prudence School, Ashok Vihar, Vigilante MUN 3.0 marked our largest flagship edition with a footfall exceeding 400 participants.',
  },
];

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [committeeView, setCommitteeView] = useState('bento');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutCommittee, setCheckoutCommittee] = useState('');

  const handleOpenCheckout = (committeeCode = '') => {
    setCheckoutCommittee(committeeCode);
    setIsCheckoutOpen(true);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleMotionChange);
      return () => mediaQuery.removeEventListener('change', handleMotionChange);
    }
  }, []);

  // Modal State
  const [modalData, setModalData] = useState(null);

  // History Expand State
  const [expandedHistory, setExpandedHistory] = useState({});

  // Countdown timer state for Oct 10, 2026
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date(2026, 9, 10, 9, 0, 0); // Oct 10, 2026

    const updateTimer = () => {
      const now = new Date();
      const diff = Math.max(0, targetDate.getTime() - now.getTime());

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id) => {
    setNavOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleHistory = (index) => {
    setExpandedHistory((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="app-root">
      {/* Background Gradient Waves */}
      <div className="app-background-waves">
        <GradientWaves
          horizonColor="#2A0405"
          waveColor="#8E0E0B"
          crestColor="#FF4D4D"
          speed={0.4}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.11}
          zoom={1.0}
          height={5.0}
          fogDepth={18}
          detail="medium"
          brightness={1.05}
          opacity={0.85}
          mouseInteraction={true}
          parallaxStrength={0.5}
          grain={true}
          grainIntensity={0.04}
        />
      </div>

      {/* Cinematic Opening Intro Screen */}
      {showIntro && <CinematicIntro onComplete={() => setShowIntro(false)} />}

      {/* Top Floating HUD Nav */}
      <nav id="hud-nav" aria-label="Main Navigation">
        <div className="logo-mark" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
          </svg>
          <span>VIGILANTE</span>
        </div>

        <button
          id="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={navOpen}
          onClick={() => setNavOpen(!navOpen)}
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <div className={`nav-links ${navOpen ? 'open' : ''}`}>
          <a href="#countdown" onClick={(e) => { e.preventDefault(); scrollToSection('countdown'); }}>Countdown</a>
          <a href="#committees" onClick={(e) => { e.preventDefault(); scrollToSection('committees'); }}>Committees</a>
          <a href="#registration" onClick={(e) => { e.preventDefault(); scrollToSection('registration'); }}>Registration</a>
          <a href="#secretariat" onClick={(e) => { e.preventDefault(); scrollToSection('secretariat'); }}>Secretariat</a>
          <a href="#founders" onClick={(e) => { e.preventDefault(); scrollToSection('founders'); }}>Founders</a>
          <a href="#history" onClick={(e) => { e.preventDefault(); scrollToSection('history'); }}>History</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
        </div>
      </nav>



      {/* Hero Section with R3F Canvas */}
      <HeroSection
        onRegisterClick={() => handleOpenCheckout()}
        onExploreClick={() => scrollToSection('committees')}
      />

      {/* Main Page Content */}
      <main>
        {/* Countdown Section */}
        <section id="countdown">
          <div className="section-inner bento">
            <div className="countdown-card glass">
              <span className="eyebrow countdown-label">Vigilante MUN 4.0 — 10th and 11th October 2026</span>
              <div className="countdown-grid">
                <div className="countdown-unit">
                  <span className="countdown-digits">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="unit-label">Days</span>
                </div>
                <div className="countdown-unit">
                  <span className="countdown-digits">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="unit-label">Hours</span>
                </div>
                <div className="countdown-unit">
                  <span className="countdown-digits">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="unit-label">Minutes</span>
                </div>
                <div className="countdown-unit">
                  <span className="countdown-digits">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="unit-label">Seconds</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Committees Bento Grid Section */}
        <section id="committees">
          <div className="section-inner">
            <div className="section-head-wrap">
              <div className="section-head">
                <span className="eyebrow">The Chambers & Agendas (Phase 1)</span>
                <LetterMaskHeading tag="h2">Committees & Agendas</LetterMaskHeading>
                <p>Explore our Phase 1 committees and agendas crafted for impactful diplomacy and debate.</p>
              </div>

              <div className="view-toggle-wrap" role="tablist" aria-label="Committees Display View">
                <button
                  type="button"
                  role="tab"
                  aria-selected={committeeView === 'bento'}
                  className={`view-toggle-btn ${committeeView === 'bento' ? 'active' : ''}`}
                  onClick={() => setCommitteeView('bento')}
                >
                  Bento Grid View
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={committeeView === 'driftwall'}
                  className={`view-toggle-btn ${committeeView === 'driftwall' ? 'active' : ''}`}
                  onClick={() => setCommitteeView('driftwall')}
                >
                  3D Drift Wall View
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={committeeView === 'agendas'}
                  className={`view-toggle-btn ${committeeView === 'agendas' ? 'active' : ''}`}
                  onClick={() => setCommitteeView('agendas')}
                >
                  Agendas List View
                </button>
              </div>

            </div>

            {/* Matrix Link Banner Card */}
            <div className="matrix-banner-card glass" style={{ marginBottom: '24px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span className="eyebrow" style={{ color: 'var(--falu)' }}>OFFICIAL MATRIX LIVE</span>
                <h3 style={{ fontSize: '18px', marginTop: '2px' }}>Committee Allocation Matrix (Phase 1)</h3>
                <p style={{ fontSize: '13.5px', marginTop: '2px', color: 'var(--quincy)', opacity: 0.9 }}>
                  View country matrix and available portfolio allocations for UNGA, UNCSW, IPL, AIPPM, Disneyverse Feud & International Press.
                </p>
              </div>
              <a
                href="https://docs.google.com/spreadsheets/d/1KPfJb0RP-UKd_Vc0bsqqz33mAXO_mmyoZJpgC0BB-Bc/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: '13px' }}
              >
                <span>Open Matrix Spreadsheet</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>

            {committeeView === 'driftwall' ? (

              <div
                className="driftwall-container glass"
                style={{
                  height: 600,
                  width: '100%',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <DriftWall
                  items={DRIFT_WALL_COMMITTEE_ITEMS}
                  columns={5}
                  tileWidth={200}
                  tileHeight={132}
                  gap={18}
                  tilt={16}
                  turn={-14}
                  perspective={1200}
                  depth={120}
                  speed={42}
                  direction="up"
                  variance={0.45}
                  parallax={0.6}
                  lift={64}
                  fade={0.6}
                  dim={0.55}
                  overlayColor="#060010"
                  onTileClick={(item) =>
                    setModalData({ title: `${item.code}${item.name ? ' — ' + item.name : ''}`, body: item.topic })
                  }
                />
              </div>
            ) : (
              <div className={committeeView === 'bento' ? 'bento' : 'agendas-list-grid'}>
                {COMMITTEES_DATA.map((c) => (
                  <CommitteeCard
                    key={c.code}
                    committee={c}
                    layoutMode={committeeView === 'agendas' ? 'list' : 'bento'}
                    prefersReducedMotion={prefersReducedMotion}
                    onClick={(item) =>
                      setModalData({ title: `${item.code}${item.name ? ' — ' + item.name : ''}`, body: item.topic })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Registration & Guidelines Section */}
        <section id="registration">
          <div className="liquid-ambient-orb liquid-ambient-orb-1" />
          <div className="liquid-ambient-orb liquid-ambient-orb-2" />

          <div className="section-inner">
            <div className="section-head center-aligned-head" style={{ textAlign: 'center', marginInline: 'auto' }}>
              <span className="eyebrow">OFFICIAL APPLICATION PORTAL</span>
              <LetterMaskHeading tag="h2">Vigilante 4.0 Individual Delegate Application</LetterMaskHeading>
              <h3 className="registration-welcome-title">Welcome to THE VIGILANTE Model United Nations 4th Edition</h3>
              <p className="registration-lead-text">
                We are extremely thrilled to announce the 4th edition of our conference, which is set to take place on <strong>10th and 11th October, 2026</strong>.
              </p>
              <p className="registration-body-text">
                Your participation today goes beyond the realms of debate and diplomacy — it&apos;s a foundational step toward crafting a better, more innovative future for our nation and the world. Use this opportunity to expand your horizons, challenge your thoughts, and unlock the immense potential within. The future lies in your capable hands, and we are excited to witness the incredible transformations you will lead.
              </p>
            </div>

            {/* Event Details Grid */}
            <div className="event-details-row glass" style={{ padding: '24px', margin: '28px 0', borderRadius: '16px' }}>
              <div className="event-detail-item">
                <span className="detail-label">MODE OF EVENT</span>
                <span className="detail-value">Offline</span>
              </div>
              <div className="event-detail-item">
                <span className="detail-label">EVENT DATES</span>
                <span className="detail-value">10th & 11th October 2026</span>
              </div>
              <div className="event-detail-item">
                <span className="detail-label">VENUE LOCATION</span>
                <span className="detail-value">Delhi / NCR</span>
              </div>
              <div className="event-detail-item">
                <span className="detail-label">DELEGATE FEES</span>
                <span className="detail-value">₹2,200 (UN & DF) | ₹2,000 (IP)</span>
              </div>
            </div>

            <div className="registration-hero-grid">
              
              {/* Terms & Guidelines */}
              <div className="terms-dashboard" style={{ gridTemplateColumns: '1fr' }}>
                <div className="term-info-card liquid-glass">
                  <h3>1. Non-Refundable Policy</h3>
                  <p>All Payment details are outlined in the next section. Please note, <strong>no refunds will be processed</strong> after successful registration.</p>
                </div>
                <div className="term-info-card liquid-glass">
                  <h3>2. Dais Integrity Protocol</h3>
                  <p>Plagiarism or unverified pre-written resolutions trigger immediate dais review and disqualification.</p>
                </div>
                <div className="term-info-card liquid-glass">
                  <h3>3. Code of Conduct & Clearance</h3>
                  <p>Delegates must adhere strictly to diplomatic decorum and committee guidelines throughout both conference days.</p>
                </div>
              </div>

              {/* REGISTER NOW CTA Banner */}
              <div className="register-cta-banner liquid-glass-dark">
                <div>
                  <span className="eyebrow" style={{ color: 'var(--beaver)' }}>OFFICIAL CLEARANCE LIVE</span>
                  <h3 style={{ marginTop: '8px' }}>Apply as Individual Delegate</h3>
                  <p>
                    Clearance is open across all 6 Phase 1 committees. Select your target committee, specify portfolio choices, and authorize payment.
                  </p>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <SpecularButton
                    size="lg"
                    radius={20}
                    tint="#A91B18"
                    tintOpacity={0.35}
                    blur={10}
                    textColor="#ffffff"
                    lineColor="#ffffff"
                    baseColor="#A91B18"
                    intensity={1.3}
                    shineSize={18}
                    shineFade={45}
                    thickness={1.8}
                    speed={0.35}
                    followMouse
                    proximity={300}
                    autoAnimate={false}
                    onClick={() => handleOpenCheckout()}
                    className="specular-button-giant"
                  >
                    <span>APPLY NOW FOR VIGILANTE 4.0</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </SpecularButton>
                </div>
              </div>

            </div>

            {/* Delegate Perks Row Below */}
            <div className="perks-dashboard" style={{ marginTop: '32px' }}>
              <div className="perk-info-card liquid-glass">
                <h3>1. Merit & Participation Certificates</h3>
                <p>Official certificates recognizing excellence in debate, diplomacy, and active chamber contribution.</p>
              </div>
              <div className="perk-info-card liquid-glass">
                <h3>2. Astonishing Cash Prizes</h3>
                <p>Substantial rewards and accolades across Best Delegate, High Commendation, and Special Mention categories.</p>
              </div>
              <div className="perk-info-card liquid-glass">
                <h3>3. Experienced Executive Board</h3>
                <p>Guided by seasoned Executive Board members ensuring fair, highly intellectual, and structured debate.</p>
              </div>
              <div className="perk-info-card liquid-glass">
                <h3>4. Background Guides & Support</h3>
                <p>Comprehensive background guides, position paper support, and enriching experience for first-timers.</p>
              </div>
            </div>

          </div>
        </section>

        {/* Secretariat Section (3D Dome Gallery with Chroma Grid effect) */}
        <section id="secretariat">
          <div className="section-inner">
            <div className="section-head">
              <span className="eyebrow">Executive Leadership</span>
              <LetterMaskHeading tag="h2">Secretariat Roster</LetterMaskHeading>
              <p>Meet our executive leadership driving diplomacy, logistics, and delegate care across all chambers.</p>
            </div>

            {/* Dedicated Top Roster Bar for Founder & Co-Founder */}
            <div className="founders-roster-bar">
              {FOUNDERS_ROSTER.map((f) => (
                <div key={f.name} className="founder-roster-card glass">
                  <div className="founder-roster-avatar-wrap">
                    <img src={f.photo} alt={f.name} loading="lazy" />
                  </div>
                  <div className="founder-roster-info">
                    <span className="founder-roster-role">{f.role}</span>
                    <h3 className="founder-roster-name">{f.name}</h3>
                    <p className="founder-roster-bio">{f.bio}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 3D Dome Gallery with Chroma Grid Glow Effect (Frameless & Seamless) */}
            <div
              className="dome-gallery-container"
              style={{
                height: '650px',
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
                marginTop: '16px'
              }}
            >
              <DomeGallery
                images={SECRETARIAT_DOME_IMAGES}
                fit={0.55}
                minRadius={500}
                maxRadius={800}
                overlayBlurColor="transparent"
                grayscale={false}
                chromaRadius={340}
                openedImageWidth="360px"
                openedImageHeight="440px"
                imageBorderRadius="20px"
                openedImageBorderRadius="24px"
              />
            </div>

          </div>
        </section>

        {/* Founders & Queries Section */}
        <section id="founders">
          <div className="section-inner">
            <div className="section-head center-aligned-head" style={{ textAlign: 'center', marginInline: 'auto' }}>
              <span className="eyebrow">LEADERSHIP & ASSISTANCE</span>
              <LetterMaskHeading tag="h2">Founder Info & Support</LetterMaskHeading>
              <p>Have queries regarding committee allocations, payments, or delegation logistics? Reach out to our founders directly.</p>
            </div>

            <div className="founders-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: '36px' }}>
              {FOUNDERS_ROSTER.map((f) => (
                <ProfileCard
                  key={f.name}
                  name={f.name}
                  title={f.displayTitle}
                  handle={f.handle}
                  status={f.status}
                  contactText={`WhatsApp ${f.role === 'FOUNDER' ? 'Founder' : 'Co-Founder'}`}
                  avatarUrl={f.photo}
                  miniAvatarUrl={f.photo}
                  showUserInfo={true}
                  enableTilt={true}
                  enableMobileTilt={true}
                  behindGlowEnabled={true}
                  behindGlowColor={f.behindGlowColor}
                  innerGradient={f.innerGradient}
                  onContactClick={() => window.open(f.whatsapp, '_blank', 'noopener,noreferrer')}
                />
              ))}
            </div>
          </div>
        </section>

        {/* History Accordion Section */}
        <section id="history">
          <div className="section-inner">
            <div className="section-head">
              <span className="eyebrow">Where We&apos;ve Stood</span>
              <LetterMaskHeading tag="h2">History</LetterMaskHeading>
            </div>

            <div className="bento">
              <div className="history-summary glass">
                <p>
                  The Vigilante MUN is a youth-led, impact-driven organisation committed to creating platforms that blend academic excellence, leadership development, and social responsibility. Over the years, Vigilante has emerged as a trusted name in large-scale student conferences, public audience events, and structured training programmes, working closely with reputed educational institutions, university administrations, and public figures.
                </p>
              </div>

              <div className="timeline">
                {HISTORY_EVENTS.map((ev, i) => (
                  <div
                    key={ev.title}
                    className={`timeline-node glass ${expandedHistory[i] ? 'expanded' : ''}`}
                    onClick={() => toggleHistory(i)}
                  >
                    <div className="tl-head">
                      <div>
                        <span className="eyebrow">{String(i + 1).padStart(2, '0')}</span>
                        <div className="tl-title">{ev.title}</div>
                        <div className="tl-caption">{ev.caption}</div>
                      </div>
                      <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                    <div className="tl-body">
                      <p>{ev.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section id="contact">
          <div className="section-inner bento">
            <div className="contact-card glass">
              <LetterMaskHeading tag="h2">Ready to take<br />the floor?</LetterMaskHeading>
              <p>Thank you for your interest in THE VIGILANTE Model United Nations! Applications for Vigilante 4.0 are live.</p>
              <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>Support Email: vigilantemun@gmail.com</p>
              <SpecularButton
                size="lg"
                radius={18}
                tint="#A91B18"
                tintOpacity={0.3}
                blur={8}
                textColor="#ffffff"
                lineColor="#ffffff"
                baseColor="#A91B18"
                intensity={1.2}
                shineSize={15}
                shineFade={40}
                thickness={1.5}
                speed={0.35}
                followMouse
                proximity={250}
                autoAnimate={false}
                onClick={() => handleOpenCheckout()}
                style={{ marginTop: '16px' }}
              >
                <span>Apply as Individual Delegate</span>
              </SpecularButton>
            </div>
          </div>
        </section>
      </main>

      {/* Checkout Flow Multi-Step Modal */}
      <CheckoutFlow
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialCommittee={checkoutCommittee}
      />

      {/* Modal Dialog */}
      {modalData && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setModalData(null)}
        >
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <h3>{modalData.title}</h3>
            <p>{modalData.body}</p>
            <button
              className="btn btn-primary"
              onClick={() => setModalData(null)}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
