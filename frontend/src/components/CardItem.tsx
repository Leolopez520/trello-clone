import type { Card } from "@/interfaces/card";
import { useState } from "react";
import { DeleteBtn } from "./DeleteBtn";

interface Props {
  card: Card;
  onUpdate: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
  onToggleCompleted: (cardId: string, currentStatus: boolean) => void;
}

export const CardItem = ({
  card,
  onClick,
  onDelete,
  onUpdate,
  onToggleCompleted,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(card.title);

  // --- LÓGICA DE FECHAS ---
  // Función corregida para mostrar fecha y hora
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);

    // 1. Verificamos si la fecha tiene una hora distinta a 00:00
    const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;

    // 2. Formateamos el día (Ej: "30 ene")
    const dayStr = date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });

    // 3. Si tiene hora, la formateamos y la agregamos (Ej: "14:30")
    if (hasTime) {
      const timeStr = date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // Pon "false" si prefieres formato 24h
      });
      return `${dayStr} ${timeStr}`;
    }

    // 4. Si no tiene hora, devolvemos solo el día
    return dayStr;
  };

  const isOverdue = card.deadline && new Date(card.deadline) < new Date();
  // -------------------------

  const handleSave = () => {
    if (!tempTitle.trim()) {
      setTempTitle(card.title);
      return setIsEditing(false);
    }
    onUpdate(card._id, tempTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setTempTitle(card.title);
    }
  };

  // MODO EDICIÓN (Se mantiene igual)
  if (isEditing) {
    return (
      <div className="relative mb-2 z-20">
        <textarea
          autoFocus
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          rows={2}
          onFocus={(e) => e.target.select()}
          className="
            w-full 
            text-sm 
            bg-gray-900 
            text-white 
            p-2 
            rounded-lg 
            shadow-xl 
            border-2 border-blue-500 
            outline-none 
            resize-none 
            block
            leading-tight
          "
        />
      </div>
    );
  }

  // MODO VISUALIZACIÓN
  return (
    <div className="group relative bg-gray-900 p-2 rounded-lg shadow-sm mb-2 border border-gray-700 hover:border-gray-500 cursor-pointer hover:bg-gray-800 flex items-start gap-2 transition-colors">
      {/* CHECKBOX (Botón) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompleted(card._id, !!card.completed);
        }}
        className={`shrink-0 mt-1 rounded-full overflow-hidden transition-all duration-300 ease-in-out hover:bg-gray-700 p-0.5
          ${
            card.completed
              ? "opacity-100"
              : "opacity-0 w-0 group-hover:w-5 group-hover:opacity-100" // Oculto hasta hover
          }`}
      >
        {card.completed ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-green-500"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-gray-400 hover:text-white"
          >
            <circle cx="12" cy="12" r="9" />
          </svg>
        )}
      </button>

      {/* CONTENEDOR DE DATOS (Etiquetas + Título + Fecha) */}
      <div className="flex flex-col flex-1 min-w-0" onClick={onClick}>
        {/* 1. ETIQUETAS (NUEVO) */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex gap-1 mb-1.5 flex-wrap">
            {card.labels.map((label, index) => (
              <div
                key={index}
                className={`h-1.5 w-8 rounded-full ${label.color}`}
                title={label.text}
              />
            ))}
          </div>
        )}

        {/* 2. TÍTULO */}
        <div
          className={`text-sm text-white font-medium w-full break-words leading-tight transition-all duration-300 ${
            card.completed ? "text-gray-500 line-through" : ""
          }`}
        >
          {card.title}
        </div>

        {/* 3. FECHA (NUEVO) */}
        {card.deadline && (
          <div
            className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded w-fit mt-2 border ${
              isOverdue
                ? "bg-red-900/40 text-red-200 border-red-800"
                : card.completed
                  ? "bg-green-900/40 text-green-200 border-green-800"
                  : "bg-gray-800 text-gray-400 border-gray-700"
            }`}
          >
            {/* Icono de Reloj SVG pequeño */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3 h-3"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clipRule="evenodd"
              />
            </svg>
            <span>{formatDate(card.deadline)}</span>
          </div>
        )}
      </div>

      {/* ICONOS DE ACCIÓN RÁPIDA (Hover) */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 bg-gray-800 rounded px-1 transition-opacity z-10 border border-gray-700 shadow-sm">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-blue-400 transition-colors"
        >
          ✏️
        </button>

        <DeleteBtn handleDelete={() => onDelete(card._id)} />
      </div>
    </div>
  );
};
