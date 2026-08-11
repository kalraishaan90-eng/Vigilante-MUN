import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// ── Locked color token constants ─────────────────────────────────────────────
const TOKEN_WARM_WHITE   = '#F8FAED';
const TOKEN_PHIL_BROWN   = '#6E120F';
const TOKEN_FALU         = '#A91B18';

const TOKEN_QUINCY_HEX       = 0x7A2C29;
const TOKEN_FALU_HEX         = 0xA91B18;
const TOKEN_BEAVER_HEX       = 0xE3B7B4;
const TOKEN_DARK_VANILLA_HEX = 0xF3E1DD;
const TOKEN_PALE_BLUE_HEX    = 0xCEE7F3;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (edge0, edge1, x) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

function createBeamSpec(p1, p2, thickness, depth) {
  const start = new THREE.Vector3(...p1);
  const end = new THREE.Vector3(...p2);
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const geometry = new THREE.BoxGeometry(thickness, length, depth, 1, 6, 1);
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
  return { geometry, mid, quaternion };
}

function buildGavelGroup(material) {
  const group = new THREE.Group();
  const handleGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.65, 12);
  const handleMesh = new THREE.Mesh(handleGeo, material);
  handleMesh.position.set(0, -0.18, 0);
  group.add(handleMesh);

  const headGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.38, 16);
  const headMesh = new THREE.Mesh(headGeo, material);
  headMesh.position.set(0, 0.18, 0);
  headMesh.rotation.z = Math.PI / 2;
  group.add(headMesh);

  const cap1Geo = new THREE.CylinderGeometry(0.13, 0.13, 0.04, 16);
  const cap1Mesh = new THREE.Mesh(cap1Geo, material);
  cap1Mesh.position.set(-0.18, 0.18, 0);
  cap1Mesh.rotation.z = Math.PI / 2;
  group.add(cap1Mesh);

  const cap2Mesh = new THREE.Mesh(cap1Geo, material);
  cap2Mesh.position.set(0.18, 0.18, 0);
  cap2Mesh.rotation.z = Math.PI / 2;
  group.add(cap2Mesh);

  return group;
}

function buildFlagGroup(material, wavingMaterial) {
  const group = new THREE.Group();
  const poleGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.75, 12);
  const pole = new THREE.Mesh(poleGeo, material);
  pole.position.set(-0.25, 0, 0);
  group.add(pole);

  const topGeo = new THREE.SphereGeometry(0.045, 12, 12);
  const top = new THREE.Mesh(topGeo, material);
  top.position.set(-0.25, 0.38, 0);
  group.add(top);

  const flagGeo = new THREE.PlaneGeometry(0.48, 0.34, 16, 16);
  const flag = new THREE.Mesh(flagGeo, wavingMaterial || material);
  flag.position.set(0.01, 0.2, 0);
  group.add(flag);

  return group;
}

function buildGlobeGroup(material) {
  const group = new THREE.Group();
  const sphereGeo = new THREE.SphereGeometry(0.25, 24, 24);
  const sphere = new THREE.Mesh(sphereGeo, material);
  group.add(sphere);

  const ringGeo = new THREE.TorusGeometry(0.33, 0.018, 12, 32);
  const ring1 = new THREE.Mesh(ringGeo, material);
  ring1.rotation.set(Math.PI / 3, Math.PI / 6, 0);
  group.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo, material);
  ring2.rotation.set(-Math.PI / 4, -Math.PI / 4, 0);
  group.add(ring2);

  return group;
}

