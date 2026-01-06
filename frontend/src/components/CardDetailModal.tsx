import type { Card } from "@/interfaces/card";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface Props {
  card: Card;
  onClose: () => void;
  onUpdate: (cardId: string, newTitle: string, newDescription: string) => void;
}

export const CardDetailModal = ({ card, onClose, onUpdate }: Props) => {
  const [description, setDescription] = useState(card.description || "");
  const [title, setTitle] = useState(card.title);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    setDescription(card.description || "");
    setTitle(card.title);
  }, [card]);

  const handleSave = () => {
    onUpdate(card._id, title, description);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#f4f5f7] w-full max-w-2xl rounded-lg shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Título */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">✏️ {title}</h2>
          <p className="text-sm text-gray-500">En la lista actual</p>
        </div>

        {/* Body: Descripción */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            📝 Descripción
          </h3>
          <textarea
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-700"
            placeholder="Añade una descripción más detallada..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Footer: Botones */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-300 rounded transition cursor-pointer"
          >
            Cancelar
          </button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-900 text-white cursor-pointer "
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};
