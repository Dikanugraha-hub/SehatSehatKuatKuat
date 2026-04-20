// Animasi pencarian LCA step-by-step:
// Fase 1: root → LCA (jalur common)
// Fase 2: LCA → node A (cabang A)
// Fase 3: LCA → node B (cabang B)

import { useState, useRef, useCallback } from "react";
import { AnimationState } from "@/types";

export type LCAPhase = "idle" | "common" | "branchA" | "branchB" | "done";

interface UseLCAAnimationOptions {
  commonPath: string[];  // segment labels: root → LCA
  tailA: string[];       // segment labels: LCA → node A
  tailB: string[];       // segment labels: LCA → node B
  speedMs?: number;
}

export interface LCAAnimState {
  phase: LCAPhase;
  animState: AnimationState;
  // index terakhir yang sudah di-highlight per segmen
  commonStep: number;   // -1 = belum mulai
  tailAStep: number;
  tailBStep: number;
  currentSegment: string | null;
}

export function useLCAAnimation({
  commonPath,
  tailA,
  tailB,
  speedMs = 400,
}: UseLCAAnimationOptions) {
  const [animState, setAnimState] = useState<AnimationState>("idle");
  const [phase, setPhase]         = useState<LCAPhase>("idle");
  const [commonStep, setCommonStep] = useState(-1);
  const [tailAStep,  setTailAStep]  = useState(-1);
  const [tailBStep,  setTailBStep]  = useState(-1);
  const [currentSegment, setCurrentSegment] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // refs untuk state internal interval (hindari stale closure)
  const phaseRef      = useRef<LCAPhase>("idle");
  const commonStepRef = useRef(-1);
  const tailAStepRef  = useRef(-1);
  const tailBStepRef  = useRef(-1);

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = useCallback(() => {
    stopInterval();
    phaseRef.current      = "idle";
    commonStepRef.current = -1;
    tailAStepRef.current  = -1;
    tailBStepRef.current  = -1;
    setAnimState("idle");
    setPhase("idle");
    setCommonStep(-1);
    setTailAStep(-1);
    setTailBStep(-1);
    setCurrentSegment(null);
  }, []);

  const skipToEnd = useCallback(() => {
    stopInterval();
    phaseRef.current      = "done";
    commonStepRef.current = commonPath.length - 1;
    tailAStepRef.current  = tailA.length - 1;
    tailBStepRef.current  = tailB.length - 1;
    setAnimState("done");
    setPhase("done");
    setCommonStep(commonPath.length - 1);
    setTailAStep(tailA.length - 1);
    setTailBStep(tailB.length - 1);
    setCurrentSegment(null);
  }, [commonPath, tailA, tailB]);

  const play = useCallback(() => {
    if (animState === "done") reset();
    setAnimState("playing");

    // Set fase awal kalau idle
    if (phaseRef.current === "idle" || phaseRef.current === "done") {
      phaseRef.current = "common";
      setPhase("common");
    }

    intervalRef.current = setInterval(() => {
      const currentPhase = phaseRef.current;

      if (currentPhase === "common") {
        const next = commonStepRef.current + 1;
        if (next < commonPath.length) {
          commonStepRef.current = next;
          setCommonStep(next);
          setCurrentSegment(commonPath[next]);
        } else {
          // Selesai common, lanjut ke tailA
          if (tailA.length > 0) {
            phaseRef.current = "branchA";
            setPhase("branchA");
          } else if (tailB.length > 0) {
            phaseRef.current = "branchB";
            setPhase("branchB");
          } else {
            stopInterval();
            phaseRef.current = "done";
            setPhase("done");
            setAnimState("done");
            setCurrentSegment(null);
          }
        }
      } else if (currentPhase === "branchA") {
        const next = tailAStepRef.current + 1;
        if (next < tailA.length) {
          tailAStepRef.current = next;
          setTailAStep(next);
          setCurrentSegment(tailA[next]);
        } else {
          // Selesai tailA, lanjut ke tailB
          if (tailB.length > 0) {
            phaseRef.current = "branchB";
            setPhase("branchB");
          } else {
            stopInterval();
            phaseRef.current = "done";
            setPhase("done");
            setAnimState("done");
            setCurrentSegment(null);
          }
        }
      } else if (currentPhase === "branchB") {
        const next = tailBStepRef.current + 1;
        if (next < tailB.length) {
          tailBStepRef.current = next;
          setTailBStep(next);
          setCurrentSegment(tailB[next]);
        } else {
          stopInterval();
          phaseRef.current = "done";
          setPhase("done");
          setAnimState("done");
          setCurrentSegment(null);
        }
      }
    }, speedMs);
  }, [animState, commonPath, tailA, tailB, speedMs, reset]);

  const pause = useCallback(() => {
    stopInterval();
    setAnimState("paused");
  }, []);

  const totalSteps = commonPath.length + tailA.length + tailB.length;
  const currentStep = commonStep + 1 + Math.max(0, tailAStep + 1) + Math.max(0, tailBStep + 1);

  return {
    animState,
    phase,
    commonStep,
    tailAStep,
    tailBStep,
    currentSegment,
    currentStep,
    totalSteps,
    play,
    pause,
    reset,
    skipToEnd,
  };
}
