"use client";

import { NOTE_COLORS } from "@/components/notes/palette";

export function PageStack() {
  return (
    <group position={[0, 0.16, 0]}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <mesh key={idx} position={[0, -idx * 0.006, 0]}>
          <boxGeometry args={[5.3, 0.0035, 3.46]} />
          <meshStandardMaterial color={idx % 2 ? NOTE_COLORS.paperA : NOTE_COLORS.paperB} roughness={0.92} metalness={0.01} />
        </mesh>
      ))}
    </group>
  );
}
