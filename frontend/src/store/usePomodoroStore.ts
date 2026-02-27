import { create } from "zustand";

interface PomodoroState {
  activeCardId: string | null;
  timeLeft: number;
  isRunning: boolean;
  mode: "focus" | "short_break" | "long_break";

  setActiveCard: (cardId: string | null) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  tick: () => void;
  resetTimer: (seconds: number) => void;
  setMode: (
    mode: "focus" | "short_break" | "long_break",
    seconds: number,
  ) => void;
}

export const usePomodoroStore = create<PomodoroState>((set) => ({
  activeCardId: null,
  timeLeft: 25 * 60,
  isRunning: false,
  mode: "focus",

  setActiveCard: (cardId) => set({ activeCardId: cardId }),
  startTimer: () => set({ isRunning: true }),
  pauseTimer: () => set({ isRunning: false }),
  tick: () => set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),
  resetTimer: (seconds) => set({ timeLeft: seconds, isRunning: false }),
  setMode: (newMode, seconds) =>
    set({ mode: newMode, timeLeft: seconds, isRunning: false }),
}));
