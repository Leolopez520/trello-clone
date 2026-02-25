import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer, Coffee } from "lucide-react";
import type { PomodoroSession } from "@/interfaces/card";

interface Props {
  completed: PomodoroSession[];
  target: number;
  onComplete: (session: PomodoroSession) => void;
  onTargetChange: (target: number) => void;
}

export function PomodoroTracker({
  completed,
  target,
  onComplete,
  onTargetChange,
}: Props) {
  const [mode, setMode] = useState<"focus" | "short_break" | "long_break">(
    "focus",
  );
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 * 60
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  //Permisos para las notificaciones
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);

      if (mode === "focus") {
        const nuevosCompletados = completed.length + 1;
        const tocaDescansoLargo = nuevosCompletados % 4 === 0;

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("¡Pomodoro Completado!", {
            body: tocaDescansoLargo
              ? "¡Racha de 4 pomodoros! Te has ganado un descanso largo de 15 minutos."
              : "Buen trabajo. Tómate un descanso corto de 5 minutos.",
          });
        }
        onComplete({
          id: crypto.randomUUID(),
          completedAt: new Date().toISOString(),
          duration: 25,
        });
        if (tocaDescansoLargo) {
          setMode("long_break");
          setTimeLeft(15 * 60); // 15 minutos //15 * 60
        } else {
          setMode("short_break");
          setTimeLeft(5 * 60); // 5 minutos //
        }
      } else {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("¡Descanso Terminado!", {
            body: "Es hora de volver a enfocarse en tu tarea.",
          });
        }
        setMode("focus");
        setTimeLeft(25 * 60); //25 * 60
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, mode, completed.length, onComplete]);

  const getTotalSeconds = () => {
    if (mode === "focus") return 25 * 60;
    if (mode === "long_break") return 15 * 60;
    return 5 * 60; // short_break
  };

  const totalSeconds = getTotalSeconds();
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const isFocus = mode === "focus";
  const isLongBreak = mode === "long_break";

  // Rojo para trabajo, Azul para descanso largo, Verde para descanso corto
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

  const textTitle = isFocus
    ? "Pomodoros"
    : isLongBreak
      ? "Descanso Largo"
      : "Descanso Corto";

  return (
    <div className="space-y-3 pt-2">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400">
          {isFocus ? (
            <Timer className={`h-4 w-4 ${primaryColor}`} />
          ) : (
            <Coffee className={`h-4 w-4 ${primaryColor}`} />
          )}
          <h3 className="text-sm font-medium">
            {isFocus ? "Pomodoros" : "Descanso"}
          </h3>
        </div>

        {/* Selector de Objetivo Mejorado */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-400">
            {completed.length}{" "}
            <span className="text-gray-600 font-normal">hechos</span>
          </span>

          <div className="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-lg border border-gray-800">
            <span className="text-xs font-medium text-gray-500 mr-1 uppercase tracking-wider">
              Meta
            </span>
            <button
              onClick={() => onTargetChange(Math.max(1, target - 1))}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors text-lg leading-none"
            >
              -
            </button>
            <span className="text-sm font-bold text-white w-6 text-center">
              {target}
            </span>
            <button
              onClick={() => onTargetChange(Math.min(20, target + 1))}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors text-lg leading-none"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Puntos de Progreso (Tomates) */}
      <div className="flex gap-1.5 flex-wrap px-1 mb-4">
        {Array.from({ length: target }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i < completed.length
                ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                : "bg-gray-800 border border-gray-700"
            }`}
          />
        ))}
      </div>

      {/* Tarjeta del Temporizador */}
      <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 flex flex-col items-center gap-5 relative overflow-hidden">
        {/* Barra de progreso sutil superior */}
        <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${bgProgressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Tiempo Gigante */}
        <div className="text-6xl font-extrabold text-white tracking-tight font-mono my-2 tabular-nums">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>

        {/* Botones de Control */}
        <div className="flex items-center gap-3 w-full justify-center">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 font-medium rounded-xl px-8 py-2.5 transition-colors shadow-lg text-sm ${
              isRunning
                ? "bg-gray-800 hover:bg-gray-700 text-white shadow-none"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20"
            }`}
          >
            {isRunning ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            {isRunning ? "Pausar" : "Iniciar"}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(getTotalSeconds());
            }}
            className="flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800 hover:text-white rounded-xl w-11 h-11 transition-colors"
            title="Reiniciar temporizador"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
