import type { Card, CheckListItem, Label } from "@/interfaces/card";
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

interface Props {
  card: Card;
  onClose: () => void;
  onUpdate: (
    cardId: string,
    title: string,
    description: string,
    deadline: string | undefined,
    labels: Label[], // <--- Posición 5
    checklist: CheckListItem[],
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

    if (card.deadline) {
      const date = new Date(card.deadline);
      setDeadline(date);
      setSelectedTime(format(date, "HH:mm"));
    } else {
      setDeadline(undefined);
      setSelectedTime("");
    }
  }, [card]);

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
        className="bg-gray-900 w-full max-w-2xl rounded-xl shadow-2xl border border-gray-800 p-0 relative overflow-hidden"
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

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COLUMNA IZQUIERDA: ETIQUETAS Y FECHA */}
          <div className="space-y-6">
            {/* Etiquetas */}
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-gray-400 mb-3 text-xs uppercase tracking-wider">
                <Tag size={14} /> Etiquetas
              </h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COLORS.map((color) => {
                  const isSelected = labels.some((l) => l.color === color);
                  return (
                    <button
                      key={color}
                      onClick={() => toggleLabel(color)}
                      className={`w-8 h-8 rounded-full ${color} transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-white scale-110 shadow-lg" // ✨ Anillo blanco para resaltar en fondo oscuro
                          : "opacity-60 hover:opacity-100 hover:scale-105"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Fecha de Vencimiento */}
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-gray-400 mb-3 text-xs uppercase tracking-wider">
                <CalendarIcon size={14} /> Fecha de Vencimiento
              </h3>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    // ✨ BOTÓN TRIGGER OSCURO
                    className={cn(
                      "w-full justify-start text-left font-normal flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-blue-500/50 outline-none",
                      !deadline && "text-gray-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                    {deadline ? (
                      <span className="flex-1">
                        {format(deadline, "PPP", { locale: es })}
                        {selectedTime && (
                          <span className="text-gray-400 ml-1">
                            a las {selectedTime}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span>Seleccionar fecha...</span>
                    )}
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-auto p-0 bg-gray-900 border-gray-700 shadow-xl"
                  align="start"
                >
                  <div className="p-3 border-b border-gray-800">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      locale={es}
                      className="p-0"
                    />
                  </div>
                  <div className="p-3 bg-gray-900">
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                      Hora límite
                    </label>
                    <div className="relative flex items-center group">
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="
                                  flex h-9 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-1 text-sm shadow-sm transition-colors 
                                  placeholder:text-gray-600 
                                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 
                                  text-white
                                  [color-scheme:dark]
                              "
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Clock className="h-4 w-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {/* SECCIÓN CHECKLIST */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                  <CheckSquare size={18} /> Checklist
                </h3>
                <span className="text-xs text-gray-400">
                  {progressPercentage}%
                </span>
              </div>

              {/* BARRA DE PROGRESO */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* LISTA DE TAREAS */}
              <div className="space-y-3 mt-4">
                {checklist.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 group cursor-pointer hover:bg-gray-800/50 p-2 rounded-md transition-colors" // ✨ Agregué hover y padding
                  >
                    {/* ZONA DE CLICK (CHECKBOX + TEXTO) */}
                    <div
                      className="flex-1 flex items-center gap-3"
                      onClick={() => handleToggleItem(item._id)}
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          item.completed
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-600 group-hover:border-gray-400"
                        }`}
                      >
                        {item.completed && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>

                      <span
                        className={`text-sm transition-all ${
                          item.completed
                            ? "text-gray-500 line-through"
                            : "text-gray-200"
                        }`}
                      >
                        {item.subTitle}
                      </span>
                    </div>

                    {/* ✨ BOTÓN DE ELIMINAR (Solo visible en Hover) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que al borrar también se marque como completada
                        handleDeleteItem(item._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
                      title="Eliminar tarea"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {/* INPUT PARA NUEVA TAREA */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddItem()} // ¡Enter para agregar!
                    placeholder="Agregar un elemento..."
                    className="flex-1 bg-gray-900/50 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={handleAddItem}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: DESCRIPCIÓN */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-gray-400 mb-3 text-xs uppercase tracking-wider">
              <AlignLeft size={14} /> Descripción
            </h3>
            {/* ✨ TEXTAREA OSCURO */}
            <textarea
              className="w-full h-40 p-4 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none text-gray-200 bg-gray-950 placeholder-gray-600 leading-relaxed"
              placeholder="Añade más detalles a esta tarea..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
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