const SWARM_ITEMS = [
  { id: 'fg-gavel-1', layer: 'fg', type: 'gavel', basePos: [-2.1, 1.6, 1.8], scale: 1.4, color: 'falu', rotSpeed: { x: 0.4, y: 0.6, z: 0.2 }, bobPhase: 0.0, bobSpeed: 1.2 },
  { id: 'fg-globe-1', layer: 'fg', type: 'globe', basePos: [2.0, 1.3, 1.6], scale: 1.35, color: 'paleBlue', rotSpeed: { x: -0.3, y: 0.5, z: 0.4 }, bobPhase: 1.4, bobSpeed: 1.4 },
  { id: 'fg-flag-1', layer: 'fg', type: 'flag', basePos: [-3.8, -0.4, 1.2], scale: 0.9, color: 'falu', rotSpeed: { x: 0.2, y: 0.4, z: -0.3 }, bobPhase: 2.8, bobSpeed: 1.1 },
  { id: 'fg-gavel-2', layer: 'fg', type: 'gavel', basePos: [3.9, 2.6, 1.1], scale: 0.85, color: 'paleBlue', rotSpeed: { x: -0.5, y: -0.3, z: 0.3 }, bobPhase: 4.2, bobSpeed: 1.3 },
  { id: 'bg-flag-2', layer: 'bg', type: 'flag', basePos: [1.9, 3.1, -1.8], scale: 1.0, color: 'falu', rotSpeed: { x: 0.3, y: -0.4, z: 0.2 }, bobPhase: 0.8, bobSpeed: 1.0 },
  { id: 'bg-globe-2', layer: 'bg', type: 'globe', basePos: [-2.9, 2.8, -1.5], scale: 0.85, color: 'paleBlue', rotSpeed: { x: 0.4, y: 0.3, z: -0.5 }, bobPhase: 2.1, bobSpeed: 1.25 },
  { id: 'bg-gavel-3', layer: 'bg', type: 'gavel', basePos: [-3.6, -0.6, -2.0], scale: 0.75, color: 'falu', rotSpeed: { x: -0.4, y: 0.5, z: 0.3 }, bobPhase: 3.5, bobSpeed: 1.35 },
  { id: 'bg-flag-3', layer: 'bg', type: 'flag', basePos: [3.7, -0.5, -2.2], scale: 0.8, color: 'paleBlue', rotSpeed: { x: 0.2, y: -0.6, z: -0.2 }, bobPhase: 4.9, bobSpeed: 1.15 },
  { id: 'bg-globe-3', layer: 'bg', type: 'globe', basePos: [0.6, 3.6, -2.5], scale: 0.95, color: 'falu', rotSpeed: { x: -0.3, y: 0.4, z: 0.4 }, bobPhase: 5.8, bobSpeed: 1.2 },
];

