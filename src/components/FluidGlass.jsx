/* eslint-disable react/no-unknown-property */
import '../react-polyfill';
import * as THREE from 'three';
import React, { useRef, useState, useEffect, memo, useMemo } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import {
  useFBO,
  useGLTF,
  useScroll,
  Image,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text
} from '@react-three/drei';
import { easing } from 'maath';

export default function FluidGlass({
  mode = 'lens',
  lensProps = {},
  barProps = {},
  cubeProps = {},
  customItems = null,
  titleText = "VIGILANTE MUN"
}) {
  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;

  const {
    navItems = customItems || [
      { label: 'Countdown', link: '#countdown' },
      { label: 'Committees', link: '#committees' },
      { label: 'Registration', link: '#registration' },
      { label: 'Secretariat', link: '#secretariat' },
      { label: 'Founders', link: '#founders' },
      { label: 'History', link: '#history' },
      { label: 'Contact', link: '#contact' }
    ],
    ...modeProps
  } = rawOverrides;

  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
      <ScrollControls damping={0.2} pages={3} distance={0.4}>
        {mode === 'bar' && <NavItems items={navItems} />}
        <Wrapper modeProps={modeProps}>
          <Scroll>
            <Typography titleText={titleText} />
            <Images />
          </Scroll>
          <Scroll html />
          <Preload />
        </Wrapper>
      </ScrollControls>
    </Canvas>
  );
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  defaultGeoType = 'cylinder',
  ...props
}) {
  const ref = useRef();
  
  // Try loading GLTF safely with fallback if missing
  let nodes = {};
  try {
    const gltf = useGLTF(glb);
    nodes = gltf.nodes || {};
  } catch {
    // Ignore missing GLTF errors and fallback to built-in geometry
  }


  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);

  // Fallback geometries if GLTF is missing
  const fallbackGeometry = useMemo(() => {
    if (defaultGeoType === 'cube') {
      return new THREE.BoxGeometry(4, 4, 4);
    } else if (defaultGeoType === 'bar') {
      return new THREE.BoxGeometry(10, 2, 2);
    }
    return new THREE.CylinderGeometry(5, 5, 2, 64);
  }, [defaultGeoType]);

  const geometryToUse = nodes[geometryKey]?.geometry || fallbackGeometry;

  useEffect(() => {
    if (geometryToUse) {
      geometryToUse.computeBoundingBox();
      if (geometryToUse.boundingBox) {
        geoWidthRef.current = geometryToUse.boundingBox.max.x - geometryToUse.boundingBox.min.x || 1;
      }
    }
  }, [geometryToUse]);

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer ? (pointer.y * v.height) / 2 : 0;
    
    if (ref.current) {
      easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

      if (modeProps.scale == null) {
        const maxWorld = v.width * 0.9;
        const desired = maxWorld / geoWidthRef.current;
        ref.current.scale.setScalar(Math.min(0.15, desired));
      }
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    // Background Color
    gl.setClearColor(0x8e0e0b, 0.2);
  });

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps;

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent opacity={0.9} />
      </mesh>
      <mesh
        ref={ref}
        scale={scale ?? 0.15}
        rotation-x={Math.PI / 2}
        geometry={geometryToUse}
        {...props}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.15}
          thickness={thickness ?? 5}
          anisotropy={anisotropy ?? 0.01}
          chromaticAberration={chromaticAberration ?? 0.1}
          {...extraMat}
        />
      </mesh>
    </>
  );
});

function Lens({ modeProps, ...p }) {
  return (
    <ModeWrapper
      glb="/assets/3d/lens.glb"
      geometryKey="Cylinder"
      defaultGeoType="cylinder"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Cube({ modeProps, ...p }) {
  return (
    <ModeWrapper
      glb="/assets/3d/cube.glb"
      geometryKey="Cube"
      defaultGeoType="cube"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Bar({ modeProps = {}, ...p }) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: '#ffffff',
    attenuationColor: '#ffffff',
    attenuationDistance: 0.25
  };

  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      defaultGeoType="bar"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  );
}

function NavItems({ items }) {
  const group = useRef();
  const { viewport, camera } = useThree();

  const DEVICE = {
    mobile: { max: 639, spacing: 0.2, fontSize: 0.035 },
    tablet: { max: 1023, spacing: 0.24, fontSize: 0.035 },
    desktop: { max: Infinity, spacing: 0.3, fontSize: 0.035 }
  };
  const getDevice = () => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    return w <= DEVICE.mobile.max ? 'mobile' : w <= DEVICE.tablet.max ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { spacing, fontSize } = DEVICE[device];

  useFrame(() => {
    if (!group.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1);

    group.current.children.forEach((child, i) => {
      child.position.x = (i - (items.length - 1) / 2) * spacing;
    });
  });

  const handleNavigate = (link) => {
    if (!link) return;
    if (link.startsWith('#')) {
      const targetId = link.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = link;
      }
    } else {
      window.location.href = link;
    }
  };

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label, link }) => (
        <Text
          key={label}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          depthWrite={false}
          outlineWidth={0}
          outlineBlur="20%"
          outlineColor="#000"
          outlineOpacity={0.5}
          depthTest={false}
          renderOrder={10}
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate(link);
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          {label}
        </Text>
      ))}
    </group>
  );
}

function Images() {
  const group = useRef();
  const data = useScroll();
  const { height } = useThree((s) => s.viewport);

  useFrame(() => {
    if (!group.current || !data) return;
    if (group.current.children[0]?.material) group.current.children[0].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    if (group.current.children[1]?.material) group.current.children[1].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    if (group.current.children[2]?.material) group.current.children[2].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    if (group.current.children[3]?.material) group.current.children[3].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    if (group.current.children[4]?.material) group.current.children[4].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
  });

  return (
    <group ref={group}>
      <Image position={[-2, 0, 0]} scale={[3, height / 1.1, 1]} url="/hero_reveal_gavel.jpg" />
      <Image position={[2, 0, 3]} scale={3} url="/hero_base_conference.jpg" />
      <Image position={[-2.05, -height, 6]} scale={[1, 3, 1]} url="/hero_reveal_gavel.jpg" />
      <Image position={[-0.6, -height, 9]} scale={[1, 2, 1]} url="/hero_base_conference.jpg" />
      <Image position={[0.75, -height, 10.5]} scale={1.5} url="/hero_reveal_gavel.jpg" />
    </group>
  );
}

function Typography({ titleText = 'VIGILANTE MUN' }) {
  const DEVICE = {
    mobile: { fontSize: 0.2 },
    tablet: { fontSize: 0.4 },
    desktop: { fontSize: 0.6 }
  };
  const getDevice = () => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    return w <= 639 ? 'mobile' : w <= 1023 ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { fontSize } = DEVICE[device];

  return (
    <Text
      position={[0, 0, 12]}
      fontSize={fontSize}
      letterSpacing={-0.05}
      outlineWidth={0}
      outlineBlur="20%"
      outlineColor="#000"
      outlineOpacity={0.5}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      {titleText}
    </Text>
  );
}

useGLTF.preload('/assets/3d/lens.glb');
useGLTF.preload('/assets/3d/cube.glb');
useGLTF.preload('/assets/3d/bar.glb');
