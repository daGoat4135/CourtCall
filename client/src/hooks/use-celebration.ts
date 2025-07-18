import { useState, useCallback } from "react";

interface CelebrationState {
  show: boolean;
  type: "match-join" | "match-create" | "milestone" | "first-match";
  playerName?: string;
  matchCount?: number;
}

export function useCelebration() {
  const [celebration, setCelebration] = useState<CelebrationState>({
    show: false,
    type: "match-join"
  });

  const triggerCelebration = useCallback((
    type: CelebrationState["type"],
    playerName?: string,
    matchCount?: number
  ) => {
    setCelebration({
      show: true,
      type,
      playerName,
      matchCount
    });
  }, []);

  const hideCelebration = useCallback(() => {
    setCelebration(prev => ({ ...prev, show: false }));
  }, []);

  const celebrateMatchJoin = useCallback((playerName: string) => {
    triggerCelebration("match-join", playerName);
  }, [triggerCelebration]);

  const celebrateMatchCreate = useCallback((playerName: string) => {
    triggerCelebration("match-create", playerName);
  }, [triggerCelebration]);

  const celebrateFirstMatch = useCallback((playerName: string) => {
    triggerCelebration("first-match", playerName);
  }, [triggerCelebration]);

  const celebrateMilestone = useCallback((playerName: string, matchCount: number) => {
    triggerCelebration("milestone", playerName, matchCount);
  }, [triggerCelebration]);

  return {
    celebration,
    celebrateMatchJoin,
    celebrateMatchCreate,
    celebrateFirstMatch,
    celebrateMilestone,
    hideCelebration
  };
}