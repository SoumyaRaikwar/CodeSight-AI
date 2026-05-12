"use client";

import { NOTE_COLORS } from "@/components/notes/palette";

export function BookSpine() {
  return (
    <group position={[0, 0.2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.24, 0.22, 3.55]} />
        <meshStandardMaterial color={NOTE_COLORS.spineDark} roughness={0.75} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.16, 0.04, 3.42]} />
        <meshStandardMaterial color={NOTE_COLORS.spineLight} roughness={0.9} metalness={0.01} />
      </mesh>
    </group>
  );
}
