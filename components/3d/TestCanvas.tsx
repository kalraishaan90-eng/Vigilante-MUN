"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";

function SpinningCube() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#7A2C29" />
    </mesh>
  );
}

export function TestCanvas() {
  return (
    <div className="h-48 w-full rounded-card overflow-hidden bg-quincy/5">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <SpinningCube />
      </Canvas>
    </div>
  );
}

export default TestCanvas;
