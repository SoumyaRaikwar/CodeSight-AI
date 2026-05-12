"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { MutableRefObject, useEffect } from "react";
import * as THREE from "three";

import { ReadingMode } from "@/components/notes/types";

export function CameraController({
  mode,
  zoom,
  resetSignal,
  controlsRef,
}: {
  mode: ReadingMode;
  zoom: number;
  resetSignal: number;
  controlsRef: MutableRefObject<any>;
}) {
  const { camera } = useThree();
  const basePos = mode === "reading" ? new THREE.Vector3(0, 2.25, 3.75) : new THREE.Vector3(0.4, 2.4, 4.25);

  useEffect(() => {
    const z = THREE.MathUtils.clamp(zoom, 0.8, 1.35);
    camera.position.set(basePos.x, basePos.y / z, basePos.z / z);
    camera.lookAt(0, 0.2, 0);
    controlsRef.current?.target.set(0, 0.16, 0);
    controlsRef.current?.update();
  }, [camera, basePos, zoom, mode, resetSignal, controlsRef]);

  useFrame(() => {
    const targetZ = basePos.z / THREE.MathUtils.clamp(zoom, 0.8, 1.35);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={false}
      minDistance={2.4}
      maxDistance={5.3}
      minPolarAngle={0.95}
      maxPolarAngle={1.45}
      minAzimuthAngle={mode === "reading" ? -0.25 : -0.65}
      maxAzimuthAngle={mode === "reading" ? 0.25 : 0.65}
    />
  );
}
