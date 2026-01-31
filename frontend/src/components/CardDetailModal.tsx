import type { Card, Label } from "@/interfaces/card";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, set } from "date-fns";
import { es } from "date-fns/locale"; // Para que la fecha salga en español

// Componentes UI
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
    deadline?: string,
    labels?: Label[],
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
  const [labels, setLabels] = useState<Label[]>(card.labels || []);

  // Estado para la fecha (objeto Date o undefined)
  const [deadline, setDeadline] = useState<Date | undefined>(
    card.deadline ? new Date(card.deadline) : undefined,
  );

  const [selectedTime, setSelectedTime] = useState("");

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
      // 👈 RECUPERAMOS LA HORA: Extraemos "HH:MM" de la fecha guardada
      setSelectedTime(format(date, "HH:mm"));
    } else {
      setDeadline(undefined);
      setSelectedTime("");
    }
  }, [card]);

  const toggleLabel = (color: string) => {
    const isSelected = labels.some((l) => l.color === color);
    if (isSelected) {
      setLabels([]);
    } else {
      setLabels([{ color, text: "" }]);
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

    // Convertimos la fecha a String ISO para enviarla al backend
    onUpdate(card._id, title, description, finalDate?.toISOString(), labels);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50 "
      onClick={onClose}
    >
      <div
        className="bg-[#f4f5f7] w-full max-w-2xl rounded-lg shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">✏️ {title}</h2>
          <p className="text-sm text-gray-500">En la lista actual</p>
        </div>

        {/* Panel de control: Etiquetas y Fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Etiquetas */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
              Etiquetas
            </h3>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map((color) => {
                const isSelected = labels.some((l) => l.color === color);
                return (
                  <button
                    key={color}
                    onClick={() => toggleLabel(color)}
                    className={`w-8 h-8 rounded-full ${color} transition-transform ${
                      isSelected
                        ? "ring-2 ring-gray-800 scale-110"
                        : "opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Selector de Fecha (Calendario Shadcn) */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
              Fecha de Vencimiento
            </h3>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "w-full justify-start text-left font-normal flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500 outline-none",
                    !deadline && "text-gray-400",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {deadline ? (
                    format(deadline, "PPP", { locale: es }) // "30 de enero de 2026"
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-gray-900 border-gray-700"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={!deadline} // Desactivado si no hay fecha
              className="bg-white border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-auto p-2.5 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            📝 Descripción
          </h3>
          <textarea
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-700 bg-white"
            placeholder="Añade una descripción más detallada..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-300 rounded transition"
          >
            Cancelar
          </button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-900 text-white"
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};
