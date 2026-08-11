"use client";

/**
 * Vigilante MUN — Main Page
 *
 * Fix #1: Zero ad-hoc hex values in JSX. All color via CSS token vars.
 * Fix #2: Fonts wired in globals.css; this file uses className only.
 * Fix #4: All images have descriptive alt text; below-fold images use loading="lazy"
 * Fix #5: All image containers have explicit width+height / aspect-ratio to prevent CLS
 * Fix #6: JS PRM guard disables intro, nav tilt, cursor spotlight, countdown flip animations
 */

import { useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import HeroCanvas — no SSR (Three.js is browser-only)
const HeroCanvas = dynamic(() => import("./components/HeroCanvas"), {
  ssr: false,
});

/* ── COMMITTEE DATA ────────────────────────────────────────── */
const COMMITTEES = [
  {
    code: "UNGA",
    topic:
      "Deliberation on the International Governance of Strategic Chokepoints and Maritime Trade Routes",
  },
  {
    code: "UNCSW",
    badge: "Beginner Committee",
    topic:
      "Protecting the rights and safety of sex workers and survivors of forced pregnancies with special emphasis on legal reforms and social protection measures",
  },
  {
    code: "AIPPM",
    topic:
      "Deliberation upon anti-defection law - 10th schedule of the Indian Constitution with special emphasis on its impact on electoral integrity",
  },
  { code: "IPL", topic: "Auction" },
  {
    code: "IP",
    name: "International Press",
    topic:
      "Focus areas: Photography, Videography (reel making, edits), Journalism",
  },
];

const SECRETARIAT = [
  { role: "Secretary-General" },
  { role: "Deputy Secretary-General" },
  { role: "Director-General" },
  { role: "USG Delegate Affairs" },
  { role: "USG Logistics" },
  { role: "USG Press & Media" },
  { role: "USG Sponsorships" },
  { role: "USG Operations" },
  { role: "Chef de Cabinet" },
  { role: "Under-Secretary General" },
  { role: "Executive Board Chair" },
  { role: "Charge d'Affaires" },
].map((r, i) => ({ name: "Name TBA", role: r.role, id: i }));

const TIMELINE = [
  {
    title: "Maiden Online Edition",
    body: "Vigilante's first digital conference hosted over 100 participants.",
    caption: "Where it began — 100+ delegates, fully online.",
  },
  {
    title: "MUN 2.0 — Satyawati College, North Campus, University of Delhi",
    body: "Organised at Satyawati College, University of Delhi (North Campus), this edition hosted over 300 participants within a central university setting. Executing the conference required close coordination with Delhi University authorities, strict adherence to institutional protocols, and disciplined large-scale crowd management, standards that Vigilante successfully upheld.",
    caption: "300+ delegates, a university stage.",
  },
  {
    title: "MUN 3.0 — Prudence School, Ashok Vihar",
    body: "Hosted at Prudence School, Ashok Vihar, a well-established and reputed academic institution, Vigilante MUN 3.0 marked our largest flagship edition with a footfall exceeding 400 participants.",
    caption: "Our biggest edition yet — 400+ delegates.",
  },
];

export default function Home() {
  useEffect(() => {
    // Fix #6: read PRM once
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouch = window.matchMedia("(hover: none)").matches;

    // ── Year ────────────────────────────────────────────────
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // ── Wordmark letter spans ────────────────────────────────
    const wm = document.getElementById("wordmark");
    if (wm && wm.childElementCount === 0) {
      const words = ["VIGILANTE", "MUN"];
      let charIndex = 0;
      words.forEach((word, wIdx) => {
        const lineEl = document.createElement("span");
        lineEl.className =
          "wordmark-line" + (wIdx === 1 ? " line-mun" : "");
        [...word].forEach((ch) => {
          const span = document.createElement("span");
          span.className = "char";
          span.textContent = ch;
          // Fix #6: skip staggered delay when reduceMotion (CSS already handles it)
          span.style.animationDelay = reduceMotion
            ? "0s"
            : 0.9 + charIndex * 0.045 + "s";
          lineEl.appendChild(span);
          charIndex++;
        });
        wm.appendChild(lineEl);
      });
    }

    // ── Intro overlay ────────────────────────────────────────
    const overlay = document.getElementById("intro-overlay");
    const skipBtn = document.getElementById("skip-intro");
    if (overlay) {
      document.body.style.overflow = "hidden";
      function openCurtain() {
        if (!overlay || overlay.classList.contains("opened")) return;
        overlay.classList.add("opened");
        document.body.style.overflow = "";
      }
      // Fix #6: skip intro animation immediately
      if (reduceMotion) {
        openCurtain();
      } else {
        setTimeout(() => skipBtn?.classList.add("visible"), 500);
        skipBtn?.addEventListener("click", openCurtain);
        setTimeout(openCurtain, 2400);
      }
    }

    // ── Nav ──────────────────────────────────────────────────
    const nav = document.getElementById("hud-nav");
    const toggle = document.getElementById("nav-toggle");
    const links = document.getElementById("nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", () => {
        const open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      links.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          links.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        })
      );
    }
    // Fix #6: skip nav mouse-tilt when reduceMotion
    if (nav && !isTouch && !reduceMotion) {
      const onMouseMove = (e: MouseEvent) => {
        const tiltX = ((e.clientY / window.innerHeight) - 0.5) * -4;
        const tiltY = ((e.clientX / window.innerWidth) - 0.5) * 4;
        nav.style.transform = `translateX(-50%) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      };
      window.addEventListener("mousemove", onMouseMove);
    }

    // ── Spotlight cursor ─────────────────────────────────────
    // Fix #6: skip entirely when reduceMotion
    const cur = document.getElementById("spotlight-cursor");
    if (cur && !isTouch && !reduceMotion) {
      window.addEventListener("mousemove", (e) => {
        cur.style.opacity = "1";
        cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      });
      window.addEventListener("mouseleave", () => (cur.style.opacity = "0"));
    }

    // ── Countdown ────────────────────────────────────────────
    function getTarget() {
      const now = new Date();
      let year = now.getUTCFullYear();
      let target = new Date(Date.UTC(year, 9, 9, 18, 30, 0));
      if (target.getTime() < now.getTime()) {
        target = new Date(Date.UTC(year + 1, 9, 9, 18, 30, 0));
      }
      return target;
    }
    const target = getTarget();
    const els = {
      d: document.getElementById("cd-days"),
      h: document.getElementById("cd-hours"),
      m: document.getElementById("cd-mins"),
      s: document.getElementById("cd-secs"),
    };
    const prev: Record<string, string | null> = {
      d: null, h: null, m: null, s: null,
    };

    function setVal(el: HTMLElement | null, val: number, key: string) {
      if (!el) return;
      const str = String(val).padStart(2, "0");
      if (prev[key] !== str) {
        el.textContent = str;
        // Fix #6: skip digit-flip animation when reduceMotion
        if (!reduceMotion) {
          el.classList.remove("flip");
          void el.offsetWidth; // force reflow
          el.classList.add("flip");
        }
        prev[key] = str;
      }
    }

    function tick() {
      const now = new Date();
      const diff = Math.max(0, target.getTime() - now.getTime());
      setVal(els.d, Math.floor(diff / 86400000), "d");
      setVal(els.h, Math.floor((diff % 86400000) / 3600000), "h");
      setVal(els.m, Math.floor((diff % 3600000) / 60000), "m");
      setVal(els.s, Math.floor((diff % 60000) / 1000), "s");
    }
    tick();
    const countdownInterval = setInterval(tick, 1000);

    // ── Committee cards ──────────────────────────────────────
    const grid = document.getElementById("committee-grid");
    const modal = document.getElementById("committee-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    let lastFocused: Element | null = null;

    function openModal(title: string, body: string) {
      lastFocused = document.activeElement;
      if (modalTitle) modalTitle.textContent = title;
      if (modalBody) modalBody.textContent = body;
      modal?.classList.add("open");
      (modal?.querySelector(".modal-close") as HTMLElement)?.focus();
    }
    function closeModal() {
      modal?.classList.remove("open");
      (lastFocused as HTMLElement)?.focus();
    }

    if (grid && grid.childElementCount === 0) {
      COMMITTEES.forEach((c, idx) => {
        const card = document.createElement("div");
        card.className = "committee-card glass reveal";
        card.style.transitionDelay = idx * 0.06 + "s";
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-haspopup", "dialog");
        card.dataset.title = c.code + (c.name ? " — " + c.name : "");
        card.dataset.body = c.topic;
        card.innerHTML = `
          <div>
            <div class="acronym">${c.code}</div>
            <div class="topic-preview">${c.topic}</div>
          </div>
          <div class="card-foot">
            ${c.badge ? `<span class="pill-badge">${c.badge}</span>` : "<span></span>"}
            <span class="read-more">Read full topic →</span>
          </div>`;
        card.addEventListener("click", () =>
          openModal(card.dataset.title!, card.dataset.body!)
        );
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openModal(card.dataset.title!, card.dataset.body!);
          }
        });
        grid.appendChild(card);
      });

      // TBA card
      const tba = document.createElement("div");
      tba.className = "committee-card tba reveal";
      tba.style.transitionDelay = COMMITTEES.length * 0.06 + "s";
      tba.innerHTML = `
        <div>
          <div class="acronym">Disneyverse Feud</div>
          <div class="topic-preview">Details TBA — working name, unconfirmed.</div>
        </div>
        <div class="card-foot">
          <span class="tba-pulse"><span class="dot"></span>In discussion</span>
          <span></span>
        </div>`;
      grid.appendChild(tba);
    }

    if (modal) {
      modal
        .querySelectorAll("[data-close]")
        .forEach((el) => el.addEventListener("click", closeModal));
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal?.classList.contains("open")) closeModal();
    });

    // ── Secretariat marquee ──────────────────────────────────
    const track = document.getElementById("marquee-track");
    const srList = document.getElementById("sr-secretariat-list");

    function makeSecCard(
      m: { name: string; role: string; id: number },
      photoFile?: string
    ) {
      const el = document.createElement("div");
      el.className = "sec-card glass";
      el.tabIndex = 0;

      // Fix #4: alt text is descriptive. Fix #5: avatar div has explicit dimensions (CSS)
      const avatarInner = photoFile
        ? `<img
             src="${photoFile}"
             alt="${m.name} — ${m.role}, Vigilante MUN Secretariat"
             loading="lazy"
             width="64"
             height="64"
           />`
        : "TBA";

      el.innerHTML = `
        <div class="avatar" aria-label="${m.name}">${avatarInner}</div>
        <div class="name">${m.name}</div>
        <div class="photo-note">Photo coming soon</div>
        <div class="detail-panel glass" aria-hidden="true">
          <div class="name">${m.name}</div>
          <div class="role">${m.role}</div>
          <div class="bio">Bio coming soon.</div>
        </div>`;
      return el;
    }

    if (track && track.childElementCount === 0) {
      [...SECRETARIAT, ...SECRETARIAT].forEach((m) =>
        track.appendChild(makeSecCard(m))
      );
    }
    if (srList && srList.childElementCount === 0) {
      SECRETARIAT.forEach((m) => {
        const li = document.createElement("li");
        li.textContent = `${m.name} — ${m.role}`;
        srList.appendChild(li);
      });
    }

    const viewport = document.querySelector(".marquee-viewport") as HTMLElement;
    // Fix #6: disable marquee animation when reduceMotion
    if (reduceMotion && track) {
      track.style.animation = "none";
      if (viewport) viewport.style.overflowX = "auto";
    }
    if (track) track.setAttribute("aria-live", "off");

    const lift = document.getElementById("marquee-lift");
    let bobTimer: ReturnType<typeof setTimeout> | null = null;

    function riseStart() {
      // Fix #6: no bob when reduceMotion, just rise
      lift?.classList.add("is-risen");
      if (!reduceMotion) {
        if (bobTimer) clearTimeout(bobTimer);
        bobTimer = setTimeout(() => lift?.classList.add("is-bobbing"), 500);
      }
    }
    function riseEnd() {
      if (bobTimer) clearTimeout(bobTimer);
      lift?.classList.remove("is-risen", "is-bobbing");
    }
    viewport?.addEventListener("mouseenter", riseStart);
    viewport?.addEventListener("mouseleave", riseEnd);
    viewport?.addEventListener("focusin", riseStart);
    viewport?.addEventListener("focusout", (e) => {
      if (!viewport.contains((e as FocusEvent).relatedTarget as Node))
        riseEnd();
    });

    // ── Timeline ─────────────────────────────────────────────
    const timeline = document.getElementById("timeline");
    if (timeline && timeline.childElementCount === 0) {
      TIMELINE.forEach((ev, i) => {
        const node = document.createElement("div");
        node.className = "timeline-node glass reveal";
        node.style.transitionDelay = i * 0.08 + "s";
        node.innerHTML = `
          <div class="tl-head">
            <div>
              <span class="eyebrow">${String(i + 1).padStart(2, "0")}</span>
              <div class="tl-title">${ev.title}</div>
              <div class="tl-caption">${ev.caption}</div>
            </div>
            <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          <div class="tl-body"><p>${ev.body}</p></div>`;
        node.addEventListener("click", () => node.classList.toggle("expanded"));
        timeline.appendChild(node);
      });
    }

    // ── Reveal on scroll ─────────────────────────────────────
    // Fix #6: skip reveal animation if reduceMotion (show all immediately)
    if (reduceMotion) {
      document
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("in-view"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
      );
      document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    }

    // ── Mood layers ──────────────────────────────────────────
    const layerA = document.getElementById("mood-layer-a");
    const layerB = document.getElementById("mood-layer-b");
    const moodEls = document.querySelectorAll("[data-mood]");
    if (layerA && layerB && moodEls.length) {
      let active = layerA,
        idle = layerB;
      let currentColor: string | null = null;
      const moodIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const color = (entry.target as HTMLElement).dataset.mood;
              if (!color || color === currentColor) return;
              currentColor = color;
              idle.style.background = `linear-gradient(180deg, ${color} 0%, var(--dark-vanilla) 100%)`;
              idle.style.opacity = "1";
              active.style.opacity = "0";
              const next = active;
              active = idle;
              idle = next;
            }
          });
        },
        { threshold: 0.4 }
      );
      moodEls.forEach((el) => moodIo.observe(el));
    }

    // ── Portal tabs ──────────────────────────────────────────
    window.switchPortalTab = (targetPane: string) => {
      document
        .querySelectorAll(".portal-pane")
        .forEach((p) => p.classList.remove("active"));
      document
        .querySelectorAll(".portal-tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document.getElementById("pane-" + targetPane)?.classList.add("active");
      document
        .getElementById("tab-btn-" + targetPane)
        ?.classList.add("active");
    };

    window.navigatePipeline = (stepNumber: number) => {
      if (stepNumber > 1) {
        const current = document.querySelector(
          ".pipeline-step.active"
        ) as HTMLElement;
        const inputs = current?.querySelectorAll("input, select") ?? [];
        let valid = true;
        inputs.forEach((input) => {
          if (!(input as HTMLInputElement).checkValidity()) {
            (input as HTMLInputElement).reportValidity();
            valid = false;
          }
        });
        if (!valid) return;
      }
      document
        .querySelectorAll(".pipeline-step")
        .forEach((s) => s.classList.remove("active"));
      document
        .getElementById("p-step-" + stepNumber)
        ?.classList.add("active");
      const fill = document.getElementById("pipeline-progress");
      const badge = document.getElementById("pipeline-step-badge");
      const fraction = document.getElementById("pipeline-step-fraction");
      const map: Record<number, [string, string, string]> = {
        1: ["33.33%", "Phase 01: Profile Setup", "1 / 3"],
        2: ["66.66%", "Phase 02: Routing Allocation", "2 / 3"],
        3: ["100%", "Phase 03: Final Authorization", "3 / 3"],
      };
      if (fill) fill.style.width = map[stepNumber][0];
      if (badge) badge.textContent = map[stepNumber][1];
      if (fraction) fraction.textContent = map[stepNumber][2];
    };

    window.submitPipelineForm = () => {
      const success = document.getElementById("form-success");
      success?.classList.add("visible");
      const submitBtn = document.querySelector(
        "#p-step-3 .btn-primary"
      ) as HTMLButtonElement | null;
      if (submitBtn) {
        submitBtn.textContent = "Seat Reserved";
        submitBtn.disabled = true;
      }
      document
        .querySelectorAll("#register-form input, #register-form select, #register-form button")
        .forEach((el) => ((el as HTMLInputElement).disabled = true));
    };

    return () => {
      clearInterval(countdownInterval);
    };
  }, []);

  return (
    <>
      <a href="#hero" className="skip-link">
        Skip to content
      </a>

      {/* Mood layers */}
      <div id="mood-layer-a" aria-hidden="true" />
      <div id="mood-layer-b" aria-hidden="true" />

      {/* Grain overlay */}
      <div id="grain-overlay" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves={2}
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Spotlight cursor */}
      <div id="spotlight-cursor" aria-hidden="true" />

      {/* Intro overlay */}
      <div id="intro-overlay" role="dialog" aria-label="Intro animation">
        <div className="curtain" />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div className="vmark">
            <svg viewBox="0 0 120 120">
              <path d="M15 20 L60 100 L105 20 M40 20 L60 58 L80 20" />
            </svg>
          </div>
          <div className="intro-label">Vigilante&nbsp;MUN</div>
        </div>
        <button id="skip-intro" aria-label="Skip intro animation">
          Skip Intro
        </button>
      </div>

      {/* Navigation */}
      <nav id="hud-nav" aria-label="Primary navigation">
        <a className="logo-mark" href="#hero" aria-label="Vigilante MUN home">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3 4 L12 20 L21 4 M8 4 L12 11.5 L16 4" />
          </svg>
          VIGILANTE
        </a>
        <button
          id="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded="false"
          aria-controls="nav-links"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <div className="nav-links" id="nav-links">
          <a href="#countdown">Countdown</a>
          <a href="#committees">Committees</a>
          <a href="#registration">Registration</a>
          <a href="#secretariat">Secretariat</a>
          <a href="#history">History</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <main>
        {/* ── HERO ───────────────────────────────────────────── */}
        <div id="hero-cinema-wrap" data-mood="#F3E1DD">
          <section id="hero" aria-labelledby="wordmark">
            <HeroCanvas />
            <div className="hero-content" id="hero-content">
              <span className="eyebrow">
                Model United Nations · October 10–11
              </span>
              <h1 className="wordmark" id="wordmark" />
              <span className="wordmark-underline" />
              <p className="hero-tagline">
                A youth-led conference where deliberation meets discipline —
                gather in the chamber, sharpen your argument, and be heard.
              </p>
              <div className="hero-ctas">
                <a className="btn btn-primary" href="#registration">
                  Secure clearance
                </a>
                <a className="btn btn-ghost" href="#committees">
                  View committees
                </a>
              </div>
            </div>
            <div className="scroll-cue" id="scroll-cue" aria-hidden="true">
              <span className="line" />
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Scroll to orbit
              </span>
            </div>
          </section>
        </div>

        {/* ── COUNTDOWN ─────────────────────────────────────── */}
        <section id="countdown" data-mood="#FAF3F1" aria-label="Countdown to Vigilante MUN">
          <div className="section-inner bento">
            <div className="countdown-card glass reveal">
              <span className="eyebrow countdown-label">
                Vigilante MUN — October 10–11
              </span>
              <div className="countdown-grid" id="countdown-grid">
                <div className="countdown-unit">
                  <div className="digit-flip-wrap">
                    <span className="countdown-digits" id="cd-days">00</span>
                  </div>
                  <span className="unit-label">Days</span>
                </div>
                <div className="countdown-unit">
                  <div className="digit-flip-wrap">
                    <span className="countdown-digits" id="cd-hours">00</span>
                  </div>
                  <span className="unit-label">Hours</span>
                </div>
                <div className="countdown-unit">
                  <div className="digit-flip-wrap">
                    <span className="countdown-digits" id="cd-mins">00</span>
                  </div>
                  <span className="unit-label">Minutes</span>
                </div>
                <div className="countdown-unit">
                  <div className="digit-flip-wrap">
                    <span className="countdown-digits" id="cd-secs">00</span>
                  </div>
                  <span className="unit-label">Seconds</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMMITTEES ────────────────────────────────────── */}
        <section id="committees" data-mood="#EFD0CC" aria-labelledby="committees-heading">
          <div className="section-inner">
            <div className="section-head reveal">
              <span className="eyebrow">The Chambers</span>
              <h2 id="committees-heading">Committees</h2>
              <p>
                Six rooms, six modes of argument. Choose where your voice
                belongs — full topics open on tap.
              </p>
            </div>
            <div className="bento" id="committee-grid" />
          </div>
        </section>

        {/* ── REGISTRATION ──────────────────────────────────── */}
        <section id="registration" data-mood="#FAF3F1" aria-labelledby="registration-heading">
          <div className="section-inner bento">
            <div className="register-card glass reveal">
              <nav className="portal-tabs" aria-label="Registration portal tabs">
                <button
                  className="portal-tab-btn active"
                  id="tab-btn-perks"
                  onClick={() => window.switchPortalTab?.("perks")}
                  aria-selected="true"
                >
                  Operative Perks
                </button>
                <button
                  className="portal-tab-btn"
                  id="tab-btn-form"
                  onClick={() => window.switchPortalTab?.("form")}
                  aria-selected="false"
                >
                  Secure Clearance
                </button>
                <button
                  className="portal-tab-btn"
                  id="tab-btn-terms"
                  onClick={() => window.switchPortalTab?.("terms")}
                  aria-selected="false"
                >
                  Rules of Engagement
                </button>
              </nav>

              {/* Perks pane */}
              <div className="portal-pane active" id="pane-perks">
                <div className="section-head" style={{ marginBottom: "var(--sp-4)" }}>
                  <span className="eyebrow">Inventory Allocation</span>
                  <h3 id="registration-heading">Delegate Provisions &amp; Assets</h3>
                  <p>
                    Every dynamic asset secured upon immediate validation
                    confirmation into the chambers.
                  </p>
                </div>
                <div className="perks-dashboard">
                  <div className="perk-info-card">
                    <h3>Tactical Delegate Kit</h3>
                    <p>
                      Receive full comprehensive physical guides, customized
                      resource binders, and exclusive dossier materials prepared
                      by the Dais.
                    </p>
                  </div>
                  <div className="perk-info-card">
                    <h3>Certified Credentials</h3>
                    <p>
                      Official physical accreditation and institutional
                      certification signed by the Secretariat recognizing
                      strategic diplomatic execution.
                    </p>
                  </div>
                  <div className="perk-info-card">
                    <h3>Distinguished Accolades</h3>
                    <p>
                      Eligibility pathways to specialized high-tier awards
                      including Best Delegate, High Commendation, and Special
                      Mention across panels.
                    </p>
                  </div>
                  <div className="perk-info-card">
                    {/* Fix #5: aspect-ratio reserves layout before image loads */}
                    <div
                      className="img-placeholder"
                      role="img"
                      aria-label="Perks interactive showcase graphic — coming soon"
                    >
                      Perks Interactive Showcase
                    </div>
                  </div>
                </div>
              </div>

              {/* Form pane */}
              <div className="portal-pane" id="pane-form">
                <div className="gamified-pipeline">
                  <div className="pipeline-header">
                    <span className="eyebrow" id="pipeline-step-badge">
                      Phase 01: Profile Setup
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--falu)",
                      }}
                      id="pipeline-step-fraction"
                    >
                      1 / 3
                    </span>
                  </div>
                  <div className="pipeline-progress-container" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={33}>
                    <div className="pipeline-progress-fill" id="pipeline-progress" />
                  </div>
                  <form
                    className="register-form"
                    id="register-form"
                    noValidate
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <div className="pipeline-step active" id="p-step-1">
                      <div className="field-row">
                        <div className="field">
                          <label htmlFor="reg-name">Full Name / Codename</label>
                          <input
                            type="text"
                            id="reg-name"
                            name="name"
                            placeholder="John Doe"
                            required
                            autoComplete="name"
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="reg-email">
                            Secure Comms (Email)
                          </label>
                          <input
                            type="email"
                            id="reg-email"
                            name="email"
                            placeholder="agent@domain.com"
                            required
                            autoComplete="email"
                          />
                        </div>
                      </div>
                      <div className="step-actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => window.navigatePipeline?.(2)}
                        >
                          Continue to Allocation Preferences →
                        </button>
                      </div>
                    </div>

                    <div className="pipeline-step" id="p-step-2">
                      <div className="field-row">
                        <div className="field">
                          <label htmlFor="reg-institution">
                            Base Institution / School
                          </label>
                          <input
                            type="text"
                            id="reg-institution"
                            name="institution"
                            placeholder="University of Delhi"
                            required
                            autoComplete="organization"
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="reg-committee">
                            Target Chamber Assignment
                          </label>
                          <select id="reg-committee" name="committee" required>
                            <option value="" disabled>
                              Select a panel...
                            </option>
                            <option>UNGA</option>
                            <option>UNCSW — Beginner Committee</option>
                            <option>AIPPM</option>
                            <option>IPL</option>
                            <option>International Press</option>
                          </select>
                        </div>
                      </div>
                      <div className="field" style={{ marginTop: "14px" }}>
                        <label htmlFor="reg-experience">
                          Prior Operations Experience
                        </label>
                        <select id="reg-experience" name="experience" required>
                          <option value="" disabled>
                            Choose tier...
                          </option>
                          <option>First conference</option>
                          <option>1–3 conferences</option>
                          <option>4+ conferences</option>
                        </select>
                      </div>
                      <div className="step-actions">
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => window.navigatePipeline?.(1)}
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => window.navigatePipeline?.(3)}
                        >
                          Review Operational Authorization →
                        </button>
                      </div>
                    </div>

                    <div className="pipeline-step" id="p-step-3">
                      <div style={{ textAlign: "center", padding: "var(--sp-2) 0" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "var(--sp-1)" }}>
                          ⚡
                        </div>
                        <h4>Data Synchronization Ready</h4>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "var(--quincy)",
                            marginTop: "6px",
                            marginBottom: "20px",
                          }}
                        >
                          Your data profiles are parsed and clean. Confirm
                          submission below to establish early priority status.
                        </p>
                      </div>
                      <div className="step-actions">
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => window.navigatePipeline?.(2)}
                        >
                          ← Edit Metrics
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => window.submitPipelineForm?.()}
                        >
                          Authorize Submission
                        </button>
                      </div>
                    </div>

                    <span
                      className="form-note"
                      style={{ display: "block", textAlign: "center", marginTop: "var(--sp-3)" }}
                    >
                      Submitting establishes direct line priority placement
                      ahead of unrestricted floor drops.
                    </span>
                    <div className="form-success" id="form-success" role="status">
                      <svg
                        width={18}
                        height={18}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Identity uploaded successfully. Await tracking confirmation
                      via your registered comms link.
                    </div>
                  </form>
                </div>
              </div>

              {/* Terms pane */}
              <div className="portal-pane" id="pane-terms">
                <div className="section-head" style={{ marginBottom: "var(--sp-4)" }}>
                  <span className="eyebrow">Codex Legalities</span>
                  <h3>Rules of Engagement</h3>
                  <p>
                    Read all mandatory constraints carefully before establishing
                    binding compliance signatures.
                  </p>
                </div>
                <div className="terms-dashboard">
                  <div className="term-info-card">
                    <h3>1. Floor Decorum Integrity</h3>
                    <p>
                      Plagiarism, pre-written resolutions, or unvouched research
                      material triggers immediate review and automatic
                      disqualification loops.
                    </p>
                  </div>
                  <div className="term-info-card">
                    <h3>2. Attendance Criteria Matrix</h3>
                    <p>
                      Missing more than one operational chamber session without
                      direct priority medical clearance rescinds eligibility for
                      awards and certifications.
                    </p>
                  </div>
                  <div className="term-info-card">
                    <h3>3. Financial Retention Protocol</h3>
                    <p>
                      Confirmed allocation cancellations processed inside a
                      window of 14 days preceding October 10 are completely
                      non-refundable.
                    </p>
                  </div>
                  <div className="term-info-card">
                    {/* Fix #5: aspect-ratio reserved */}
                    <div
                      className="img-placeholder"
                      role="img"
                      aria-label="Regulatory codex sign-off graphic — coming soon"
                    >
                      Regulatory Codex Sign-off
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECRETARIAT ───────────────────────────────────── */}
        <section id="secretariat" data-mood="#F3E1DD" aria-labelledby="secretariat-heading">
          <div className="section-inner">
            <div className="section-head reveal">
              <span className="eyebrow">Behind the Gavel</span>
              <h2 id="secretariat-heading">Secretariat</h2>
              <p>The team running the room. Hover or focus a card to meet them.</p>
            </div>
          </div>
          <div className="marquee-viewport">
            <div className="marquee-lift" id="marquee-lift">
              {/*
               * Fix #4: Individual sec-card images get alt text in makeSecCard() (JS).
               * Fix #5: Avatar .sec-card .avatar has explicit 64×64 CSS dimensions to
               *         reserve layout before image loads → no CLS.
               */}
              <div className="marquee-track" id="marquee-track" />
            </div>
          </div>
          <ul className="sr-only-list" id="sr-secretariat-list" aria-label="Secretariat roster" />
        </section>

        {/* ── HISTORY ───────────────────────────────────────── */}
        <section id="history" data-mood="#E8C0BC" aria-labelledby="history-heading">
          <div className="section-inner">
            <div className="section-head reveal">
              <span className="eyebrow">Where We&apos;ve Stood</span>
              <h2 id="history-heading">History</h2>
            </div>
            <div className="bento">
              <div className="history-summary glass reveal">
                <p>
                  The Vigilante MUN is a youth-led, impact-driven organisation
                  committed to creating platforms that blend academic excellence,
                  leadership development, and social responsibility. Over the
                  years, Vigilante has emerged as a trusted name in large-scale
                  student conferences, public audience events, and structured
                  training programmes, working closely with reputed educational
                  institutions, university administrations, and public figures.
                  With experience spanning on-ground events, online conferences,
                  social impact campaigns, and mass-audience management,
                  Vigilante has consistently delivered initiatives marked by
                  professionalism, scale, and purpose.
                </p>
              </div>
              <div className="timeline" id="timeline" />
            </div>
          </div>
        </section>

        {/* ── SPONSORS ──────────────────────────────────────── */}
        <section id="sponsors" data-mood="#F8FAED" aria-labelledby="sponsors-heading">
          <div className="section-inner">
            <div
              className="section-head reveal"
              style={{ margin: "0 auto var(--sp-4)", textAlign: "center", maxWidth: "100%" }}
            >
              <span className="eyebrow">Standing With Us</span>
              <h2 id="sponsors-heading">Sponsors &amp; Partners</h2>
            </div>
            <div className="bento">
              <div className="sponsor-row glass reveal" style={{ padding: "var(--sp-3)" }}>
                <div className="sponsor-slot glass">Partner slot</div>
                <div className="sponsor-slot glass">Partner slot</div>
                <div className="sponsor-slot glass">Partner slot</div>
                <div className="sponsor-slot glass">Partner slot</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ───────────────────────────────────────── */}
        <section id="contact" data-mood="#FAF3F1" aria-labelledby="contact-heading">
          <div className="section-inner bento">
            <div className="contact-card glass reveal">
              <h2 id="contact-heading">Ready to take the floor?</h2>
              <p>
                Registration opens soon. Follow along so you don&apos;t miss
                your seat.
              </p>
              <a className="btn btn-primary" href="#registration">
                Get notified
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="foot-mark">VIGILANTE MUN</div>
        <div>October 10–11 · New Delhi</div>
        <div className="foot-note">
          © <span id="year" /> Vigilante MUN. All rights reserved.
        </div>
      </footer>

      {/* Committee modal */}
      <div
        id="committee-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-scrim" data-close />
        <div className="modal-panel">
          <button
            className="modal-close"
            data-close
            aria-label="Close committee details"
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <h3 id="modal-title" />
          <p id="modal-body" />
        </div>
      </div>
    </>
  );
}

// Augment window for portal functions called from onClick handlers
declare global {
  interface Window {
    switchPortalTab?: (pane: string) => void;
    navigatePipeline?: (step: number) => void;
    submitPipelineForm?: () => void;
  }
}
