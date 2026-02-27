import { useEffect, useRef } from "react";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import { Play, Pause, X, Timer, Coffee } from "lucide-react";
import type {
  Card,
  Label,
  CheckListItem,
  PomodoroSession,
} from "@/interfaces/card";

interface Props {
  cards: Card[];
  onUpdateCard: (
    cardId: string,
    title: string,
    description: string,
    deadline: string | undefined,
    labels: Label[],
    checklist: CheckListItem[],
    pomodoros: PomodoroSession[],
    pomodoroTarget: number,
    recurrence: string,
  ) => void;
}

export const FloatingTimer = ({ cards, onUpdateCard }: Props) => {
  const {
    activeCardId,
    timeLeft,
    isRunning,
    mode,
    tick,
    startTimer,
    pauseTimer,
    setActiveCard,
    setMode,
  } = usePomodoroStore();

  const cardsRef = useRef(cards);
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  // 🚀 1. EL MOTOR (El Web Worker que no se duerme)
  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/timeWorker.ts", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (e) => {
      if (e.data === "tick") {
        tick();
      }
    };

    if (isRunning) {
      worker.postMessage("start");
    } else {
      worker.postMessage("stop");
    }

    return () => {
      worker.postMessage("stop");
      worker.terminate();
    };
  }, [isRunning, tick]);

  // 🚀 2. EL VIGILANTE (Guarda en la base de datos al llegar a cero)
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      pauseTimer();

      const card = cardsRef.current.find((c) => c._id === activeCardId);

      if (card) {
        if (mode === "focus") {
          const pomodoros = card.pomodoros || [];
          const tocaDescansoLargo = (pomodoros.length + 1) % 4 === 0;

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(
              tocaDescansoLargo ? "¡Descanso Largo!" : "¡Pomodoro Completado!",
              {
                body: tocaDescansoLargo
                  ? "Racha de 4. Tómate 15 minutos."
                  : "Buen trabajo. Tómate 5 minutos.",
              },
            );
          }

          const newSession = {
            id: crypto.randomUUID(),
            completedAt: new Date().toISOString(),
            duration: 25,
          };

          onUpdateCard(
            card._id,
            card.title,
            card.description || "",
            card.deadline,
            card.labels || [],
            card.checklist || [],
            [...pomodoros, newSession],
            card.pomodoroTarget || 1,
            card.recurrence || "none",
          );

          setMode(
            tocaDescansoLargo ? "long_break" : "short_break",
            tocaDescansoLargo ? 15 * 60 : 5 * 60,
          );
        } else {
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("¡Descanso Terminado!", {
              body: "Es hora de volver a enfocarse.",
            });
          }
          setMode("focus", 25 * 60);
        }
      }
    }
  }, [
    timeLeft,
    isRunning,
    activeCardId,
    mode,
    pauseTimer,
    setMode,
    onUpdateCard,
  ]);

  // 🚀 NUEVO: EL ACTUALIZADOR DE LA PESTAÑA (Tab Title)
  const originalTitle = useRef(document.title); // Guardamos el nombre original de tu app

  useEffect(() => {
    if (!activeCardId) {
      document.title = originalTitle.current;
      return;
    }

    const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const secs = String(timeLeft % 60).padStart(2, "0");
    const icon = mode === "focus" ? "🍅" : "☕"; // Tomate para enfoque, café para descanso

    if (isRunning) {
      document.title = `(${mins}:${secs}) ${icon} Focus`;
    } else {
      document.title = `[Pausado] ${mins}:${secs}`;
    }

    // Cleanup: Cuando el componente se desmonta (cierras el timer), restauramos el título
    return () => {
      document.title = originalTitle.current;
    };
  }, [timeLeft, isRunning, activeCardId, mode]);

  // 🚀 3. LA INTERFAZ VISUAL
  if (!activeCardId) return null;
  const activeCard = cards.find((c) => c._id === activeCardId);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isFocus = mode === "focus";
  const primaryColor = isFocus ? "text-red-500" : "text-emerald-500";

  return (
    <div className="fixed bottom-6 right-6 bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 z-50 animate-in slide-in-from-bottom-5 min-w-[260px]">
      <div
        className="px-1 w-full text-xs font-medium text-gray-400 truncate max-w-[240px]"
        title={activeCard?.title}
      >
        Enfocado en: <span className="text-gray-200">{activeCard?.title}</span>
      </div>

      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 pl-1">
          {isFocus ? (
            <Timer className={`h-5 w-5 ${primaryColor}`} />
          ) : (
            <Coffee className={`h-5 w-5 ${primaryColor}`} />
          )}
          <span className="text-2xl font-mono font-bold text-white tabular-nums tracking-tight">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
        </div>

        <div className="w-px h-8 bg-gray-800 mx-2"></div>

        <div className="flex items-center gap-1 pr-1">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
              isRunning
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            {isRunning ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>

          <button
            onClick={() => {
              pauseTimer();
              setActiveCard(null);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
            title="Cerrar temporizador"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
