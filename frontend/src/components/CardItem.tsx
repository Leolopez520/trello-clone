import type { Card } from "@/interfaces/card";
import { useState } from "react";
import { Button } from "./ui/button";

interface Props {
  card: Card;
  onUpdate: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export const CardItem = ({ card, onClick, onDelete, onUpdate }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(card.title);
  //Edicion rapida
  const handleSave = () => {
    if (!tempTitle.trim()) {
      return setIsEditing(false);
    }
    onUpdate(card._id, tempTitle);
    setIsEditing(false);
  };
  //Teclas edicion rapida
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
      <div className="bg-white p-2 rounded-b-lg shadow-sm mb-2 border border-blue-500">
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
    <div
      className="group relative bg-white p-2 rounded-lg shadow-sm mb-2 border border-gray-200 hover:border-gray-300 cursor-pointer hover:bg-gray-50"
    >
      <div onClick={onClick} className="text-sm text-gray-800 break-words min-h-[20px]">
        {card.title}
      </div>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 bg-white/80 rounded px-1 transition-opacity">
        
        <Button
          onClick={(e) => {
            e.stopPropagation(); 
            setIsEditing(true);
          }}
          className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-blue-600"
        >
          ✏️
        </Button>


        <button
          onClick={(e) => {
            e.stopPropagation(); 
            if (confirm("¿Borrar esta tarjeta?")) {
               onDelete(card._id);
            }
          }}
          className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-600"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
