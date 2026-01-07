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

  const handleSave = () => {
    if (!tempTitle.trim()) {
      setTempTitle(card.title); // Revertimos si está vacío
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

  if (isEditing) {
    return (
      <div className="bg-white p-2 rounded-lg shadow-sm mb-2 border-2 border-blue-500 z-20 relative">
        <textarea
          autoFocus
          className="w-full text-sm outline-none resize-none bg-transparent"
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          rows={2}
        />
      </div>
    );
  }

  return (
    <div className="group relative bg-white p-2 rounded-lg shadow-sm mb-2 border border-gray-200 hover:border-gray-300 cursor-pointer hover:bg-gray-50 flex items-start">
      {/* USAMOS <button> (HTML NATIVO) 
         Para que la animación de width (w-0 a w-5) funcione suave.
         El Button de Shadcn tiene padding forzado que arruinaría esto.
      */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompleted(card._id, card.completed);
        }}
        className={`shrink-0 mt-0.5 rounded-full overflow-hidden transition-all duration-300 ease-in-out hover:bg-gray-200 p-0.5
          ${
            card.completed
              ? "w-5 mr-2 opacity-100"
              : "w-0 opacity-0 group-hover:w-5 group-hover:mr-2 group-hover:opacity-100"
          }`}
      >
        {card.completed ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-green-600"
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
            className="w-5 h-5 text-gray-400 hover:text-gray-600"
          >
            <circle cx="12" cy="12" r="9" />
          </svg>
        )}
      </button>

      {/* TÍTULO */}
      <div
        onClick={onClick}
        className={`text-sm text-gray-800 break-words flex-1 leading-6 transition-all duration-300 ${
          card.completed ? "text-gray-400 line-through" : ""
        }`}
      >
        {card.title}
      </div>

      {/* ICONOS DE ACCIÓN RÁPIDA */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 bg-white/90 rounded px-1 transition-opacity z-10">
        {/* Lápiz: Usamos botón nativo para evitar estilos extraños */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-blue-600"
        >
          ✏️
        </button>

        {/* ALERT DIALOG (Basura) */}
        <DeleteBtn handleDelete={() => onDelete(card._id)} />
      </div>
    </div>
  );
};
