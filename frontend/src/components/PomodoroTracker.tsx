import { Play, Pause, RotateCcw, Timer, Coffee } from "lucide-react";
import { isToday, isThisWeek } from "date-fns";
import type { PomodoroSession } from "@/interfaces/card";
import { usePomodoroStore } from "@/store/usePomodoroStore";

interface Props {
  cardId: string;
  completed: PomodoroSession[];
  target: number;
  recurrence?: string;
  onComplete: (session: PomodoroSession) => void;
  onTargetChange: (target: number) => void;
}

export function PomodoroTracker({
  cardId,
  completed,
  target,
  recurrence = "none",
  onComplete,
  onTargetChange,
}: Props) {
  const {
    activeCardId,
    setActiveCard,
    timeLeft: globalTimeLeft,
    isRunning: globalIsRunning,
    mode: globalMode,
    startTimer,
    pauseTimer,
    resetTimer,
  } = usePomodoroStore();

  const isBusyWithAnotherCard =
    activeCardId !== null && activeCardId !== cardId;
  const isActive = activeCardId === cardId;

  // Si es el activo, usamos el tiempo global. Si no, mostramos 25 minutos por defecto.
  const timeLeft = isActive ? globalTimeLeft : 25 * 60;
  const isRunning = isActive ? globalIsRunning : false;
  const mode = isActive ? globalMode : "focus";

  // Lógica de pomodoros activos (Esto se queda igual)
  const activePomodoros = completed.filter((pomodoro) => {
    if (!pomodoro.completedAt) return false;
    const date = new Date(pomodoro.completedAt);
    if (recurrence === "daily") return isToday(date);
    if (recurrence === "weekly") return isThisWeek(date, { weekStartsOn: 1 });
    return true;
  });
  const pomodorosHechos = activePomodoros.length;

  // Cálculos dinámicos de tiempo
  const getTotalSeconds = () => {
    if (mode === "focus") return 25 * 60;
    if (mode === "long_break") return 15 * 60;
    return 5 * 60;
  };

  const totalSeconds = getTotalSeconds();
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Colores
  const isFocus = mode === "focus";
  const isLongBreak = mode === "long_break";
  const primaryColor = isFocus
    ? "text-red-500"
    : isLongBreak
      ? "text-blue-500"
      : "text-emerald-500";
  const bgProgressColor = isFocus
    ? "bg-red-500"
    : isLongBreak
      ? "bg-blue-500"
      : "bg-emerald-500";

  // Estadísticas
  const minutosCompletados = pomodorosHechos * 25;
  const minutosTotales = target * 25;

  const formatoHorasMinutos = (totalMinutos: number) => {
    if (totalMinutos === 0) return "0m";
    const horas = Math.floor(totalMinutos / 60);
    const minutosResta = totalMinutos % 60;
    if (horas === 0) return `${minutosResta}m`;
    return `${horas}h ${minutosResta.toString().padStart(2, "0")}m`;
  };

  const toggleTimer = () => {
    if (!isActive) {
      setActiveCard(cardId);
      startTimer();
    } else {
      if (isRunning) pauseTimer();
      else startTimer();
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400">
          {isFocus ? (
            <Timer className={`h-4 w-4 ${primaryColor}`} />
          ) : (
            <Coffee className={`h-4 w-4 ${primaryColor}`} />
          )}
          <h3 className="text-sm font-medium">
            {isFocus
              ? "Pomodoros"
              : isLongBreak
                ? "Descanso Largo"
                : "Descanso Corto"}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-400">
            {pomodorosHechos}{" "}
            <span className="text-gray-600 font-normal">hechos</span>
          </span>

          <div className="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-lg border border-gray-800">
            <span className="text-xs font-medium text-gray-500 mr-1 uppercase tracking-wider">
              Meta
            </span>
            <button
              onClick={() => onTargetChange(Math.max(1, target - 1))}
              className="w-6 h-6 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300"
            >
              -
            </button>
            <span className="text-sm font-bold text-white w-6 text-center">
              {target}
            </span>
            <button
              onClick={() => onTargetChange(Math.min(20, target + 1))}
              className="w-6 h-6 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap px-1 mb-4">
        {Array.from({ length: target }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i < pomodorosHechos ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-gray-800 border border-gray-700"}`}
          />
        ))}
      </div>

      <div className="flex justify-between items-center text-xs font-medium text-gray-500 bg-gray-900/40 px-3 py-2 rounded-lg border border-gray-800/60 mb-4">
        <span>
          Tiempo enfocado:{" "}
          <strong className="text-gray-300 ml-1">
            {formatoHorasMinutos(minutosCompletados)}
          </strong>
        </span>
        <span>
          Meta total:{" "}
          <strong className="text-gray-300 ml-1">
            {formatoHorasMinutos(minutosTotales)}
          </strong>
        </span>
      </div>

      <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 flex flex-col items-center gap-5 relative overflow-hidden">
        <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${bgProgressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-6xl font-extrabold text-white tracking-tight font-mono my-2 tabular-nums">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>

        <div className="flex items-center gap-3 w-full justify-center">
          <button
            onClick={toggleTimer}
            disabled={isBusyWithAnotherCard}
            className={`flex items-center gap-2 font-medium rounded-xl px-8 py-2.5 transition-colors shadow-lg text-sm ${
              isBusyWithAnotherCard
                ? "bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800 shadow-none"
                : isRunning
                  ? "bg-gray-800 hover:bg-gray-700 text-white shadow-none"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20"
            }`}
          >
            {isRunning ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            {isBusyWithAnotherCard
              ? "Ocupado"
              : isRunning
                ? "Pausar"
                : "Iniciar"}
          </button>

          <button
            onClick={() => {
              if (isActive) {
                pauseTimer();
                resetTimer(getTotalSeconds());
              }
            }}
            className="flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800 hover:text-white rounded-xl w-11 h-11 transition-colors"
            title="Reiniciar temporizador"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {isBusyWithAnotherCard && (
          <div className="mt-2 text-xs font-medium text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-center w-full">
            ⚠️ Hay un Pomodoro activo en otra tarjeta. Termínalo o ciérralo
            primero.
          </div>
        )}
      </div>
    </div>
  );
}
