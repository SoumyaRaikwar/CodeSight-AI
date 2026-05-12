import { useState } from "react";

export function usePageTurnController(onCommit: (direction: "next" | "prev") => void) {
  const [turnDirection, setTurnDirection] = useState<"next" | "prev" | null>(null);
  const [turnProgress, setTurnProgress] = useState(0);

  const triggerTurn = (direction: "next" | "prev") => {
    if (turnDirection) return;
    setTurnDirection(direction);
    const start = performance.now();
    const duration = 560;

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setTurnProgress(eased);
      if (t < 1) {
        requestAnimationFrame(step);
        return;
      }
      onCommit(direction);
      setTimeout(() => {
        setTurnDirection(null);
        setTurnProgress(0);
      }, 80);
    };

    requestAnimationFrame(step);
  };

  return { turnDirection, turnProgress, triggerTurn };
}
