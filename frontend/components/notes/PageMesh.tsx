"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { NOTE_COLORS } from "@/components/notes/palette";

export function PageMesh({ side, turnProgress, direction }: { side: "left" | "right"; turnProgress: number; direction: "next" | "prev" | null }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    const isActiveSide = (direction === "next" && side === "right") || (direction === "prev" && side === "left");
    const base = side === "left" ? -0.03 : 0.03;
    const flip = isActiveSide ? (direction === "next" ? -Math.PI * 0.95 : Math.PI * 0.95) * turnProgress : 0;
    const bend = isActiveSide ? Math.sin(turnProgress * Math.PI) * 0.12 : 0;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, base + flip, 0.18);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, bend, 0.2);
  });

  return (
    <mesh ref={ref} position={[side === "left" ? -1.38 : 1.38, 0.165, 0]} castShadow>
      <boxGeometry args={[2.55, 0.028, 3.28]} />
      <meshStandardMaterial color={NOTE_COLORS.paperTop} roughness={0.9} metalness={0.01} />
    </mesh>
  );
}
