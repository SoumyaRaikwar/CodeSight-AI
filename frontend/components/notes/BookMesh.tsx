"use client";

import { BookSpine } from "@/components/notes/BookSpine";
import { PageStack } from "@/components/notes/PageStack";
import { NOTE_COLORS } from "@/components/notes/palette";

export function BookMesh() {
  return (
    <group position={[0, -0.11, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[5.9, 0.46, 3.95]} />
        <meshStandardMaterial color={NOTE_COLORS.shellDark} roughness={0.56} metalness={0.28} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[5.78, 0.07, 3.84]} />
        <meshStandardMaterial color={NOTE_COLORS.shellMid} roughness={0.45} metalness={0.22} />
      </mesh>

      <PageStack />
      <BookSpine />

      <mesh position={[0, 0.29, 0]}>
        <boxGeometry args={[5.55, 0.01, 3.62]} />
        <meshStandardMaterial color={NOTE_COLORS.paperTop} roughness={0.96} metalness={0.01} />
      </mesh>
    </group>
  );
}
