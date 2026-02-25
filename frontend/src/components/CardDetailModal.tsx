import type {
  Card,
  CheckListItem,
  Label,
  PomodoroSession,
} from "@/interfaces/card";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  AlignLeft,
  Tag,
  X,
  CheckSquare,
  Check,
  Trash2,
  Plus,
  Repeat,
} from "lucide-react";
import { format, set } from "date-fns";
import { es } from "date-fns/locale";
import { useDebounce } from "@/hooks/useDebounce";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PomodoroTracker } from "./PomodoroTracker";

interface Props {
  card: Card;
  onClose: () => void;
  onUpdate: (
    cardId: string,
    title: string,
    description: string,
    deadline: string | undefined,
    labels: Label[],
    checklist: CheckListItem[],
    pomodoros: PomodoroSession[],
    pomodoroTarget: number,
  ) => void;
}

const AVAILABLE_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
];

export const CardDetailModal = ({ card, onClose, onUpdate }: Props) => {
  const [description, setDescription] = useState(card.description || "");
  const [title, setTitle] = useState(card.title);
  const [pomodoros, setPomodoros] = useState<PomodoroSession[]>(
    card.pomodoros || [],
  );
  const [pomodoroTarget, setPomodoroTarget] = useState<number>(
    card.pomodoroTarget || 1,
  );
  const debouncedTitle = useDebounce(title, 500);
  const [labels, setLabels] = useState<Label[]>(card.labels || []);
  const [checklist, setChecklist] = useState<CheckListItem[]>(
    card.checklist || [],
  );

  const [deadline, setDeadline] = useState<Date | undefined>(
    card.deadline ? new Date(card.deadline) : undefined,
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [newItemText, setNewItemText] = useState("");

  //Funcion para tener debounce en el titulo
  useEffect(() => {
    if (debouncedTitle === card.title) return;
    onUpdate(
      card._id,
      debouncedTitle,
      description,
      card.deadline,
      labels,
      checklist,
      card.pomodoros || [],
      card.pomodoroTarget || 1,
    );
  }, [debouncedTitle]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setDescription(card.description || "");
    setTitle(card.title);
    setLabels(card.labels || []);
    setPomodoros(card.pomodoros || []);
    setPomodoroTarget(card.pomodoroTarget || 1);

    if (card.deadline) {
      const date = new Date(card.deadline);
      setDeadline(date);
      setSelectedTime(format(date, "HH:mm"));
    } else {
      setDeadline(undefined);
      setSelectedTime("");
    }
  }, [card._id]);

  const toggleLabel = (color: string) => {
    const isSelected = labels.some((l) => l.color === color);
    if (isSelected) {
      setLabels(labels.filter((l) => l.color !== color));
    } else {
      setLabels([...labels, { color, text: "" }]);
    }
  };

  const handleSave = () => {
    let finalDate = deadline;

    if (finalDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      finalDate = set(finalDate, {
        hours: hours,
        minutes: minutes,
      });
    }

    onUpdate(
      card._id,
      title,
      description,
      finalDate?.toISOString(),
      labels,
      checklist,
      card.pomodoros || [],
      card.pomodoroTarget || 1,
    );
    onClose();
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    const newItem: CheckListItem = {
      _id: Date.now().toString(),
      subTitle: newItemText,
      completed: false,
    };

    const updatedList = [...checklist, newItem];
    setChecklist(updatedList);
    setNewItemText("");
    onUpdate(
      card._id,
      title,
      description,
      card.deadline,
      card.labels || [],
      updatedList,
      card.pomodoros || [],
      card.pomodoroTarget || 1,
    );
  };

  const handleToggleItem = (itemId: string) => {
    // 1. Creamos una nueva lista con el ítem modificado
    const updatedList = checklist.map((item) => {
      if (item._id === itemId) {
        return { ...item, completed: !item.completed }; // Invertimos el valor
      }
      return item;
    });

    // 2. Actualizamos visualmente
    setChecklist(updatedList);

    // 3. ✨ GUARDAMOS EN BASE DE DATOS
    onUpdate(
      card._id,
      title,
      description,
      card.deadline,
      card.labels || [],
      updatedList,
      card.pomodoros || [],
      card.pomodoroTarget || 1,
    );
  };

  const handleDeleteItem = (itemId: string) => {
    // 1. Filtramos la lista para quitar el ítem
    const updatedList = checklist.filter((item) => item._id !== itemId);

    // 2. Actualizamos visualmente
    setChecklist(updatedList);

    // 3. Guardamos en BD
    onUpdate(
      card._id,
      title,
      description,
      card.deadline,
      card.labels || [],
      updatedList,
      card.pomodoros || [],
      card.pomodoroTarget || 1,
    );
  };

  //Realizar el calculo de la barra de progreso de las subtareas
  //const checklist = card.checkList || [];
  const totalItems = checklist.length;
  const completedItems = checklist.filter((item) => item.completed).length;
  const progressPercentage =
    totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  return (
    <div
      className="fixed inset-0 bg-black/90 flex justify-center items-start pt-20 z-50 "
      onClick={onClose}
    >
      <div
        // ✨ FONDO OSCURO Y BORDES SUTILES
        className="bg-gray-900 w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl shadow-2xl border border-gray-800 p-0 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✨ BARRA DE TÍTULO */}
        <div className="p-6 pb-4 border-b border-gray-800">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault;
                    handleSave();
                    e.currentTarget.blur();
                  }
                }}
                placeholder="Inserta un titulo"
                className="text-xl font-bold text-white bg-transparent border-none outline-none w-full placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
              />
              {/* <p className="text-sm text-gray-400 mt-1">En la lista actual</p>  */}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col md:grid-cols-2 gap-8 overflow-y-auto scrollbar-thin flex-1 min-h-0">
          {/* COLUMNA IZQUIERDA: ETIQUETAS Y FECHA */}
          <div className="space-y-6">
            {/* Etiquetas */}
            {/* Etiquetas */}
            <div>
              {/* Título más limpio, sin el ícono, igual que en tu referencia */}
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Etiquetas
              </h3>
              <div className="flex gap-2 flex-wrap">
                {AVAILABLE_COLORS.map((color) => {
                  const isSelected = labels.some((l) => l.color === color);
                  return (
                    <button
                      key={color}
                      onClick={() => toggleLabel(color)}
                      className={cn(
                        "h-6 w-10 rounded-md transition-all border-2", // La forma rectangular de tu referencia
                        color, // Mantenemos bg-red-500, etc. para que coincida con tu BD
                        isSelected
                          ? "border-gray-200 scale-110 shadow-md" // Borde claro al seleccionar (modo oscuro)
                          : "border-transparent opacity-60 hover:opacity-100", // Semitransparente si no está seleccionado
                      )}
                    />
                  );
                })}
              </div>
            </div>
            {/* COLUMNA DERECHA: DESCRIPCIÓN */}
            <section className="space-y-2">
              {/* Cabecera separada como en tu referencia */}
              <div className="flex items-center gap-2 text-gray-400">
                <AlignLeft className="h-4 w-4" />
                <h3 className="text-sm font-medium">Descripción</h3>
              </div>

              {/* Textarea estilo "muted" en Dark Mode */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  // Conservamos tu funcionalidad de atajo de teclado original
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                placeholder="Añadir una descripción..."
                className="w-full min-h-[80px] p-3 resize-none bg-gray-800/50 hover:bg-gray-800 border-none rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-200 placeholder-gray-500 text-sm transition-colors"
              />
            </section>
            {/* Fecha de Vencimiento */}
            {/* FECHA LÍMITE */}
            <section className="space-y-2">
              {/* Cabecera */}
              <div className="flex items-center gap-2 text-gray-400">
                <CalendarIcon className="h-4 w-4" />
                <h3 className="text-sm font-medium">Fecha límite</h3>
              </div>

              {/* Controles: Botón Popover + Botón Limpiar */}
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    {/* Botón estilo "outline" oscuro */}
                    <button
                      className={cn(
                        "flex items-center justify-start h-8 px-3 rounded-md border border-gray-800 bg-gray-950/50 hover:bg-gray-800 transition-colors text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500",
                        !deadline ? "text-gray-500" : "text-gray-200",
                      )}
                    >
                      <CalendarIcon className="h-3.5 w-3.5 mr-2 opacity-70" />
                      {deadline ? (
                        <span>
                          {format(deadline, "PPP", { locale: es })}
                          {selectedTime && ` a las ${selectedTime}`}
                        </span>
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-auto p-0 bg-gray-900 border-gray-800 shadow-xl rounded-lg"
                    align="start"
                  >
                    {/* El calendario ahora tiene p-3 directamente para evitar que los números se muevan */}
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                      locale={es}
                      className="p-3 pointer-events-auto"
                    />

                    {/* Selector de hora integrado limpiamente */}
                    <div className="p-3 border-t border-gray-800 bg-gray-900/30">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="flex-1 h-8 rounded-md border border-gray-800 bg-gray-950 px-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Botón para quitar la fecha (Aparece solo si hay fecha seleccionada) */}
                {deadline && (
                  <button
                    onClick={() => {
                      setDeadline(undefined);
                      setSelectedTime("");
                    }}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
                    title="Quitar fecha"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </section>
            {/* SECCIÓN CHECKLIST */}
            <div className="mt-6">
              {/* LISTA DE TAREAS */}

              {/* SECCIÓN CHECKLIST / SUBTAREAS */}
              <section className="space-y-3 mt-2">
                {/* Cabecera (Icono + Título + Contador dinámico) */}
                <div className="flex items-center gap-2 text-gray-400">
                  <CheckSquare className="h-4 w-4" />
                  <h3 className="text-sm font-medium">
                    Subtareas{" "}
                    {totalItems > 0 && `(${completedItems}/${totalItems})`}
                  </h3>
                </div>

                {/* Barra de progreso (Solo visible si hay tareas) */}
                {totalItems > 0 && (
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                )}

                {/* Lista de Tareas */}
                <div className="space-y-1.5">
                  {checklist.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-2 group"
                    >
                      {/* Checkbox minimalista */}
                      <button
                        onClick={() => handleToggleItem(item._id)}
                        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors shrink-0 ${
                          item.completed
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "border-gray-500 hover:border-gray-400"
                        }`}
                      >
                        {item.completed && <Check size={12} strokeWidth={3} />}
                      </button>

                      {/* Texto de la tarea */}
                      <span
                        onClick={() => handleToggleItem(item._id)}
                        className={cn(
                          "text-sm flex-1 cursor-pointer transition-colors select-none",
                          item.completed
                            ? "line-through text-gray-500"
                            : "text-gray-200",
                        )}
                      >
                        {item.subTitle}
                      </span>

                      {/* Botón de eliminar (Aparece en hover, usando X como en tu referencia) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item._id);
                        }}
                        className="h-6 w-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Input para nueva tarea (Inline) */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                    placeholder="Añadir subtarea..."
                    className="flex-1 h-8 bg-gray-800/50 hover:bg-gray-800 border-none rounded-md px-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    onClick={handleAddItem}
                    className="h-8 w-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md border border-gray-700 transition-colors shrink-0"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </section>
            </div>

            {/* ✨ SECCIÓN RECURRENCIA (Opcional, estilo base) */}
            <section className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Repeat className="h-4 w-4" />
                <h3 className="text-sm font-medium">Recurrencia</h3>
              </div>
              {/* Un Select HTML con estilo Dark Mode (puedes cambiarlo a tu componente Select de shadcn luego) */}
              <select className="w-full sm:w-48 h-9 bg-gray-950 border border-gray-800 text-gray-200 text-sm rounded-md px-3 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer hover:bg-gray-900 transition-colors">
                <option value="none">Sin recurrencia</option>
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
              </select>
            </section>

            {/* ✨ SECCIÓN POMODORO FUNCIONAL */}
            <section className="space-y-2 pt-4 border-t border-gray-800 mt-4">
              <PomodoroTracker
                completed={pomodoros}
                target={pomodoroTarget}
                onComplete={(session) => {
                  // Tomamos los pomodoros anteriores y agregamos el nuevo
                  const updatedPomodoros = [...pomodoros, session];
                  setPomodoros(updatedPomodoros);
                  onUpdate(
                    card._id,
                    title,
                    description,
                    card.deadline,
                    labels,
                    checklist,
                    updatedPomodoros, // 🚀 Se guarda la nueva sesión
                    card.pomodoroTarget || 1,
                  );
                }}
                onTargetChange={(newTarget) => {
                  setPomodoroTarget(newTarget);
                  onUpdate(
                    card._id,
                    title,
                    description,
                    card.deadline,
                    labels,
                    checklist,
                    card.pomodoros || [],
                    newTarget, // 🚀 Se actualiza la cantidad objetivo
                  );
                }}
              />
            </section>
          </div>
        </div>

        {/* ✨ FOOTER OSCURO */}
        <div className="flex justify-end gap-3 p-6 pt-2 bg-gray-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 px-6"
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
};