export default function Hero3D({ containerRef, heroContentRef, scrollCueRef }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, clientX: undefined, clientY: undefined });
  const [isTouch, setIsTouch] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const filterStateRef = useRef({ blurCurrent: 0 });

  useEffect(() => {
    const checkTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(checkTouch);

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
        clientX: e.clientX,
        clientY: e.clientY,
      };
    };

    if (!checkTouch) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      if (!checkTouch) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Post-processing blur & scale state updater for container scroll
  useEffect(() => {
    if (containerRef && containerRef.current) {
      containerRef.current.onScrollStateUpdate = (progress, velocity, time) => {
        if (!wrapperRef.current) return;

        if (!prefersReducedMotion) {
          const blurTarget = Math.min(velocity * 900, 3.5);
          filterStateRef.current.blurCurrent += (blurTarget - filterStateRef.current.blurCurrent) * 0.25;
          const breathe = 1 + Math.sin(time * 0.6) * 0.008;

          wrapperRef.current.style.filter = `brightness(1.08) contrast(1.06) saturate(1.18) blur(${filterStateRef.current.blurCurrent.toFixed(2)}px)`;
          wrapperRef.current.style.transform = `scale(${breathe})`;
        } else {
          wrapperRef.current.style.filter = 'brightness(1.08) contrast(1.06) saturate(1.18)';
          wrapperRef.current.style.transform = 'none';
        }

        if (heroContentRef && heroContentRef.current) {
          const contentOpacity = 1 - smoothstep(0.28, 0.55, progress);
          heroContentRef.current.style.opacity = contentOpacity;
          heroContentRef.current.style.transform = `translateY(${-progress * 60}px)`;
        }

        if (scrollCueRef && scrollCueRef.current) {
          const cueOpacity = 1 - smoothstep(0, 0.1, progress);
          scrollCueRef.current.style.opacity = String(cueOpacity);
        }
      };
    }
  }, [containerRef, heroContentRef, scrollCueRef, prefersReducedMotion]);

  // Main Three.js Scene Setup & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const darkFogColor = new THREE.Color(TOKEN_PHIL_BROWN);
    const lightFogColor = new THREE.Color(TOKEN_WARM_WHITE);
    scene.fog = new THREE.FogExp2(prefersReducedMotion ? lightFogColor : darkFogColor, 0.035);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 2.3, 10.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // Materials
    const strokeMat = new THREE.MeshStandardMaterial({ color: TOKEN_QUINCY_HEX, roughness: 0.5, metalness: 0.28 });
    const accentMat = new THREE.MeshStandardMaterial({ color: TOKEN_FALU_HEX, roughness: 0.3, metalness: 0.45, emissive: TOKEN_FALU_HEX, emissiveIntensity: 1.0 });
    const pedestalMat = new THREE.MeshStandardMaterial({ color: TOKEN_BEAVER_HEX, roughness: 0.7, metalness: 0.1 });
    const groundMat = new THREE.MeshStandardMaterial({ color: TOKEN_DARK_VANILLA_HEX, roughness: 0.9, metalness: 0, transparent: true, opacity: 0.5 });
    const faluMat = new THREE.MeshStandardMaterial({ color: TOKEN_FALU_HEX, roughness: 0.75, metalness: 0.1 });
    const paleBlueMat = new THREE.MeshStandardMaterial({ color: TOKEN_PALE_BLUE_HEX, roughness: 0.75, metalness: 0.1 });

    const createWavingMat = (baseMat) => {
      const mat = baseMat.clone();
      mat.userData = { uTime: { value: 0 } };
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = mat.userData.uTime;
        shader.vertexShader = `uniform float uTime;\n${shader.vertexShader}`.replace('#include <begin_vertex>', `#include <begin_vertex>\ntransformed.z += sin(uv.x * 6.28 - uTime * 3.5) * 0.07 * uv.x;`);
      };
      return mat;
    };
    const wavingFaluMat = createWavingMat(faluMat);
    const wavingPaleBlueMat = createWavingMat(paleBlueMat);

    // Liquid Wave Background Plane
    const waveMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScrollProgress: { value: 0 },
        uPaletteMix: { value: prefersReducedMotion ? 1.0 : 0.0 },
        uAspect: { value: width / height },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uScrollProgress;
        uniform float uPaletteMix;
        uniform float uAspect;
        varying vec2 vUv;

        const vec3 TOP_SHADOW    = vec3(0.065, 0.015, 0.020);
        const vec3 TOP_BODY_LOW  = vec3(0.431, 0.071, 0.059);
        const vec3 TOP_BODY_HIGH = vec3(0.478, 0.173, 0.161);
        const vec3 TOP_CREST     = vec3(0.925, 0.815, 0.795);

        const vec3 BOT_SHADOW    = vec3(0.040, 0.015, 0.020);
        const vec3 BOT_BODY_LOW  = vec3(0.094, 0.090, 0.090);
        const vec3 BOT_BODY_HIGH = vec3(0.663, 0.106, 0.094);
        const vec3 BOT_CREST     = vec3(0.808, 0.906, 0.953);

        const vec3 LIGHT_SHADOW    = vec3(0.920, 0.850, 0.830);
        const vec3 LIGHT_BODY_LOW  = vec3(0.953, 0.882, 0.867);
        const vec3 LIGHT_BODY_HIGH = vec3(0.973, 0.980, 0.929);
        const vec3 LIGHT_CREST     = vec3(0.988, 0.992, 0.965);

        float waveField(vec2 uv, float time, float scrollDeform) {
          vec2 dir1 = vec2(0.819, 0.574);
          vec2 dir2 = vec2(-0.766, 0.643);
          vec2 dir3 = vec2(0.643, -0.766);

          float w1 = sin(dot(uv, dir1) * 2.4 + time * 1.0 + scrollDeform * 0.7);
          float w2 = cos(dot(uv, dir2) * 3.6 - time * 1.2 + scrollDeform * 0.5);
          float w3 = sin(dot(uv, dir3) * 1.8 + time * 0.75 - scrollDeform * 0.9);

          float composite = w1 * 0.42 + w2 * 0.36 + w3 * 0.22;
          return smoothstep(-0.85, 0.85, composite);
        }

        void main() {
          vec2 uv = (vUv - vec2(0.5));
          uv.x *= uAspect;
          float scrollDeform = uScrollProgress * 5.0;
          float waveVal = waveField(uv, uTime, scrollDeform);

          float sFactor = smoothstep(0.0, 1.0, uScrollProgress);
          vec3 stopShadow   = mix(TOP_SHADOW, BOT_SHADOW, sFactor);
          vec3 stopBodyLow  = mix(TOP_BODY_LOW, BOT_BODY_LOW, sFactor);
          vec3 stopBodyHigh = mix(TOP_BODY_HIGH, BOT_BODY_HIGH, sFactor);
          vec3 stopCrest    = mix(TOP_CREST, BOT_CREST, sFactor);

          stopShadow   = mix(stopShadow, LIGHT_SHADOW, uPaletteMix);
          stopBodyLow  = mix(stopBodyLow, LIGHT_BODY_LOW, uPaletteMix);
          stopBodyHigh = mix(stopBodyHigh, LIGHT_BODY_HIGH, uPaletteMix);
          stopCrest    = mix(stopCrest, LIGHT_CREST, uPaletteMix);

          vec3 color;
          if (waveVal < 0.32) {
            color = mix(stopShadow, stopBodyLow, smoothstep(0.0, 0.32, waveVal));
          } else if (waveVal < 0.72) {
            color = mix(stopBodyLow, stopBodyHigh, smoothstep(0.32, 0.72, waveVal));
          } else {
            color = mix(stopBodyHigh, stopCrest, smoothstep(0.72, 1.0, waveVal));
          }

          vec2 vigUv = vUv - vec2(0.5);
          float vignette = 1.0 - dot(vigUv, vigUv) * 0.12;
          color *= vignette;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      depthWrite: false,
      depthTest: false,
    });

    const wavePlane = new THREE.Mesh(new THREE.PlaneGeometry(35, 25), waveMaterial);
    wavePlane.position.set(0, 0, -8);
    wavePlane.renderOrder = -10;
    scene.add(camera);
    camera.add(wavePlane);

    // Lights
    const hemiLight = new THREE.HemisphereLight(TOKEN_WARM_WHITE, TOKEN_PHIL_BROWN, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(TOKEN_WARM_WHITE, 1.1);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(TOKEN_FALU, 1.5, 14);
    rimLight.position.set(0, 1.3, 1.6);
    scene.add(rimLight);

    // Monument Group
    const monumentGroup = new THREE.Group();
    scene.add(monumentGroup);

    const beamSpecs = [
      { id: 'outerLeft', ...createBeamSpec([-2.0, 3.4, 0], [0, -0.4, 0], 0.36, 0.36), material: strokeMat, offset: new THREE.Vector3(-1.7, 0.7, 0.8) },
      { id: 'outerRight', ...createBeamSpec([0, -0.4, 0], [2.0, 3.4, 0], 0.36, 0.36), material: strokeMat, offset: new THREE.Vector3(1.7, 0.7, -0.8) },
      { id: 'innerLeft', ...createBeamSpec([-1.05, 3.4, 0.06], [0, 1.3, 0.06], 0.2, 0.24), material: accentMat, offset: new THREE.Vector3(-1.1, -0.9, -0.9) },
      { id: 'innerRight', ...createBeamSpec([0, 1.3, 0.06], [1.05, 3.4, 0.06], 0.2, 0.24), material: accentMat, offset: new THREE.Vector3(1.1, -0.9, 0.9) },
    ];

    const pieces = [];
    beamSpecs.forEach((spec) => {
      const mesh = new THREE.Mesh(spec.geometry, spec.material);
      mesh.position.copy(spec.mid);
      mesh.quaternion.copy(spec.quaternion);
      monumentGroup.add(mesh);
      pieces.push({ mesh, basePos: spec.mid.clone(), offset: spec.offset });
    });

    const pedestalGeo = new THREE.CylinderGeometry(2.5, 2.8, 0.35, 48);
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.position.set(0, -0.75, 0);
    monumentGroup.add(pedestalMesh);
    pieces.push({ mesh: pedestalMesh, basePos: new THREE.Vector3(0, -0.75, 0), offset: new THREE.Vector3(0, -0.6, 0) });

    // Ground Circle
    const groundGeo = new THREE.CircleGeometry(9, 48);
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(0, -0.95, 0);
    scene.add(groundMesh);

    // Particles
    const pCount = 120;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 14;
      pPos[i * 3 + 1] = Math.random() * 7;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xF3E1DD, size: 0.035, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Swarm Layer Groups
    const fgGroup = new THREE.Group();
    const bgGroup = new THREE.Group();
    scene.add(bgGroup);
    scene.add(fgGroup);

    const itemMeshes = [];
    const itemStates = SWARM_ITEMS.map(() => ({ currentPushPxX: 0, currentPushPxY: 0 }));

    SWARM_ITEMS.forEach((item) => {
      let meshGroup;
      if (item.type === 'gavel') {
        meshGroup = buildGavelGroup(faluMat);
      } else if (item.type === 'flag') {
        const mat = item.color === 'falu' ? faluMat : paleBlueMat;
        const waveM = item.color === 'falu' ? wavingFaluMat : wavingPaleBlueMat;
        meshGroup = buildFlagGroup(mat, waveM);
      } else {
        const mat = item.color === 'falu' ? faluMat : paleBlueMat;
        meshGroup = buildGlobeGroup(mat);
      }

      meshGroup.position.set(...item.basePos);
      meshGroup.scale.setScalar(item.scale);

      if (item.layer === 'bg') {
        bgGroup.add(meshGroup);
      } else {
        fgGroup.add(meshGroup);
      }
      itemMeshes.push(meshGroup);
    });

    // Resize Handler
    const handleResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      waveMaterial.uniforms.uAspect.value = w / h;
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();
    const stateRef = { smoothProgress: 0, lastSmooth: 0, velocity: 0 };
    const lookTarget = new THREE.Vector3(0, 1.5, 0);
    const tempProjVec = new THREE.Vector3();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (wavingFaluMat.userData.uTime) wavingFaluMat.userData.uTime.value = t;
      if (wavingPaleBlueMat.userData.uTime) wavingPaleBlueMat.userData.uTime.value = t;

      let rawProgress = 0;
      if (containerRef && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
        if (totalScrollable > 0) rawProgress = clamp01(-rect.top / totalScrollable);
      }

      stateRef.smoothProgress += (rawProgress - stateRef.smoothProgress) * (prefersReducedMotion ? 1 : 0.09);
      const p = stateRef.smoothProgress;
      stateRef.velocity = Math.abs(p - stateRef.lastSmooth);
      stateRef.lastSmooth = p;

      const heroTone = prefersReducedMotion ? 1.0 : smoothstep(0.75, 1.0, p);

      if (wrapperRef.current) {
        wrapperRef.current.style.setProperty('--hero-bg-mix', heroTone.toFixed(4));
      }
      if (containerRef && containerRef.current) {
        containerRef.current.style.setProperty('--hero-bg-mix', heroTone.toFixed(4));
      }

      scene.fog.color.copy(darkFogColor).lerp(lightFogColor, heroTone);
      waveMaterial.uniforms.uTime.value = t * 0.08;
      waveMaterial.uniforms.uScrollProgress.value = p;
      waveMaterial.uniforms.uPaletteMix.value = heroTone;

      monumentGroup.rotation.y = p * Math.PI * 2 + (prefersReducedMotion ? 0 : Math.sin(t * 0.15) * 0.05);
      if (!prefersReducedMotion) particles.rotation.y = t * 0.02;

      const eEstablish = smoothstep(0.0, 0.35, p);
      const eOrbit = smoothstep(0.35, 0.75, p);
      const ePush = smoothstep(0.75, 1.0, p);
      const breakAmount = smoothstep(0.35, 0.55, p) - smoothstep(0.55, 0.75, p);

      const radius = lerp(10.5, 7.0, eEstablish) - lerp(0, 0.8, eOrbit) - lerp(0, 1.9, ePush);
      const camHeight = lerp(2.3, 1.8, eEstablish) + lerp(0, 0.3, eOrbit) - lerp(0, 0.4, ePush);
      const azimuth = lerp(0, 1.15, eOrbit) + lerp(0, 0.2, ePush);
      const targetY = lerp(1.5, 1.5, eEstablish) + lerp(0, 0.7, ePush);

      let camX = Math.sin(azimuth) * radius + (!isTouch && !prefersReducedMotion && mouseRef.current ? mouseRef.current.x * 0.8 : 0);
      const mouseYOffset = !isTouch && !prefersReducedMotion && mouseRef.current ? -mouseRef.current.y * 0.35 : 0;
      camera.position.set(camX, camHeight + mouseYOffset, Math.cos(azimuth) * radius);
      camera.lookAt(lookTarget.set(0, targetY, 0));

      rimLight.intensity = 1.4 + ePush * 1.4 + breakAmount * 0.6;
      keyLight.intensity = 1.1 + eOrbit * 0.15;

      pieces.forEach((piece) => {
        if (piece.mesh) piece.mesh.position.copy(piece.basePos).addScaledVector(piece.offset, breakAmount);
      });

      const pxToWorld = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * Math.abs(camera.position.z)) / Math.max(1, window.innerHeight);
      if (mouseRef.current) {
        fgGroup.position.set(mouseRef.current.x * 60 * pxToWorld, -mouseRef.current.y * 60 * pxToWorld, 0);
        bgGroup.position.set(mouseRef.current.x * -30 * pxToWorld, -mouseRef.current.y * -30 * pxToWorld, 0);
      }

      SWARM_ITEMS.forEach((item, idx) => {
        const mesh = itemMeshes[idx];
        if (!mesh) return;
        const itemState = itemStates[idx];
        const bobY = Math.sin(t * item.bobSpeed + item.bobPhase) * 0.15;
        let targetPushPxX = 0, targetPushPxY = 0, speedMult = 1.0;

        if (!isTouch && !prefersReducedMotion && mouseRef.current?.clientX !== undefined) {
          mesh.getWorldPosition(tempProjVec).project(camera);
          const dx = mouseRef.current.clientX - (tempProjVec.x * 0.5 + 0.5) * window.innerWidth;
          const dy = mouseRef.current.clientY - (-tempProjVec.y * 0.5 + 0.5) * window.innerHeight;
          const dist = Math.hypot(dx, dy);
          if (dist < 400 && dist > 0.0001) {
            const force = (400 - dist) / 400;
            targetPushPxX = (dx / dist) * force * -80;
            targetPushPxY = (dy / dist) * force * -80;
            speedMult = 1 + force * 5;
          }
        }

        itemState.currentPushPxX += (targetPushPxX - itemState.currentPushPxX) * 0.1;
        itemState.currentPushPxY += (targetPushPxY - itemState.currentPushPxY) * 0.1;
        const itemPxToWorld = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * Math.max(1, Math.abs(camera.position.z - item.basePos[2]))) / Math.max(1, window.innerHeight);
        mesh.position.set(item.basePos[0] + itemState.currentPushPxX * itemPxToWorld, item.basePos[1] + bobY - itemState.currentPushPxY * itemPxToWorld, item.basePos[2]);

        if (!prefersReducedMotion) {
          mesh.rotation.set(
            mesh.rotation.x + item.rotSpeed.x * speedMult * 0.016,
            mesh.rotation.y + item.rotSpeed.y * speedMult * 0.016,
            mesh.rotation.z + item.rotSpeed.z * speedMult * 0.016
          );
        }
      });

      if (containerRef?.current?.onScrollStateUpdate) {
        containerRef.current.onScrollStateUpdate(p, stateRef.velocity, t);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      strokeMat.dispose();
      accentMat.dispose();
      pedestalMat.dispose();
      groundMat.dispose();
      faluMat.dispose();
      paleBlueMat.dispose();
      wavingFaluMat.dispose();
      wavingPaleBlueMat.dispose();
      waveMaterial.dispose();
      pGeo.dispose();
      pMat.dispose();
    };
  }, [containerRef, prefersReducedMotion, isTouch]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        willChange: 'transform, filter',
        transition: prefersReducedMotion ? 'none' : 'filter 0.05s linear',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
