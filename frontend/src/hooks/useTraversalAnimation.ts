// Animasi step-by-step traversal — pakai uid dari traversal_sequence backend
import { useState, useRef, useCallback } from "react";
import { AnimationState } from "@/types";

interface UseTraversalAnimationOptions {
  traversalSequence: string[];  // uid[] dalam urutan kunjungan (traversal_sequence)
  matchedUids: string[];        // uid[] node yang match (dari matches[].uid)
  speedMs?: number;
}

export function useTraversalAnimation({
  traversalSequence,
  matchedUids,
  speedMs = 300,
}: UseTraversalAnimationOptions) {
  const [state, setState] = useState<AnimationState>("idle");
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [visitedUids, setVisitedUids] = useState<Set<string>>(new Set());
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [matchedSoFar, setMatchedSoFar] = useState<Set<string>>(new Set());

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef<number>(-1);
  const matchedSet = new Set(matchedUids);

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = useCallback(() => {
    stopInterval();
    stepRef.current = -1;
    setCurrentStep(-1);
    setVisitedUids(new Set());
    setCurrentUid(null);
    setMatchedSoFar(new Set());
    setState("idle");
  }, []);

  const play = useCallback(() => {
    if (state === "done") reset();
    setState("playing");

    intervalRef.current = setInterval(() => {
      const nextStep = stepRef.current + 1;

      if (nextStep >= traversalSequence.length) {
        stopInterval();
        setState("done");
        setCurrentUid(null);
        return;
      }

      stepRef.current = nextStep;
      const uid = traversalSequence[nextStep];

      setCurrentStep(nextStep);
      setCurrentUid(uid);
      setVisitedUids((prev) => new Set([...prev, uid]));

      if (matchedSet.has(uid)) {
        setMatchedSoFar((prev) => new Set([...prev, uid]));
      }
    }, speedMs);
  }, [state, traversalSequence, matchedSet, speedMs, reset]);

  const pause = useCallback(() => {
    stopInterval();
    setState("paused");
  }, []);

  const skipToEnd = useCallback(() => {
    stopInterval();
    stepRef.current = traversalSequence.length - 1;
    setCurrentStep(traversalSequence.length - 1);
    setCurrentUid(null);
    setVisitedUids(new Set(traversalSequence));
    setMatchedSoFar(new Set(matchedUids));
    setState("done");
  }, [traversalSequence, matchedUids]);

  return {
    state,
    currentStep,
    visitedUids,
    currentUid,
    matchedSoFar,
    play,
    pause,
    reset,
    skipToEnd,
    totalSteps: traversalSequence.length,
  };
}
