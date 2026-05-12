"use client";

import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";

import { BookMesh } from "@/components/notes/BookMesh";
import { CameraController } from "@/components/notes/CameraController";
import { NOTE_COLORS } from "@/components/notes/palette";
import { PageMesh } from "@/components/notes/PageMesh";
import { ReadingMode } from "@/components/notes/types";

export function BookScene({ turnProgress, turnDirection, mode, zoom, resetSignal }: { turnProgress: number; turnDirection: "next" | "prev" | null; mode: ReadingMode; zoom: number; resetSignal: number; }) {
  const controlsRef = useRef<any>(null);

  return (
    <Canvas shadows camera={{ position: [0, 2.2, 3.7], fov: 34 }} dpr={[1, 1.8]}>
      <color attach="background" args={[NOTE_COLORS.stageBg]} />
      <ambientLight intensity={0.92} />
      <directionalLight castShadow position={[3.2, 4.8, 2.1]} intensity={1.18} shadow-mapSize-width={2048} shadow-mapSize-height={2048} color={NOTE_COLORS.stageFill} />
      <directionalLight position={[-2.8, 2.4, -1.8]} intensity={0.32} color={NOTE_COLORS.stageCool} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.27, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <shadowMaterial opacity={0.28} />
      </mesh>

      <BookMesh />
      <PageMesh side="left" turnProgress={turnProgress} direction={turnDirection} />
      <PageMesh side="right" turnProgress={turnProgress} direction={turnDirection} />

      <Environment preset="apartment" />
      <CameraController mode={mode} zoom={zoom} resetSignal={resetSignal} controlsRef={controlsRef} />
    </Canvas>
  );
}
