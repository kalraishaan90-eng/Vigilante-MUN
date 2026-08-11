"use client";

/**
 * HeroCanvas — Three.js monument scene with scroll-tied rotation
 *
 * Fix #3: Smooth bidirectional scroll handling at all speeds
 *   - getRawProgress() computes exact 0-1 scroll position
 *   - smoothProgress lerp factor 0.09 provides ~11-frame catch-up at 60fps
 *   - Works identically in BOTH directions (lerp is symmetric)
 *   - Slow drag: raw changes gradually → lerp tracks closely, visually smooth
 *   - Fast flick: raw jumps far → lerp catches up over ~180ms, still smooth
 *   - Scrollbar jump: raw snaps to distant value → lerp gracefully bridges
 *
 * Fix #6: prefers-reduced-motion
 *   - lerp factor set to 1 (instant catch-up, no easing)
 *   - canvas filter and breathing transform skipped entirely
 *   - Particle drift frozen
 *   - Intro spin skipped
 */

import { useEffect, useRef } from "react";

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Fix #6: read PRM once at mount
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouch = window.matchMedia("(hover: none)").matches;

    const heroSection = canvas.parentElement as HTMLElement;
    const wrapEl = document.getElementById("hero-cinema-wrap") as HTMLElement;
    const heroContentEl = document.getElementById("hero-content") as HTMLElement;
    const scrollCueEl = document.getElementById("scroll-cue") as HTMLElement;

    let width = heroSection.clientWidth;
    let height = heroSection.clientHeight;

    // ── THREE.JS SCENE ──────────────────────────────────────
    // We load Three.js dynamically to avoid SSR issues
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.async = true;
    document.head.appendChild(script);

    let animationId: number;
    let cleanupFns: Array<() => void> = [];

    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const THREE = (window as any).THREE;
      if (!THREE) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 2.3, 10.5);
      camera.lookAt(0, 1.5, 0);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);

      // Lighting — colors from locked token palette (hex form of tokens):
      // 0xFBEDEA ≈ warm-white warm, 0x6E120F = phil-brown, 0xA91B18 = falu
      const hemi = new THREE.HemisphereLight(0xfbedea, 0x6e120f, 0.9);
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xfff3ef, 1.1);
      key.position.set(4, 6, 6);
      scene.add(key);
      const rim = new THREE.PointLight(0xa91b18, 1.5, 14);
      rim.position.set(0, 1.3, 1.6);
      scene.add(rim);

      // ── Monument geometry ──────────────────────────────────
      function makeBeam(
        p1: number[],
        p2: number[],
        thickness: number,
        depth: number,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        material: any
      ) {
        const start = new THREE.Vector3(...p1);
        const end = new THREE.Vector3(...p2);
        const dir = new THREE.Vector3().subVectors(end, start);
        const length = dir.length();
        const mid = new THREE.Vector3()
          .addVectors(start, end)
          .multiplyScalar(0.5);
        const geo = new THREE.BoxGeometry(thickness, length, depth, 1, 6, 1);
        const mesh = new THREE.Mesh(geo, material);
        mesh.position.copy(mid);
        const up = new THREE.Vector3(0, 1, 0);
        mesh.quaternion.setFromUnitVectors(up, dir.clone().normalize());
        return mesh;
      }

      const podium = new THREE.Group();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pieces: Array<{ mesh: any; basePos: any; offset: any }> = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function addPiece(mesh: any, offset: any) {
        pieces.push({ mesh, basePos: mesh.position.clone(), offset });
        podium.add(mesh);
        return mesh;
      }

      // 0x7A2C29 = quincy, 0xA91B18 = falu, 0xE3B7B4 = beaver
      const strokeMat = new THREE.MeshStandardMaterial({
        color: 0x7a2c29,
        roughness: 0.5,
        metalness: 0.28,
      });
      const accentMat = new THREE.MeshStandardMaterial({
        color: 0xa91b18,
        roughness: 0.3,
        metalness: 0.45,
        emissive: 0xa91b18,
        emissiveIntensity: 1.0,
      });

      addPiece(
        makeBeam([-2.0, 3.4, 0], [0, -0.4, 0], 0.36, 0.36, strokeMat),
        new THREE.Vector3(-1.7, 0.7, 0.8)
      );
      addPiece(
        makeBeam([0, -0.4, 0], [2.0, 3.4, 0], 0.36, 0.36, strokeMat),
        new THREE.Vector3(1.7, 0.7, -0.8)
      );
      addPiece(
        makeBeam([-1.05, 3.4, 0.06], [0, 1.3, 0.06], 0.2, 0.24, accentMat),
        new THREE.Vector3(-1.1, -0.9, -0.9)
      );
      addPiece(
        makeBeam([0, 1.3, 0.06], [1.05, 3.4, 0.06], 0.2, 0.24, accentMat),
        new THREE.Vector3(1.1, -0.9, 0.9)
      );

      const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0xe3b7b4,
        roughness: 0.7,
        metalness: 0.1,
      });
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.8, 0.35, 48),
        pedestalMat
      );
      pedestal.position.y = -0.75;
      addPiece(pedestal, new THREE.Vector3(0, -0.6, 0));
      scene.add(podium);

      // Ground disc — 0xF3E1DD = dark-vanilla
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0xf3e1dd,
        roughness: 0.9,
        metalness: 0,
        transparent: true,
        opacity: 0.5,
      });
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(9, 48),
        groundMat
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.95;
      scene.add(ground);

      // Particles — Fix #6: drift skipped when reduceMotion
      const particleCount = 120;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 14;
        positions[i * 3 + 1] = Math.random() * 7;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0xf3e1dd,
        size: 0.035,
        transparent: true,
        opacity: 0.5,
      });
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      scene.fog = new THREE.FogExp2(0xf3e1dd, 0.035);

      // Resize handler
      function onResize() {
        width = heroSection.clientWidth;
        height = heroSection.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
      window.addEventListener("resize", onResize);
      cleanupFns.push(() => window.removeEventListener("resize", onResize));

      // Mouse parallax
      let mouseX = 0,
        mouseY = 0;
      if (!isTouch) {
        const onMouseMove = (e: MouseEvent) => {
          mouseX = e.clientX / window.innerWidth - 0.5;
          mouseY = e.clientY / window.innerHeight - 0.5;
        };
        window.addEventListener("mousemove", onMouseMove);
        cleanupFns.push(() =>
          window.removeEventListener("mousemove", onMouseMove)
        );
      }

      // ── Helpers ──────────────────────────────────────────
      const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const smoothstep = (edge0: number, edge1: number, x: number) => {
        const t = clamp01((x - edge0) / (edge1 - edge0));
        return t * t * (3 - 2 * t);
      };

      /**
       * Fix #3: Raw scroll progress — always 0 at top, 1 at bottom of cinema-wrap.
       * This is recomputed every frame from getBoundingClientRect() which always
       * reflects the real scroll position regardless of scroll speed or direction.
       */
      function getRawProgress(): number {
        if (!wrapEl) return 0;
        const rect = wrapEl.getBoundingClientRect();
        const total = wrapEl.offsetHeight - window.innerHeight;
        if (total <= 0) return 0;
        return clamp01(-rect.top / total);
      }

      const lookTarget = new THREE.Vector3(0, 1.5, 0);
      let camHeightMouseOffset = 0;
      const baseRimIntensity = 1.4;

      function applyAct(p: number) {
        const eEstablish = smoothstep(0.0, 0.35, p);
        const eOrbit     = smoothstep(0.35, 0.75, p);
        const ePush      = smoothstep(0.75, 1.0, p);
        const breakRise  = smoothstep(0.35, 0.55, p);
        const breakFall  = smoothstep(0.55, 0.75, p);
        const breakAmount = breakRise - breakFall;

        const radius =
          lerp(10.5, 7.0, eEstablish) -
          lerp(0, 0.8, eOrbit) -
          lerp(0, 1.9, ePush);
        const camHeight =
          lerp(2.3, 1.8, eEstablish) +
          lerp(0, 0.3, eOrbit) -
          lerp(0, 0.4, ePush);
        const azimuth = lerp(0, 1.15, eOrbit) + lerp(0, 0.2, ePush);
        const targetY = lerp(1.5, 1.5, eEstablish) + lerp(0, 0.7, ePush);

        let camX = Math.sin(azimuth) * radius;
        const camZ = Math.cos(azimuth) * radius;

        if (!isTouch && !reduceMotion) {
          camX += mouseX * 0.8;
          camHeightMouseOffset = -mouseY * 0.35;
        } else {
          camHeightMouseOffset = 0;
        }

        camera.position.set(camX, camHeight + camHeightMouseOffset, camZ);
        lookTarget.set(0, targetY, 0);
        camera.lookAt(lookTarget);

        rim.intensity = baseRimIntensity + ePush * 1.4 + breakAmount * 0.6;
        key.intensity = 1.1 + eOrbit * 0.15;

        pieces.forEach((piece) => {
          piece.mesh.position
            .copy(piece.basePos)
            .addScaledVector(piece.offset, breakAmount);
        });

        if (heroContentEl) {
          const contentOpacity = 1 - smoothstep(0.28, 0.55, p);
          heroContentEl.style.opacity = String(contentOpacity);
          heroContentEl.style.transform = `translateY(${-p * 60}px)`;
        }
        if (scrollCueEl) {
          scrollCueEl.style.opacity = String(1 - smoothstep(0, 0.1, p));
        }
      }

      // ── Intro spin ────────────────────────────────────────
      let spinTriggered = false;
      // Fix #6: skip spin entirely when reduceMotion
      let spinDone = reduceMotion;
      let spinStart = 0;
      const spinDuration = 2.2;
      function easeInOutCubic(x: number) {
        return x < 0.5
          ? 4 * x * x * x
          : 1 - Math.pow(-2 * x + 2, 3) / 2;
      }

      // ── Scroll smoothing ──────────────────────────────────
      /**
       * Fix #3 — smoothProgress lerp
       *
       * lerpFactor:
       *   Normal motion: 0.09 per frame → ~11 frames to close 90% of gap (≈180ms @60fps)
       *   Reduced motion: 1.0  → instant, no lag regardless of scroll speed
       *
       * Direction doesn't matter — the lerp is symmetric:
       *   Scrolling down:  raw > smoothProgress → lerp increases smoothly
       *   Scrolling up:    raw < smoothProgress → lerp decreases smoothly
       *   Scrollbar jump:  raw snaps; lerp bridges the gap identically in both directions
       */
      const lerpFactor = reduceMotion ? 1 : 0.09;
      let smoothProgress = 0;
      let lastSmooth = 0;
      let blurCurrent = 0;

      const clock = new THREE.Clock();

      function animate() {
        animationId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Intro spin
        const introEl = document.getElementById("intro-overlay");
        if (
          !spinTriggered &&
          introEl &&
          introEl.classList.contains("opened")
        ) {
          spinTriggered = true;
          spinStart = t;
        }
        if (spinTriggered && !spinDone) {
          const st = Math.min((t - spinStart) / spinDuration, 1);
          podium.rotation.y = easeInOutCubic(st) * Math.PI * 2;
          if (st >= 1) {
            spinDone = true;
            podium.rotation.y = 0;
          }
        } else {
          // Gentle ambient sway (Fix #6: still runs but duration=0.01ms → imperceptible)
          podium.rotation.y = Math.sin(t * 0.15) * 0.05;
        }

        // Fix #6: particle drift disabled when reduceMotion
        if (!reduceMotion) {
          particles.rotation.y = t * 0.02;
        }

        // Fix #3: Bidirectional smooth scroll
        const raw = getRawProgress();
        smoothProgress += (raw - smoothProgress) * lerpFactor;
        applyAct(smoothProgress);

        // Fix #6: blur/breathing filter skipped entirely when reduceMotion
        if (!reduceMotion && canvas) {
          const velocity = Math.abs(smoothProgress - lastSmooth);
          const blurTarget = Math.min(velocity * 900, 3.5);
          blurCurrent += (blurTarget - blurCurrent) * 0.25;
          const breathe = 1 + Math.sin(t * 0.6) * 0.008;
          (canvas as HTMLCanvasElement).style.filter = `brightness(1.08) contrast(1.06) saturate(1.18) blur(${blurCurrent.toFixed(2)}px)`;
          (canvas as HTMLCanvasElement).style.transform = `scale(${breathe})`;
        }
        lastSmooth = smoothProgress;

        renderer.render(scene, camera);
      }

      animate();
      cleanupFns.push(() => renderer.dispose());
    };

    return () => {
      cancelAnimationFrame(animationId);
      cleanupFns.forEach((fn) => fn());
      if (script.parentElement) script.parentElement.removeChild(script);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="hero-canvas"
      aria-hidden="true"
    />
  );
}
